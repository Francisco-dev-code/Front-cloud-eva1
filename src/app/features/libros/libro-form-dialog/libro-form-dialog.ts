import { Component, OnInit, inject, signal, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { Libro } from '../../../core/models/libro.model';
import { Autor } from '../../../core/models/autor.model';
import { Categoria } from '../../../core/models/categoria.model';
import { AutorService } from '../../../core/services/autor.service';
import { CategoriaService } from '../../../core/services/categoria.service';

@Component({
  selector: 'app-libro-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  templateUrl: './libro-form-dialog.html',
  styleUrl: './libro-form-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LibroFormDialogComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly autorService = inject(AutorService);
  private readonly categoriaService = inject(CategoriaService);
  protected readonly ref = inject(MatDialogRef<LibroFormDialogComponent>);
  protected readonly datos = inject<Libro | null>(MAT_DIALOG_DATA);

  protected readonly esEdicion = !!this.datos?.id;
  protected readonly autores = signal<Autor[]>([]);
  protected readonly categorias = signal<Categoria[]>([]);

  protected readonly formulario = this.fb.group({
    titulo: [this.datos?.titulo ?? '', [Validators.required, Validators.maxLength(150)]],
    isbn: [this.datos?.isbn ?? '', [Validators.required]],
    editorial: [this.datos?.editorial ?? ''],
    anioPublicacion: [this.datos?.anioPublicacion ?? null],
    cantidadTotal: [this.datos?.cantidadTotal ?? 1, [Validators.required, Validators.min(1)]],
    cantidadDisponible: [this.datos?.cantidadDisponible ?? 1, [Validators.required, Validators.min(0)]],
    autorId: [this.datos?.autorId ?? null, Validators.required],
    categoriaId: [this.datos?.categoriaId ?? null, Validators.required]
  });

  ngOnInit(): void {
    this.autorService.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((res) => this.autores.set(res));
    this.categoriaService.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((res) => this.categorias.set(res));
  }

  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    const valor: Libro = {
      ...(this.datos ?? {}),
      ...(this.formulario.getRawValue() as Libro)
    };
    this.ref.close(valor);
  }
}
