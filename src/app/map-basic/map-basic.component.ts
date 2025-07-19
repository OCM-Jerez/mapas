import { AfterViewInit, Component } from '@angular/core';
import { geoJSON, map, tileLayer, Layer, LeafletEvent } from 'leaflet';
import { GeoJsonObject, Feature, Geometry } from 'geojson';
import secionesCensales from '../../assets/data/secionesCensalesUpdateCenso2004-2022UpdateTotal.json';

@Component({
  selector: 'app-map-basic',
  templateUrl: './map-basic.component.html',
  styleUrls: ['./map-basic.component.scss']
})
export class MapBasicComponent implements AfterViewInit {
  geoJson: GeoJsonObject | undefined;
  
  // Configuración del mapa base
  tileLayerConfig = {
    maxZoom: 17,
    minZoom: 10,
    attribution:
      'Map data &copy; <a href="http://openstreetmap.org"> OpenStreetMap</a> Contributors, ' +
      '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery © <a href="http://mapbox.com">Mapbox</a>',
    id: 'mapbox.light',
  };

  onEachFeature = (feature: Feature<Geometry, any>, layer: Layer): void => {
    layer.on({
      mouseover: this.highlightFeature,
      mouseout: this.resetHighlight,
      click: this.showSectionInfo
    });
  };

  highlightFeature = (e: LeafletEvent): void => {
    const layer = e.target;
    layer.setStyle({
      weight: 3,
      color: '#666',
      dashArray: '',
      fillOpacity: 0.3,
    });
  };

  resetHighlight = (e: LeafletEvent): void => {
    const layer = e.target;
    layer.setStyle({
      weight: 2,
      color: '#3388ff',
      dashArray: '',
      fillOpacity: 0.1,
    });
  };

  showSectionInfo = (e: LeafletEvent): void => {
    const layer = e.target;
    const properties = layer.feature.properties;
    
    layer.bindPopup(`
      <h4>Sección Censal: ${properties.ID}</h4>
      <p><strong>Distrito:</strong> ${properties.ID.split('-')[0]}</p>
      <p><strong>Sección:</strong> ${properties.ID.split('-')[1]}</p>
    `).openPopup();
  };

  constructor() {}

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

    tileLayer(
      'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
      this.tileLayerConfig
    ).addTo(mapBasic);

    // Añadir las secciones censales al mapa sin datos adicionales
    const geoJson = geoJSON(secionesCensales as GeoJsonObject, {
      onEachFeature: this.onEachFeature,
      style: {
        weight: 2,
        color: '#3388ff',
        dashArray: '',
        fillOpacity: 0.1,
        fillColor: '#3388ff'
      }
    }).addTo(mapBasic);

    console.log('Mapa básico creado con', secionesCensales.features.length, 'secciones censales');
  }
}
