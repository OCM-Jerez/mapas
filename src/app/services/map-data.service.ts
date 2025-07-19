import { Injectable } from '@angular/core';
import type { PopulationData, VariationData, SectionFeature, MarkerData } from '@interfaces/map.interface';

// Import data files
import secionesCensales from '@assets/data/secionesCensalesUpdateCenso2004-2022UpdateTotal.json';
import variacionPoblacion from '@assets/data/variacion_poblacion_2011_2024.json';
import poblacion2024Data from '@assets/data/poblacion_secciones_filtradas.json';
import perimetroRealData from '@assets/data/union_real_secciones_deseadas.json';
import perimetroIntramurosData from '@assets/data/intramuros_perimetro.json';

@Injectable({
  providedIn: 'root'
})
export class MapDataService {
  
  // Data getter methods
  getSecionesCensales() {
    return secionesCensales;
  }
  
  getVariacionPoblacion(): VariationData[] {
    return variacionPoblacion as VariationData[];
  }
  
  getPoblacion2024Data(): PopulationData[] {
    return poblacion2024Data as PopulationData[];
  }
  
  getPerimetroRealData() {
    return perimetroRealData;
  }
  
  getPerimetroIntramurosData() {
    return perimetroIntramurosData;
  }

  // Data processing methods
  createVariationMap(): Record<string, { poblacion2011: number; nombre: string }> {
    const variacionMap: Record<string, { poblacion2011: number; nombre: string }> = {};
    
    this.getVariacionPoblacion().forEach(item => {
      const codigoCompleto = item['Código sección'].toString();
      
      if (codigoCompleto.length === 10) {
        const ultimosCinco = codigoCompleto.substring(5);
        const distrito = ultimosCinco.substring(0, 2);
        const seccion = ultimosCinco.substring(2, 5);
        const seccionId = `${distrito}-${seccion}`;
        
        variacionMap[seccionId] = {
          poblacion2011: item['Población 2011'],
          nombre: item['Nombre']
        };
      }
    });
    
    return variacionMap;
  }
  
  createPoblacion2024Map(): Record<string, number> {
    const poblacion2024Map: Record<string, number> = {};
    
    this.getPoblacion2024Data().forEach(item => {
      const codigoCompleto = item['Código sección'].toString();
      
      if (codigoCompleto.length === 10) {
        const ultimosCinco = codigoCompleto.substring(5);
        const distrito = ultimosCinco.substring(0, 2);
        const seccion = ultimosCinco.substring(2, 5);
        const seccionId = `${distrito}-${seccion}`;
        
        poblacion2024Map[seccionId] = item['Población 2024'];
      }
    });
    
    return poblacion2024Map;
  }
  
  filterValidFeatures(
    features: SectionFeature[],
    variacionMap: Record<string, any>,
    poblacion2024Map: Record<string, number>
  ): SectionFeature[] {
    return features.filter(feature => {
      const hasVariationData = variacionMap[feature.properties.ID] !== undefined;
      const hasPoblacion2024Data = poblacion2024Map[feature.properties.ID] !== undefined;
      const hasCoords = feature.properties.lat && feature.properties.long;
      
      return hasVariationData && hasPoblacion2024Data && hasCoords;
    });
  }
}
