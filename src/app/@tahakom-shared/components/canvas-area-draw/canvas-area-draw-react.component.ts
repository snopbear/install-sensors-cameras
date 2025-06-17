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

// Type definitions
type DrawingMode = 'select' | 'pan' | 'zoom' | 'label';
type AnnotationType = 'polygon' | 'rectangle';
type ToolMode = DrawingMode | AnnotationType;

interface Point {
  x: number;
  y: number;
}

interface Annotation {
  id: number;
  type: AnnotationType;
  points: Point[];
  label: string;
  color: string;
  isComplete: boolean;
}

@Component({
  selector: "tkm-canvas-area-draw-react",
  template: `
    <div class="annotation">
      <!-- Left Toolbar - Vertical Icons -->
      <div class="vertical-toolbar">
        <!-- Select/Move Tool -->
        <button
          class="tool-icon"
          [class.active]="drawingMode === 'select'"
          (click)="setDrawingMode('select')"
          title="Select/Move"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
          </svg>
        </button>

        <!-- Hand/Pan Tool -->
        <button class="tool-icon" title="Pan">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M18 11v-1a2 2 0 0 0-4 0v1a2 2 0 0 0-4 0v1a2 2 0 0 0-4 0v2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2z"
            />
          </svg>
        </button>

        <!-- Magnifying Glass/Zoom -->
        <button class="tool-icon" (click)="zoomIn()" title="Zoom">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            <line x1="11" y1="8" x2="11" y2="14"></line>
            <line x1="8" y1="11" x2="14" y2="11"></line>
          </svg>
        </button>

        <!-- Tag/Label Tool -->
        <button class="tool-icon" title="Label">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"
            />
            <line x1="7" y1="7" x2="7.01" y2="7" />
          </svg>
        </button>

        <!-- Polygon Tool -->
        <button
          class="tool-icon"
          [class.active]="drawingMode === 'polygon'"
          (click)="setDrawingMode('polygon')"
          title="Draw Polygon"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            />
          </svg>
        </button>

        <!-- Rectangle Tool -->
        <button
          class="tool-icon"
          [class.active]="drawingMode === 'rectangle'"
          (click)="setDrawingMode('rectangle')"
          title="Draw Rectangle"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          </svg>
        </button>

        <!-- Expand/Fullscreen -->
        <button class="tool-icon" (click)="resetZoom()" title="Fit to Screen">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"
            />
          </svg>
        </button>

        <!-- Export/Share -->
        <button class="tool-icon" title="Export">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7,10 12,15 17,10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </button>
      </div>

      <!-- Main Content Area -->
      <div class="main-content">
        <!-- Header -->
        <div class="image-viewer-header">
          <div class="header-title">{{ imageTitle || "Annotation Tool" }}</div>
          <div class="header-controls">
            <div class="annotation-counter" *ngIf="annotationData.length > 0">
              {{ getNamedAnnotationsCount() }} of
              {{ annotationData.length }} annotation(s) labeled
            </div>
            <div class="zoom-controls">
              <button class="zoom-btn" (click)="zoomOut()" title="Zoom Out">
                −
              </button>
              <span class="zoom-level">{{ Math.round(zoom * 100) }}%</span>
              <button class="zoom-btn" (click)="zoomIn()" title="Zoom In">
                +
              </button>
            </div>
          </div>
        </div>

        <!-- Canvas Area -->
        <div class="canvas-panel" #canvasPanel>
          <div class="canvas-wrapper" #canvasWrapper>
            <canvas #drawingCanvas></canvas>
          </div>
        </div>

        <!-- Bottom Annotations Panel -->
        <div class="bottom-panel" *ngIf="annotationData.length > 0">
          <div class="annotations-header">
            <h3>Annotations ({{ annotationData.length }})</h3>
            <div class="panel-controls">
              <button
                class="control-btn"
                (click)="clearAll()"
                title="Clear All"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div class="annotations-grid">
            <div
              *ngFor="let annotation of annotationData; let i = index"
              class="annotation-card"
              [class.active]="i === activeAnnotation"
              (click)="selectAnnotation(i)"
            >
              <div class="annotation-info">
                <div
                  class="annotation-color"
                  [style.background-color]="getAnnotationColor(annotation)"
                ></div>
                <div class="annotation-details">
                  <input
                    type="text"
                    [(ngModel)]="annotation.label"
                    (click)="$event.stopPropagation()"
                    (blur)="updateAnnotationLabel(i, $event)"
                    placeholder="Enter label..."
                    class="annotation-label-input"
                  />
                  <div class="annotation-meta">
                    <span class="annotation-type">{{ annotation.type }}</span>
                    <span class="point-count"
                      >{{ annotation.points.length }} points</span
                    >
                  </div>
                </div>
              </div>
              <button
                class="delete-btn"
                (click)="deleteAnnotation(i, $event)"
                title="Delete"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      /* Main Container */
      .annotation {
        display: flex;
        height: 100vh;
        width: 100%;
        background-color: #f8f9fa;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
          sans-serif;
        overflow: hidden;
      }

      /* Vertical Toolbar */
      .vertical-toolbar {
        display: flex;
        flex-direction: column;
        width: 60px;
        background-color: #2c3e50;
        border-right: 1px solid #34495e;
        padding: 12px 8px;
        gap: 8px;
        box-shadow: 2px 0 4px rgba(0, 0, 0, 0.1);
      }

      .tool-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 44px;
        height: 44px;
        background: none;
        border: none;
        border-radius: 8px;
        color: #ecf0f1;
        cursor: pointer;
        transition: all 0.2s ease;
        position: relative;
      }

      .tool-icon:hover {
        background-color: #34495e;
        color: #3498db;
        transform: translateX(2px);
      }

      .tool-icon.active {
        background-color: #3498db;
        color: white;
        box-shadow: 0 2px 8px rgba(52, 152, 219, 0.3);
      }

      .tool-icon:active {
        transform: translateX(2px) scale(0.95);
      }

      .tool-icon svg {
        width: 20px;
        height: 20px;
      }

      /* Main Content Area */
      .main-content {
        display: flex;
        flex-direction: column;
        flex: 1;
        overflow: hidden;
      }

      /* Header */
      .image-viewer-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 24px;
        background-color: white;
        border-bottom: 1px solid #e9ecef;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }

      .header-title {
        font-size: 18px;
        font-weight: 600;
        color: #2c3e50;
      }

      .header-controls {
        display: flex;
        align-items: center;
        gap: 20px;
      }

      .annotation-counter {
        font-size: 14px;
        color: #6c757d;
        padding: 6px 12px;
        background-color: #f8f9fa;
        border-radius: 20px;
        border: 1px solid #dee2e6;
      }

      .zoom-controls {
        display: flex;
        align-items: center;
        gap: 8px;
        background-color: #f8f9fa;
        border: 1px solid #dee2e6;
        border-radius: 24px;
        padding: 4px;
      }

      .zoom-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        background: none;
        border: none;
        border-radius: 50%;
        color: #495057;
        cursor: pointer;
        font-size: 18px;
        font-weight: 500;
        transition: all 0.2s ease;
      }

      .zoom-btn:hover {
        background-color: #e9ecef;
        color: #2c3e50;
      }

      .zoom-level {
        font-size: 14px;
        font-weight: 500;
        color: #495057;
        min-width: 50px;
        text-align: center;
      }

      /* Canvas Area */
      .canvas-panel {
        flex: 1;
        position: relative;
        background-color: #f8f9fa;
        overflow: hidden;
      }

      .canvas-wrapper {
        width: 100%;
        height: 100%;
        position: relative;
        overflow: auto;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      canvas {
        border: 1px solid #dee2e6;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        background-color: white;
        cursor: crosshair;
        max-width: 100%;
        max-height: 100%;
      }

      canvas[data-mode="select"] {
        cursor: default;
      }

      canvas[data-mode="pan"] {
        cursor: grab;
      }

      canvas[data-mode="pan"]:active {
        cursor: grabbing;
      }

      canvas[data-mode="zoom"] {
        cursor: zoom-in;
      }

      /* Bottom Annotations Panel */
      .bottom-panel {
        background-color: white;
        border-top: 1px solid #dee2e6;
        max-height: 300px;
        display: flex;
        flex-direction: column;
      }

      .annotations-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 24px;
        border-bottom: 1px solid #e9ecef;
        background-color: #f8f9fa;
      }

      .annotations-header h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #2c3e50;
      }

      .panel-controls {
        display: flex;
        gap: 8px;
      }

      .control-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        background: none;
        border: 1px solid #dee2e6;
        border-radius: 6px;
        color: #6c757d;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .control-btn:hover {
        background-color: #e9ecef;
        color: #dc3545;
        border-color: #dc3545;
      }

      /* Annotations Grid */
      .annotations-grid {
        padding: 16px 24px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        overflow-y: auto;
        max-height: 200px;
      }

      .annotation-card {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        background-color: white;
        border: 1px solid #e9ecef;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .annotation-card:hover {
        border-color: #3498db;
        box-shadow: 0 2px 8px rgba(52, 152, 219, 0.15);
      }

      .annotation-card.active {
        border-color: #3498db;
        background-color: #f8f9ff;
        box-shadow: 0 2px 8px rgba(52, 152, 219, 0.2);
      }

      .annotation-info {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;
      }

      .annotation-color {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
      }

      .annotation-details {
        flex: 1;
      }

      .annotation-label-input {
        width: 100%;
        padding: 4px 8px;
        border: 1px solid transparent;
        border-radius: 4px;
        font-size: 14px;
        font-weight: 500;
        color: #2c3e50;
        background: transparent;
        transition: all 0.2s ease;
      }

      .annotation-label-input:focus {
        outline: none;
        border-color: #3498db;
        background-color: white;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
      }

      .annotation-label-input::placeholder {
        color: #adb5bd;
        font-style: italic;
      }

      .annotation-meta {
        display: flex;
        gap: 12px;
        margin-top: 4px;
      }

      .annotation-type {
        font-size: 12px;
        color: #6c757d;
        text-transform: capitalize;
        background-color: #e9ecef;
        padding: 2px 6px;
        border-radius: 10px;
      }

      .point-count {
        font-size: 12px;
        color: #6c757d;
      }

      .delete-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        background: none;
        border: none;
        border-radius: 4px;
        color: #6c757d;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .delete-btn:hover {
        background-color: #fee;
        color: #dc3545;
      }

      /* Responsive Design */
      @media (max-width: 768px) {
        .annotation {
          flex-direction: column;
        }

        .vertical-toolbar {
          flex-direction: row;
          width: 100%;
          height: 60px;
          padding: 8px 12px;
          overflow-x: auto;
        }

        .header-controls {
          flex-direction: column;
          gap: 8px;
          align-items: flex-end;
        }

        .annotations-grid {
          padding: 12px 16px;
        }
      }
    `,
  ],
  imports: [FormsModule, CommonModule],
})
export class TKMCanvasAreaDrawReactComponent implements AfterViewInit {
  @ViewChild("drawingCanvas", { static: false })
  canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild("canvasPanel", { static: false })
  canvasPanelRef!: ElementRef<HTMLDivElement>;
  @ViewChild("canvasWrapper", { static: false })
  canvasWrapperRef!: ElementRef<HTMLDivElement>;

