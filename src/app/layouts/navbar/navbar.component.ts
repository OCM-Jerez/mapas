import { Component, inject, computed } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  imports: []
})
export class NavbarComponent {
  readonly router = inject(Router);
  
  readonly isHomePage = computed(() => this.router.url === '/home');

  navigateToRoute(route: string): void {
    this.router.navigate([route]);
  }
}
