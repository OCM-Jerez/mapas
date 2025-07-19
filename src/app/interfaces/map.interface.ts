export type MapType = 'population' | 'variation' | 'basic' | 'distritos';

export interface PopulationData {
  'Código sección': string;
  'Población 2024': number;
  'Nombre': string;
}

export interface VariationData {
  'Código sección': string;
  'Población 2011': number;
  'Nombre': string;
}

export interface SectionFeature {
  properties: {
    ID: string;
    lat?: number;
    long?: number;
    [key: string]: any;
  };
  geometry: any;
}

export interface MarkerData {
  icon: any;
  title: string;
  tooltip: string;
  lat: number;
  long: number;
  colorTooltip: string;
  variacion: number;
}

export interface PerimetroData {
  name: string;
  method: string;
  sectionCount: number;
  sections: string[];
  description: string;
  pointsCount: number | string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}
