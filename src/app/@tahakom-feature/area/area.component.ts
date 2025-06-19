import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
// area.model.ts
export interface Area {
  id: number;
  name: string;
  description: string;
  cityId: number;
  population: number;
  areaSize: number; // in square kilometers
  isCommercial: boolean;
  isResidential: boolean;
}
@Component({
  selector: "app-area",
  templateUrl: "./area.component.html",
  styleUrls: ["./area.component.css"],
  imports:[ReactiveFormsModule,CommonModule]
})
export class AreaComponent implements OnInit {
  areaForm!: FormGroup;
  cities = [
    { id: 1, name: "Riyadh" },
    { id: 2, name: "Jeddah" },
    { id: 3, name: "Dammam" },
  ];

  areaData: Area = {
    id: 1,
    name: "Al-Olaya",
    description: "Commercial district in Riyadh",
    cityId: 1,
    population: 150000,
    areaSize: 12.5,
    isCommercial: true,
    isResidential: false,
  };

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.areaForm = this.fb.group({
      id: [this.areaData.id],
      name: [
        this.areaData.name,
        [Validators.required, Validators.maxLength(100)],
      ],
      description: [this.areaData.description, [Validators.maxLength(500)]],
      cityId: [this.areaData.cityId, [Validators.required]],
      population: [
        this.areaData.population,
        [Validators.required, Validators.min(0)],
      ],
      areaSize: [
        this.areaData.areaSize,
        [Validators.required, Validators.min(0.1)],
      ],
      isCommercial: [this.areaData.isCommercial],
      isResidential: [this.areaData.isResidential],
    });
  }

  onSubmit(): void {
    if (this.areaForm.valid) {
      const updatedArea: Area = this.areaForm.value;
      console.log("Form submitted:", updatedArea);
      // Send data to your backend
    } else {
      console.log("Form is invalid");
    }
  }
}
