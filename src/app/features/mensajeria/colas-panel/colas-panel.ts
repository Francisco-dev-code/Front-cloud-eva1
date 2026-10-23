import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RabbitAdminService } from '../../../core/services/rabbit-admin.service';
import { RabbitQueue } from '../../../core/models/mensajeria.model';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog';
import { mensajeError } from '../../../core/utils/http-error';

@Component({
  selector: 'app-colas-panel',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatTableModule, MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatCheckboxModule, MatDialogModule, MatProgressSpinnerModule
  ],
  templateUrl: './colas-panel.html',
  styleUrl: '../mensajeria.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ColasPanelComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly servicio = inject(RabbitAdminService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly columnas = ['name', 'durable', 'dlx', 'messages', 'consumers', 'acciones'];
  protected readonly datos = signal<RabbitQueue[]>([]);
  protected readonly cargando = signal(false);

  protected readonly formulario = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(255), Validators.pattern(/^[\w.\-:]+$/)]],
    durable: [true],
    deadLetterExchange: [''],
    deadLetterRoutingKey: [''],
    messageTtl: [null as number | null, [Validators.min(1)]]
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.servicio.listarColas().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        this.datos.set(res);
        this.cargando.set(false);
      },
      error: (e) => {
        this.cargando.set(false);
        this.snackBar.open(mensajeError(e, 'No se pudieron cargar las colas'), 'Cerrar', { duration: 3500 });
      }
    });
  }

  crear(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    const v = this.formulario.getRawValue();
    const cola: RabbitQueue = {
      name: v.name.trim(),
      durable: v.durable,
      deadLetterExchange: v.deadLetterExchange.trim() || null,
      deadLetterRoutingKey: v.deadLetterRoutingKey.trim() || null,
      messageTtl: v.messageTtl ?? null
    };
    this.servicio.crearCola(cola).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.snackBar.open(`Cola "${cola.name}" creada`, 'Cerrar', { duration: 2500 });
        this.formulario.reset({ name: '', durable: true, deadLetterExchange: '', deadLetterRoutingKey: '', messageTtl: null });
        this.cargar();
      },
      error: (e) => this.snackBar.open(mensajeError(e, 'Error al crear la cola'), 'Cerrar', { duration: 3500 })
    });
  }

  eliminar(cola: RabbitQueue): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { titulo: 'Eliminar cola', mensaje: `¿Eliminar la cola "${cola.name}" y sus mensajes? Esta acción no se puede deshacer.` }
    });
    ref.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((ok: boolean) => {
      if (!ok) return;
      this.servicio.eliminarCola(cola.name).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          this.snackBar.open('Cola eliminada', 'Cerrar', { duration: 2500 });
          this.cargar();
        },
        error: (e) => this.snackBar.open(mensajeError(e, 'Error al eliminar la cola'), 'Cerrar', { duration: 3500 })
      });
    });
  }
}
