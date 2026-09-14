import { Component, OnInit, inject, signal, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CategoriaService } from '../../../core/services/categoria.service';
import { Categoria } from '../../../core/models/categoria.model';
import { CategoriaFormDialogComponent } from '../categoria-form-dialog/categoria-form-dialog';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-categorias-list',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './categorias-list.html',
  styleUrl: './categorias-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoriasListComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly servicio = inject(CategoriaService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly columnas = ['id', 'nombre', 'descripcion', 'acciones'];
  protected readonly datos = signal<Categoria[]>([]);
  protected readonly cargando = signal(false);

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
        this.snackBar.open('No se pudieron cargar las categorías', 'Cerrar', { duration: 3000 });
      }
    });
  }

  nuevo(): void {
    const ref = this.dialog.open(CategoriaFormDialogComponent, { data: null });
    ref.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((resultado: Categoria | null) => {
      if (!resultado) return;
      this.servicio.create(resultado).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          this.snackBar.open('Categoría creada', 'Cerrar', { duration: 2500 });
          this.cargar();
        },
        error: () => this.snackBar.open('Error al crear la categoría', 'Cerrar', { duration: 3000 })
      });
    });
  }

  editar(item: Categoria): void {
    const ref = this.dialog.open(CategoriaFormDialogComponent, { data: item });
    ref.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((resultado: Categoria | null) => {
      if (!resultado || !item.id) return;
      this.servicio.update(item.id, resultado).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          this.snackBar.open('Categoría actualizada', 'Cerrar', { duration: 2500 });
          this.cargar();
        },
        error: () => this.snackBar.open('Error al actualizar la categoría', 'Cerrar', { duration: 3000 })
      });
    });
  }

  eliminar(item: Categoria): void {
    if (!item.id) return;
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { titulo: 'Eliminar categoría', mensaje: `¿Eliminar "${item.nombre}"? Esta acción no se puede deshacer.` }
    });
    ref.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((confirmado: boolean) => {
      if (!confirmado || !item.id) return;
      this.servicio.delete(item.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          this.snackBar.open('Categoría eliminada', 'Cerrar', { duration: 2500 });
          this.cargar();
        },
        error: () => this.snackBar.open('Error al eliminar la categoría', 'Cerrar', { duration: 3000 })
      });
    });
  }
}
