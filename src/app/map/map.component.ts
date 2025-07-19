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
  private readonly variationMap = computed(() => this.mapDataService.createVariationMap());
  private readonly poblacion2024Map = computed(() => this.mapDataService.createPoblacion2024Map());
  private readonly secionesCensales = computed(() => this.mapDataService.getSecionesCensales());
  private readonly validFeatures = computed(() => 
    this.mapDataService.filterValidFeatures(
      this.secionesCensales().features as SectionFeature[],
      this.variationMap(),
      this.poblacion2024Map()
    )
  );

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
  private readonly defaultZoom = 16;

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
    const variationMap = this.variationMap();
    const poblacion2024Map = this.poblacion2024Map();

    // Create icons
    const iconGreen = this.createIcon('blue');
    
    // Process features and create markers
    const markersData = this.createMarkersData(
      secionesCensalesData.features as SectionFeature[],
      variationMap,
      poblacion2024Map,
      iconGreen
    );

    // Add markers to map
    markersData.forEach(markerData => {
      L.marker([markerData.lat, markerData.long], {
        icon: markerData.icon,
      })
        .addTo(mapInstance)
        .bindPopup(markerData.title)
        .bindTooltip(markerData.tooltip, {
          permanent: true,
          className: markerData.colorTooltip,
        });
    });
  }

  private createIcon(color: string): L.Icon {
    return new L.Icon({
      iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
  }

  private createMarkersData(
    features: SectionFeature[],
    variationMap: Record<string, { poblacion2011: number; nombre: string }>,
    poblacion2024Map: Record<string, number>,
    icon: L.Icon
  ): MarkerData[] {
    return features
      .filter(feature => {
        const hasVariationData = variationMap[feature.properties.ID] !== undefined;
        const hasPoblacion2024Data = poblacion2024Map[feature.properties.ID] !== undefined;
        const hasCoords = feature.properties.lat && feature.properties.long;
        return hasVariationData && hasPoblacion2024Data && hasCoords;
      })
      .map(feature => {
        const properties = feature.properties;
        const variationData = variationMap[properties.ID];
        const poblacion2024 = poblacion2024Map[properties.ID];
        
        // Extract population data with proper index access
        const censados = properties['censados'] ? properties['censados'].replace(/\./g, '') : null;
        const censo2022 = Number(properties['censo2022']);
        const censo2004 = Number(properties['censo2004']);
        const total = Number(properties['TOTAL']);
        
        // Calculate variation between census 2022 and 2004
        const variacion2022_2004 = censo2022 - censo2004;
        const porcentajeVariacion2022_2004 = censo2004 > 0 
          ? Number(((variacion2022_2004 / censo2004) * 100).toFixed(2)) 
          : 0;
        
        return {
          icon,
          title: this.createPopupContent(properties, censados, censo2022, censo2004, total, variacion2022_2004, porcentajeVariacion2022_2004),
          tooltip: total.toString(),
          lat: properties.lat!,
          long: properties.long!,
          colorTooltip: properties['backgroundColor'] || '',
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
        <p><strong>Censo 2022:</strong> ${censo2022.toLocaleString()}</p>
        <p><strong>Censo 2004:</strong> ${censo2004.toLocaleString()}</p>
        <p><strong>Total registrado:</strong> ${total.toLocaleString()}</p>
        <hr style="margin: 8px 0;">
        <p><strong>Variación (2004-2022):</strong> ${variacion > 0 ? '+' : ''}${variacion.toLocaleString()}</p>
        <p><strong>Porcentaje:</strong> ${porcentaje > 0 ? '+' : ''}${porcentaje}%</p>
      </div>
    `;
  }
}
