import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  PublicarMensaje,
  RabbitBinding,
  RabbitExchange,
  RabbitQueue
} from '../models/mensajeria.model';

/**
 * Cliente del microservicio administrador de RabbitMQ.
 *
 *   GET/POST   /api/rabbit/queues          DELETE /api/rabbit/queues/{name}
 *   GET/POST   /api/rabbit/exchanges       DELETE /api/rabbit/exchanges/{name}
 *   GET/POST   /api/rabbit/bindings        DELETE /api/rabbit/bindings?exchange=&queue=&routingKey=
 *   POST       /api/rabbit/publish
 */
@Injectable({ providedIn: 'root' })
export class RabbitAdminService {
  private readonly http = inject(HttpClient);

  private get url(): string {
    return `${environment.apiUrl.replace(/\/+$/, '')}/api/rabbit`;
  }

  listarColas(): Observable<RabbitQueue[]> {
    return this.http.get<RabbitQueue[]>(`${this.url}/queues`);
  }
  crearCola(cola: RabbitQueue): Observable<RabbitQueue> {
    return this.http.post<RabbitQueue>(`${this.url}/queues`, cola);
  }
  eliminarCola(nombre: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/queues/${encodeURIComponent(nombre)}`);
  }

  listarExchanges(): Observable<RabbitExchange[]> {
    return this.http.get<RabbitExchange[]>(`${this.url}/exchanges`);
  }
  crearExchange(exchange: RabbitExchange): Observable<RabbitExchange> {
    return this.http.post<RabbitExchange>(`${this.url}/exchanges`, exchange);
  }
  eliminarExchange(nombre: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/exchanges/${encodeURIComponent(nombre)}`);
  }

  listarBindings(): Observable<RabbitBinding[]> {
    return this.http.get<RabbitBinding[]>(`${this.url}/bindings`);
  }
  crearBinding(binding: RabbitBinding): Observable<RabbitBinding> {
    return this.http.post<RabbitBinding>(`${this.url}/bindings`, binding);
  }
  eliminarBinding(binding: RabbitBinding): Observable<void> {
    return this.http.delete<void>(`${this.url}/bindings`, {
      params: {
        exchange: binding.exchange,
        queue: binding.queue,
        routingKey: binding.routingKey
      }
    });
  }

  publicar(mensaje: PublicarMensaje): Observable<unknown> {
    return this.http.post(`${this.url}/publish`, mensaje);
  }
}
