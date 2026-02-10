
import { Routes } from '@angular/router';
import { MainLayout } from './core/layouts/main-layout/main-layout';

export const routes: Routes = [
    {
        path: '',
        component: MainLayout,
        children: [
            // Home
            {
                path: '',
                loadComponent: () =>
                    import('./pages/home/home').then(m => m.Home),
            },
            // Estudios
            {
                path: 'estudios',
                loadComponent: () =>
                    import('./pages/estudios/estudios.component').then(c => c.EstudiosComponent),
            },
            // Sucursales
            {
                path: 'sucursales',
                loadComponent: () =>
                    import('./pages/sucursales/sucursales.component').then(c => c.SucursalesComponent),
            },
            // Facturación
            {
                path: 'facturacion',
                loadComponent: () =>
                    import('./pages/facturacion/facturacion.component').then(c => c.FacturacionComponent),
            },
            // Resultados
            {
                path: 'resultados',
                loadComponent: () =>
                    import('./pages/resultados/resultados.component').then(c => c.ResultadosComponent),
            },
            // Médicos
            {
                path: 'medicos',
                loadComponent: () =>
                    import('./pages/medicos/medicos.component').then(c => c.MedicosComponent),
            },
        ],
    },
    // Wildcard a Home (opcional)
    { path: '**', redirectTo: '', pathMatch: 'full' },
];