  // Add Input property for image
  @Input() imageUrl: string | null = null;
  @Input() imageFile: File | null = null;

  // Expose Math to template
  Math = Math;

  // Component state
  drawingMode: ToolMode = "select";
  zoom: number = 1;
  imageTitle: string = "Annotation Tool";
  annotationData: Annotation[] = [];
  activeAnnotation: number = -1;

  // Canvas properties
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private canvasWidth: number = 800;
  private canvasHeight: number = 600;
  private imageLoaded: boolean = false;
  private currentImage: HTMLImageElement | null = null;

  // Drawing state
  private isDrawing: boolean = false;
  private isPanning: boolean = false;
  private currentPoints: Point[] = [];
  private panStart: Point = { x: 0, y: 0 };
  private canvasOffset: Point = { x: 0, y: 0 };

  // Colors for annotations
  private readonly annotationColors: string[] = [
    "#3498db",
    "#e74c3c",
    "#2ecc71",
    "#f39c12",
    "#9b59b6",
    "#1abc9c",
    "#e67e22",
    "#95a5a6",
  ];

  // Event listeners
  private boundMouseDown = this.onMouseDown.bind(this);
  private boundMouseMove = this.onMouseMove.bind(this);
  private boundMouseUp = this.onMouseUp.bind(this);
  private boundKeyDown = this.onKeyDown.bind(this);




