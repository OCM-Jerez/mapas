import { AfterViewInit, Component, computed, inject, signal, OnDestroy } from '@angular/core';
import { geoJSON, map, marker, tileLayer, polygon, Layer, LeafletEvent, Map as LeafletMap, divIcon, Control, DomUtil } from 'leaflet';
import * as L from 'leaflet';
import { GeoJsonObject, Feature, Geometry } from 'geojson';

import { MapDataService } from '@services/map-data.service';
import { MapStateService } from '@services/map-state.service';
import { PerimetroInfoComponent } from '../perimetro-info/perimetro-info.component';
import { distritoCentro } from '../../assets/data/distritos/distritoCentro';
import type { PerimetroData } from '@interfaces/map.interface';

@Component({
  selector: 'app-map-variation',
  templateUrl: './map-variation.component.html',
  styleUrls: ['./map-variation.component.scss'],
  imports: [PerimetroInfoComponent]
})
export class MapVariationComponent implements AfterViewInit, OnDestroy {
  private readonly mapDataService = inject(MapDataService);
  private readonly mapStateService = inject(MapStateService);
  
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

  // Get legend data for template
  getLegendData() {
    return [
      { label: '1000+', color: this.getVariationColor(1500) },
      { label: '500–1000', color: this.getVariationColor(750) },
      { label: '200–500', color: this.getVariationColor(350) },
      { label: '100–200', color: this.getVariationColor(150) },
      { label: '50–100', color: this.getVariationColor(75) },
      { label: '20–50', color: this.getVariationColor(35) },
      { label: '10–20', color: this.getVariationColor(15) },
      { label: '0–10', color: this.getVariationColor(5) },
      { label: '-10–0', color: this.getVariationColor(-5) },
      { label: '-20 – -10', color: this.getVariationColor(-15) },
      { label: '-50 – -20', color: this.getVariationColor(-35) },
      { label: '-100 – -50', color: this.getVariationColor(-75) },
      { label: '-200 – -100', color: this.getVariationColor(-150) },
      { label: '< -200', color: this.getVariationColor(-250) },
      { label: 'Sin datos', color: 'transparent', border: '1px dashed #ccc' }
    ];
  }
  
  // Map references
  private distritoPolygon: Layer | null = null;
  private perimetroIntramurosLayer: Layer | null = null;
  private mapVariation: LeafletMap | null = null;
  private geoJsonLayer: Layer | null = null;
  private infoControl: any = null;
  
  // Variation data cache
  private variationMap = new Map<string, number>();
  
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

  // Choropleth color scale function - Red to Green (low to high values)
  private readonly getVariationColor = (variation: number): string => {
    // Red tones for negative/low values, Green tones for positive/high values
    return variation >= 1000 ? '#006400' :  // Dark green for very high positive variation (1000+)
           variation >= 500  ? '#228B22' :  // Forest green (500-1000)
           variation >= 200  ? '#32CD32' :  // Lime green (200-500)
           variation >= 100  ? '#7CFC00' :  // Lawn green (100-200)
           variation >= 50   ? '#9AFF9A' :  // Light green (50-100)
           variation >= 20   ? '#FFFF99' :  // Light yellow (20-50)
           variation >= 10   ? '#FFCC99' :  // Light orange (10-20)
           variation >= 0    ? '#FFB366' :  // Light orange-red (0-10)
           variation >= -10  ? '#FF9999' :  // Light red (-10 to 0)
           variation >= -20  ? '#FF6666' :  // Red (-20 to -10)
           variation >= -50  ? '#FF3333' :  // Bright red (-50 to -20)
           variation >= -100 ? '#FF0000' :  // Pure red (-100 to -50)
           variation >= -200 ? '#CC0000' :  // Dark red (-200 to -100)
                              '#990000';   // Very dark red (less than -200)
  };

