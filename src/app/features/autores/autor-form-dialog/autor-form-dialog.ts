import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Autor } from '../../../core/models/autor.model';

@Component({
  selector: 'app-autor-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './autor-form-dialog.html',
  styleUrl: './autor-form-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AutorFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  protected readonly ref = inject(MatDialogRef<AutorFormDialogComponent>);
  protected readonly datos = inject<Autor | null>(MAT_DIALOG_DATA);

  protected readonly esEdicion = !!this.datos?.id;

  protected readonly formulario = this.fb.group({
    nombre: [this.datos?.nombre ?? '', [Validators.required, Validators.maxLength(80)]],
    apellido: [this.datos?.apellido ?? '', [Validators.required, Validators.maxLength(80)]],
    nacionalidad: [this.datos?.nacionalidad ?? ''],
    fechaNacimiento: [this.datos?.fechaNacimiento ? new Date(this.datos.fechaNacimiento) : null],
    biografia: [this.datos?.biografia ?? '']
  });

  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    const valores = this.formulario.getRawValue();
    const valor: Autor = {
      ...(this.datos ?? {}),
      ...valores,
      fechaNacimiento: valores.fechaNacimiento
        ? new Date(valores.fechaNacimiento).toISOString().substring(0, 10)
        : undefined
    } as Autor;
    this.ref.close(valor);
  }
}
