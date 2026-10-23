import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { ColasPanelComponent } from './colas-panel/colas-panel';
import { ExchangesPanelComponent } from './exchanges-panel/exchanges-panel';
import { BindingsPanelComponent } from './bindings-panel/bindings-panel';
import { PublicarPanelComponent } from './publicar-panel/publicar-panel';

/** Administración de RabbitMQ: colas (con DLQ), exchanges, bindings y publicación de prueba. */
@Component({
  selector: 'app-mensajeria',
  standalone: true,
  imports: [MatTabsModule, ColasPanelComponent, ExchangesPanelComponent, BindingsPanelComponent, PublicarPanelComponent],
  templateUrl: './mensajeria.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MensajeriaComponent {}
