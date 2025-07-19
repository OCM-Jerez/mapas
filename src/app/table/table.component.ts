import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import poblacionData from '../../assets/data/poblacion_secciones_filtradas.json';
import poblacion2011Data from '../../assets/data/variacion_poblacion_2011_2024.json';

interface SeccionCensal {
  'Código sección': string;
  'Nombre': string;
  'Población 2024': number;
  'Población 2011'?: number;
  'Diferencia 2024-2011'?: number;
}

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  imports: [CommonModule]
})
export class TableComponent implements OnInit {
  secciones: SeccionCensal[] = [];
  totalPoblacion2024: number = 0;
  totalPoblacion2011: number = 0;
  totalDiferencia: number = 0;

  constructor() { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    // Filtrar solo las secciones reales (excluir TOTAL si existe)
    const secciones2024 = poblacionData.filter(seccion => seccion['Código sección'] !== 'TOTAL');
    const secciones2011 = poblacion2011Data.filter(seccion => seccion['Código sección'] !== 'TOTAL');
    
    // Crear un mapa con los datos de 2011 para fácil búsqueda
    const poblacion2011Map: { [key: string]: number } = {};
    secciones2011.forEach(seccion => {
      poblacion2011Map[seccion['Código sección']] = seccion['Población 2011'];
    });
    
    // Combinar los datos de 2024 con los de 2011
    this.secciones = secciones2024.map(seccion2024 => {
      const poblacion2011 = poblacion2011Map[seccion2024['Código sección']] || 0;
      const diferencia = seccion2024['Población 2024'] - poblacion2011;
      
      return {
        ...seccion2024,
        'Población 2011': poblacion2011,
        'Diferencia 2024-2011': diferencia
      };
    });
    
    // Calcular los totales
    this.totalPoblacion2024 = this.secciones.reduce((total, seccion) => {
      return total + seccion['Población 2024'];
    }, 0);
    
    this.totalPoblacion2011 = this.secciones.reduce((total, seccion) => {
      return total + (seccion['Población 2011'] || 0);
    }, 0);
    
    this.totalDiferencia = this.totalPoblacion2024 - this.totalPoblacion2011;
  }

  // Función para formatear números con punto como separador de miles
  formatNumber(num: number): string {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  // Función para formatear números con signo y separador de miles
  formatNumberWithSign(num: number): string {
    const formattedNum = Math.abs(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    if (num > 0) {
      return `+${formattedNum}`;
    } else if (num < 0) {
      return `-${formattedNum}`;
    } else {
      return '0';
    }
  }
}
