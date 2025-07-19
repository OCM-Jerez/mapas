import { AfterViewInit, Component, computed, inject, signal } from '@angular/core';
import { Icon, geoJSON, map, marker, tileLayer, polygon, Layer, LeafletEvent, Map as LeafletMap } from 'leaflet';
import { GeoJsonObject, Feature, Geometry } from 'geojson';

import { MapDataService } from '@services/map-data.service';
import { PerimetroInfoComponent } from '../perimetro-info/perimetro-info.component';
import { distritoCentro } from '../../assets/data/distritos/distritoCentro';
import type { PerimetroData } from '@interfaces/map.interface';

@Component({
  selector: 'app-map-variation',
  templateUrl: './map-variation.component.html',
  styleUrls: ['./map-variation.component.scss'],
  imports: [PerimetroInfoComponent]
})
export class MapVariationComponent implements AfterViewInit {
  private readonly mapDataService = inject(MapDataService);
  
  // Signals for component state
  private readonly _showMap = signal(true);
  private readonly _showPerimetroInfo = signal(false);
  private readonly _showDistritoCentro = signal(true);
  private readonly _showPerimetroIntramuros = signal(true);
  private readonly _perimetroData = signal<PerimetroData | null>(null);
  
  // Public readonly signals
  readonly showMap = this._showMap.asReadonly();
  readonly showPerimetroInfo = this._showPerimetroInfo.asReadonly();
  readonly showDistritoCentro = this._showDistritoCentro.asReadonly();
  readonly showPerimetroIntramuros = this._showPerimetroIntramuros.asReadonly();
  readonly perimetroData = this._perimetroData.asReadonly();
  
  // Map references
  private distritoPolygon: Layer | null = null;
  private perimetroIntramurosLayer: Layer | null = null;
  private mapVariation: LeafletMap | null = null;
  
  // Configuration
  private readonly tileLayerConfig = {
    maxZoom: 17,
    minZoom: 10,
    attribution:
      'Map data &copy; <a href="http://openstreetmap.org"> OpenStreetMap</a> Contributors, ' +
      '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery © <a href="http://mapbox.com">Mapbox</a>',
    id: 'mapbox.light',
  };

  // Event handlers for map features
  private readonly onEachFeature = (feature: Feature<Geometry, any>, layer: Layer): void => {
    layer.on({
      mouseover: this.highlightFeature,
      mouseout: this.resetHighlight,
    });
  };

  private readonly highlightFeature = (e: LeafletEvent): void => {
    const layer = e.target;
    layer.setStyle({
      weight: 5,
      color: '#666',
      dashArray: '',
      fillOpacity: 0.3,
      fillColor: '#333'
    });
  };

  private readonly resetHighlight = (e: LeafletEvent): void => {
    const layer = e.target;
    layer.setStyle({
      weight: 2,
      color: '#3388ff',
      dashArray: '',
      fillOpacity: 0,
    });
  };

  toggleMap(): void {
    this._showMap.update(show => !show);
    
    if (this._showMap()) {
      setTimeout(() => {
        this.initializeMap();
      }, 0);
    }
  }

  showPerimetroInformation(): void {
    const perimetroRealData = this.mapDataService.getPerimetroRealData();
    
    if (perimetroRealData?.features?.[0]) {
      const feature = perimetroRealData.features[0];
      const geometry = feature.geometry as any;
      const pointsCount = geometry?.coordinates?.[0]?.length ? geometry.coordinates[0].length - 1 : 'N/A';
      
      this._perimetroData.set({
        name: feature.properties.name || 'Perímetro Real de Secciones',
        method: feature.properties.method || 'polygon-union',
        sectionCount: feature.properties.sectionCount || 0,
        sections: feature.properties.sections || [],
        description: feature.properties.description || 'Perímetro exterior exacto obtenido por unión de polígonos',
        pointsCount
      });
      
      this._showPerimetroInfo.set(true);
    } else {
      console.warn('No hay datos de perímetro disponibles para mostrar');
    }
  }

  closePerimetroInfo(): void {
    this._showPerimetroInfo.set(false);
    this._perimetroData.set(null);
  }

  toggleDistritoCentro(): void {
    this._showDistritoCentro.update(show => !show);
    
    if (this.distritoPolygon && this.mapVariation) {
      if (this._showDistritoCentro()) {
        this.distritoPolygon.addTo(this.mapVariation);
        console.log('✅ Distrito Centro mostrado');
      } else {
        this.distritoPolygon.remove();
        console.log('✅ Distrito Centro ocultado');
      }
    }
  }

  togglePerimetroIntramuros(): void {
    this._showPerimetroIntramuros.update(show => !show);
    
    if (this.perimetroIntramurosLayer && this.mapVariation) {
      if (this._showPerimetroIntramuros()) {
        this.perimetroIntramurosLayer.addTo(this.mapVariation);
        console.log('✅ Perímetro intramuros mostrado');
      } else {
        this.perimetroIntramurosLayer.remove();
        console.log('✅ Perímetro intramuros ocultado');
      }
    }
  }

  ngAfterViewInit(): void {
    if (this._showMap()) {
      setTimeout(() => {
        this.initializeMap();
      }, 0);
    }
  }

