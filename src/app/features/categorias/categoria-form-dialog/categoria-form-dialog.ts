import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Categoria } from '../../../core/models/categoria.model';

@Component({
  selector: 'app-categoria-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './categoria-form-dialog.html',
  styleUrl: './categoria-form-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoriaFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  protected readonly ref = inject(MatDialogRef<CategoriaFormDialogComponent>);
  protected readonly datos = inject<Categoria | null>(MAT_DIALOG_DATA);

  protected readonly esEdicion = !!this.datos?.id;

  protected readonly formulario = this.fb.group({
    nombre: [this.datos?.nombre ?? '', [Validators.required, Validators.maxLength(100)]],
    descripcion: [this.datos?.descripcion ?? '']
  });

  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    const valor: Categoria = {
      ...(this.datos ?? {}),
      ...(this.formulario.getRawValue() as Categoria)
    };
    this.ref.close(valor);
  }
}
