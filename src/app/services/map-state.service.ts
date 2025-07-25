import { Injectable, computed, signal } from '@angular/core';
import type { MapType } from '@interfaces/map.interface';

@Injectable({
  providedIn: 'root'
})
export class MapStateService {
  private readonly _currentMap = signal<MapType>('variation');
  private readonly _showTable = signal<boolean>(false);
  
  // Public readonly signals
  readonly currentMap = this._currentMap.asReadonly();
  readonly showTable = this._showTable.asReadonly();
  
  // Computed signals for UI states
  readonly isPopulationMap = computed(() => this._currentMap() === 'population');
  readonly isVariationMap = computed(() => this._currentMap() === 'variation');
  readonly isBasicMap = computed(() => this._currentMap() === 'basic');
  readonly isDistritosMap = computed(() => this._currentMap() === 'distritos');
  
  // Methods to change map
  showPopulationMap(): void {
    this._currentMap.set('population');
    this._showTable.set(false);
  }
  
  showVariationMap(): void {
    this._currentMap.set('variation');
    this._showTable.set(false);
  }
  
  showBasicMap(): void {
    this._currentMap.set('basic');
    this._showTable.set(false);
  }
  
  showDistritosMap(): void {
    this._currentMap.set('distritos');
    this._showTable.set(false);
  }
  
  setMap(mapType: MapType): void {
    this._currentMap.set(mapType);
    this._showTable.set(false);
  }
  
  toggleTable(): void {
    this._showTable.set(!this._showTable());
  }
  
  showTableOnly(): void {
    this._showTable.set(true);
  }
  
  hideTable(): void {
    this._showTable.set(false);
  }
}