  private initializeMap(): void {
    // Get data from service
    const secionesCensales = this.mapDataService.getSecionesCensales();
    const perimetroRealData = this.mapDataService.getPerimetroRealData();
    const perimetroIntramurosData = this.mapDataService.getPerimetroIntramurosData();
    
    console.log('Iniciando map-variation component optimizado');
    
    // Create map
    const mapVariation = map('map-variation', {
      center: [36.684881, -6.132903],
      zoomControl: false,
      zoom: 16,
      maxZoom: 17,
      minZoom: 11,
    });

    this.mapVariation = mapVariation;

    tileLayer(
      'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
      this.tileLayerConfig
    ).addTo(mapVariation);

    // Add census sections to map
    const geoJson = geoJSON(secionesCensales as GeoJsonObject, {
      onEachFeature: this.onEachFeature,
      style: {
        weight: 2,
        color: '#3388ff',
        dashArray: '',
        fillOpacity: 0,
      }
    }).addTo(mapVariation);

    this.addDistritoPolygon(mapVariation);
    this.addPerimetroLayers(mapVariation, perimetroRealData, perimetroIntramurosData);
    this.addVariationMarkers(mapVariation, secionesCensales);
  }

  private addDistritoPolygon(mapVariation: LeafletMap): void {
    if (distritoCentro?.length > 0) {
      try {
        const distritoCoords: [number, number][] = distritoCentro.map(point => [point.lat, point.lng]);
        
        this.distritoPolygon = polygon(distritoCoords, {
          color: '#2563eb',
          weight: 10,
          opacity: 0.8,
          fillColor: '#3b82f6',
          fillOpacity: 0.1,
          dashArray: '5, 5',
          interactive: false
        });

        this.distritoPolygon.bindPopup('<h4>Distrito Centro</h4><p>Límites administrativos del distrito Centro de Jerez</p>');
        
        if (this._showDistritoCentro()) {
          this.distritoPolygon.addTo(mapVariation);
        }
        
        console.log('✅ Distrito Centro preparado');
      } catch (error) {
        console.error('❌ Error al preparar el distrito Centro:', error);
      }
    }
  }

  private addPerimetroLayers(mapVariation: LeafletMap, perimetroRealData: any, perimetroIntramurosData: any): void {
    // Add real perimeter
    if (perimetroRealData) {
      try {
        geoJSON(perimetroRealData as GeoJsonObject, {
          style: {
            color: '#ff0000',
            weight: 6,
            opacity: 1.0,
            fillColor: '#ff0000',
            fillOpacity: 0.15,
            dashArray: '',
            interactive: false
          }
        }).addTo(mapVariation);
        
        console.log('✅ Perímetro real añadido');
      } catch (error) {
        console.error('❌ Error al añadir el perímetro:', error);
      }
    }

    // Add intramuros perimeter
    if (perimetroIntramurosData) {
      try {
        this.perimetroIntramurosLayer = geoJSON(perimetroIntramurosData as GeoJsonObject, {
          style: {
            color: '#00ff00',
            weight: 4,
            opacity: 0.9,
            fillColor: '#00ff00',
            fillOpacity: 0.1,
            dashArray: '10, 5',
            interactive: false
          }
        });

        if (this._showPerimetroIntramuros()) {
          this.perimetroIntramurosLayer.addTo(mapVariation);
        }

        this.perimetroIntramurosLayer.bindPopup(`
          <h4>Perímetro Intramuros</h4>
          <p><strong>Método:</strong> ${perimetroIntramurosData.metadata?.method || 'N/A'}</p>
          <p><strong>Secciones:</strong> ${perimetroIntramurosData.metadata?.foundSections || 0}</p>
        `);

        console.log('✅ Perímetro intramuros preparado');
      } catch (error) {
        console.error('❌ Error al preparar el perímetro intramuros:', error);
      }
    }
  }

  private addVariationMarkers(mapVariation: LeafletMap, secionesCensales: any): void {
    const variacionMap = this.mapDataService.createVariationMap();
    const poblacion2024Map = this.mapDataService.createPoblacion2024Map();

    // Create marker icons
    const icons = {
      positive: new Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      }),
      negative: new Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      }),
      neutral: new Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      })
    };

    const validFeatures = this.mapDataService.filterValidFeatures(
      secionesCensales.features,
      variacionMap,
      poblacion2024Map
    );

    const variationMarkers = validFeatures.map(feature => {
      const seccionData = variacionMap[feature.properties.ID];
      const poblacion2024 = Number(poblacion2024Map[feature.properties.ID]);
      const poblacion2011 = Number(seccionData.poblacion2011);
      const variacion = poblacion2024 - poblacion2011;
      const porcentajeVariacion = Number(((variacion / poblacion2011) * 100).toFixed(2));
      
      // Determine icon and tooltip style based on variation
      let icon = icons.neutral;
      let colorTooltip = 'tooltipNeutral';
      
      if (variacion > 50) {
        icon = icons.positive;
        colorTooltip = 'tooltipPositive';
      } else if (variacion < -50) {
        icon = icons.negative;
        colorTooltip = 'tooltipNegative';
      }

      return {
        icon,
        title: `
          <h4>${feature.properties.ID} - ${seccionData.nombre}</h4>
          <p><strong>Población 2011:</strong> ${poblacion2011}</p>
          <p><strong>Población 2024:</strong> ${poblacion2024}</p>
          <p><strong>Variación:</strong> ${variacion > 0 ? '+' : ''}${variacion}</p>
          <p><strong>Porcentaje:</strong> ${porcentajeVariacion > 0 ? '+' : ''}${porcentajeVariacion}%</p>
        `,
        tooltip: `${variacion > 0 ? '+' : ''}${variacion}`,
        lat: feature.properties.lat,
        long: feature.properties.long,
        colorTooltip
      };
    });

    // Add markers to map
    variationMarkers.forEach(point => {
      if (point.lat && point.long) {
        marker([point.lat, point.long], {
          icon: point.icon,
        })
          .addTo(mapVariation)
          .bindPopup(point.title)
          .bindTooltip(point.tooltip, {
            permanent: true,
            className: point.colorTooltip,
          });
      }
    });

    console.log(`✅ ${variationMarkers.length} marcadores de variación añadidos`);
  }
}
