import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { RabbitAdminService } from './rabbit-admin.service';
import { NotificacionService } from './notificacion.service';
import { environment } from '../../../environments/environment';

describe('RabbitAdminService', () => {
  const base = `${environment.apiUrl.replace(/\/+$/, '')}/api`;
  let servicio: RabbitAdminService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    servicio = TestBed.inject(RabbitAdminService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('crea una cola con DLX', () => {
    const cola = { name: 'notificaciones.queue', durable: true, deadLetterExchange: 'dlx', deadLetterRoutingKey: 'dlq' };
    servicio.crearCola(cola).subscribe();
    const req = http.expectOne(`${base}/rabbit/queues`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(cola);
    req.flush(cola);
  });

  it('elimina una cola codificando el nombre', () => {
    servicio.eliminarCola('a b/c').subscribe();
    const req = http.expectOne(`${base}/rabbit/queues/a%20b%2Fc`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('crea y elimina exchanges', () => {
    servicio.crearExchange({ name: 'x', type: 'topic', durable: true }).subscribe();
    http.expectOne(`${base}/rabbit/exchanges`).flush({});
    servicio.eliminarExchange('x').subscribe();
    const req = http.expectOne(`${base}/rabbit/exchanges/x`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('crea y elimina bindings (DELETE con query params)', () => {
    const b = { exchange: 'x', queue: 'q', routingKey: 'k.#' };
    servicio.crearBinding(b).subscribe();
    http.expectOne(`${base}/rabbit/bindings`).flush(b);
    servicio.eliminarBinding(b).subscribe();
    const req = http.expectOne((r) => r.url === `${base}/rabbit/bindings` && r.method === 'DELETE');
    expect(req.request.params.get('exchange')).toBe('x');
    expect(req.request.params.get('queue')).toBe('q');
    expect(req.request.params.get('routingKey')).toBe('k.#');
    req.flush(null);
  });

  it('publica un mensaje', () => {
    servicio.publicar({ exchange: 'x', routingKey: 'k', payload: '{}' }).subscribe();
    const req = http.expectOne(`${base}/rabbit/publish`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('lista notificaciones en /api/notificaciones', () => {
    TestBed.inject(NotificacionService).getAll().subscribe();
    http.expectOne(`${base}/notificaciones`).flush([]);
  });
});
