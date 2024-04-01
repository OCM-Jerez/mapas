import { AfterViewInit, Component } from '@angular/core';
import { GeoJsonObject } from 'geojson';
import { Map, geoJSON, polygon, polyline, tileLayer } from 'leaflet';

import { ds02004 } from '../../assets/data/02-004';
import { ds02011 } from '../../assets/data/02-011';
import { ds02013 } from '../../assets/data/02-013';
import { ds02014 } from '../../assets/data/02-014';
import { ds02021 } from '../../assets/data/02-021';
import { ds02026 } from '../../assets/data/02-026';
import { distritoCentro } from '../../assets/data/distritoCentro';
import { limitesAlbarizuela } from '../../assets/data/limitesAlbarizuela';

import secionesCensales from '../../assets/data/secionesCensalesUpdateCenso2004-2022UpdateTotal.json';

@Component({
	selector: 'app-map',
	standalone: true,

	templateUrl: './map.component.html',
	styleUrls: ['./map.component.scss']
})
export class MapComponent implements AfterViewInit {
	constructor() {}

	ngAfterViewInit(): void {
		// http://leaflet-extras.github.io/leaflet-providers/preview/
		const mapProblemas = new Map('map');

		const distritoCentroArray: [number, number][] = [];
		distritoCentro.forEach((element:any) => {
			distritoCentroArray.push([element.lat, element.lng]);
		});
		polyline(distritoCentroArray, {
			color: 'red',
			weight: 9
		}).addTo(mapProblemas);

		const limitesAlbarizuelaArray: [number, number][] = [];
		limitesAlbarizuela.forEach((element) => {
			limitesAlbarizuelaArray.push([element.lat, element.lng]);
		});
		polyline(limitesAlbarizuelaArray, {
			color: 'green',
			weight: 9
		}).addTo(mapProblemas);

		// const ds_02_021: [number, number][] = [
		//   [
		//     36.688551,
		//     -6.133619,
		//   ],
		//   [
		//     36.688133,
		//     -6.134499,
		//   ],
		//   [
		//     36.68783,
		//     -6.135444,

		//   ],
		// ]
		// polyline(ds_02_021, { color: 'green' }).addTo(mapProblemas);

		const ds02021Array: [number, number][] = [];
		ds02021.forEach((element) => {
			ds02021Array.push([element.lat, element.long]);
		});
		polygon(ds02021Array, {
			color: 'green',
			fillColor: 'green',
			fillOpacity: 0.1
		}).addTo(mapProblemas);

		const ds02004Array: [number, number][] = [];
		ds02004.forEach((element) => {
			ds02004Array.push([element.lat, element.lng]);
		});
		polygon(ds02004Array, {
			color: 'blue',
			fillColor: 'blue',
			fillOpacity: 0.2
		}).addTo(mapProblemas);

		const ds02014Array: [number, number][] = [];
		ds02014.forEach((element) => {
			ds02014Array.push([element.lat, element.lng]);
		});
		polygon(ds02014Array, {
			color: 'yellow',
			fillColor: 'yellow',
			fillOpacity: 0.2
		}).addTo(mapProblemas);

		const ds02026Array: [number, number][] = [];
		ds02026.forEach((element) => {
			ds02026Array.push([element.lat, element.lng]);
		});
		polygon(ds02026Array, {
			color: 'black',
			fillColor: 'black',
			fillOpacity: 0.2
		}).addTo(mapProblemas);

		const ds02011Array: [number, number][] = [];
		ds02011.forEach((element) => {
			ds02011Array.push([element.lat, element.lng]);
		});
		polygon(ds02011Array, {
			color: 'red',
			fillColor: 'red',
			fillOpacity: 0.1
		}).addTo(mapProblemas);

		const ds02013Array: [number, number][] = [];
		ds02013.forEach((element) => {
			ds02013Array.push([element.lat, element.lng]);
		});
		polygon(ds02013Array, {
			color: 'red',
			fillColor: 'red',
			fillOpacity: 0.2
		}).addTo(mapProblemas);

		// const ds01004Array: [number, number][] = [];
		// ds01004.forEach((element) => {
		// 	ds01004Array.push([element.lat, element.lng]);
		// });
		// polygon(ds01004Array, {
		// 	color: 'blue',
		// 	fillColor: 'blue',
		// 	fillOpacity: 0.2
		// }).addTo(mapProblemas);

		// // San Miguel
		// const ds02017Array: [number, number][] = [];
		// ds02017.forEach((element) => {
		// 	ds02017Array.push([element.lat, element.lng]);
		// });
		// polygon(ds02017Array, {
		// 	color: 'red',
		// 	fillColor: 'red',
		// 	fillOpacity: 0.1
		// }).addTo(mapProblemas);

		// const geoJson = geoJSON(secionesCensales as GeoJsonObject, {}).addTo(mapProblemas);

		const geoJson = geoJSON(secionesCensales as GeoJsonObject, {
			style: function (feature) {
				// Establece un estilo predeterminado para todas las características
				let estiloPredeterminado = {
					color: 'green', // Color del borde del polígono o característica
					fillColor: 'green', // Color de relleno del polígono o característica
					fillOpacity: 0.1 // Opacidad del relleno
				};

				// Distrito Centro
				// Aplica un estilo diferente a la característica que cumple con una condición específica
				if (
					feature!.properties.ID === '01-001' ||
					feature!.properties.ID === '01-002' ||
					feature!.properties.ID === '01-003' ||
					feature!.properties.ID === '01-004' ||
					feature!.properties.ID === '01-005' ||
					feature!.properties.ID === '02-001' ||
					feature!.properties.ID === '02-002' ||
					feature!.properties.ID === '02-003' ||
					feature!.properties.ID === '02-005' ||
					feature!.properties.ID === '02-006' ||
					feature!.properties.ID === '02-007' ||
					feature!.properties.ID === '02-008' ||
					feature!.properties.ID === '02-011' ||
					feature!.properties.ID === '02-012' ||
					feature!.properties.ID === '02-013' ||
					feature!.properties.ID === '02-017' ||
					feature!.properties.ID === '02-022' ||
					feature!.properties.ID === '02-023' ||
					feature!.properties.ID === '02-024' ||
					feature!.properties.ID === '02-025' ||
					feature!.properties.ID === '03-010' ||
					feature!.properties.ID === '03-015' ||
					feature!.properties.ID === '03-018'
				) {
					estiloPredeterminado.color = 'blue'; // Cambia el color del borde
					estiloPredeterminado.fillColor = 'red'; // Cambia el color de relleno
					// Puedes ajustar cualquier otra propiedad de estilo aquí
				}

				return estiloPredeterminado;
			},
			onEachFeature: function (feature, layer) {
				// Aquí puedes vincular eventos o añadir información adicional a cada característica
				if (feature.properties && feature.properties.ID) {
					layer.bindPopup('ID: ' + feature.properties.ID);
				}
			}
		}).addTo(mapProblemas);

		tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			maxZoom: 21,
			attribution:
				'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
		}).addTo(mapProblemas);

		// https://www.youtube.com/watch?v=8fwWsFgXloY&list=PLaaTcPGicjqgLAUhR_grKBGCXbyKaP7qR&index=29
		// https://github.com/pointhi/leaflet-color-markers

		// const problemaIcon = new Icon({
		// 	iconUrl:
		// 		'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
		// 	shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
		// 	iconSize: [25, 41],
		// 	iconAnchor: [12, 41],
		// 	popupAnchor: [1, -34],
		// 	shadowSize: [41, 41]
		// 	// shadowAnchor: [22, 94]
		// });

		// problemas.map((point) => {
		// 	marker([point.lat, point.long], {
		// 		icon: problemaIcon
		// 	})
		// 		.addTo(mapProblemas)
		// 		.bindPopup(point.title);
		// });

		// const ideaIcon = new Icon({
		// 	iconUrl:
		// 		'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
		// 	shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
		// 	iconSize: [25, 41],
		// 	iconAnchor: [12, 41],
		// 	popupAnchor: [1, -34],
		// 	shadowSize: [41, 41]
		// 	// shadowAnchor: [22, 94]
		// });

		// ideas.map((point) => {
		// 	marker([point.lat, point.long], {
		// 		icon: ideaIcon
		// 	})
		// 		.addTo(mapProblemas)
		// 		.bindPopup(point.title);
		// });

		mapProblemas.setView([36.68519, -6.13229], 18);

		// Control de capas
		// https://www.youtube.com/watch?v=psTsxc1045k&list=PLaaTcPGicjqgLAUhR_grKBGCXbyKaP7qR&index=58

		// const comedia = marker([36.68593, -6.13121]).addTo(map);
		var baseLayers = {
			//  "Default": bizcocheros,
			// "OpenStreetMap": osm
		};

		var overlays = {
			// "Marker": comedia,
			// "Roads": roadsLayer
		};

		// control.layers(baseLayers, overlays).addTo(map);
	}
}
