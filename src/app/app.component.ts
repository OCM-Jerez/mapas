import { Component, inject } from '@angular/core';
import { MapStateService } from '@services/map-state.service';
import { NavbarComponent } from '@layouts/navbar/navbar.component';
import { FooterComponent } from '@layouts/footer/footer.component';
import { MapSeccionesCensalesComponent } from './map-secciones-censales/map-secciones-censales.component';
import { MapDistritosComponent } from './map-distritos/map-distritos.component';
import { MapCentroHistoricoEvolucionPoblacionComponent } from './map-centro-historico-evolucion-poblacion/map-centro-historico-evolucion-poblacion.component';
import { MapSeccionesCensalesEvolucionPoblacionComponent } from './map-secciones-censales-evolucion-poblacion/map-secciones-censales-evolucion-poblacion.component';
import { TableComponent } from './table/table.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [
    NavbarComponent, 
    FooterComponent, 
    MapSeccionesCensalesEvolucionPoblacionComponent, 
    MapSeccionesCensalesComponent, 
    MapCentroHistoricoEvolucionPoblacionComponent, 
    MapDistritosComponent,
    TableComponent
  ]
})
export class AppComponent {
  readonly mapState = inject(MapStateService);
}