  ngOnChanges(changes: SimpleChanges): void {
    // Handle image URL changes
    if (changes["imageUrl"] && changes["imageUrl"].currentValue) {
      this.loadImageFromUrl(changes["imageUrl"].currentValue);
    }

    // Handle image file changes
    if (changes["imageFile"] && changes["imageFile"].currentValue) {
      this.loadImageFromFile(changes["imageFile"].currentValue);
    }
  }

  // ... (keep all existing methods)

  // Modified loadImage method
  private loadImageFromUrl(imageUrl: string): void {
    const img = new Image();
    img.onload = () => {
      this.currentImage = img;
      this.imageLoaded = true;
      this.adjustCanvasToImage();
      this.redrawCanvas();
    };
    img.onerror = () => {
      console.error("Failed to load image:", imageUrl);
    };
    img.src = imageUrl;
  }

  // New method to load image from File object
  private loadImageFromFile(file: File): void {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        this.currentImage = img;
        this.imageLoaded = true;
        this.adjustCanvasToImage();
        this.redrawCanvas();
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  // Optional: Adjust canvas size to match image dimensions
  private adjustCanvasToImage(): void {
    if (this.currentImage) {
      this.canvasWidth = this.currentImage.width;
      this.canvasHeight = this.currentImage.height;
      this.canvas.width = this.canvasWidth;
      this.canvas.height = this.canvasHeight;
    }
  }

  ngAfterViewInit(): void {
    this.initializeCanvas();
    this.setupEventListeners();
  }

  ngOnDestroy(): void {
    this.removeEventListeners();
  }

  private initializeCanvas(): void {
    this.canvas = this.canvasRef.nativeElement;
    this.ctx = this.canvas.getContext("2d")!;

    this.canvas.width = this.canvasWidth;
    this.canvas.height = this.canvasHeight;

    this.redrawCanvas();
  }

  private setupEventListeners(): void {
    this.canvas.addEventListener("mousedown", this.boundMouseDown);
    this.canvas.addEventListener("mousemove", this.boundMouseMove);
    this.canvas.addEventListener("mouseup", this.boundMouseUp);
    document.addEventListener("keydown", this.boundKeyDown);
  }

  private removeEventListeners(): void {
    this.canvas.removeEventListener("mousedown", this.boundMouseDown);
    this.canvas.removeEventListener("mousemove", this.boundMouseMove);
    this.canvas.removeEventListener("mouseup", this.boundMouseUp);
    document.removeEventListener("keydown", this.boundKeyDown);
  }

  // Tool mode management
  setDrawingMode(mode: ToolMode): void {
    this.drawingMode = mode;
    this.finishCurrentDrawing();
    this.updateCanvasCursor();
  }

  private updateCanvasCursor(): void {
    const cursors: Record<ToolMode, string> = {
      select: "default",
      pan: "grab",
      zoom: "zoom-in",
      label: "text",
      polygon: "crosshair",
      rectangle: "crosshair",
    };

    this.canvas.style.cursor = cursors[this.drawingMode] || "default";
  }

  // Mouse event handlers
  private onMouseDown(event: MouseEvent): void {
    const point = this.getMousePosition(event);

    switch (this.drawingMode) {
      case "select":
        this.handleSelectMode(point);
        break;
      case "pan":
        this.startPanning(point);
        break;
      case "zoom":
        this.handleZoomClick(point, event.shiftKey);
        break;
      case "polygon":
        this.handlePolygonClick(point);
        break;
      case "rectangle":
        this.startRectangleDrawing(point);
        break;
    }
  }

  private onMouseMove(event: MouseEvent): void {
    const point = this.getMousePosition(event);

    if (this.isPanning) {
      this.updatePan(point);
    } else if (this.isDrawing && this.drawingMode === "rectangle") {
      this.updateRectangleDrawing(point);
    }
  }

  private onMouseUp(event: MouseEvent): void {
    if (this.isPanning) {
      this.endPanning();
    } else if (this.isDrawing && this.drawingMode === "rectangle") {
      this.finishRectangleDrawing();
    }
  }

  private onKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case "Escape":
        this.cancelCurrentDrawing();
        break;
      case "Enter":
        if (this.drawingMode === "polygon" && this.currentPoints.length >= 3) {
          this.finishPolygonDrawing();
        }
        break;
      case "Delete":
      case "Backspace":
        if (this.activeAnnotation >= 0) {
          this.deleteAnnotation(this.activeAnnotation);
        }
        break;
    }
  }

  // Mouse position utility
  private getMousePosition(event: MouseEvent): Point {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) / this.zoom,
      y: (event.clientY - rect.top) / this.zoom,
    };
  }

  // Drawing mode handlers
  private handleSelectMode(point: Point): void {
    const clickedAnnotation = this.getAnnotationAtPoint(point);
    if (clickedAnnotation !== -1) {
      this.selectAnnotation(clickedAnnotation);
    } else {
      this.activeAnnotation = -1;
    }
  }

  private startPanning(point: Point): void {
    this.isPanning = true;
    this.panStart = point;
    this.canvas.style.cursor = "grabbing";
  }

  private updatePan(point: Point): void {
    if (!this.isPanning) return;

    const deltaX = point.x - this.panStart.x;
    const deltaY = point.y - this.panStart.y;

    this.canvasOffset.x += deltaX;
    this.canvasOffset.y += deltaY;

    this.redrawCanvas();
  }

  private endPanning(): void {
    this.isPanning = false;
    this.canvas.style.cursor = "grab";
  }

  private handleZoomClick(point: Point, isZoomOut: boolean): void {
    if (isZoomOut) {
      this.zoomOut();
    } else {
      this.zoomIn();
    }
  }

  private handlePolygonClick(point: Point): void {
    this.currentPoints.push(point);

    if (this.currentPoints.length === 1) {
      // Start new polygon
      this.isDrawing = true;
    }

    this.redrawCanvas();
  }

  private startRectangleDrawing(point: Point): void {
    this.currentPoints = [point];
    this.isDrawing = true;
  }

  private updateRectangleDrawing(point: Point): void {
    if (this.currentPoints.length > 0) {
      this.currentPoints[1] = point;
      this.redrawCanvas();
    }
  }

  private finishRectangleDrawing(): void {
    if (this.currentPoints.length === 2) {
      const startPoint = this.currentPoints[0];
      const endPoint = this.currentPoints[1];

      // Create rectangle points (clockwise from top-left)
      const rectanglePoints: Point[] = [
        {
          x: Math.min(startPoint.x, endPoint.x),
          y: Math.min(startPoint.y, endPoint.y),
        },
        {
          x: Math.max(startPoint.x, endPoint.x),
          y: Math.min(startPoint.y, endPoint.y),
        },
        {
          x: Math.max(startPoint.x, endPoint.x),
          y: Math.max(startPoint.y, endPoint.y),
        },
        {
          x: Math.min(startPoint.x, endPoint.x),
          y: Math.max(startPoint.y, endPoint.y),
        },
      ];

      this.addNewAnnotation("rectangle", rectanglePoints);
    }

    this.finishCurrentDrawing();
  }

  private finishPolygonDrawing(): void {
    if (this.currentPoints.length >= 3) {
      this.addNewAnnotation("polygon", [...this.currentPoints]);
    }

    this.finishCurrentDrawing();
  }

  private finishCurrentDrawing(): void {
    this.isDrawing = false;
    this.currentPoints = [];
    this.redrawCanvas();
  }

  private cancelCurrentDrawing(): void {
    this.finishCurrentDrawing();
  }

  // Annotation management
  addNewAnnotation(type: AnnotationType, points: Point[]): void {
    const newAnnotation: Annotation = {
      id: Date.now(),
      type: type,
      points: points,
      label: "",
      color: this.getNextAnnotationColor(),
      isComplete: true,
    };

    this.annotationData.push(newAnnotation);
    this.activeAnnotation = this.annotationData.length - 1;
    this.redrawCanvas();
  }

  selectAnnotation(index: number): void {
    this.activeAnnotation = index;
    this.redrawCanvas();
  }

  deleteAnnotation(index: number, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    this.annotationData.splice(index, 1);

    if (this.activeAnnotation >= index && this.activeAnnotation > 0) {
      this.activeAnnotation--;
    } else if (this.activeAnnotation === index) {
      this.activeAnnotation = -1;
    }

    this.redrawCanvas();
  }

  updateAnnotationLabel(index: number, event: any): void {
    const newLabel = event.target.value;
    if (this.annotationData[index]) {
      this.annotationData[index].label = newLabel;
    }
  }

  clearAll(): void {
    this.annotationData = [];
    this.activeAnnotation = -1;
    this.finishCurrentDrawing();
    this.redrawCanvas();
  }

  private getAnnotationAtPoint(point: Point): number {
    for (let i = this.annotationData.length - 1; i >= 0; i--) {
      const annotation = this.annotationData[i];
      if (this.isPointInAnnotation(point, annotation)) {
        return i;
      }
    }
    return -1;
  }

  private isPointInAnnotation(point: Point, annotation: Annotation): boolean {
    // Simple point-in-polygon test using ray casting algorithm
    const { points } = annotation;
    let inside = false;

    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      if (
        points[i].y > point.y !== points[j].y > point.y &&
        point.x <
          ((points[j].x - points[i].x) * (point.y - points[i].y)) /
            (points[j].y - points[i].y) +
            points[i].x
      ) {
        inside = !inside;
      }
    }

    return inside;
  }

  // Zoom controls
  zoomIn(): void {
    this.zoom = Math.min(this.zoom * 1.2, 5);
    this.applyZoom();
  }

  zoomOut(): void {
    this.zoom = Math.max(this.zoom / 1.2, 0.1);
    this.applyZoom();
  }

  resetZoom(): void {
    this.zoom = 1;
    this.canvasOffset = { x: 0, y: 0 };
    this.applyZoom();
  }

  private applyZoom(): void {
    const wrapper = this.canvasWrapperRef.nativeElement;
    wrapper.style.transform = `scale(${this.zoom}) translate(${this.canvasOffset.x}px, ${this.canvasOffset.y}px)`;
    this.redrawCanvas();
  }

  // Canvas drawing
  private redrawCanvas(): void {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

    // Draw background
    this.ctx.fillStyle = "#ffffff";
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    // Draw image if loaded
    if (this.currentImage && this.imageLoaded) {
      this.ctx.drawImage(
        this.currentImage,
        0,
        0,
        this.canvasWidth,
        this.canvasHeight
      );
    }

    // Draw completed annotations
    this.annotationData.forEach((annotation, index) => {
      this.drawAnnotation(annotation, index === this.activeAnnotation);
    });

    // Draw current drawing
    if (this.isDrawing && this.currentPoints.length > 0) {
      this.drawCurrentDrawing();
    }
  }

  private drawAnnotation(annotation: Annotation, isActive: boolean): void {
    const { points, color, type } = annotation;

    if (points.length === 0) return;

    // Set drawing style
    this.ctx.strokeStyle = color;
    this.ctx.fillStyle = color + "20"; // 20% opacity
    this.ctx.lineWidth = isActive ? 3 : 2;

    // Draw shape
    this.ctx.beginPath();
    this.ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
      this.ctx.lineTo(points[i].x, points[i].y);
    }

    this.ctx.closePath();
    this.ctx.stroke();
    this.ctx.fill();

    // Draw points
    points.forEach((point, index) => {
      this.drawPoint(point, color, isActive);
    });
  }

  private drawCurrentDrawing(): void {
    if (this.currentPoints.length === 0) return;

    this.ctx.strokeStyle = "#3498db";
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([5, 5]);

    this.ctx.beginPath();
    this.ctx.moveTo(this.currentPoints[0].x, this.currentPoints[0].y);

    for (let i = 1; i < this.currentPoints.length; i++) {
      this.ctx.lineTo(this.currentPoints[i].x, this.currentPoints[i].y);
    }

    if (this.drawingMode === "rectangle" && this.currentPoints.length === 2) {
      this.ctx.closePath();
    }

    this.ctx.stroke();
    this.ctx.setLineDash([]);

    // Draw points
    this.currentPoints.forEach((point) => {
      this.drawPoint(point, "#3498db", true);
    });
  }

  private drawPoint(point: Point, color: string, isActive: boolean): void {
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(point.x, point.y, isActive ? 4 : 3, 0, 2 * Math.PI);
    this.ctx.fill();

    // White border
    this.ctx.strokeStyle = "#ffffff";
    this.ctx.lineWidth = 1;
    this.ctx.stroke();
  }

  // Utility methods
  getNamedAnnotationsCount(): number {
    return this.annotationData.filter(
      (annotation) => annotation.label && annotation.label.trim() !== ""
    ).length;
  }

  getAnnotationColor(annotation: Annotation): string {
    return annotation.color;
  }

  private getNextAnnotationColor(): string {
    return this.annotationColors[
      this.annotationData.length % this.annotationColors.length
    ];
  }

  // Image loading (optional)
  loadImage(imageUrl: string): void {
    const img = new Image();
    img.onload = () => {
      this.currentImage = img;
      this.imageLoaded = true;
      this.redrawCanvas();
    };
    img.src = imageUrl;
  }
}
