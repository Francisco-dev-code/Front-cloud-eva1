import { Component, OnInit, inject, signal, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Prestamo, EstadoPrestamo } from '../../../core/models/prestamo.model';
import { Libro } from '../../../core/models/libro.model';
import { Usuario } from '../../../core/models/usuario.model';
import { LibroService } from '../../../core/services/libro.service';
import { UsuarioService } from '../../../core/services/usuario.service';

@Component({
  selector: 'app-prestamo-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './prestamo-form-dialog.html',
  styleUrl: './prestamo-form-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrestamoFormDialogComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly libroService = inject(LibroService);
  private readonly usuarioService = inject(UsuarioService);
  protected readonly ref = inject(MatDialogRef<PrestamoFormDialogComponent>);
  protected readonly datos = inject<Prestamo | null>(MAT_DIALOG_DATA);

  protected readonly esEdicion = !!this.datos?.id;
  protected readonly libros = signal<Libro[]>([]);
  protected readonly usuarios = signal<Usuario[]>([]);
  protected readonly estados: EstadoPrestamo[] = ['ACTIVO', 'DEVUELTO', 'ATRASADO'];

  protected readonly formulario = this.fb.group({
    libroId: [this.datos?.libroId ?? null, Validators.required],
    usuarioId: [this.datos?.usuarioId ?? null, Validators.required],
    fechaPrestamo: [
      this.datos?.fechaPrestamo ? new Date(this.datos.fechaPrestamo) : new Date(),
      Validators.required
    ],
    fechaDevolucionEsperada: [
      this.datos?.fechaDevolucionEsperada ? new Date(this.datos.fechaDevolucionEsperada) : null,
      Validators.required
    ],
    estado: [this.datos?.estado ?? ('ACTIVO' as EstadoPrestamo), Validators.required],
    observaciones: [this.datos?.observaciones ?? '']
  });

  ngOnInit(): void {
    this.libroService.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((res) => this.libros.set(res));
    this.usuarioService.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((res) => this.usuarios.set(res));
  }

  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    const v = this.formulario.getRawValue();
    const valor: Prestamo = {
      ...(this.datos ?? {}),
      ...v,
      fechaPrestamo: new Date(v.fechaPrestamo as Date).toISOString().substring(0, 10),
      fechaDevolucionEsperada: new Date(v.fechaDevolucionEsperada as Date).toISOString().substring(0, 10)
    } as Prestamo;
    this.ref.close(valor);
  }
}
