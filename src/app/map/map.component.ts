import { AfterViewInit, Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { GeoJsonObject } from 'geojson';

import type { MarkerData, SectionFeature } from '@interfaces/map.interface';
import { MapDataService } from '@services/map-data.service';
import { MapStateService } from '@services/map-state.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  imports: [CommonModule]
})
export class MapComponent implements AfterViewInit, OnDestroy {
  // Services injection
  private readonly mapDataService = inject(MapDataService);
  private readonly mapStateService = inject(MapStateService);

  // Component state signals
  private readonly mapInstance = signal<L.Map | null>(null);
  private readonly geoJsonLayer = signal<L.GeoJSON | null>(null);
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);

  // Computed signals for data processing
  private readonly secionesCensales = computed(() => this.mapDataService.getSecionesCensales());
  
  // Map configuration
  private readonly tileLayerConfig = {
    maxZoom: 17,
    minZoom: 10,
    attribution:
      'Map data &copy; <a href="http://openstreetmap.org"> OpenStreetMap</a> Contributors, ' +
      '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery © <a href="http://mapbox.com">Mapbox</a>',
    id: 'mapbox.light',
  };

  private readonly mapCenter: [number, number] = [36.684881, -6.132903];
  private readonly defaultZoom = 14;

  // Event handlers with proper typing
  private readonly onEachFeature = (feature: any, layer: L.Layer): void => {
    layer.on({
      mouseover: this.highlightFeature,
      mouseout: this.resetHighlight,
    });
  };

  private readonly highlightFeature = (e: L.LeafletMouseEvent): void => {
    const layer = e.target as L.Path;
    layer.setStyle({
      weight: 5,
      color: '#666',
      dashArray: '',
      fillOpacity: 0.3,
      fillColor: '#333'
    });
  };

  private readonly resetHighlight = (e: L.LeafletMouseEvent): void => {
    const layer = e.target as L.Path;
    layer.setStyle({
      weight: 2,
      color: '#3388ff',
      dashArray: '',
      fillOpacity: 0,
    });
  };

  ngAfterViewInit(): void {
    try {
      this.initializeMap();
      this.isLoading.set(false);
    } catch (error) {
      console.error('Error initializing map:', error);
      this.error.set('Error al inicializar el mapa');
      this.isLoading.set(false);
    }
  }

  ngOnDestroy(): void {
    const map = this.mapInstance();
    if (map) {
      map.remove();
      this.mapInstance.set(null);
    }
  }

  private initializeMap(): void {
    // Initialize Leaflet map
    const mapInstance = L.map('map', {
      center: this.mapCenter,
      zoomControl: false,
      zoom: this.defaultZoom,
      maxZoom: 17,
      minZoom: 11,
    });

    this.mapInstance.set(mapInstance);

    // Add tile layer
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', this.tileLayerConfig)
      .addTo(mapInstance);

    // Add GeoJSON layer
    this.addGeoJsonLayer(mapInstance);

    // Add markers
    this.addMarkers(mapInstance);
  }

  private addGeoJsonLayer(mapInstance: L.Map): void {
    const secionesCensalesData = this.secionesCensales();
    
    const geoJsonLayer = L.geoJSON(secionesCensalesData as GeoJsonObject, {
      onEachFeature: this.onEachFeature,
      style: {
        weight: 2,
        color: '#3388ff',
        dashArray: '',
        fillOpacity: 0,
      }
    }).addTo(mapInstance);

    this.geoJsonLayer.set(geoJsonLayer);
  }

  private addMarkers(mapInstance: L.Map): void {
    const secionesCensalesData = this.secionesCensales();
    
    // Process features and create markers - usar directamente las features sin filtrado
    const markersData = this.createMarkersData(
      secionesCensalesData.features as SectionFeature[]
    );

    // Add markers to map
    markersData.forEach(markerData => {
      // Determine background color based on variation
      const backgroundColor = markerData.variacion > 0 ? 'green' : 'red';
      
      // Create a divIcon with just the number and colored background
      const numberIcon = L.divIcon({
        className: 'number-marker',
        html: `<div class="marker-number" style="background-color: ${backgroundColor}">${markerData.tooltip}</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      L.marker([markerData.lat, markerData.long], {
        icon: numberIcon,
      })
        .addTo(mapInstance)
        .bindPopup(markerData.title);
    });
  }

  private createMarkersData(
    features: SectionFeature[]
  ): MarkerData[] {
    return features
      .filter(feature => {
        // Solo requerimos coordenadas para mostrar el marcador
        const hasCoords = feature.properties.lat && feature.properties.long;
        return hasCoords;
      })
      .map(feature => {
        const properties = feature.properties;
        
        // Extract population data with proper index access - usar solo datos del JSON principal
        const censados = properties['censados'] ? properties['censados'].replace(/\./g, '') : null;
        const censo2022 = Number(properties['censo2022'] || 0);
        const censo2004 = Number(properties['censo2004'] || 0);
        const total = Number(properties['TOTAL'] || 0);
        
        // Calculate variation between census 2022 and 2004
        const variacion2022_2004 = censo2022 - censo2004;
        const porcentajeVariacion2022_2004 = censo2004 > 0 
          ? Number(((variacion2022_2004 / censo2004) * 100).toFixed(2)) 
          : 0;
        
        return {
          title: this.createPopupContent(properties, censados, censo2022, censo2004, total, variacion2022_2004, porcentajeVariacion2022_2004),
          tooltip: total.toString() || properties.ID,
          lat: properties.lat!,
          long: properties.long!,
          colorTooltip: properties['backgroundColor'] || 'tooltipBlue',
          variacion: variacion2022_2004,
        };
      });
  }

  private createPopupContent(
    properties: any,
    censados: string | null,
    censo2022: number,
    censo2004: number,
    total: number,
    variacion: number,
    porcentaje: number
  ): string {
    return `
      <div style="max-width: 280px;">
        <h4>${properties.ID}</h4>
        <hr style="margin: 8px 0;">
        <p><strong>Población actual (censados):</strong> ${censados ? Number(censados).toLocaleString() : 'No disponible'}</p>
        <p><strong>Censo 2022:</strong> ${censo2022 > 0 ? censo2022.toLocaleString() : 'No disponible'}</p>
        <p><strong>Censo 2004:</strong> ${censo2004 > 0 ? censo2004.toLocaleString() : 'No disponible'}</p>
        <p><strong>Total registrado:</strong> ${total > 0 ? total.toLocaleString() : 'No disponible'}</p>
        <hr style="margin: 8px 0;">
        <p><strong>Variación (2004-2022):</strong> ${censo2022 > 0 && censo2004 > 0 ? (variacion > 0 ? '+' : '') + variacion.toLocaleString() : 'No calculable'}</p>
        <p><strong>Porcentaje:</strong> ${censo2022 > 0 && censo2004 > 0 ? (porcentaje > 0 ? '+' : '') + porcentaje + '%' : 'No calculable'}</p>
      </div>
    `;
  }
}
