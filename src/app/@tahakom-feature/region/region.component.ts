import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
// region.model.ts
export interface Region {
  id: number;
  name: string;
  description: string;
  population: number;
}
@Component({
  selector: "app-region",
  templateUrl: "./region.component.html",
  styleUrls: ["./region.component.css"],
  imports:[ReactiveFormsModule,CommonModule]
})
export class RegionComponent implements OnInit {
  regionForm!: FormGroup;
  regionData: Region = {
    id: 1,
    name: "Riyadh Region",
    description: "The central region of Saudi Arabia",
    population: 8000000,
  };

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.regionForm = this.fb.group({
      id: [this.regionData.id],
      name: [
        this.regionData.name,
        [Validators.required, Validators.maxLength(100)],
      ],
      description: [this.regionData.description, [Validators.maxLength(500)]],
      population: [
        this.regionData.population,
        [Validators.required, Validators.min(0)],
      ],
    });
  }

  onSubmit(): void {
    if (this.regionForm.valid) {
      const updatedRegion: Region = this.regionForm.value;
      console.log("Form submitted:", updatedRegion);
      // Here you would typically send the data to your backend
    } else {
      console.log("Form is invalid");
    }
  }
}
