import { Routes } from '@angular/router';
import { LayoutComponent } from './shared/layout/layout';

export const routes: Routes = [
  {
    path: 'registro',
    loadComponent: () =>
      import('./features/registro/registro').then((m) => m.RegistroComponent)
  },
  {
    // Sitio público: la autenticación se exige al hacer solicitudes a la API (ver authRequiredInterceptor).
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
      {
        path: 'inicio',
        loadComponent: () => import('./features/home/home').then((m) => m.HomeComponent)
      },
      {
        path: 'libros',
        loadComponent: () =>
          import('./features/libros/libros-list/libros-list').then((m) => m.LibrosListComponent)
      },
      {
        path: 'autores',
        loadComponent: () =>
          import('./features/autores/autores-list/autores-list').then((m) => m.AutoresListComponent)
      },
      {
        path: 'categorias',
        loadComponent: () =>
          import('./features/categorias/categorias-list/categorias-list').then(
            (m) => m.CategoriasListComponent
          )
      },
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./features/usuarios/usuarios-list/usuarios-list').then((m) => m.UsuariosListComponent)
      },
      {
        path: 'mensajeria',
        loadComponent: () =>
          import('./features/mensajeria/mensajeria').then((m) => m.MensajeriaComponent)
      },
      {
        path: 'notificaciones',
        loadComponent: () =>
          import('./features/notificaciones/notificaciones-list').then(
            (m) => m.NotificacionesListComponent
          )
      },
      {
        path: 'prestamos',
        loadComponent: () =>
          import('./features/prestamos/prestamos-list/prestamos-list').then(
            (m) => m.PrestamosListComponent
          )
      }
    ]
  },
  { path: '**', redirectTo: 'inicio' }
];
