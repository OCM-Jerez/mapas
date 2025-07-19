import { Component, inject, output } from '@angular/core';
import { MapStateService } from '@services/map-state.service';
import type { MapType } from '@interfaces/map.interface';

@Component({
  selector: 'app-map-navigation',
  template: `
    <div class="map-navigation">
      <button 
        (click)="selectMap('population')" 
        [class.active]="mapState.isPopulationMap()"
        class="map-button">
        Variación poblacional 2004-2022
        <br>Municipio
      </button>
      <button 
        (click)="selectMap('variation')" 
        [class.active]="mapState.isVariationMap()"
        class="map-button">
        Variación poblacional 2011-2024<br>Centro Histórico
      </button>
      <button 
        (click)="selectMap('basic')" 
        [class.active]="mapState.isBasicMap()"
        class="map-button">
        Secciones censales
      </button>
      <button 
        (click)="selectMap('distritos')" 
        [class.active]="mapState.isDistritosMap()"
        class="map-button">
        Distritos
      </button>
    </div>
  `,
  styles: [`
    .map-navigation {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin: 1rem 0;
      flex-wrap: wrap;
    }

    .map-button {
      padding: 0.75rem 1.5rem;
      border: 2px solid #ddd;
      background: white;
      cursor: pointer;
      border-radius: 0.5rem;
      transition: all 0.2s ease;
      text-align: center;
      font-size: 0.9rem;
    }

    .map-button:hover {
      background: #f0f0f0;
      border-color: #007bff;
    }

    .map-button.active {
      background: #007bff;
      color: white;
      border-color: #007bff;
    }

    @media (max-width: 768px) {
      .map-navigation {
        flex-direction: column;
        align-items: center;
      }
      
      .map-button {
        width: 100%;
        max-width: 300px;
      }
    }
  `]
})
export class MapNavigationComponent {
  readonly mapState = inject(MapStateService);
  readonly mapChanged = output<MapType>();

  selectMap(mapType: MapType): void {
    this.mapState.setMap(mapType);
    this.mapChanged.emit(mapType);
  }
}
