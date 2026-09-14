import { Component, OnInit, inject, signal, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { LibroService } from '../../../core/services/libro.service';
import { Libro } from '../../../core/models/libro.model';
import { LibroFormDialogComponent } from '../libro-form-dialog/libro-form-dialog';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-libros-list',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    FormsModule
  ],
  templateUrl: './libros-list.html',
  styleUrl: './libros-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LibrosListComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly servicio = inject(LibroService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly columnas = ['id', 'titulo', 'autor', 'categoria', 'disponibilidad', 'acciones'];
  protected readonly datos = signal<Libro[]>([]);
  protected readonly cargando = signal(false);
  protected filtro = '';

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.servicio.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        this.datos.set(res);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.snackBar.open('No se pudieron cargar los libros', 'Cerrar', { duration: 3000 });
      }
    });
  }

  buscar(): void {
    const termino = this.filtro.trim();
    if (!termino) {
      this.cargar();
      return;
    }
    this.cargando.set(true);
    this.servicio.buscar(termino).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        this.datos.set(res);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.snackBar.open('No se pudo realizar la búsqueda', 'Cerrar', { duration: 3000 });
      }
    });
  }

  nuevo(): void {
    const ref = this.dialog.open(LibroFormDialogComponent, { data: null });
    ref.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((resultado: Libro | null) => {
      if (!resultado) return;
      this.servicio.create(resultado).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          this.snackBar.open('Libro creado', 'Cerrar', { duration: 2500 });
          this.cargar();
        },
        error: () => this.snackBar.open('Error al crear el libro', 'Cerrar', { duration: 3000 })
      });
    });
  }

  editar(item: Libro): void {
    const ref = this.dialog.open(LibroFormDialogComponent, { data: item });
    ref.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((resultado: Libro | null) => {
      if (!resultado || !item.id) return;
      this.servicio.update(item.id, resultado).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          this.snackBar.open('Libro actualizado', 'Cerrar', { duration: 2500 });
          this.cargar();
        },
        error: () => this.snackBar.open('Error al actualizar el libro', 'Cerrar', { duration: 3000 })
      });
    });
  }

  eliminar(item: Libro): void {
    if (!item.id) return;
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { titulo: 'Eliminar libro', mensaje: `¿Eliminar "${item.titulo}"?` }
    });
    ref.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((confirmado: boolean) => {
      if (!confirmado || !item.id) return;
      this.servicio.delete(item.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          this.snackBar.open('Libro eliminado', 'Cerrar', { duration: 2500 });
          this.cargar();
        },
        error: () => this.snackBar.open('Error al eliminar el libro', 'Cerrar', { duration: 3000 })
      });
    });
  }
}
