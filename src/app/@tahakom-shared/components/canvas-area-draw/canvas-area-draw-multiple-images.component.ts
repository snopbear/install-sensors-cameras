import { NgIf } from "@angular/common";
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

@Component({
  selector: "tkm-canvas-area-draw-multiple-images",
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
              (click)="removeActivePolygon()"
              title="Remove"
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
      </div>
      <div class="container">
        <div class="image-viewer-header">
          <div class="header-title">
            {{ currentImageTitle }} ({{ currentImageIndex + 1 }}/{{
              imageUrls.length
            }})
          </div>
          <div class="header-controls">
            <button
              class="control-btn"
              (click)="previousImage()"
              [disabled]="currentImageIndex <= 0"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
              <span>Prev</span>
            </button>
            <button
              class="control-btn"
              (click)="nextImage()"
              [disabled]="currentImageIndex >= imageUrls.length - 1"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
              <span>Next</span>
            </button>
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
        width: 100px;
        background: #f8f9fa;
        display: flex;
        flex-direction: column;
        overflow-y: auto;
      }

      .tool-section {
        padding: 15px;
        background: #2c3e50;
        border-bottom: 1px solid #e0e0e0;
        height: 100vh;
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
      .toolbar,
      .zoom-controls {
        display: flex;
        flex-direction: column;
        gap: 8px;
        align-items: center;
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

      .zoom-level {
        font-size: 14px;
        padding: 8px 12px;
        text-align: center;
        color: #666;
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
      .container-canvas {
        width: 100%;
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

      .header-controls {
        display: flex;
        gap: 15px;
      }

      .control-btn {
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

      .control-btn:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      .control-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .control-btn svg {
        stroke: currentColor;
      }

      .exit-btn {
        background: rgba(231, 76, 60, 0.2);
      }

      .exit-btn:hover {
        background: rgba(231, 76, 60, 0.4);
      }
    `,
  ],
})
export class TKMCanvasAreaDrawMultipleImagesComponent implements AfterViewInit {
  // Class property
  readonly ZOOM_FACTOR = 1.1; // More subtle than 1.2

  @Input() imageUrls: string[] = []; // Changed from imageUrl to imageUrls
  @Input() imageTitles: string[] = []; // Added for image titles
  @Input() colorPalette: string[] = [];
  @Input() enabled: boolean = true;
  @Input() polygons: number[][][] = [];

  @ViewChild("drawingCanvas") canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild("canvasWrapper") canvasWrapper!: ElementRef<HTMLDivElement>;
  @ViewChild("canvasPanel") canvasPanel!: ElementRef<HTMLDivElement>;

  public ctx!: CanvasRenderingContext2D;
  public image = new Image();
  public zoom: number = 1.0;
  public panOffset = { x: 0, y: 0 };
  public isPanning = false;
  public lastPanPosition = { x: 0, y: 0 };
  // public polygons: number[][][] = [];
  public activePolygon: number = -1;
  public activePoint: number | null = null;
  public isDragging = false;
  public currentImageIndex: number = 0; // Track current image index
  public imageAnnotations: { [key: number]: number[][][] } = {}; // Store annotations per image

  ngAfterViewInit(): void {
    this.initializeCanvas();
    this.loadCurrentImage();
  }

  private initializeCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext("2d")!;

    // Set up event listeners
    canvas.addEventListener("mousedown", (e) => this.handleMouseDown(e));
    canvas.addEventListener("mousemove", (e) => this.handleMouseMove(e));
    canvas.addEventListener("mouseup", () => this.handleMouseUp());
    canvas.addEventListener("mouseleave", () => this.handleMouseUp());
    canvas.addEventListener("contextmenu", (e) => e.preventDefault());
  }

  private loadCurrentImage(): void {
    if (this.imageUrls.length === 0) return;

    // Save current annotations before switching
    this.saveCurrentAnnotations();

    this.image.onload = () => {
      this.resizeCanvas();
      this.centerCanvas();
      this.loadAnnotations();
      this.draw();
    };
    this.image.src = this.imageUrls[this.currentImageIndex];
  }

  private saveCurrentAnnotations(): void {
    if (this.polygons.length > 0) {
      this.imageAnnotations[this.currentImageIndex] = [...this.polygons];
    } else {
      // Remove entry if no annotations
      delete this.imageAnnotations[this.currentImageIndex];
    }
  }

  private loadAnnotations(): void {
    if (this.imageAnnotations[this.currentImageIndex]) {
      this.polygons = [...this.imageAnnotations[this.currentImageIndex]];
    } else {
      this.polygons = [];
    }
    this.activePolygon =
      this.polygons.length > 0 ? this.polygons.length - 1 : -1;
  }

  // Navigation methods
  previousImage(): void {
    if (this.currentImageIndex > 0) {
      this.currentImageIndex--;
      this.resetZoom();
      this.loadCurrentImage();
    }
  }

  nextImage(): void {
    if (this.currentImageIndex < this.imageUrls.length - 1) {
      this.currentImageIndex++;
      this.resetZoom();
      this.loadCurrentImage();
    }
  }

  get currentImageTitle(): string {
    return (
      this.imageTitles[this.currentImageIndex] ||
      `Image ${this.currentImageIndex + 1}`
    );
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
    this.zoom = Math.max(0.1, this.zoom / this.ZOOM_FACTOR);
    this.adjustPanAfterZoom();
    this.applyTransform();
  }

  zoomIn(): void {
    this.zoom = Math.min(10, this.zoom * this.ZOOM_FACTOR);
    this.adjustPanAfterZoom();
    this.applyTransform();
  }

  resetZoom(): void {
    this.zoom = 1.0;
    this.centerCanvas();
  }

  private adjustPanAfterZoom(): void {
    const panel = this.canvasPanel.nativeElement;
    const viewportCenter = {
      x: panel.scrollLeft + panel.clientWidth / 2,
      y: panel.scrollTop + panel.clientHeight / 2,
    };

    this.panOffset = {
      x: viewportCenter.x - (viewportCenter.x - this.panOffset.x) / this.zoom,
      y: viewportCenter.y - (viewportCenter.y - this.panOffset.y) / this.zoom,
    };
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
      const polygon = this.polygons[this.activePolygon];
      const pointIndex = this.findPointNear(mousePos, polygon);

      if (pointIndex >= 0) {
        // Start dragging existing point
        this.activePoint = pointIndex;
        this.isDragging = true;
      } else {
        // Add new point
        const insertIndex = this.findInsertPosition(mousePos, polygon);
        polygon.splice(insertIndex, 0, [mousePos.x, mousePos.y]);
        this.activePoint = insertIndex;
        this.isDragging = true;
      }

      this.draw();
    }
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
      const polygon = this.polygons[this.activePolygon];
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

  // Polygon manipulation
  addNewPolygon(): void {
    this.polygons.push([]);
    this.activePolygon = this.polygons.length - 1;
    this.draw();
  }

  undoLastPoint(): void {
    if (
      this.activePolygon >= 0 &&
      this.polygons[this.activePolygon].length > 0
    ) {
      this.polygons[this.activePolygon].pop();
      this.draw();
    }
  }

  removeActivePolygon(): void {
    if (this.activePolygon >= 0) {
      this.polygons.splice(this.activePolygon, 1);
      this.activePolygon = this.polygons.length - 1;
      this.draw();
    }
  }

  clearAll(): void {
    this.polygons = [];
    this.activePolygon = -1;
    this.draw();
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
      const polygon = this.polygons[this.activePolygon];
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

  // Drawing
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
    this.polygons.forEach((polygon, index) => {
      if (polygon.length > 0) {
        this.drawPolygon(polygon, index === this.activePolygon);
      }
    });
  }

  private drawPolygon(polygon: number[][], isActive: boolean): void {
    if (polygon.length < 1) return;

    this.ctx.beginPath();
    this.ctx.moveTo(polygon[0][0], polygon[0][1]);

    for (let i = 1; i < polygon.length; i++) {
      this.ctx.lineTo(polygon[i][0], polygon[i][1]);
    }

    if (polygon.length > 2) {
      this.ctx.closePath();
    }

    const colorIndex =
      this.activePolygon >= 0
        ? this.activePolygon % this.colorPalette.length
        : 0;
    this.ctx.fillStyle = this.colorPalette[colorIndex];
    this.ctx.fill();

    this.ctx.strokeStyle = isActive ? "#4e79ff" : "#666";
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    if (isActive) {
      polygon.forEach((point) => {
        this.ctx.fillStyle = "#fff";
        this.ctx.fillRect(point[0] - 3, point[1] - 3, 6, 6);
        this.ctx.strokeStyle = "#4e79ff";
        this.ctx.strokeRect(point[0] - 3, point[1] - 3, 6, 6);
      });
    }
  }

  @HostListener("wheel", ["$event"])
  onWheel(event: WheelEvent): void {
    if (event.ctrlKey) {
      event.preventDefault();
      const panel = this.canvasPanel.nativeElement;
      const rect = panel.getBoundingClientRect();

      const mouseX = event.clientX - rect.left + panel.scrollLeft;
      const mouseY = event.clientY - rect.top + panel.scrollTop;

      const zoomFactor = event.deltaY < 0 ? 1.6 : 0.625;
      const newZoom = Math.max(0.1, Math.min(10, this.zoom * zoomFactor));

      this.panOffset = {
        x: mouseX - (mouseX - this.panOffset.x) * (newZoom / this.zoom),
        y: mouseY - (mouseY - this.panOffset.y) * (newZoom / this.zoom),
      };

      this.zoom = newZoom;
      this.applyTransform();
    }
  }
}