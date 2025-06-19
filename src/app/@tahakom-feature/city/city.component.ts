import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';

// city.model.ts
export interface City {
  id: number;
  name: string;
  description: string;
  population: number;
  regionId: number; // Reference to the region
  isCapital: boolean;
  foundedYear?: number; // Optional field
}
@Component({
  selector: "app-city",
  templateUrl: "./city.component.html",
  styleUrls: ["./city.component.css"],
  imports:[ReactiveFormsModule,CommonModule]
})
export class CityComponent implements OnInit {
  cityForm!: FormGroup;
  regions = [
    { id: 1, name: "Riyadh Region" },
    { id: 2, name: "Makkah Region" },
    { id: 3, name: "Eastern Province" },
  ];

  cityData: City = {
    id: 1,
    name: "Riyadh",
    description: "The capital and largest city of Saudi Arabia",
    population: 7700000,
    regionId: 1,
    isCapital: true,
    foundedYear: 1746,
  };

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.cityForm = this.fb.group({
      id: [this.cityData.id],
      name: [
        this.cityData.name,
        [Validators.required, Validators.maxLength(100)],
      ],
      description: [this.cityData.description, [Validators.maxLength(500)]],
      population: [
        this.cityData.population,
        [Validators.required, Validators.min(0)],
      ],
      regionId: [this.cityData.regionId, [Validators.required]],
      isCapital: [this.cityData.isCapital],
      foundedYear: [
        this.cityData.foundedYear,
        [Validators.min(1000), Validators.max(new Date().getFullYear())],
      ],
    });
  }

  onSubmit(): void {
    if (this.cityForm.valid) {
      const updatedCity: City = this.cityForm.value;
      console.log("Form submitted:", updatedCity);
      // Send data to your backend
    } else {
      console.log("Form is invalid");
    }
  }
}
