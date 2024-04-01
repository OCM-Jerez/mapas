import { Component,  inject } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';


@Component({
	selector: 'app-navbar',
	templateUrl: './navbar.component.html',
	styleUrls: ['./navbar.component.scss'],
	standalone: true,
	imports: []
})
export class NavbarComponent {
	
	private _location = inject(Location);
		public router = inject(Router);


	

	navigateTo() {
		this.router.navigateByUrl('/');
	}

	volver() {
		
		this._location.back();
	}


}
