import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RegionComponent } from '../region/region.component';
import { CityComponent } from '../city/city.component';
import { AreaComponent } from "../area/area.component";
import { TKMCanvasAreaDrawComponent } from 'src/app/@tahakom-shared/components/canvas-area-draw/canvas-area-draw.component';

@Component({
  selector: "app-tree-view-dynamic-view",
  templateUrl: "./tree-view-dynamic-view.component.html",
  styleUrls: ["./tree-view-dynamic-view.component.css"],
  imports: [
    CommonModule,
    RegionComponent,
    CityComponent,
    AreaComponent,
    TKMCanvasAreaDrawComponent,
  ],
})
// TypeScript Component Code
export class TreeViewDynamicViewComponent {
  imageUrl = "https://cctv.essexhighways.org/10K03.jpg";
  // Data structure with nested references
  data = {
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

  // Expansion state
  expandedRegions = new Set<number>();
  expandedCities = new Set<number>();
  expandedAreas = new Set<number>();

  // Panel properties
  currentPanel: {
    type: "region" | "city" | "area" | "site";
    title: string;
    data: any;
    parentData?: any;
    grandParentData?: any;
    greatGrandParentData?: any;
  } | null = null;

  // Helper methods to get related entities
  getCitiesByRegion(regionId: number): any[] {
    const region = this.data.regions.find((r) => r.id === regionId);
    if (!region) return [];

    return region.cities
      .map((cityId) => this.data.cities.find((c) => c.id === cityId))
      .filter((city) => city !== undefined);
  }

  getAreasByCity(cityId: number): any[] {
    const city = this.data.cities.find((c) => c.id === cityId);
    if (!city) return [];

    return city.areas
      .map((areaId) => this.data.areas.find((a) => a.id === areaId))
      .filter((area) => area !== undefined);
  }

  getSitesByArea(areaId: number): any[] {
    const area = this.data.areas.find((a) => a.id === areaId);
    if (!area) return [];

    return area.sites
      .map((siteId) => this.data.sites.find((s) => s.id === siteId))
      .filter((site) => site !== undefined);
  }

  // Expansion toggle methods
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

  // Click handlers
  // Add this property to your component class
  selectedSiteId: number | null = null;

  // Update the onSiteClick method
  onSiteClick(siteId: number): void {
    console.log("Site clicked:", siteId);
    this.selectedSiteId = siteId; // Track the selected site

    const site = this.data.sites.find((s) => s.id === siteId);
    if (site) {
      const area = this.getAreaForSite(siteId);
      const city = area ? this.getCityForArea(area.id) : null;
      const region = city ? this.getRegionForCity(city.id) : null;

      this.showPanel("site", site, area, city, region);
    }
  }

  showPanel(
    type: "region" | "city" | "area" | "site",
    data: any,
    parentData?: any,
    grandParentData?: any,
    greatGrandParentData?: any
  ): void {
    let title = "";
    switch (type) {
      case "region":
        title = `Region: ${data.name}`;
        break;
      case "city":
        title = `City: ${data.name}`;
        break;
      case "area":
        title = `Area: ${data.name}`;
        break;
      case "site":
        title = `Site: ${data.name}`;
        break;
    }

    this.currentPanel = {
      type,
      title,
      data,
      parentData,
      grandParentData,
      greatGrandParentData,
    };
  }

  closePanel(): void {
    this.currentPanel = null;
  }

  // Utility methods for navigation
  private getRegionForCity(cityId: number): any {
    const city = this.data.cities.find((c) => c.id === cityId);
    if (!city) return null;
    return this.data.regions.find((r) => r.id === city.regionId);
  }

  private getCityForArea(areaId: number): any {
    const area = this.data.areas.find((a) => a.id === areaId);
    if (!area) return null;
    return this.data.cities.find((c) => c.id === area.cityId);
  }

  private getAreaForSite(siteId: number): any {
    const site = this.data.sites.find((s) => s.id === siteId);
    if (!site) return null;
    return this.data.areas.find((a) => a.id === site.areaId);
  }
}