  // Style function for choropleth
  private readonly choroplethStyle = (feature?: Feature<Geometry, any>) => {
    if (!feature) {
      return {
        fillColor: 'transparent',
        weight: 1,
        opacity: 0.3,
        color: '#ccc',
        dashArray: '3',
        fillOpacity: 0
      };
    }
    
    const sectionId = feature.properties?.ID;
    const variation = sectionId ? this.variationMap.get(sectionId) : undefined;
    
    // If no variation data is available, make it transparent
    if (variation === undefined) {
      return {
        fillColor: 'transparent',
        weight: 1,
        opacity: 0.3,
        color: '#ccc',
        dashArray: '3',
        fillOpacity: 0
      };
    }
    
    return {
      fillColor: this.getVariationColor(variation),
      weight: 2,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.5
    };
  };

  // Event handlers for map features
  private readonly onEachFeature = (feature: Feature<Geometry, any>, layer: Layer): void => {
    layer.on({
      mouseover: this.highlightFeature,
      mouseout: this.resetHighlight,
      click: this.zoomToFeature
    });
  };

  private readonly highlightFeature = (e: LeafletEvent): void => {
    const layer = e.target;
    const feature = layer.feature;
    
    // Get variation data to determine if section has data
    const sectionId = feature?.properties?.ID;
    const variation = sectionId ? this.variationMap.get(sectionId) : undefined;
    
    // Different highlight style for sections without data
    if (variation === undefined) {
      layer.setStyle({
        weight: 3,
        color: '#999',
        dashArray: '',
        fillOpacity: 0.2,
        fillColor: '#f0f0f0'
      });
    } else {
      layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.5
      });
    }
    
    layer.bringToFront();
    
    // Update info control
    if (this.infoControl && feature?.properties) {
      const sectionName = this.getSectionName(sectionId);
      
      if (variation === undefined) {
        (this.infoControl as any).update({
          name: sectionName || sectionId,
          variation: 'Sin datos',
          sectionId: sectionId
        });
      } else {
        // Get detailed population data for this section
        const variacionPoblacion = this.mapDataService.getVariacionPoblacion();
        const poblacion2024Data = this.mapDataService.getPoblacion2024Data();
        
        // Find the complete data for this section
        const variacionItem = variacionPoblacion.find(item => {
          const codigoCompleto = item['Código sección'].toString();
          if (codigoCompleto.length === 10) {
            const ultimosCinco = codigoCompleto.substring(5);
            const distrito = ultimosCinco.substring(0, 2);
            const seccion = ultimosCinco.substring(2, 5);
            const id = `${distrito}-${seccion}`;
            return id === sectionId;
          }
          return false;
        });
        
        const poblacion2024Item = poblacion2024Data.find(item => 
          item['Código sección'] === variacionItem?.['Código sección']
        );
        
        const poblacion2011 = variacionItem?.['Población 2011'];
        const poblacion2024 = poblacion2024Item?.['Población 2024'];
        const porcentaje = poblacion2011 && poblacion2024 ? ((poblacion2024 - poblacion2011) / poblacion2011) * 100 : undefined;
        
        (this.infoControl as any).update({
          name: sectionName || sectionId,
          variation: variation,
          sectionId: sectionId,
          poblacion2011: poblacion2011,
          poblacion2024: poblacion2024,
          porcentaje: porcentaje
        });
      }
    }
  };

  private readonly resetHighlight = (e: LeafletEvent): void => {
    if (this.geoJsonLayer) {
      (this.geoJsonLayer as any).resetStyle(e.target);
    }
    
    // Reset info control
    if (this.infoControl) {
      (this.infoControl as any).update();
    }
  };

  private readonly zoomToFeature = (e: LeafletEvent): void => {
    if (this.mapVariation) {
      this.mapVariation.fitBounds(e.target.getBounds());
    }
  };

  // Helper method to get section name from variation data
  private getSectionName(sectionId: string): string | undefined {
    const variacionPoblacion = this.mapDataService.getVariacionPoblacion();
    const sectionData = variacionPoblacion.find(item => {
      const codigoCompleto = item['Código sección'].toString();
      if (codigoCompleto.length === 10) {
        const ultimosCinco = codigoCompleto.substring(5);
        const distrito = ultimosCinco.substring(0, 2);
        const seccion = ultimosCinco.substring(2, 5);
        const id = `${distrito}-${seccion}`;
        return id === sectionId;
      }
      return false;
    });
    
    return sectionData?.['Nombre'];
  }

  // Create custom info control - simplified approach  
  private createInfoControl(): any {
    const InfoControl = (L as any).Control.extend({
      options: {
        position: 'topright'
      },
      
      onAdd: function(map: any) {
        this._div = DomUtil.create('div', 'info');
        this.update();
        return this._div;
      },
      
      update: function(props?: { 
        name: string, 
        variation: number | string, 
        sectionId: string,
        poblacion2011?: number,
        poblacion2024?: number,
        porcentaje?: number
      }) {
        this._div.innerHTML = '<h4>Variación Poblacional (2011-2024)</h4>' + 
          (props ?
            '<b>' + props.name + '</b><br/>' +
            (props.variation === 'Sin datos' ? 
              '<b>Estado:</b> Sin datos disponibles' :
              '<br/><b>Población 2011:</b> ' + (props.poblacion2011 ? props.poblacion2011.toLocaleString('es-ES') : 'N/A') + '<br/>' +
              '<b>Población 2024:</b> ' + (props.poblacion2024 ? props.poblacion2024.toLocaleString('es-ES') : 'N/A') + '<br/>' +
              '<br/><b>Variación (2011-2024):</b> ' + (typeof props.variation === 'number' && props.variation > 0 ? '+' : '') + 
              (typeof props.variation === 'number' ? props.variation.toLocaleString('es-ES') : props.variation) + '<br/>' +
              '<b>Porcentaje:</b> ' + (props.porcentaje !== undefined ? 
                (props.porcentaje > 0 ? '+' : '') + props.porcentaje.toFixed(2) + '%' : 'N/A'))
            : 'Pasa el cursor sobre una sección');
      }
    });
    
    return new InfoControl();
  }

  toggleMap(): void {
    this._showMap.update(show => !show);
    
    // Controlar la visibilidad de la tabla a través del servicio
    if (this._showMap()) {
      // Si mostramos el mapa, ocultamos la tabla
      this.mapStateService.hideTable();
      setTimeout(() => {
        this.initializeMap();
      }, 0);
    } else {
      // Si ocultamos el mapa, mostramos la tabla
      this.mapStateService.showTableOnly();
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
    
    console.log('Iniciando map-variation component con choropleth');
    
    // Build variation map for choropleth colors
    this.buildVariationMap();
    
    // Create map
    const mapVariation = map('map-variation', {
      center: [36.684881, -6.136253],
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

    // Add census sections to map with choropleth styling
    this.geoJsonLayer = geoJSON(secionesCensales as GeoJsonObject, {
      style: this.choroplethStyle,
      onEachFeature: this.onEachFeature
    }).addTo(mapVariation);

    // Create and add info control
    this.infoControl = this.createInfoControl();
    if (this.infoControl) {
      this.infoControl.addTo(mapVariation);
      console.log('✅ Info control añadido');
    }

    this.addDistritoPolygon(mapVariation);
    this.addPerimetroLayers(mapVariation, perimetroRealData, perimetroIntramurosData);
    // Note: We keep markers for additional detailed information
    this.addVariationMarkers(mapVariation, secionesCensales);
  }

  // Build variation map for quick lookup
  private buildVariationMap(): void {
    const variacionPoblacion = this.mapDataService.getVariacionPoblacion();
    const poblacion2024Data = this.mapDataService.getPoblacion2024Data();
    
    let sectionsWithData = 0;
    let sectionsWithoutData = 0;
    
    variacionPoblacion.forEach(variacionItem => {
      // Find corresponding 2024 population data
      const poblacion2024Item = poblacion2024Data.find(item => 
        item['Código sección'] === variacionItem['Código sección']
      );
      
      if (poblacion2024Item) {
        // Extract section ID
        const codigoCompleto = variacionItem['Código sección'].toString();
        if (codigoCompleto.length === 10) {
          const ultimosCinco = codigoCompleto.substring(5);
          const distrito = ultimosCinco.substring(0, 2);
          const seccion = ultimosCinco.substring(2, 5);
          const seccionId = `${distrito}-${seccion}`;
          
          const poblacion2011 = variacionItem['Población 2011'];
          const poblacion2024 = poblacion2024Item['Población 2024'];
          const variacion = poblacion2024 - poblacion2011;
          
          this.variationMap.set(seccionId, variacion);
          sectionsWithData++;
        }
      } else {
        sectionsWithoutData++;
      }
    });
    
    console.log(`✅ Mapa de variación construido:`);
    console.log(`   - ${sectionsWithData} secciones con datos`);
    console.log(`   - ${sectionsWithoutData} secciones sin datos (aparecerán transparentes)`);
  }

  ngOnDestroy(): void {
    // Clean up controls when component is destroyed
    if (this.mapVariation) {
      if (this.infoControl) {
        this.mapVariation.removeControl(this.infoControl);
      }
    }
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
    // Usar directamente los datos de variación - no necesitamos crear mapas ni filtrar
    const variacionPoblacion = this.mapDataService.getVariacionPoblacion();
    const poblacion2024Data = this.mapDataService.getPoblacion2024Data();

    // Crear marcadores directamente desde los datos de variación
    const variationMarkers = variacionPoblacion.map(variacionItem => {
      // Buscar los datos de población 2024 correspondientes
      const poblacion2024Item = poblacion2024Data.find(item => 
        item['Código sección'] === variacionItem['Código sección']
      );
      
      if (!poblacion2024Item) return null;

      // Extraer el ID de la sección (formato XX-XXX)
      const codigoCompleto = variacionItem['Código sección'].toString();
      const ultimosCinco = codigoCompleto.substring(5);
      const distrito = ultimosCinco.substring(0, 2);
      const seccion = ultimosCinco.substring(2, 5);
      const seccionId = `${distrito}-${seccion}`;

      // Buscar las coordenadas en el JSON principal
      const featureCorrespondiente = secionesCensales.features.find((feature: any) => 
        feature.properties.ID === seccionId
      );

      if (!featureCorrespondiente || !featureCorrespondiente.properties.lat || !featureCorrespondiente.properties.long) {
        return null;
      }

      const poblacion2011 = variacionItem['Población 2011'];
      const poblacion2024 = poblacion2024Item['Población 2024'];
      const variacion = poblacion2024 - poblacion2011;
      const porcentajeVariacion = Number(((variacion / poblacion2011) * 100).toFixed(2));
      
      // Determine background color based on variation
      let backgroundColor = '#ffd700'; // neutral/yellow
      
      if (variacion > 50) {
        backgroundColor = 'green'; // positive
      } else if (variacion < -50) {
        backgroundColor = 'red'; // negative
      }

      return {
        backgroundColor,
        // <h4>${seccionId} - ${variacionItem['Nombre']}</h4>
        title: `
          <div style="max-width: 280px;">
                        <h4>${variacionItem['Nombre']}</h4>

            <hr style="margin: 8px 0;">
            <p><strong>Población 2011:</strong> ${poblacion2011.toLocaleString('es-ES', { useGrouping: true }).replace(/\s/g, '.')}</p>
            <p><strong>Población 2024:</strong> ${poblacion2024.toLocaleString('es-ES', { useGrouping: true }).replace(/\s/g, '.')}</p>
            <hr style="margin: 8px 0;">
            <p><strong>Variación (2011-2024):</strong> ${variacion > 0 ? '+' : ''}${variacion.toLocaleString('es-ES', { useGrouping: true }).replace(/\s/g, '.')}</p>
            <p><strong>Porcentaje:</strong> ${porcentajeVariacion > 0 ? '+' : ''}${porcentajeVariacion}%</p>
          </div>
        `,
        tooltip: `${variacion > 0 ? '+' : ''}${variacion}`,
        lat: featureCorrespondiente.properties.lat,
        long: featureCorrespondiente.properties.long,
        variacion
      };
    }).filter(marker => marker !== null);

    // Add markers to map
    variationMarkers.forEach(point => {
      if (point && point.lat && point.long) {
        // Create a divIcon with just the number and colored background
        const numberIcon = divIcon({
          className: 'number-marker',
          html: `<div class="marker-number" style="background-color: ${point.backgroundColor}">${point.tooltip}</div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });

        marker([point.lat, point.long], {
          icon: numberIcon,
        })
          .addTo(mapVariation)
          .bindPopup(point.title);
      }
    });

    console.log(`✅ ${variationMarkers.length} marcadores de variación añadidos`);
  }
}
