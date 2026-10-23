import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RabbitAdminService } from '../../../core/services/rabbit-admin.service';
import { RabbitExchange, TipoExchange } from '../../../core/models/mensajeria.model';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog';
import { mensajeError } from '../../../core/utils/http-error';

@Component({
  selector: 'app-exchanges-panel',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatTableModule, MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatCheckboxModule, MatDialogModule, MatProgressSpinnerModule
  ],
  templateUrl: './exchanges-panel.html',
  styleUrl: '../mensajeria.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExchangesPanelComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly servicio = inject(RabbitAdminService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly tipos: TipoExchange[] = ['direct', 'topic', 'fanout', 'headers'];
  protected readonly columnas = ['name', 'type', 'durable', 'acciones'];
  protected readonly datos = signal<RabbitExchange[]>([]);
  protected readonly cargando = signal(false);

  protected readonly formulario = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(255), Validators.pattern(/^[\w.\-:]+$/)]],
    type: ['direct' as TipoExchange, Validators.required],
    durable: [true],
    autoDelete: [false]
  });

  ngOnInit(): void {
    this.cargar();
  }

  /** Los exchanges predefinidos de RabbitMQ (vacío y amq.*) no se pueden eliminar. */
  protected esDelSistema(nombre: string): boolean {
    return nombre === '' || nombre.startsWith('amq.');
  }

  cargar(): void {
    this.cargando.set(true);
    this.servicio.listarExchanges().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        this.datos.set(res);
        this.cargando.set(false);
      },
      error: (e) => {
        this.cargando.set(false);
        this.snackBar.open(mensajeError(e, 'No se pudieron cargar los exchanges'), 'Cerrar', { duration: 3500 });
      }
    });
  }

  crear(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    const exchange: RabbitExchange = { ...this.formulario.getRawValue() };
    exchange.name = exchange.name.trim();
    this.servicio.crearExchange(exchange).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.snackBar.open(`Exchange "${exchange.name}" creado`, 'Cerrar', { duration: 2500 });
        this.formulario.reset({ name: '', type: 'direct', durable: true, autoDelete: false });
        this.cargar();
      },
      error: (e) => this.snackBar.open(mensajeError(e, 'Error al crear el exchange'), 'Cerrar', { duration: 3500 })
    });
  }

  eliminar(exchange: RabbitExchange): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { titulo: 'Eliminar exchange', mensaje: `¿Eliminar el exchange "${exchange.name}" y sus bindings?` }
    });
    ref.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((ok: boolean) => {
      if (!ok) return;
      this.servicio.eliminarExchange(exchange.name).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          this.snackBar.open('Exchange eliminado', 'Cerrar', { duration: 2500 });
          this.cargar();
        },
        error: (e) => this.snackBar.open(mensajeError(e, 'Error al eliminar el exchange'), 'Cerrar', { duration: 3500 })
      });
    });
  }
}
