// location.model.ts
export interface Site {
  id: number;
  name: string;
  areaId: number;
}

export interface Area {
  id: number;
  name: string;
  cityId: number;
  sites: number[];
  sitesData?: Site[];
}

export interface City {
  id: number;
  name: string;
  regionId: number;
  areas: number[];
  areasData?: Area[];
}

export interface Region {
  id: number;
  name: string;
  cities: number[];
  citiesData?: City[];
}

export interface LocationData {
  regions: Region[];
  cities: City[];
  areas: Area[];
  sites: Site[];
}
