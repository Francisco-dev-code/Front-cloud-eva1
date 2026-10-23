import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { Subscription, timer, switchMap } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NotificacionService } from '../../core/services/notificacion.service';
import { Notificacion } from '../../core/models/mensajeria.model';
import { mensajeError } from '../../core/utils/http-error';

const INTERVALO_MS = 5000;

/** Muestra el resultado de las tareas asíncronas (notificaciones, tickets, documentos) procesadas por RabbitMQ. */
@Component({
  selector: 'app-notificaciones-list',
  standalone: true,
  imports: [DatePipe, MatTableModule, MatButtonModule, MatIconModule, MatSlideToggleModule, MatProgressSpinnerModule],
  templateUrl: './notificaciones-list.html',
  styleUrl: './notificaciones-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificacionesListComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly servicio = inject(NotificacionService);
  private readonly snackBar = inject(MatSnackBar);
  private sondeo?: Subscription;

  protected readonly columnas = ['id', 'tipo', 'mensaje', 'destinatario', 'cola', 'estado', 'fecha'];
  protected readonly datos = signal<Notificacion[]>([]);
  protected readonly cargando = signal(false);
  protected readonly autoActualizar = signal(false);

  constructor() {
    this.destroyRef.onDestroy(() => this.sondeo?.unsubscribe());
  }

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
      error: (e) => {
        this.cargando.set(false);
        this.snackBar.open(mensajeError(e, 'No se pudieron cargar las notificaciones'), 'Cerrar', { duration: 3500 });
      }
    });
  }

  alternarAutoActualizar(activo: boolean): void {
    this.autoActualizar.set(activo);
    this.sondeo?.unsubscribe();
    if (!activo) return;
    this.sondeo = timer(INTERVALO_MS, INTERVALO_MS)
      .pipe(switchMap(() => this.servicio.getAll()))
      .subscribe({
        next: (res) => this.datos.set(res),
        error: (e) => {
          this.autoActualizar.set(false);
          this.snackBar.open(mensajeError(e, 'Se detuvo la actualización automática'), 'Cerrar', { duration: 3500 });
        }
      });
  }
}
