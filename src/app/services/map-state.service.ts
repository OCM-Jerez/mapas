import { Injectable, computed, signal } from '@angular/core';
import type { MapType } from '@interfaces/map.interface';

@Injectable({
  providedIn: 'root'
})
export class MapStateService {
  private readonly _currentMap = signal<MapType>('variation');
  
  // Public readonly signals
  readonly currentMap = this._currentMap.asReadonly();
  
  // Computed signals for UI states
  readonly isPopulationMap = computed(() => this._currentMap() === 'population');
  readonly isVariationMap = computed(() => this._currentMap() === 'variation');
  readonly isBasicMap = computed(() => this._currentMap() === 'basic');
  readonly isDistritosMap = computed(() => this._currentMap() === 'distritos');
  
  // Methods to change map
  showPopulationMap(): void {
    this._currentMap.set('population');
  }
  
  showVariationMap(): void {
    this._currentMap.set('variation');
  }
  
  showBasicMap(): void {
    this._currentMap.set('basic');
  }
  
  showDistritosMap(): void {
    this._currentMap.set('distritos');
  }
  
  setMap(mapType: MapType): void {
    this._currentMap.set(mapType);
  }
}
