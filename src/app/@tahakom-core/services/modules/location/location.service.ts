// location.service.ts
import { Injectable } from "@angular/core";
import { Area, City, LocationData, Region, Site } from "@models/interfaces/location/location.model";

@Injectable({
  providedIn: "root",
})
export class LocationService {
  private locationData = {
    regions: [
      {
        id: 1,
        name: "Riyadh Region",
        cities: [1, 2],
      },
      {
        id: 2,
        name: "Makkah Region",
        cities: [3],
      },
    ],
    cities: [
      {
        id: 1,
        name: "Riyadh",
        regionId: 1,
        areas: [1, 2],
      },
      {
        id: 2,
        name: "Al-Kharj",
        regionId: 1,
        areas: [3],
      },
      {
        id: 3,
        name: "Jeddah",
        regionId: 2,
        areas: [4, 5],
      },
    ],
    areas: [
      {
        id: 1,
        name: "Olaya",
        cityId: 1,
        sites: [1, 2],
      },
      {
        id: 2,
        name: "Al-Malaz",
        cityId: 1,
        sites: [3],
      },
      {
        id: 3,
        name: "Al-Yamamah",
        cityId: 2,
        sites: [4],
      },
      {
        id: 4,
        name: "Al-Rawdah",
        cityId: 3,
        sites: [5],
      },
      {
        id: 5,
        name: "Al-Safa",
        cityId: 3,
        sites: [6],
      },
    ],
    sites: [
      {
        id: 1,
        name: "Kingdom Centre Tower",
        areaId: 1,
      },
      {
        id: 2,
        name: "Al Faisaliyah Center",
        areaId: 1,
      },
      {
        id: 3,
        name: "Riyadh Zoo",
        areaId: 2,
      },
      {
        id: 4,
        name: "Al Kharj Water Tower",
        areaId: 3,
      },
      {
        id: 5,
        name: "King Abdulaziz University",
        areaId: 4,
      },
      {
        id: 6,
        name: "Al-Salam Mall",
        areaId: 5,
      },
    ],
  };

  getProcessedLocations(): { regions: Region[] } {
    // Create deep copies of all arrays to avoid mutation
    const regions = JSON.parse(JSON.stringify(this.locationData.regions));
    const cities = JSON.parse(JSON.stringify(this.locationData.cities));
    const areas = JSON.parse(JSON.stringify(this.locationData.areas));
    const sites = JSON.parse(JSON.stringify(this.locationData.sites));

    // Process the hierarchy
    regions.forEach((region:any) => {
      region.citiesData = cities
        .filter((city: any) => region.cities.includes(city.id))
        .map((city: any) => {
          city.areasData = areas
            .filter((area: any) => city.areas.includes(area.id))
            .map((area: any) => {
              area.sitesData = sites.filter((site: any) =>
                area.sites.includes(site.id)
              );
              return area;
            });
          return city;
        });
    });

    return { regions };
  }
}
