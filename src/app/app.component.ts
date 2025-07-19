import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './layouts/navbar/navbar.component';
import { FooterComponent } from './layouts/footer/footer.component';
import MapComponent from './map/map.component';
import MapVarComponent from './variacion/var.component';

@Component({
    selector: 'app-root',
    imports: [NavbarComponent, RouterOutlet, FooterComponent, MapComponent, MapVarComponent],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public router = inject(Router);

  avar() {
		this.router.navigateByUrl('/var');
	}

	distritos() {
			this.router.navigateByUrl('/distritos');
	}

  



}
