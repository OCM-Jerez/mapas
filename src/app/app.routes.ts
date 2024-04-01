import { Routes } from '@angular/router';

export default [
    {
        path: 'distritos',
		loadComponent: () => import('./map/map.component')
	},
    {
        path: 'var',
		loadComponent: () => import('./variacion/var.component')
	},
    { path: '**', pathMatch: 'full', redirectTo: '/distritos' },


] as Routes
