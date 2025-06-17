import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TKMCanvasAreaDrawComponent } from "../../@tahakom-shared/components/canvas-area-draw/canvas-area-draw.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: "app-polygon",
  templateUrl: "./polygon.component.html",
  styleUrls: ["./polygon.component.css"],
  imports: [TKMCanvasAreaDrawComponent, CommonModule],
})
export class PolygonComponent implements OnInit, OnDestroy {
  imageUrl = "https://cctv.essexhighways.org/10K03.jpg";

  colorPalette: string[] = [
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

  @ViewChild(TKMCanvasAreaDrawComponent)
  canvasComponent!: TKMCanvasAreaDrawComponent;

  polygonData!: any[];
  ngAfterViewInit() {
    // Wait a bit for the component to fully initialize
    // setTimeout(() => {
    //   this.checkPolygonData();
    // }, 1000);
  }
  ngOnInit() {
    console.log("Component INITIALIZED PolygonComponent");
    // This should log only on first visit if reuse is working
  }

  ngOnDestroy() {
    console.log("Component DESTROYED PolygonComponent");
    // This shouldn't log when navigating away if reuse is working
  }

  onGetPolygonData() {
    if (this.canvasComponent) {
      this.polygonData = this.canvasComponent.getCompletePolygonData();

      if (this.polygonData.length > 0) {
        console.log("Found", this.polygonData.length, "polygons:");

        // Transform to array of objects with consistent structure
        const polygonArray = this.polygonData.map((polygon, index) => {
          const polygonObject = {
            id: index + 1,
            label: polygon.label,
            pointCount: polygon.points.length,
            points: polygon.points,
            // Add any other properties you need
          };

          console.log(`Polygon ${index + 1}:`, polygonObject);
          return polygonObject;
        });

        return polygonArray;
      } else {
        console.log("No polygons found. Draw some polygons first.");
        return [];
      }
    }
    return [];
  }
}
