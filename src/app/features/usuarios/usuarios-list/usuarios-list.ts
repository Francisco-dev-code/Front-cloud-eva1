import { Component, OnInit, inject, signal, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UsuarioService } from '../../../core/services/usuario.service';
import { Usuario } from '../../../core/models/usuario.model';
import { UsuarioFormDialogComponent } from '../usuario-form-dialog/usuario-form-dialog';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-usuarios-list',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDialogModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './usuarios-list.html',
  styleUrl: './usuarios-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsuariosListComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly servicio = inject(UsuarioService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly columnas = ['id', 'nombre', 'email', 'telefono', 'activo', 'acciones'];
  protected readonly datos = signal<Usuario[]>([]);
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
        this.snackBar.open('No se pudieron cargar los usuarios', 'Cerrar', { duration: 3000 });
      }
    });
  }

  nuevo(): void {
    const ref = this.dialog.open(UsuarioFormDialogComponent, { data: null });
    ref.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((resultado: Usuario | null) => {
      if (!resultado) return;
      this.servicio.create(resultado).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          this.snackBar.open('Usuario creado', 'Cerrar', { duration: 2500 });
          this.cargar();
        },
        error: () => this.snackBar.open('Error al crear el usuario', 'Cerrar', { duration: 3000 })
      });
    });
  }

  editar(item: Usuario): void {
    const ref = this.dialog.open(UsuarioFormDialogComponent, { data: item });
    ref.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((resultado: Usuario | null) => {
      if (!resultado || !item.id) return;
      this.servicio.update(item.id, resultado).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          this.snackBar.open('Usuario actualizado', 'Cerrar', { duration: 2500 });
          this.cargar();
        },
        error: () => this.snackBar.open('Error al actualizar el usuario', 'Cerrar', { duration: 3000 })
      });
    });
  }

  eliminar(item: Usuario): void {
    if (!item.id) return;
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { titulo: 'Eliminar usuario', mensaje: `¿Eliminar a "${item.nombre} ${item.apellido}"?` }
    });
    ref.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((confirmado: boolean) => {
      if (!confirmado || !item.id) return;
      this.servicio.delete(item.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          this.snackBar.open('Usuario eliminado', 'Cerrar', { duration: 2500 });
          this.cargar();
        },
        error: () => this.snackBar.open('Error al eliminar el usuario', 'Cerrar', { duration: 3000 })
      });
    });
  }
}
