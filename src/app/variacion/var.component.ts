import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Icon, geoJSON, map, marker, tileLayer } from 'leaflet';

import { GeoJsonObject } from 'geojson';
import secionesCensales from '../../assets/data/secionesCensalesUpdateCenso2004-2022UpdateTotal.json';

@Component({
  selector: 'app-map-var',
  standalone: true,
  templateUrl: './var.component.html',
  styleUrls: ['./var.component.scss'],
})
export default class VarComponent implements AfterViewInit, OnInit {
  geoJson: GeoJsonObject | undefined;
  // Configuración del mapa base.
  tileLayerConfig = {
    maxZoom: 17,
    minZoom: 10,
    attribution:
      'Map data &copy; <a href="http://openstreetmap.org"> OpenStreetMap</a> Contributors, ' +
      '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery © <a href="http://mapbox.com">Mapbox</a>',
    id: 'mapbox.light',
  };

  onEachFeature = (feature:any, layer:any) => {
    layer.on({
      mouseover: this.highlightFeature,
      // mouseout: this.resetHighlight,
      // click: this.zoomToFeature
    });
  };

  highlightFeature = (e:any) => {
    const layer = e.target;
    layer.setStyle({
      weight: 5,
      color: '#666',
      dashArray: '',
      fillOpacity: 0.5,
    });
  };

  constructor() {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    // http://leaflet-extras.github.io/leaflet-providers/preview/
    // const mamOCM = new Map('map');
    const mamOCM = map('map', {
      center: [36.684881, -6.132903],
      zoomControl: false,
      zoom: 16,
      maxZoom: 17,
      minZoom: 11,
      // maxBounds: [
      //   // Esquina superior izquierda hasta donde permitira mover.
      //   [36.034027, -6.332731],
      //   // Esquina inferior derecha.
      //   [36.984881, -5.40752],
      // ],
    });

    tileLayer(
      'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
      this.tileLayerConfig
    ).addTo(mamOCM);

    // mamOCM.setView([36.68519, -6.13229], 15);

    const geoJson = geoJSON(secionesCensales as GeoJsonObject, {
      // style: this.style2(),
      // onEachFeature: this.onEachFeature,
    }).addTo(mamOCM);

    // console.log('secionesCensales', secionesCensales.features[0].properties.ID);
    // console.log(
    //   'secionesCensales',
    //   secionesCensales.features[0].geometry.coordinates[0][0]
    // );
    // console.log(
    //   'secionesCensales',
    //   secionesCensales.features[0].geometry.coordinates[0][0][0],
    //   typeof secionesCensales.features[0].geometry.coordinates[0][0][0]
    // );
    // console.log(
    //   'secionesCensales',
    //   secionesCensales.features[0].geometry.coordinates[0][0][1]
    // );

    // this.geoJson.features.forEach((feature) => {
    //   const coordinates = feature.geometry.coordinates[0][0];
    //   const marker = L.marker([coordinates[1], coordinates[0]]).addTo(this.map);
    //   marker.bindPopup(`<b>ID:</b> ${feature.properties.ID}`);
    // });

    const iconGreen = new Icon({
      iconUrl:
        'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
      shadowUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
      // shadowAnchor: [22, 94]
    });

    const iconRed = new Icon({
      iconUrl:
        'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
      shadowUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
      // shadowAnchor: [22, 94]
    });

    // const intramuros = secionesCensales.features.map((feature) => {

    const idsToRetrieve = [
      '01-001',
      '01-002',
      '01-003',
      '01-004',
      '01-005',
      '02-003',
      '02-004',
      '02-005',
      '02-006',
      '02-007',
      '02-008',
      '02-009',
      '02-010',
      '02-011',
      '02-012',
      '02-013',
      '02-014',
      '02-017',
      '02-021',
      '02-022',
      '02-024',
      '02-026',
      '03-010',
      '03-015',
      '03-018',
    ];

    // Utiliza el método `filter` para iterar sobre secionesCensales.features y extraer aquellos elementos cuyo properties.ID esté incluido en el array idsToRetrieve
    const filteredFeatures = secionesCensales.features.filter((feature) => {
      return idsToRetrieve.includes(feature.properties.ID);
    });

    // Utiliza el método `map` para crear los objetos con las propiedades deseadas
    // const intramuros = filteredFeatures.map((feature) => {
    const intramuros = secionesCensales.features.map((feature) => {
      return {
        icon: iconGreen,
        title: feature.properties.ID,
        tooltip: feature.properties.TOTAL,
        lat: feature.properties.lat,
        long: feature.properties.long,
        colorTooltip: feature.properties.backgroundColor,
      };
    });

    // console.log(intramuros); // Muestra los objetos extraídos

    const varHabitantes = [
      // {
      //   icon: iconGreen,
      //   title: `<h1>Sección censal 02-0004</h1>
      //     <h3>Datos</h3>
      //       <img src="https://res.cloudinary.com/dabrencx7/image/upload/v1647547099/albarizuela/fotosRutas/Caldereros_sxrbgn.jpg" alt="Don Juan" width="100px">
      //    `,
      //   lat: 36.686587,
      //   long: -6.142346,
      //   tooltip: '32',
      //   colorTooltip: 'tooltipGreen',
      // },

      {
        icon: iconGreen,
        title: secionesCensales.features[0].properties.ID,
        tooltip: secionesCensales.features[0].properties.TOTAL,
        lat: secionesCensales.features[0].properties.lat,
        long: secionesCensales.features[0].properties.long,
        colorTooltip: secionesCensales.features[0].properties.backgroundColor,
      },
    ];

    // console.log('varHabitantes', varHabitantes);

    intramuros.map((point) => {
      // console.log('point', point);

      marker([point.lat, point.long], {
        // marker(point.lat = point.coordinates, {
        icon: point.icon,
      })
        .addTo(mamOCM)
        .bindPopup(point.title)
        .bindTooltip(point.tooltip, {
          permanent: true,
          className: point.colorTooltip,
        });
    });

    var overlays = {};

    // const text = 'Hello, World!';
    // const icon = divIcon({
    //   className: 'custom-text-marker',
    //   html: `<div>${text}</div>`,
    // });

    // const coordinates = [-6.13279, 36.68528];
    // // const coordinates = [36.68528, , -6.13279];
    // marker([coordinates], {
    //   icon: ideaIcon,
    // })
    //   .addTo(mamOCM)
    //   .bindPopup(point.title);
  }
}
