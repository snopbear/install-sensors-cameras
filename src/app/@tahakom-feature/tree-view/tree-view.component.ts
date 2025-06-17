import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { LocationService } from "@services/modules/location/location.service";
// First, define interfaces for your data structure
interface Site {
  id: number;
  name: string;
  areaId: number;
}

interface Area {
  id: number;
  name: string;
  cityId: number;
  sites: number[];
}

interface City {
  id: number;
  name: string;
  regionId: number;
  areas: number[];
}

interface Region {
  id: number;
  name: string;
  cities: number[];
}

@Component({
  selector: "app-tree-view",
  templateUrl: "./tree-view.component.html",
  styleUrls: ["./tree-view.component.scss"],
  imports: [CommonModule, ReactiveFormsModule],
})
export class TreeViewComponent {
  private fb = inject(FormBuilder);

  // Constants
  private readonly DEFAULT_FORM_VALUES = {
    cameraId: "",
    ipAddress: "",
    skillName: "",
    expectedWorkingInYears: "",
  };

  // Form definition
  readonly deviceForm = this.fb.group({
    cameraId: [this.DEFAULT_FORM_VALUES.cameraId],
    ipAddress: [
      this.DEFAULT_FORM_VALUES.ipAddress,
      [Validators.required, Validators.pattern(/\b(?:\d{1,3}\.){3}\d{1,3}\b/)],
    ],
    skills: this.fb.array([this.addSkillFormGroup()]),
  });
  addSkillFormGroup(): FormGroup {
    return this.fb.group({
      skillName: [this.DEFAULT_FORM_VALUES.skillName, Validators.required],
      expectedWorkingInYears: [
        this.DEFAULT_FORM_VALUES.expectedWorkingInYears,
        Validators.required,
      ],
    });
  }

  removeSkillGroup(index: number): void {
    const skillsFormArray = <FormArray>this.deviceForm.get("skills");
    skillsFormArray.removeAt(index);
    skillsFormArray.markAsDirty();
    skillsFormArray.markAsTouched();
  }

  removeSkillButtonClick(skillGroupIndex: number): void {
    const skillsFormArray = <FormArray>this.deviceForm.get("skills");
    skillsFormArray.removeAt(skillGroupIndex);
    skillsFormArray.markAsDirty();
    skillsFormArray.markAsTouched();
  }

  addSkillButtonClick(): void {
    (<FormArray>this.deviceForm.get("skills")).push(this.addSkillFormGroup());
  }
  get skillsControls(): any {
    return (<FormArray>this.deviceForm.get("skills")).controls;
  }

  onSubmit(){
    const consumed={
    ...this.result,
    ...this.deviceForm.value
    };


    console.log("Consumed:", consumed);
   
  }
  /*********************************** */
  result!: {
  };
  regions: Region[] = [];
  cities: City[] = [];
  areas: Area[] = [];
  sites: Site[] = [];

  expandedRegions = new Set<number>();
  expandedCities = new Set<number>();
  expandedAreas = new Set<number>();

  ngOnInit(): void {
    const data = {
      regions: [
        { id: 1, name: "Riyadh Region", cities: [1, 2] },
        { id: 2, name: "Makkah Region", cities: [3] },
      ],
      cities: [
        { id: 1, name: "Riyadh", regionId: 1, areas: [1, 2] },
        { id: 2, name: "Al-Kharj", regionId: 1, areas: [3] },
        { id: 3, name: "Jeddah", regionId: 2, areas: [4, 5] },
      ],
      areas: [
        { id: 1, name: "Olaya", cityId: 1, sites: [1, 2] },
        { id: 2, name: "Al-Malaz", cityId: 1, sites: [3] },
        { id: 3, name: "Al-Yamamah", cityId: 2, sites: [4] },
        { id: 4, name: "Al-Rawdah", cityId: 3, sites: [5] },
        { id: 5, name: "Al-Safa", cityId: 3, sites: [6] },
      ],
      sites: [
        { id: 1, name: "Kingdom Centre Tower", areaId: 1 },
        { id: 2, name: "Al Faisaliyah Center", areaId: 1 },
        { id: 3, name: "Riyadh Zoo", areaId: 2 },
        { id: 4, name: "Al Kharj Water Tower", areaId: 3 },
        { id: 5, name: "King Abdulaziz University", areaId: 4 },
        { id: 6, name: "Al-Salam Mall", areaId: 5 },
      ],
    };

    this.regions = data.regions;
    this.cities = data.cities;
    this.areas = data.areas;
    this.sites = data.sites;
  }

  getCitiesByRegion(regionId: number): City[] {
    return this.cities.filter((c) => c.regionId === regionId);
  }

  getAreasByCity(cityId: number): Area[] {
    return this.areas.filter((a) => a.cityId === cityId);
  }

  getSitesByArea(areaId: number): Site[] {
    return this.sites.filter((s) => s.areaId === areaId);
  }

  toggleSet(set: Set<number>, id: number): void {
    if (set.has(id)) {
      set.delete(id);
    } else {
      set.add(id);
    }
  }

  isExpanded(set: Set<number>, id: number): boolean {
    return set.has(id);
  }

  onSiteClick(siteId: number): void {
    const site = this.sites.find((s) => s.id === siteId);
    if (!site) return;

    const area = this.areas.find((a) => a.id === site.areaId);
    if (!area) return;

    const city = this.cities.find((c) => c.id === area.cityId);
    if (!city) return;

    const region = this.regions.find((r) => r.id === city.regionId);
    if (!region) return;

    this.result = {
      regionId: region.id,
      cityId: city.id,
      areaId: area.id,
      siteId: site.id,
    };

    console.log("Selected IDs:", this.result);

    // Optional: emit this via an Output or use it for another purpose
  }
}
