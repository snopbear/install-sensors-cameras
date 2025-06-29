import { CommonModule, NgIf } from "@angular/common";
import {
  Component,
  Input,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
  HostListener,
} from "@angular/core";
import { FormsModule } from "@angular/forms";

interface PolygonData {
  points: number[][];
  label: string;
  id: string;
}

@Component({
  selector: "tkm-canvas-area-draw",
  template: `
    <div class="annotation">
      <!-- Left Pane - Tools -->
      <div class="tool-panel">
        <div class="tool-section">
          <h3>Drawing Tools</h3>
          <div class="toolbar">
            <button
              class="tool-button"
              (click)="addNewPolygon()"
              title="New Polygon"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  d="M12 2v20M2 12h20"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
            </button>

            <button class="tool-button" (click)="undoLastPoint()" title="Undo">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  d="M4 10h10a4 4 0 0 1 0 8H8"
                  stroke-width="2"
                  stroke-linecap="round"
                />
                <path
                  d="M7 14l-3-3 3-3"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>

            <button
              class="tool-button"
              (click)="removeSelectedPolygon()"
              title="Remove Selected"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  d="M18 6L6 18M6 6l12 12"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
            </button>

            <button class="tool-button" (click)="clearAll()" title="Clear All">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"
                  stroke-width="2"
                />
              </svg>
            </button>

            <button class="zoom-button" (click)="zoomIn()" title="Zoom In">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                <line x1="11" y1="8" x2="11" y2="14"></line>
                <line x1="8" y1="11" x2="14" y2="11"></line>
              </svg>
            </button>

            <button class="zoom-button" (click)="zoomOut()" title="Zoom Out">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                <line x1="8" y1="11" x2="14" y2="11"></line>
              </svg>
            </button>
            <button
              class="zoom-button"
              (click)="resetZoom()"
              title="Reset Zoom"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0"
                  stroke-width="2"
                />
                <path
                  d="M9 9l6 6m0-6l-6 6"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          </div>
        </div>

        <!-- Polygon List Section -->
        <div class="polygon-list-section" *ngIf="polygonData.length > 0">
          <h3>Polygons</h3>
          <div class="polygon-list">
            <div
              *ngFor="let polygon of polygonData; let i = index"
              class="polygon-item"
              [class.active]="i === activePolygon"
              (click)="selectPolygon(i)"
            >
              <div class="polygon-info">
                <div
                  class="polygon-color"
                  [style.background-color]="getPolygonColor(i)"
                ></div>
                <input
                  type="text"
                  [(ngModel)]="polygon.label"
                  (click)="$event.stopPropagation()"
                  (blur)="updatePolygonLabel(i, $event)"
                  placeholder="Label..."
                  class="polygon-label-input"
                />
              </div>
              <button
                class="delete-polygon-btn"
                (click)="deletePolygon(i, $event)"
                title="Delete Polygon"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="container">
        <div class="image-viewer-header">
          <div class="header-title">Seve's Desk</div>
          <div class="polygon-counter" *ngIf="polygonData.length > 0">
            {{ polygonData.length }} polygon(s)
          </div>
        </div>

        <!-- Right Pane - Canvas -->
        <div class="canvas-panel" #canvasPanel>
          <div class="canvas-wrapper" #canvasWrapper>
            <canvas #drawingCanvas></canvas>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      /* Main layout */
      .annotation {
        display: flex;
        height: 100vh;
        font-family: "Segoe UI", Roboto, sans-serif;
      }

      .container {
        display: flex;
        flex-direction: column;
      }

      /* Left Tools Panel */
      .tool-panel {
        width: 250px;

        background: #2c3e50;
        border-bottom: 1px solid #34495e;

        display: flex;
        flex-direction: column;
        overflow-y: auto;
      }

      .tool-section {
        padding: 15px;
        background: #2c3e50;
        border-bottom: 1px solid #34495e;
      }

      .tool-section h3 {
        margin: 0 0 12px 0;
        font-size: 14px;
        color: #fff;
        text-transform: capitalize;
        letter-spacing: 0.5px;
        text-align: center;
      }

      /* Toolbar buttons */
      .toolbar {
        display: flex;
        flex-direction: column;
        gap: 8px;
        // align-items: center;
      }

      .tool-button,
      .zoom-button {
        display: flex;
        align-items: center;
        gap: 6px;
        background: rgba(255, 255, 255, 0.1);
        border: none;
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 14px;
      }

      .tool-button:hover,
      .zoom-button:hover {
        background: #858585;
        border-color: #ccc;
        color: #fff;
      }

      .tool-button svg,
      .zoom-button svg {
        flex-shrink: 0;
      }

      /* Polygon List Section */
      .polygon-list-section {
        flex: 1;
        background: #2c3e50;
        border-bottom: 1px solid #34495e;
        padding: 15px;
        border-bottom: 1px solid #bdc3c7;
      }

      .polygon-list-section h3 {
        margin: 0 0 12px 0;
        font-size: 14px;
        color: #2c3e50;
        text-transform: capitalize;
        letter-spacing: 0.5px;
      }

      .polygon-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
        max-height: 300px;
        overflow-y: auto;
      }

      .polygon-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 12px;
        background: white;
        border: 2px solid transparent;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .polygon-item:hover {
        background: #f8f9fa;
        border-color: #ddd;
      }

      .polygon-item.active {
        border-color: #4e79ff;
        background: #e8f2ff;
      }

      .polygon-info {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 1;
      }

      .polygon-color {
        width: 16px;
        height: 16px;
        border-radius: 3px;
        border: 1px solid #ddd;
        flex-shrink: 0;
      }

      .polygon-label-input {
        border: none;
        background: transparent;
        font-size: 12px;
        color: #2c3e50;
        flex: 1;
        min-width: 0;
      }

      .polygon-label-input:focus {
        outline: none;
        background: white;
        padding: 2px 4px;
        border-radius: 3px;
      }

      .delete-polygon-btn {
        width: 20px;
        height: 20px;
        border: none;
        background: #e74c3c;
        color: white;
        border-radius: 50%;
        cursor: pointer;
        font-size: 14px;
        font-weight: bold;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        flex-shrink: 0;
      }

      .delete-polygon-btn:hover {
        background: #c0392b;
        transform: scale(1.1);
      }

      /* Right Canvas Panel */
      .canvas-panel {
        flex: 1;
        background: #f5f5f5;
        overflow: auto;
        position: relative;
      }

      .canvas-wrapper {
        position: absolute;
        transform-origin: 0 0;
        will-change: transform;
      }

      canvas {
        display: block;
        background-size: contain;
        cursor: crosshair;
      }

      .image-viewer-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 20px;
        background-color: #2c3e50;
        color: white;
        font-family: "Segoe UI", Arial, sans-serif;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      }

      .header-title {
        font-size: 18px;
        font-weight: 500;
      }

      .polygon-counter {
        font-size: 14px;
        color: #bdc3c7;
      }
    `,
  ],
  imports: [FormsModule, CommonModule],
})
export class TKMCanvasAreaDrawComponent implements AfterViewInit {
  readonly ZOOM_FACTOR = 1.1;

