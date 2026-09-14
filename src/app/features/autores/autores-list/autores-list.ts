import { Component, OnInit, inject, signal, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AutorService } from '../../../core/services/autor.service';
import { Autor } from '../../../core/models/autor.model';
import { AutorFormDialogComponent } from '../autor-form-dialog/autor-form-dialog';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-autores-list',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, MatIconModule, MatDialogModule, MatProgressSpinnerModule],
  templateUrl: './autores-list.html',
  styleUrl: './autores-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AutoresListComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly servicio = inject(AutorService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly columnas = ['id', 'nombre', 'apellido', 'nacionalidad', 'fechaNacimiento', 'acciones'];
  protected readonly datos = signal<Autor[]>([]);
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
        this.snackBar.open('No se pudieron cargar los autores', 'Cerrar', { duration: 3000 });
      }
    });
  }

  nuevo(): void {
    const ref = this.dialog.open(AutorFormDialogComponent, { data: null });
    ref.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((resultado: Autor | null) => {
      if (!resultado) return;
      this.servicio.create(resultado).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          this.snackBar.open('Autor creado', 'Cerrar', { duration: 2500 });
          this.cargar();
        },
        error: () => this.snackBar.open('Error al crear el autor', 'Cerrar', { duration: 3000 })
      });
    });
  }

  editar(item: Autor): void {
    const ref = this.dialog.open(AutorFormDialogComponent, { data: item });
    ref.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((resultado: Autor | null) => {
      if (!resultado || !item.id) return;
      this.servicio.update(item.id, resultado).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          this.snackBar.open('Autor actualizado', 'Cerrar', { duration: 2500 });
          this.cargar();
        },
        error: () => this.snackBar.open('Error al actualizar el autor', 'Cerrar', { duration: 3000 })
      });
    });
  }

  eliminar(item: Autor): void {
    if (!item.id) return;
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { titulo: 'Eliminar autor', mensaje: `¿Eliminar a "${item.nombre} ${item.apellido}"?` }
    });
    ref.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((confirmado: boolean) => {
      if (!confirmado || !item.id) return;
      this.servicio.delete(item.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          this.snackBar.open('Autor eliminado', 'Cerrar', { duration: 2500 });
          this.cargar();
        },
        error: () => this.snackBar.open('Error al eliminar el autor', 'Cerrar', { duration: 3000 })
      });
    });
  }
}
