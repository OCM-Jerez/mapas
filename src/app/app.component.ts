import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MapStateService } from '@services/map-state.service';
import { NavbarComponent } from '@layouts/navbar/navbar.component';
import { FooterComponent } from '@layouts/footer/footer.component';
import { MapNavigationComponent } from '@commons/components/map-navigation.component';
import { MapBasicComponent } from './map-basic/map-basic.component';
import { MapDistritosComponent } from './map-distritos/map-distritos.component';
import { MapVariationComponent } from './map-variation/map-variation.component';
import MapComponent from './map/map.component';
import { TableComponent } from './table/table.component';

@Component({
  selector: 'app-root',
  template: `
    <div class="OCM-app-root">
      <app-navbar />
      <router-outlet />
      
      <!-- Map Navigation -->
      <app-map-navigation (mapChanged)="onMapChanged($event)" />

      <!-- Map Display using control flow -->
      @if (mapState.isPopulationMap()) {
        <app-map />
      } @else if (mapState.isVariationMap()) {
        <app-map-variation />
      } @else if (mapState.isBasicMap()) {
        <app-map-basic />
      } @else if (mapState.isDistritosMap()) {
        <app-map-distritos />
      }
      
      <!-- Table only shown for variation map -->
      @if (mapState.isVariationMap()) {
        <app-table />
      }
      
      <app-footer />
    </div>
  `,
  styleUrls: ['./app.component.scss'],
  imports: [
    RouterOutlet,
    NavbarComponent, 
    FooterComponent, 
    MapNavigationComponent,
    MapComponent, 
    MapBasicComponent, 
    MapVariationComponent, 
    MapDistritosComponent,
    TableComponent
  ]
})
export class AppComponent {
  readonly mapState = inject(MapStateService);

  onMapChanged(mapType: string): void {
    // Additional logic when map changes if needed
    console.log('Map changed to:', mapType);
  }
}
