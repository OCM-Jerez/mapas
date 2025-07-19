import { AfterViewInit, Component, signal } from '@angular/core';
import { geoJSON, map, tileLayer, Layer, LeafletEvent, Map } from 'leaflet';
import { GeoJsonObject, Feature, Geometry } from 'geojson';
import seccionesCensalesGeometry from '../../assets/data/secciones-censales-geometry.json';

@Component({
  selector: 'app-map-basic',
  templateUrl: './map-basic.component.html',
  styleUrls: ['./map-basic.component.scss'],
  standalone: true
})
export class MapBasicComponent implements AfterViewInit {
  private readonly mapInstance = signal<Map | null>(null);
  private readonly geoJsonLayer = signal<Layer | null>(null);
  
  // Configuración del mapa base
  private readonly tileLayerConfig = {
    maxZoom: 17,
    minZoom: 10,
    attribution:
      'Map data &copy; <a href="http://openstreetmap.org"> OpenStreetMap</a> Contributors, ' +
      '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery © <a href="http://mapbox.com">Mapbox</a>',
    id: 'mapbox.light',
  };

  private readonly onEachFeature = (feature: Feature<Geometry, any>, layer: Layer): void => {
    layer.on({
      mouseover: this.highlightFeature,
      mouseout: this.resetHighlight,
      click: this.showSectionInfo
    });
  };

  private readonly highlightFeature = (e: LeafletEvent): void => {
    const layer = e.target;
    layer.setStyle({
      weight: 3,
      color: '#666',
      dashArray: '',
      fillOpacity: 0.3,
    });
  };

  private readonly resetHighlight = (e: LeafletEvent): void => {
    const layer = e.target;
    layer.setStyle({
      weight: 2,
      color: '#3388ff',
      dashArray: '',
      fillOpacity: 0.1,
    });
  };

  private readonly showSectionInfo = (e: LeafletEvent): void => {
    const layer = e.target;
    const properties = layer.feature.properties;
    
    layer.bindPopup(`
      <h4>Sección Censal: ${properties.ID}</h4>
      <p><strong>Distrito:</strong> ${properties.ID.split('-')[0]}</p>
      <p><strong>Sección:</strong> ${properties.ID.split('-')[1]}</p>
      <p><strong>Coordenadas:</strong> ${properties.lat.toFixed(6)}, ${properties.long.toFixed(6)}</p>
    `).openPopup();
  };

  ngAfterViewInit(): void {
    console.log('Iniciando map-basic component');
    
    // Crear el mapa
    const mapBasic = map('map-basic', {
      center: [36.684881, -6.132903],
      zoomControl: true,
      zoom: 15,
      maxZoom: 17,
      minZoom: 11,
    });

    this.mapInstance.set(mapBasic);

    tileLayer(
      'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
      this.tileLayerConfig
    ).addTo(mapBasic);

    // Añadir las secciones censales al mapa usando el archivo de geometría
    const geoJsonLayer = geoJSON(seccionesCensalesGeometry as GeoJsonObject, {
      onEachFeature: this.onEachFeature,
      style: {
        weight: 2,
        color: '#3388ff',
        dashArray: '',
        fillOpacity: 0.1,
        fillColor: '#3388ff'
      }
    }).addTo(mapBasic);

    this.geoJsonLayer.set(geoJsonLayer);

    console.log('Mapa básico creado con', seccionesCensalesGeometry.features.length, 'secciones censales');
  }
}
