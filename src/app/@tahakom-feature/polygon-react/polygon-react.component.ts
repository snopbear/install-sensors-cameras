import { Component, OnInit, ViewChild } from '@angular/core';
import { TKMCanvasAreaDrawReactComponent } from 'src/app/@tahakom-shared/components/canvas-area-draw/canvas-area-draw-react.component';

@Component({
  selector: "app-polygon-react",
  templateUrl: "./polygon-react.component.html",
  styleUrls: ["./polygon-react.component.css"],
  imports: [TKMCanvasAreaDrawReactComponent],
})
export class PolygonReactComponent {
  constructor() {}
  @ViewChild("canvasComponent")
  canvasComponent!: TKMCanvasAreaDrawReactComponent;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        // Call the public loadImage method
        this.canvasComponent.loadImage(imageUrl);
      };

      reader.readAsDataURL(file);
    }
  }

  loadSampleImage(): void {
    this.canvasComponent.loadImage("https://cctv.essexhighways.org/10K03.jpg");
  }





}
