import { Component, inject } from '@angular/core';
import { MapStateService } from '@services/map-state.service';
import { NavbarComponent } from '@layouts/navbar/navbar.component';
import { FooterComponent } from '@layouts/footer/footer.component';
import { MapBasicComponent } from './map-basic/map-basic.component';
import { MapDistritosComponent } from './map-distritos/map-distritos.component';
import { MapVariationComponent } from './map-variation/map-variation.component';
import { MapComponent } from './map/map.component';
import { TableComponent } from './table/table.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [
    NavbarComponent, 
    FooterComponent, 
    MapComponent, 
    MapBasicComponent, 
    MapVariationComponent, 
    MapDistritosComponent,
    TableComponent
  ]
})
export class AppComponent {
  readonly mapState = inject(MapStateService);
}
