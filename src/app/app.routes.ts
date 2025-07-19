import { Routes } from '@angular/router';

export default [
  {
    path: '',
    redirectTo: '/maps',
    pathMatch: 'full'
  },
  {
    path: 'maps',
    loadComponent: () => import('./app.component').then(m => m.AppComponent)
  },
  {
    path: 'distritos',
    loadComponent: () => import('./map/map.component')
  },
  {
    path: 'variation',
    loadComponent: () => import('./variacion/var.component')
  },
  {
    path: '**',
    redirectTo: '/maps'
  }
] as Routes;
