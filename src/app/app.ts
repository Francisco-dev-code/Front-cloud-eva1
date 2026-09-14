import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AuthenticationResult,
  EventMessage,
  EventType
} from '@azure/msal-browser';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {
  private readonly msal = inject(MsalService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.procesarRedirect();
    this.configurarCuentaActiva();
  }

  private procesarRedirect(): void {
    this.msal
      .handleRedirectObservable()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resultado: AuthenticationResult | null) => {
          if (resultado?.account) {
            this.msal.instance.setActiveAccount(resultado.account);
          }
        },
        error: (error: unknown) => {
          console.error('Error al procesar el redirect de MSAL:', error);
        }
      });
  }

  private configurarCuentaActiva(): void {
    this.msal.instance.addEventCallback(
      (mensaje: EventMessage) => {
        if (
          mensaje.eventType === EventType.LOGIN_SUCCESS &&
          mensaje.payload
        ) {
          const resultado = mensaje.payload as AuthenticationResult;

          if (resultado.account) {
            this.msal.instance.setActiveAccount(resultado.account);
          }
        }
      }
    );

    const cuentas = this.msal.instance.getAllAccounts();

    if (cuentas.length > 0 && !this.msal.instance.getActiveAccount()) {
      this.msal.instance.setActiveAccount(cuentas[0]);
    }
  }
}