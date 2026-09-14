import { Routes } from '@angular/router';
import { LayoutComponent } from './shared/layout/layout';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
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
        path: 'prestamos',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/prestamos/prestamos-list/prestamos-list').then(
            (m) => m.PrestamosListComponent
          )
      }
    ]
  },
  { path: '**', redirectTo: 'inicio' }
];
