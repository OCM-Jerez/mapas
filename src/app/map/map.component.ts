import { AfterViewInit, Component, inject } from '@angular/core';
import { GeoJsonObject } from 'geojson';
import { Map, geoJSON, polygon, polyline, tileLayer } from 'leaflet';

import { MapDataService } from '@services/map-data.service';
import { ds02004 } from '../../assets/data/secciones-censales/02-004';
import { ds02011 } from '../../assets/data/secciones-censales/02-011';
import { ds02013 } from '../../assets/data/secciones-censales/02-013';
import { ds02014 } from '../../assets/data/secciones-censales/02-014';
import { ds02021 } from '../../assets/data/secciones-censales/02-021';
import { ds02026 } from '../../assets/data/secciones-censales/02-026';
import { distritoCentro } from '../../assets/data/distritos/distritoCentro';
import { limitesAlbarizuela } from '../../assets/data/Albarizuela/limitesAlbarizuela';

@Component({
  selector: 'app-map',
  standalone: true,
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export default class MapComponent implements AfterViewInit {
  private readonly mapDataService = inject(MapDataService);

  ngAfterViewInit(): void {
    this.initializeMap();
  }

  private initializeMap(): void {
    // http://leaflet-extras.github.io/leaflet-providers/preview/
    const mapProblemas = new Map('map');

    // Add distrito Centro polygon
    this.addDistritoPolygon(mapProblemas);
    
    // Add Albarizuela limits
    this.addAlbarizuelaLimits(mapProblemas);
    
    // Add section polygons
    this.addSectionPolygons(mapProblemas);
    
    // Add GeoJSON data
    this.addGeoJsonData(mapProblemas);
    
    // Add tile layer
    this.addTileLayer(mapProblemas);

    // Set map view
    mapProblemas.setView([36.68519, -6.13229], 18);
  }

  private addDistritoPolygon(map: Map): void {
    const distritoCentroArray: [number, number][] = distritoCentro.map(
      (element: any) => [element.lat, element.lng]
    );
    
    polyline(distritoCentroArray, {
      color: 'red',
      weight: 9
    }).addTo(map);
  }

  private addAlbarizuelaLimits(map: Map): void {
    const limitesAlbarizuelaArray: [number, number][] = limitesAlbarizuela.map(
      (element) => [element.lat, element.lng]
    );
    
    polyline(limitesAlbarizuelaArray, {
      color: 'green',
      weight: 9
    }).addTo(map);
  }

  private addSectionPolygons(map: Map): void {
    const sections = [
      { data: ds02021, color: 'green', fillOpacity: 0.1, longKey: 'long' },
      { data: ds02004, color: 'blue', fillOpacity: 0.2, longKey: 'lng' },
      { data: ds02014, color: 'yellow', fillOpacity: 0.2, longKey: 'lng' },
      { data: ds02026, color: 'black', fillOpacity: 0.2, longKey: 'lng' },
      { data: ds02011, color: 'red', fillOpacity: 0.1, longKey: 'lng' },
      { data: ds02013, color: 'red', fillOpacity: 0.2, longKey: 'lng' }
    ];

    sections.forEach(section => {
      const coordinates: [number, number][] = section.data.map((element: any) => [
        element.lat,
        element[section.longKey as keyof typeof element]
      ]);
      
      polygon(coordinates, {
        color: section.color,
        fillColor: section.color,
        fillOpacity: section.fillOpacity
      }).addTo(map);
    });
  }

  private addGeoJsonData(map: Map): void {
    const secionesCensales = this.mapDataService.getSecionesCensales();
    
    const geoJson = geoJSON(secionesCensales as GeoJsonObject, {
      style: (feature) => {
        // Default style
        let defaultStyle = {
          color: 'green',
          fillColor: 'green',
          fillOpacity: 0.1
        };

        // Apply different style based on distrito Centro sections
        const distritoSections = [
          '01-001', '01-002', '01-003', '01-004', '01-005',
          '02-001', '02-002', '02-003', '02-005', '02-006', '02-007', '02-008',
          '02-011', '02-012', '02-013', '02-017', '02-022', '02-023', '02-024', '02-025',
          '03-010', '03-015', '03-018'
        ];

        if (feature && distritoSections.includes(feature.properties.ID)) {
          defaultStyle.color = 'blue';
          defaultStyle.fillColor = 'red';
        }

        return defaultStyle;
      },
      onEachFeature: (feature, layer) => {
        if (feature.properties?.ID) {
          layer.bindPopup('ID: ' + feature.properties.ID);
        }
      }
    }).addTo(map);
  }

  private addTileLayer(map: Map): void {
    tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 21,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
  }
}
