import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RabbitAdminService } from '../../../core/services/rabbit-admin.service';
import { RabbitExchange } from '../../../core/models/mensajeria.model';
import { mensajeError } from '../../../core/utils/http-error';

/** Publica un mensaje de prueba (productor) para comprobar el ruteo, los consumidores y la DLQ. */
@Component({
  selector: 'app-publicar-panel',
  standalone: true,
  imports: [ReactiveFormsModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  templateUrl: './publicar-panel.html',
  styleUrl: '../mensajeria.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PublicarPanelComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly servicio = inject(RabbitAdminService);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly exchanges = signal<RabbitExchange[]>([]);
  protected readonly enviando = signal(false);

  protected readonly formulario = this.fb.nonNullable.group({
    exchange: ['', Validators.required],
    routingKey: [''],
    payload: ['', Validators.required]
  });

  ngOnInit(): void {
    this.servicio.listarExchanges().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => this.exchanges.set(res.filter((e) => e.name !== '')),
      error: (e) => this.snackBar.open(mensajeError(e, 'No se pudieron cargar los exchanges'), 'Cerrar', { duration: 3500 })
    });
  }

  publicar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.enviando.set(true);
    this.servicio.publicar(this.formulario.getRawValue()).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.enviando.set(false);
        this.snackBar.open('Mensaje publicado', 'Cerrar', { duration: 2500 });
      },
      error: (e) => {
        this.enviando.set(false);
        this.snackBar.open(mensajeError(e, 'Error al publicar el mensaje'), 'Cerrar', { duration: 3500 });
      }
    });
  }
}
