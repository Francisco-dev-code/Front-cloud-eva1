import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RabbitAdminService } from '../../../core/services/rabbit-admin.service';
import { RabbitBinding, RabbitExchange, RabbitQueue } from '../../../core/models/mensajeria.model';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog';
import { mensajeError } from '../../../core/utils/http-error';

@Component({
  selector: 'app-bindings-panel',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatTableModule, MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatDialogModule, MatProgressSpinnerModule
  ],
  templateUrl: './bindings-panel.html',
  styleUrl: '../mensajeria.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BindingsPanelComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly servicio = inject(RabbitAdminService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly columnas = ['exchange', 'queue', 'routingKey', 'acciones'];
  protected readonly datos = signal<RabbitBinding[]>([]);
  protected readonly exchanges = signal<RabbitExchange[]>([]);
  protected readonly colas = signal<RabbitQueue[]>([]);
  protected readonly cargando = signal(false);

  protected readonly formulario = this.fb.nonNullable.group({
    exchange: ['', Validators.required],
    queue: ['', Validators.required],
    routingKey: ['', Validators.maxLength(255)]
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    forkJoin({
      bindings: this.servicio.listarBindings(),
      exchanges: this.servicio.listarExchanges(),
      colas: this.servicio.listarColas()
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (r) => {
          this.datos.set(r.bindings);
          // No se puede enlazar al exchange por defecto ni a los amq.* desde la UI.
          this.exchanges.set(r.exchanges.filter((e) => e.name !== ''));
          this.colas.set(r.colas);
          this.cargando.set(false);
        },
        error: (e) => {
          this.cargando.set(false);
          this.snackBar.open(mensajeError(e, 'No se pudieron cargar los bindings'), 'Cerrar', { duration: 3500 });
        }
      });
  }

  crear(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    const binding: RabbitBinding = this.formulario.getRawValue();
    this.servicio.crearBinding(binding).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.snackBar.open('Binding creado', 'Cerrar', { duration: 2500 });
        this.formulario.reset({ exchange: '', queue: '', routingKey: '' });
        this.cargar();
      },
      error: (e) => this.snackBar.open(mensajeError(e, 'Error al crear el binding'), 'Cerrar', { duration: 3500 })
    });
  }

  eliminar(binding: RabbitBinding): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titulo: 'Eliminar binding',
        mensaje: `¿Eliminar el binding ${binding.exchange} → ${binding.queue} (${binding.routingKey || 'sin routing key'})?`
      }
    });
    ref.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((ok: boolean) => {
      if (!ok) return;
      this.servicio.eliminarBinding(binding).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          this.snackBar.open('Binding eliminado', 'Cerrar', { duration: 2500 });
          this.cargar();
        },
        error: (e) => this.snackBar.open(mensajeError(e, 'Error al eliminar el binding'), 'Cerrar', { duration: 3500 })
      });
    });
  }
}