  @Input() imageUrl: string = "";
  @Input() colorPalette: string[] = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEAA7",
    "#DDA0DD",
    "#FFB347",
    "#87CEEB",
    "#F0E68C",
    "#FFB6C1",
  ];
  @Input() enabled: boolean = true;
  @Input() polygons: number[][][] = []; // Keep for backward compatibility

  @ViewChild("drawingCanvas") canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild("canvasWrapper") canvasWrapper!: ElementRef<HTMLDivElement>;
  @ViewChild("canvasPanel") canvasPanel!: ElementRef<HTMLDivElement>;

  public ctx!: CanvasRenderingContext2D;
  public image = new Image();
  public zoom: number = 1.0;
  public panOffset = { x: 0, y: 0 };
  public isPanning = false;
  public lastPanPosition = { x: 0, y: 0 };

  // Enhanced polygon data structure
  public polygonData: PolygonData[] = [];
  public activePolygon: number = -1;
  public activePoint: number | null = null;
  public isDragging = false;
  private nextPolygonId = 1;

  // Add this method to debug and check your polygonData
  ngAfterViewInit(): void {
    this.initializeCanvas();
    this.loadImage();
    this.migrateOldPolygons();

    // Add debug logging
    console.log("PolygonData after init:", this.polygonData);
    console.log("Active polygon:", this.activePolygon);
  }

  private migrateOldPolygons(): void {
    // Convert old polygon format to new format
    if (this.polygons.length > 0 && this.polygonData.length === 0) {
      this.polygonData = this.polygons.map((points, index) => ({
        points: points,
        label: `Polygon ${index + 1}`,
        id: this.generatePolygonId(),
      }));
      this.polygons = []; // Clear old data
    }
  }

  private generatePolygonId(): string {
    return `polygon_${this.nextPolygonId++}`;
  }

  private initializeCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext("2d")!;

    canvas.addEventListener("mousedown", (e) => this.handleMouseDown(e));
    canvas.addEventListener("mousemove", (e) => this.handleMouseMove(e));
    canvas.addEventListener("mouseup", () => this.handleMouseUp());
    canvas.addEventListener("mouseleave", () => this.handleMouseUp());
    canvas.addEventListener("contextmenu", (e) => e.preventDefault());
  }

  private loadImage(): void {
    this.image.onload = () => {
      this.resizeCanvas();
      this.centerCanvas();
      this.draw();
    };
    this.image.src = this.imageUrl;
  }

  private resizeCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = this.image.width;
    canvas.height = this.image.height;
  }

  private centerCanvas(): void {
    const panel = this.canvasPanel.nativeElement;
    const canvas = this.canvasRef.nativeElement;

    this.panOffset = {
      x: (panel.clientWidth - canvas.width * this.zoom) / 2,
      y: (panel.clientHeight - canvas.height * this.zoom) / 2,
    };

    this.applyTransform();
  }

  private applyTransform(): void {
    const wrapper = this.canvasWrapper.nativeElement;
    wrapper.style.transform = `translate(${this.panOffset.x}px, ${this.panOffset.y}px) scale(${this.zoom})`;
    wrapper.style.width = `${this.canvasRef.nativeElement.width * this.zoom}px`;
    wrapper.style.height = `${
      this.canvasRef.nativeElement.height * this.zoom
    }px`;
  }

  // Zoom functionality
  zoomOut(): void {
    const oldZoom = this.zoom;
    this.zoom = Math.max(0.1, this.zoom / this.ZOOM_FACTOR);
    this.adjustPanForZoom(oldZoom, this.zoom);
    this.applyTransform();
  }

  zoomIn(): void {
    const oldZoom = this.zoom;
    this.zoom = Math.min(10, this.zoom * this.ZOOM_FACTOR);
    this.adjustPanForZoom(oldZoom, this.zoom);
    this.applyTransform();
  }

  resetZoom(): void {
    this.zoom = 1.0;
    this.centerCanvas();
  }

  // Replace the adjustPanAfterZoom method with this improved version:
  private adjustPanForZoom(oldZoom: number, newZoom: number): void {
    const panel = this.canvasPanel.nativeElement;
    const canvas = this.canvasRef.nativeElement;

    // Get the center of the viewport
    const viewportCenterX = panel.clientWidth / 2;
    const viewportCenterY = panel.clientHeight / 2;

    // Calculate the canvas center in world coordinates
    const canvasCenterX = (viewportCenterX - this.panOffset.x) / oldZoom;
    const canvasCenterY = (viewportCenterY - this.panOffset.y) / oldZoom;

    // Adjust pan offset to keep the same center point
    this.panOffset.x = viewportCenterX - canvasCenterX * newZoom;
    this.panOffset.y = viewportCenterY - canvasCenterY * newZoom;

    // Ensure the image doesn't go completely off-screen
    const maxOffsetX = panel.clientWidth;
    const maxOffsetY = panel.clientHeight;
    const minOffsetX = -canvas.width * newZoom;
    const minOffsetY = -canvas.height * newZoom;

    this.panOffset.x = Math.max(
      minOffsetX,
      Math.min(maxOffsetX, this.panOffset.x)
    );
    this.panOffset.y = Math.max(
      minOffsetY,
      Math.min(maxOffsetY, this.panOffset.y)
    );
  }

  // Enhanced polygon management
  addNewPolygon(): void {
    const newPolygon: PolygonData = {
      points: [],
      label: `Polygon ${this.polygonData.length + 1}`,
      id: this.generatePolygonId(),
    };
    this.polygonData.push(newPolygon);
    this.activePolygon = this.polygonData.length - 1;
    this.draw();
  }

  selectPolygon(index: number): void {
    this.activePolygon = index;
    this.draw();
  }

  deletePolygon(index: number, event: Event): void {
    event.stopPropagation();
    this.polygonData.splice(index, 1);

    // Adjust active polygon index
    if (this.activePolygon >= index) {
      this.activePolygon = this.activePolygon > 0 ? this.activePolygon - 1 : -1;
    }
    if (this.polygonData.length === 0) {
      this.activePolygon = -1;
    }

    this.draw();
  }

  updatePolygonLabel(index: number, event: any): void {
    this.polygonData[index].label =
      event.target.value || `Polygon ${index + 1}`;
  }

  getPolygonColor(index: number): string {
    return this.colorPalette[index % this.colorPalette.length];
  }

  undoLastPoint(): void {
    if (
      this.activePolygon >= 0 &&
      this.polygonData[this.activePolygon].points.length > 0
    ) {
      this.polygonData[this.activePolygon].points.pop();
      this.draw();
    }
  }

  removeSelectedPolygon(): void {
    if (this.activePolygon >= 0) {
      this.polygonData.splice(this.activePolygon, 1);
      this.activePolygon =
        this.polygonData.length > 0 ? this.polygonData.length - 1 : -1;
      this.draw();
    }
  }

  clearAll(): void {
    this.polygonData = [];
    this.activePolygon = -1;
    this.draw();
  }

  // Mouse event handlers
  private getCanvasMousePos(event: MouseEvent): { x: number; y: number } {
    const panel = this.canvasPanel.nativeElement;
    const rect = panel.getBoundingClientRect();

    return {
      x:
        (event.clientX - rect.left + panel.scrollLeft - this.panOffset.x) /
        this.zoom,
      y:
        (event.clientY - rect.top + panel.scrollTop - this.panOffset.y) /
        this.zoom,
    };
  }

  private handleMouseDown(event: MouseEvent): void {
    if (!this.enabled) return;

    const mousePos = this.getCanvasMousePos(event);
    const canvas = this.canvasRef.nativeElement;

    // Check if clicking on a polygon for selection
    if (event.button === 0 && !event.ctrlKey) {
      const clickedPolygonIndex = this.findPolygonAtPoint(mousePos);
      if (
        clickedPolygonIndex >= 0 &&
        clickedPolygonIndex !== this.activePolygon
      ) {
        this.activePolygon = clickedPolygonIndex;
        this.draw();
        return;
      }
    }

    // Middle mouse or Ctrl+Left click for panning
    if (event.button === 1 || (event.button === 0 && event.ctrlKey)) {
      event.preventDefault();
      this.isPanning = true;
      this.lastPanPosition = {
        x: event.clientX + this.canvasPanel.nativeElement.scrollLeft,
        y: event.clientY + this.canvasPanel.nativeElement.scrollTop,
      };
      canvas.style.cursor = "grabbing";
      return;
    }

    // Right click - remove point
    if (event.button === 2) {
      event.preventDefault();
      this.removePointNear(mousePos);
      return;
    }

    // Left click - add or drag point
    if (this.activePolygon >= 0) {
      const polygon = this.polygonData[this.activePolygon].points;
      const pointIndex = this.findPointNear(mousePos, polygon);

      if (pointIndex >= 0) {
        this.activePoint = pointIndex;
        this.isDragging = true;
      } else {
        const insertIndex = this.findInsertPosition(mousePos, polygon);
        polygon.splice(insertIndex, 0, [mousePos.x, mousePos.y]);
        this.activePoint = insertIndex;
        this.isDragging = true;
      }

      this.draw();
    }
  }

  private findPolygonAtPoint(pos: { x: number; y: number }): number {
    for (let i = this.polygonData.length - 1; i >= 0; i--) {
      if (this.isPointInPolygon(pos, this.polygonData[i].points)) {
        return i;
      }
    }
    return -1;
  }

  private isPointInPolygon(
    point: { x: number; y: number },
    polygon: number[][]
  ): boolean {
    if (polygon.length < 3) return false;

    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][0],
        yi = polygon[i][1];
      const xj = polygon[j][0],
        yj = polygon[j][1];

      if (
        yi > point.y !== yj > point.y &&
        point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi
      ) {
        inside = !inside;
      }
    }
    return inside;
  }

  private handleMouseMove(event: MouseEvent): void {
    const panel = this.canvasPanel.nativeElement;
    const canvas = this.canvasRef.nativeElement;

    if (this.isPanning) {
      event.preventDefault();
      const currentX = event.clientX + panel.scrollLeft;
      const currentY = event.clientY + panel.scrollTop;

      const dx = currentX - this.lastPanPosition.x;
      const dy = currentY - this.lastPanPosition.y;

      this.panOffset.x += dx;
      this.panOffset.y += dy;
      this.lastPanPosition = { x: currentX, y: currentY };

      this.applyTransform();
      return;
    }

    if (
      this.isDragging &&
      this.activePolygon >= 0 &&
      this.activePoint !== null
    ) {
      const mousePos = this.getCanvasMousePos(event);
      const polygon = this.polygonData[this.activePolygon].points;
      polygon[this.activePoint] = [mousePos.x, mousePos.y];
      this.draw();
    }
  }

  private handleMouseUp(): void {
    this.isPanning = false;
    this.isDragging = false;
    this.activePoint = null;
    this.canvasRef.nativeElement.style.cursor = "crosshair";
  }

  // Helper methods
  private findPointNear(
    pos: { x: number; y: number },
    polygon: number[][]
  ): number {
    for (let i = 0; i < polygon.length; i++) {
      const dx = pos.x - polygon[i][0];
      const dy = pos.y - polygon[i][1];
      if (Math.sqrt(dx * dx + dy * dy) < 10 / this.zoom) {
        return i;
      }
    }
    return -1;
  }

  private removePointNear(pos: { x: number; y: number }): void {
    if (this.activePolygon >= 0) {
      const polygon = this.polygonData[this.activePolygon].points;
      const pointIndex = this.findPointNear(pos, polygon);
      if (pointIndex >= 0) {
        polygon.splice(pointIndex, 1);
        this.draw();
      }
    }
  }

  private findInsertPosition(
    pos: { x: number; y: number },
    polygon: number[][]
  ): number {
    if (polygon.length < 2) return polygon.length;

    for (let i = 1; i < polygon.length; i++) {
      if (this.pointNearLine([pos.x, pos.y], polygon[i - 1], polygon[i])) {
        return i;
      }
    }

    return polygon.length;
  }

  private pointNearLine(
    point: number[],
    lineStart: number[],
    lineEnd: number[]
  ): boolean {
    const l2 =
      Math.pow(lineStart[0] - lineEnd[0], 2) +
      Math.pow(lineStart[1] - lineEnd[1], 2);
    if (l2 === 0) return false;

    const t = Math.max(
      0,
      Math.min(
        1,
        ((point[0] - lineStart[0]) * (lineEnd[0] - lineStart[0]) +
          (point[1] - lineStart[1]) * (lineEnd[1] - lineStart[1])) /
          l2
      )
    );

    const proj = {
      x: lineStart[0] + t * (lineEnd[0] - lineStart[0]),
      y: lineStart[1] + t * (lineEnd[1] - lineStart[1]),
    };

    return (
      Math.sqrt(
        Math.pow(point[0] - proj.x, 2) + Math.pow(point[1] - proj.y, 2)
      ) <
      10 / this.zoom
    );
  }

  // Drawing methods
  private draw(): void {
    this.clearCanvas();
    this.drawImage();
    this.drawPolygons();
  }

  private clearCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  private drawImage(): void {
    this.ctx.drawImage(this.image, 0, 0);
  }

  private drawPolygons(): void {
    this.polygonData.forEach((polygonData, index) => {
      if (polygonData.points.length > 0) {
        this.drawPolygon(polygonData, index === this.activePolygon, index);
      }
    });
  }

  private drawPolygon(
    polygonData: PolygonData,
    isActive: boolean,
    index: number
  ): void {
    const polygon = polygonData.points;
    if (polygon.length < 1) return;

    this.ctx.beginPath();
    this.ctx.moveTo(polygon[0][0], polygon[0][1]);

    for (let i = 1; i < polygon.length; i++) {
      this.ctx.lineTo(polygon[i][0], polygon[i][1]);
    }

    if (polygon.length > 2) {
      this.ctx.closePath();
    }

    // Fill with color
    const colorIndex = index % this.colorPalette.length;
    this.ctx.fillStyle =
      this.colorPalette[colorIndex] + (isActive ? "80" : "40");
    this.ctx.fill();

    // Stroke
    this.ctx.strokeStyle = isActive ? "#4e79ff" : this.colorPalette[colorIndex];
    this.ctx.lineWidth = isActive ? 3 : 2;
    this.ctx.stroke();

    // Draw points for active polygon
    if (isActive) {
      polygon.forEach((point) => {
        this.ctx.fillStyle = "#fff";
        this.ctx.fillRect(point[0] - 3, point[1] - 3, 6, 6);
        this.ctx.strokeStyle = "#4e79ff";
        this.ctx.strokeRect(point[0] - 3, point[1] - 3, 6, 6);
      });
    }

    // Draw label
    if (polygon.length > 0 && polygonData.label) {
      this.drawPolygonLabel(polygonData, index);
    }
  }

  private drawPolygonLabel(polygonData: PolygonData, index: number): void {
    const polygon = polygonData.points;
    if (polygon.length === 0) return;

    // Calculate centroid
    let centerX = 0,
      centerY = 0;
    polygon.forEach((point) => {
      centerX += point[0];
      centerY += point[1];
    });
    centerX /= polygon.length;
    centerY /= polygon.length;

    // Draw label background
    this.ctx.font = "12px Arial";
    const metrics = this.ctx.measureText(polygonData.label);
    const padding = 4;

    this.ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    this.ctx.fillRect(
      centerX - metrics.width / 2 - padding,
      centerY - 6 - padding,
      metrics.width + padding * 2,
      12 + padding * 2
    );

    // Draw label border
    this.ctx.strokeStyle = this.colorPalette[index % this.colorPalette.length];
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(
      centerX - metrics.width / 2 - padding,
      centerY - 6 - padding,
      metrics.width + padding * 2,
      12 + padding * 2
    );

    // Draw label text
    this.ctx.fillStyle = "#2c3e50";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(polygonData.label, centerX, centerY);
  }

  // Wheel event for zooming

  // Also update the wheel zoom handler:
  @HostListener("wheel", ["$event"])
  onWheel(event: WheelEvent): void {
    if (event.ctrlKey) {
      event.preventDefault();
      const panel = this.canvasPanel.nativeElement;
      const rect = panel.getBoundingClientRect();

      // Get mouse position relative to the panel
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      const oldZoom = this.zoom;
      const zoomFactor =
        event.deltaY < 0 ? this.ZOOM_FACTOR : 1 / this.ZOOM_FACTOR;
      const newZoom = Math.max(0.1, Math.min(10, this.zoom * zoomFactor));

      // Calculate the point under mouse in canvas coordinates
      const canvasX = (mouseX - this.panOffset.x) / oldZoom;
      const canvasY = (mouseY - this.panOffset.y) / oldZoom;

      // Adjust pan to keep the same point under the mouse
      this.panOffset.x = mouseX - canvasX * newZoom;
      this.panOffset.y = mouseY - canvasY * newZoom;

      this.zoom = newZoom;
      this.applyTransform();
    }
  }

  // Public methods for external access
  getPolygonData(): PolygonData[] {
    return this.polygonData;
  }

  setPolygonData(data: PolygonData[]): void {
    this.polygonData = data;
    this.activePolygon = data.length > 0 ? 0 : -1;
    this.draw();
  }

  exportPolygons(): any {
    return {
      polygons: this.polygonData,
      imageUrl: this.imageUrl,
      timestamp: new Date().toISOString(),
    };
  }

  importPolygons(data: any): void {
    if (data.polygons && Array.isArray(data.polygons)) {
      this.polygonData = data.polygons.map((p: any, index: number) => ({
        points: p.points || [],
        label: p.label || `Polygon ${index + 1}`,
        id: p.id || this.generatePolygonId(),
      }));
      this.activePolygon = this.polygonData.length > 0 ? 0 : -1;
      this.draw();
    }
  }

  // Method to get all polygon points - call this from outside the component
  public getPolygonPoints(): number[][][] {
    console.log("Current polygonData:", this.polygonData);
    if (!this.polygonData || this.polygonData.length === 0) {
      console.log("No polygon data available");
      return [];
    }
    return this.polygonData.map((polygon) => polygon.points);
  }

  // Method to get complete polygon information
  public getCompletePolygonData(): PolygonData[] {
    console.log("Getting complete polygon data:", this.polygonData);
    return this.polygonData || [];
  }

  // Method to check if polygonData exists and has content
  public hasPolygonData(): boolean {
    const hasData = this.polygonData && this.polygonData.length > 0;
    console.log(
      "Has polygon data:",
      hasData,
      "Count:",
      this.polygonData?.length || 0
    );
    return hasData;
  }

  // Method to manually add test polygon (for debugging)
  public addTestPolygon(): void {
    const testPolygon: PolygonData = {
      points: [
        [100, 100],
        [200, 100],
        [200, 200],
        [100, 200],
      ],
      label: "Test Polygon",
      id: this.generatePolygonId(),
    };

    if (!this.polygonData) {
      this.polygonData = [];
    }

    this.polygonData.push(testPolygon);
    this.activePolygon = this.polygonData.length - 1;
    this.draw();

    console.log("Added test polygon:", testPolygon);
    console.log("Current polygonData:", this.polygonData);
  }

  // Method to log current state (for debugging)
  public debugPolygonState(): void {
    console.log("=== POLYGON DEBUG INFO ===");
    console.log("polygonData exists:", !!this.polygonData);
    console.log("polygonData type:", typeof this.polygonData);
    console.log("polygonData length:", this.polygonData?.length || "undefined");
    console.log("polygonData content:", this.polygonData);
    console.log("activePolygon:", this.activePolygon);
    console.log("========================");
  }
}
