import { Component, OnInit, inject, signal, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { LibroService } from '../../core/services/libro.service';
import { AutorService } from '../../core/services/autor.service';
import { CategoriaService } from '../../core/services/categoria.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { PrestamoService } from '../../core/services/prestamo.service';

interface Tarjeta {
  etiqueta: string;
  valor: number;
  icono: string;
  ruta: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatCardModule, MatIconModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly libroService = inject(LibroService);
  private readonly autorService = inject(AutorService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly prestamoService = inject(PrestamoService);

  protected readonly tarjetas = signal<Tarjeta[]>([
    { etiqueta: 'Libros', valor: 0, icono: 'menu_book', ruta: '/libros' },
    { etiqueta: 'Autores', valor: 0, icono: 'person', ruta: '/autores' },
    { etiqueta: 'Categorías', valor: 0, icono: 'category', ruta: '/categorias' },
    { etiqueta: 'Usuarios', valor: 0, icono: 'group', ruta: '/usuarios' },
    { etiqueta: 'Préstamos activos', valor: 0, icono: 'assignment_return', ruta: '/prestamos' }
  ]);

  ngOnInit(): void {
    forkJoin({
      libros: this.libroService.getAll(),
      autores: this.autorService.getAll(),
      categorias: this.categoriaService.getAll(),
      usuarios: this.usuarioService.getAll(),
      prestamos: this.prestamoService.getAll()
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ libros, autores, categorias, usuarios, prestamos }) => {
        this.tarjetas.set([
          { etiqueta: 'Libros', valor: libros.length, icono: 'menu_book', ruta: '/libros' },
          { etiqueta: 'Autores', valor: autores.length, icono: 'person', ruta: '/autores' },
          { etiqueta: 'Categorías', valor: categorias.length, icono: 'category', ruta: '/categorias' },
          { etiqueta: 'Usuarios', valor: usuarios.length, icono: 'group', ruta: '/usuarios' },
          {
            etiqueta: 'Préstamos activos',
            valor: prestamos.filter((p) => p.estado !== 'DEVUELTO').length,
            icono: 'assignment_return',
            ruta: '/prestamos'
          }
        ]);
      },
      error: () => {
        // Si el backend aún no está disponible, se deja el panel en cero sin bloquear la vista.
      }
    });
  }
}
