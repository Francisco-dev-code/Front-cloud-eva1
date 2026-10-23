import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';

interface ItemMenu {
  ruta: string;
  etiqueta: string;
  icono: string;
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LayoutComponent {
  protected readonly auth = inject(AuthService);
  protected readonly router = inject(Router);

  protected readonly menu: ItemMenu[] = [
    { ruta: '/inicio', etiqueta: 'Inicio', icono: 'dashboard' },
    { ruta: '/libros', etiqueta: 'Libros', icono: 'menu_book' },
    { ruta: '/autores', etiqueta: 'Autores', icono: 'person' },
    { ruta: '/categorias', etiqueta: 'Categorías', icono: 'category' },
    { ruta: '/usuarios', etiqueta: 'Usuarios', icono: 'group' },
    { ruta: '/prestamos', etiqueta: 'Préstamos', icono: 'assignment_return' },
    { ruta: '/notificaciones', etiqueta: 'Notificaciones', icono: 'notifications' },
    { ruta: '/mensajeria', etiqueta: 'Mensajería', icono: 'hub' }
  ];

  private readonly esMovil = toSignal(
    inject(BreakpointObserver)
      .observe(Breakpoints.Handset)
      .pipe(map((resultado) => resultado.matches)),
    { initialValue: false }
  );

  protected readonly modoSidenav = () =>
    this.esMovil() ? 'over' : 'side';

  protected readonly abiertoPorDefecto = () =>
    !this.esMovil();
}