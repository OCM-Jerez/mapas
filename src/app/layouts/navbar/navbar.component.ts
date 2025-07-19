import { Component,  inject } from '@angular/core';
import { Router } from '@angular/router';


@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss'],
    imports: []
})
export class NavbarComponent {
	
		public router = inject(Router);


	


}
