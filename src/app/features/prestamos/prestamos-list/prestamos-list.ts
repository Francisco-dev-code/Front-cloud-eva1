import { Component, OnInit, inject, signal, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PrestamoService } from '../../../core/services/prestamo.service';
import { Prestamo } from '../../../core/models/prestamo.model';
import { PrestamoFormDialogComponent } from '../prestamo-form-dialog/prestamo-form-dialog';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-prestamos-list',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './prestamos-list.html',
  styleUrl: './prestamos-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrestamosListComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly servicio = inject(PrestamoService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly columnas = [
    'id',
    'libro',
    'usuario',
    'fechaPrestamo',
    'fechaDevolucionEsperada',
    'estado',
    'acciones'
  ];
  protected readonly datos = signal<Prestamo[]>([]);
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
        this.snackBar.open('No se pudieron cargar los préstamos', 'Cerrar', { duration: 3000 });
      }
    });
  }

  nuevo(): void {
    const ref = this.dialog.open(PrestamoFormDialogComponent, { data: null });
    ref.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((resultado: Prestamo | null) => {
      if (!resultado) return;
      this.servicio.create(resultado).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          this.snackBar.open('Préstamo registrado', 'Cerrar', { duration: 2500 });
          this.cargar();
        },
        error: () => this.snackBar.open('Error al registrar el préstamo', 'Cerrar', { duration: 3000 })
      });
    });
  }

  editar(item: Prestamo): void {
    const ref = this.dialog.open(PrestamoFormDialogComponent, { data: item });
    ref.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((resultado: Prestamo | null) => {
      if (!resultado || !item.id) return;
      this.servicio.update(item.id, resultado).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          this.snackBar.open('Préstamo actualizado', 'Cerrar', { duration: 2500 });
          this.cargar();
        },
        error: () => this.snackBar.open('Error al actualizar el préstamo', 'Cerrar', { duration: 3000 })
      });
    });
  }

  devolver(item: Prestamo): void {
    if (!item.id) return;
    this.servicio.devolver(item.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.snackBar.open('Devolución registrada', 'Cerrar', { duration: 2500 });
        this.cargar();
      },
      error: () => this.snackBar.open('Error al registrar la devolución', 'Cerrar', { duration: 3000 })
    });
  }

  eliminar(item: Prestamo): void {
    if (!item.id) return;
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { titulo: 'Eliminar préstamo', mensaje: '¿Eliminar este registro de préstamo?' }
    });
    ref.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((confirmado: boolean) => {
      if (!confirmado || !item.id) return;
      this.servicio.delete(item.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          this.snackBar.open('Préstamo eliminado', 'Cerrar', { duration: 2500 });
          this.cargar();
        },
        error: () => this.snackBar.open('Error al eliminar el préstamo', 'Cerrar', { duration: 3000 })
      });
    });
  }

  colorEstado(estado: string): 'primary' | 'warn' | 'accent' {
    if (estado === 'DEVUELTO') return 'primary';
    if (estado === 'ATRASADO') return 'warn';
    return 'accent';
  }
}
