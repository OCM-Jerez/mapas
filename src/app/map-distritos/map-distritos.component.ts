import { AfterViewInit, Component, OnInit } from '@angular/core';
import { geoJSON, map, tileLayer, polygon } from 'leaflet';
import { distritoCentro } from '../../assets/data/distritos/distritoCentro';

@Component({
  selector: 'app-map-distritos',
  templateUrl: './map-distritos.component.html',
  styleUrls: ['./map-distritos.component.scss']
})
export class MapDistritosComponent implements AfterViewInit, OnInit {
  
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

  constructor() {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    console.log('Iniciando map-distritos component');
    
    // Crear el mapa
    const mapDistritos = map('map-distritos', {
      center: [36.684881, -6.132903],
      zoomControl: true,
      zoom: 15,
      maxZoom: 17,
      minZoom: 11,
    });

    

    tileLayer(
      'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
      this.tileLayerConfig
    ).addTo(mapDistritos);

    // Convertir los datos del distrito centro a formato de coordenadas para Leaflet
    const distritoCentroCoords: [number, number][] = distritoCentro.map(coord => [coord.lat, coord.lng]);

    // Crear el polígono del distrito centro
    const distritoCentroPolygon = polygon(distritoCentroCoords, {
      color: '#ff6b35',
      weight: 3,
      fillColor: '#ff6b35',
      fillOpacity: 0.3,
      dashArray: '5, 5'
    }).addTo(mapDistritos);

    // Añadir popup informativo al distrito
    distritoCentroPolygon.bindPopup(`
      <div class="distrito-popup">
        <h4>Distrito Centro</h4>
        <p><strong>Tipo:</strong> Distrito Histórico</p>
        <p><strong>Coordenadas:</strong> ${distritoCentro.length} puntos</p>
        <p><strong>Descripción:</strong> Delimitación del centro histórico de Jerez de la Frontera</p>
      </div>
    `);

    // Ajustar la vista del mapa al polígono
    // mapDistritos.fitBounds(distritoCentroPolygon.getBounds(), {
    //   padding: [20, 20]
    // });

    console.log('Mapa de distritos creado con el distrito centro');
  }
}
