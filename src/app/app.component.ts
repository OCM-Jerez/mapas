import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './layouts/navbar/navbar.component';
import { FooterComponent } from './layouts/footer/footer.component';
import { MapBasicComponent } from './map-basic/map-basic.component';
import { MapDistritosComponent } from './map-distritos/map-distritos.component';
import { MapVariationComponent } from './map-variation/map-variation.component';
import MapComponent from './map/map.component';
import { TableComponent } from './table/table.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [CommonModule, NavbarComponent, FooterComponent, MapComponent, MapBasicComponent, MapVariationComponent, MapDistritosComponent,TableComponent], 
})
export class AppComponent {
  showMap = 'variation'; // 'population' | 'variation' | 'basic' | 'distritos' - Por defecto muestra el mapa de variación

  constructor() {}

  showPopulationMap() {
    this.showMap = 'population';
  }

  showVariationMap() {
    this.showMap = 'variation';
  }

  showBasicMap() {
    this.showMap = 'basic';
  }

  showDistritosMap() {
    this.showMap = 'distritos';
  }
}
