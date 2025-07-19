import { AfterViewInit, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Icon, geoJSON, map, marker, tileLayer, polygon, Layer, LeafletEvent, Map as LeafletMap } from 'leaflet';
import { GeoJsonObject, Feature, Geometry } from 'geojson';
import secionesCensales from '../../assets/data/secionesCensalesUpdateCenso2004-2022UpdateTotal.json';
import variacionPoblacion from '../../assets/data/variacion_poblacion_2011_2024.json';
import poblacion2024Data from '../../assets/data/poblacion_secciones_filtradas.json';
import perimetroRealData from '../../assets/data/union_real_secciones_deseadas.json';
import perimetroIntramurosData from '../../assets/data/intramuros_perimetro.json';
import { distritoCentro } from '../../assets/data/distritos/distritoCentro';
import { PerimetroInfoComponent } from '../perimetro-info/perimetro-info.component';

@Component({
  selector: 'app-map-variation',
  templateUrl: './map-variation.component.html',
  styleUrls: ['./map-variation.component.scss'],
  imports: [CommonModule, PerimetroInfoComponent]
})
export class MapVariationComponent implements AfterViewInit {
  geoJson: GeoJsonObject | undefined;
  showMap = true; // Control para mostrar/ocultar el mapa - Por defecto se muestra
  showPerimetroInfo = false; // Control para mostrar/ocultar la información del perímetro
  perimetroData: any = null; // Datos del perímetro para mostrar en el modal
  showDistritoCentro = true; // Control para mostrar/ocultar el distrito Centro
  showPerimetroIntramuros = true; // Control para mostrar/ocultar el perímetro intramuros
  private distritoPolygon: Layer | null = null; // Referencia al polígono del distrito
  private perimetroIntramurosLayer: Layer | null = null; // Referencia al polígono del perímetro intramuros
  private mapVariation: LeafletMap | null = null; // Referencia al mapa
  
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
    });
  };

  highlightFeature = (e: LeafletEvent): void => {
    const layer = e.target;
    layer.setStyle({
      weight: 5,
      color: '#666',
      dashArray: '',
      fillOpacity: 0.3, // Relleno semi-transparente para oscurecer el interior
      fillColor: '#333' // Color gris oscuro para el relleno
    });
  };

  resetHighlight = (e: LeafletEvent): void => {
    const layer = e.target;
    layer.setStyle({
      weight: 2,
      color: '#3388ff',
      dashArray: '',
      fillOpacity: 0, // Sin relleno también al resetear
    });
  };

  constructor() {}

  toggleMap(): void {
    this.showMap = !this.showMap;
    
    // Si se muestra el mapa, inicializar después del siguiente ciclo de detección de cambios
    if (this.showMap) {
      setTimeout(() => {
        this.initializeMap();
      }, 0);
    }
  }

  showPerimetroInformation(): void {
    // Generar información del perímetro para mostrar en el modal
    if (perimetroRealData && perimetroRealData.features && perimetroRealData.features[0]) {
      const feature = perimetroRealData.features[0];
      const geometry = feature.geometry as any;
      const pointsCount = geometry?.coordinates?.[0]?.length ? geometry.coordinates[0].length - 1 : 'N/A';
      
      this.perimetroData = {
        name: feature.properties.name || 'Perímetro Real de Secciones',
        method: feature.properties.method || 'polygon-union',
        sectionCount: feature.properties.sectionCount || 0,
        sections: feature.properties.sections || [],
        description: feature.properties.description || 'Perímetro exterior exacto obtenido por unión de polígonos',
        pointsCount: pointsCount
      };
      
      this.showPerimetroInfo = true;
    } else {
      console.warn('No hay datos de perímetro disponibles para mostrar');
    }
  }

  closePerimetroInfo(): void {
    this.showPerimetroInfo = false;
    this.perimetroData = null;
  }

  toggleDistritoCentro(): void {
    this.showDistritoCentro = !this.showDistritoCentro;
    
    if (this.distritoPolygon && this.mapVariation) {
      if (this.showDistritoCentro) {
        // Mostrar el distrito
        this.distritoPolygon.addTo(this.mapVariation);
        console.log('✅ Distrito Centro mostrado');
      } else {
        // Ocultar el distrito
        this.distritoPolygon.remove();
        console.log('✅ Distrito Centro ocultado');
      }
    } else {
      console.warn('❌ No se pudo cambiar la visibilidad del distrito Centro - referencias no disponibles');
    }
  }

  togglePerimetroIntramuros(): void {
    this.showPerimetroIntramuros = !this.showPerimetroIntramuros;
    
    if (this.perimetroIntramurosLayer && this.mapVariation) {
      if (this.showPerimetroIntramuros) {
        // Mostrar el perímetro intramuros
        this.perimetroIntramurosLayer.addTo(this.mapVariation);
        console.log('✅ Perímetro intramuros mostrado');
      } else {
        // Ocultar el perímetro intramuros
        this.perimetroIntramurosLayer.remove();
        console.log('✅ Perímetro intramuros ocultado');
      }
    } else {
      console.warn('❌ No se pudo cambiar la visibilidad del perímetro intramuros - referencias no disponibles');
    }
  }

  ngAfterViewInit(): void {
    // Inicializar el mapa automáticamente cuando se carga el componente
    if (this.showMap) {
      setTimeout(() => {
        this.initializeMap();
      }, 0);
    }
  }

  private initializeMap(): void {
    console.log('Iniciando map-variation component');
    console.log('Datos de secciones censales cargados:', !!secionesCensales);
    console.log('Datos de variación poblacional cargados:', !!variacionPoblacion);
    console.log('Datos de perímetro real cargados:', !!perimetroRealData);
    console.log('Datos de perímetro intramuros cargados:', !!perimetroIntramurosData);
    console.log('Datos de distrito Centro cargados:', !!distritoCentro);
    console.log('Total features:', secionesCensales?.features?.length);
    console.log('Total variaciones:', variacionPoblacion?.length);
    console.log('Total puntos distrito Centro:', distritoCentro?.length);
    console.log('Perímetro real - método:', perimetroRealData?.metadata?.method);
    console.log('Perímetro real - secciones incluidas:', perimetroRealData?.metadata?.foundSections);
    console.log('Perímetro intramuros - método:', perimetroIntramurosData?.metadata?.method);
    console.log('Perímetro intramuros - secciones incluidas:', perimetroIntramurosData?.metadata?.foundSections);
    
    // Crear el mapa
    const mapVariation = map('map-variation', {
      center: [36.684881, -6.132903],
      zoomControl: false,
      zoom: 16,
      maxZoom: 17,
      minZoom: 11,
    });

    // Guardar referencia al mapa para uso posterior
    this.mapVariation = mapVariation;

    tileLayer(
      'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
      this.tileLayerConfig
    ).addTo(mapVariation);

    // Añadir las secciones censales al mapa primero
    const geoJson = geoJSON(secionesCensales as GeoJsonObject, {
      onEachFeature: this.onEachFeature,
      style: {
        weight: 2,
        color: '#3388ff',
        dashArray: '',
        fillOpacity: 0, // Sin relleno por defecto
      }
    }).addTo(mapVariation);

    // Añadir el distrito Centro como polígono
    if (distritoCentro && distritoCentro.length > 0) {
      console.log('Añadiendo distrito Centro al mapa...');
      console.log('Puntos del distrito Centro:', distritoCentro.length);
      
      try {
        // Convertir las coordenadas al formato esperado por Leaflet [lat, lng]
        const distritoCoords: [number, number][] = distritoCentro.map(point => [point.lat, point.lng]);
        
        this.distritoPolygon = polygon(distritoCoords, {
          color: '#2563eb',        // Color azul
          weight: 10,               // Línea mediana
          opacity: 0.8,            // Semi-transparente
          fillColor: '#3b82f6',    // Relleno azul más claro
          fillOpacity: 0.1,        // Relleno muy sutil
          dashArray: '5, 5',       // Línea discontinua para distinguir del perímetro
          interactive: false       // No interceptar eventos de mouse para permitir hover en secciones debajo
        });

        this.distritoPolygon.bindPopup('<h4>Distrito Centro</h4><p>Límites administrativos del distrito Centro de Jerez</p>');
        
        // Solo añadir al mapa si está configurado para mostrarse
        if (this.showDistritoCentro) {
          this.distritoPolygon.addTo(mapVariation);
        }
        
        console.log('✅ Distrito Centro preparado exitosamente');
        
      } catch (error) {
        console.error('❌ Error al preparar el distrito Centro:', error);
      }
    } else {
      console.warn('❌ No hay datos del distrito Centro disponibles');
    }

    // Añadir el perímetro real DESPUÉS de las secciones censales para que esté encima
    if (perimetroRealData) {
      console.log('Añadiendo perímetro real al mapa...');
      console.log('Datos del perímetro:', perimetroRealData);
      console.log('Tipo de datos del perímetro:', typeof perimetroRealData);
      console.log('Features del perímetro:', perimetroRealData.features?.length);
      
      try {
        const perimetroLayer = geoJSON(perimetroRealData as GeoJsonObject, {
          style: {
            color: '#ff0000',        // Color rojo como en la imagen original
            weight: 6,               // Línea más gruesa
            opacity: 1.0,            // Opacidad completa
            fillColor: '#ff0000',
            fillOpacity: 0.15,       // Relleno un poco más visible para debug
            dashArray: '',           // Línea sólida
            interactive: false       // No interceptar eventos de mouse para permitir hover en secciones debajo
          }
        }).addTo(mapVariation);

        console.log('✅ Perímetro real añadido al mapa exitosamente');
        console.log('Perímetro layer:', perimetroLayer);
        
        // Verificar bounds del perímetro
        const bounds = perimetroLayer.getBounds();
        console.log('Bounds del perímetro:', bounds);
        
      } catch (error) {
        console.error('❌ Error al añadir el perímetro:', error);
      }
    } else {
      console.warn('❌ No hay datos de perímetro disponibles');
    }

    // Añadir el perímetro intramuros DESPUÉS del perímetro real
    if (perimetroIntramurosData) {
      console.log('Añadiendo perímetro intramuros al mapa...');
      console.log('Datos del perímetro intramuros:', perimetroIntramurosData);
      console.log('Tipo de datos del perímetro intramuros:', typeof perimetroIntramurosData);
      console.log('Features del perímetro intramuros:', perimetroIntramurosData.features?.length);
      
      try {
        this.perimetroIntramurosLayer = geoJSON(perimetroIntramurosData as GeoJsonObject, {
          style: {
            color: '#00ff00',        // Color verde para distinguir del perímetro real
            weight: 4,               // Línea mediana
            opacity: 0.9,            // Casi opaco
            fillColor: '#00ff00',
            fillOpacity: 0.1,        // Relleno sutil
            dashArray: '10, 5',      // Línea discontinua para distinguir del perímetro real
            interactive: false       // No interceptar eventos de mouse para permitir hover en secciones debajo
          }
        });

        // Solo añadir al mapa si está configurado para mostrarse
        if (this.showPerimetroIntramuros) {
          this.perimetroIntramurosLayer.addTo(mapVariation);
        }

        // Añadir popup con información
        this.perimetroIntramurosLayer.bindPopup(`
          <h4>Perímetro Intramuros</h4>
          <p><strong>Método:</strong> ${perimetroIntramurosData.metadata?.method || 'N/A'}</p>
          <p><strong>Secciones:</strong> ${perimetroIntramurosData.metadata?.foundSections || 0}</p>
          <p><strong>Generado:</strong> ${perimetroIntramurosData.metadata?.generatedAt ? new Date(perimetroIntramurosData.metadata.generatedAt).toLocaleString() : 'N/A'}</p>
        `);

        console.log('✅ Perímetro intramuros preparado exitosamente');
        
        // Verificar bounds del perímetro intramuros (si el layer tiene getBounds)
        if ('getBounds' in this.perimetroIntramurosLayer) {
          const bounds = (this.perimetroIntramurosLayer as any).getBounds();
          console.log('Bounds del perímetro intramuros:', bounds);
        }
        
      } catch (error) {
        console.error('❌ Error al preparar el perímetro intramuros:', error);
      }
    } else {
      console.warn('❌ No hay datos de perímetro intramuros disponibles');
    }

    // Crear un mapa de variación poblacional por código de sección
    const variacionMap: { [key: string]: { poblacion2011: number; nombre: string } } = {};
    variacionPoblacion.forEach(item => {
      // Extraer el ID de la sección censal del código completo
      const codigoCompleto = item['Código sección'].toString();
      console.log('Procesando código:', codigoCompleto);
      
      // Convertir de formato 1102001001 a 01-001
      if (codigoCompleto.length === 10) {
        // Para código 1102001001: 
        // - Los últimos 5 dígitos son 01001
        // - distrito = 01 (posiciones 5-6)
        // - sección = 001 (posiciones 7-9)
        const ultimosCinco = codigoCompleto.substring(5); // "01001"
        const distrito = ultimosCinco.substring(0, 2); // "01"
        const seccion = ultimosCinco.substring(2, 5); // "001"
        const seccionId = `${distrito}-${seccion}`;
        
        console.log('Código original:', codigoCompleto, 'Últimos 5:', ultimosCinco, 'ID convertido:', seccionId);
        
        variacionMap[seccionId] = {
          poblacion2011: item['Población 2011'],
          nombre: item['Nombre']
        };
      }
    });

    // Crear un mapa con los datos de población 2024 correctos
    const poblacion2024Map: { [key: string]: number } = {};
    poblacion2024Data.forEach(item => {
      const codigoCompleto = item['Código sección'].toString();
      if (codigoCompleto.length === 10) {
        const ultimosCinco = codigoCompleto.substring(5);
        const distrito = ultimosCinco.substring(0, 2);
        const seccion = ultimosCinco.substring(2, 5);
        const seccionId = `${distrito}-${seccion}`;
        
        poblacion2024Map[seccionId] = item['Población 2024'];
      }
    });
    
    console.log('Mapa de variación creado con', Object.keys(variacionMap).length, 'elementos');
    console.log('Mapa de población 2024 creado con', Object.keys(poblacion2024Map).length, 'elementos');
    console.log('Primeras 5 claves del mapa:', Object.keys(variacionMap).slice(0, 5));

    // Iconos para diferentes variaciones
    const iconPositive = new Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    const iconNegative = new Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    const iconNeutral = new Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    // Crear marcadores con información de variación poblacional
    console.log('Total de features en secionesCensales:', secionesCensales.features.length);
    console.log('Primeros 5 IDs de features:', secionesCensales.features.slice(0, 5).map(f => f.properties.ID));
    
    const variationMarkers = secionesCensales.features
      .filter(feature => {
        const hasVariationData = variacionMap[feature.properties.ID] !== undefined;
        const hasPoblacion2024Data = poblacion2024Map[feature.properties.ID] !== undefined;
        if (!hasVariationData) {
          console.log('No hay datos de variación para:', feature.properties.ID);
        }
        if (!hasPoblacion2024Data) {
          console.log('No hay datos de población 2024 para:', feature.properties.ID);
        }
        return hasVariationData && hasPoblacion2024Data;
      })
      .filter(feature => {
        // Verificar que las coordenadas existen
        const hasCoords = feature.properties.lat && feature.properties.long;
        if (!hasCoords) {
          console.log('No hay coordenadas para:', feature.properties.ID);
        }
        return hasCoords;
      })
      .map(feature => {
        const seccionData = variacionMap[feature.properties.ID];
        const poblacion2024 = Number(poblacion2024Map[feature.properties.ID]); // Usar datos correctos
        const poblacion2011 = Number(seccionData.poblacion2011);
        const variacion = poblacion2024 - poblacion2011;
        const porcentajeVariacion = Number(((variacion / poblacion2011) * 100).toFixed(2));
        
        console.log(`Sección ${feature.properties.ID}: 2011=${poblacion2011}, 2024=${poblacion2024}, variación=${variacion}`);
        
        // Determinar el icono basado en la variación
        let icon = iconNeutral;
        let colorTooltip = 'tooltipNeutral';
        
        if (variacion > 50) {
          icon = iconPositive;
          colorTooltip = 'tooltipPositive';
        } else if (variacion < -50) {
          icon = iconNegative;
          colorTooltip = 'tooltipNegative';
        }

        return {
          icon: icon,
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
          colorTooltip: colorTooltip,
          variacion: variacion
        };
      });
    
    console.log('Marcadores creados:', variationMarkers.length);

    // Añadir los marcadores al mapa
    variationMarkers.forEach(point => {
      marker([point.lat, point.long], {
        icon: point.icon,
      })
        .addTo(mapVariation)
        .bindPopup(point.title)
        .bindTooltip(point.tooltip, {
          permanent: true,
          className: point.colorTooltip,
        });
    });
  }
}
