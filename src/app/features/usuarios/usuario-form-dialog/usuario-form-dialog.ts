import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Usuario } from '../../../core/models/usuario.model';

@Component({
  selector: 'app-usuario-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSlideToggleModule
  ],
  templateUrl: './usuario-form-dialog.html',
  styleUrl: './usuario-form-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsuarioFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  protected readonly ref = inject(MatDialogRef<UsuarioFormDialogComponent>);
  protected readonly datos = inject<Usuario | null>(MAT_DIALOG_DATA);

  protected readonly esEdicion = !!this.datos?.id;

  protected readonly formulario = this.fb.group({
    nombre: [this.datos?.nombre ?? '', [Validators.required, Validators.maxLength(80)]],
    apellido: [this.datos?.apellido ?? '', [Validators.required, Validators.maxLength(80)]],
    email: [this.datos?.email ?? '', [Validators.required, Validators.email]],
    telefono: [this.datos?.telefono ?? ''],
    direccion: [this.datos?.direccion ?? ''],
    activo: [this.datos?.activo ?? true]
  });

  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    const valor: Usuario = {
      ...(this.datos ?? {}),
      ...(this.formulario.getRawValue() as Usuario)
    };
    this.ref.close(valor);
  }
}
