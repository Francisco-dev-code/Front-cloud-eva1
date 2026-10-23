import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { ColasPanelComponent } from './colas-panel';
import { RabbitAdminService } from '../../../core/services/rabbit-admin.service';

describe('ColasPanelComponent', () => {
  const servicio = {
    listarColas: vi.fn(() => of([{ name: 'notificaciones.queue', durable: true, deadLetterExchange: 'dlx', messages: 2, consumers: 1 }])),
    crearCola: vi.fn(() => of({ name: 'x', durable: true })),
    eliminarCola: vi.fn(() => of(void 0))
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [ColasPanelComponent],
      providers: [{ provide: RabbitAdminService, useValue: servicio }]
    }).compileComponents();
  });

  it('lista las colas en la tabla', async () => {
    const fixture = TestBed.createComponent(ColasPanelComponent);
    await fixture.whenStable();
    fixture.detectChanges();
    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).toContain('notificaciones.queue');
    expect(texto).toContain('dlx');
  });

  it('no crea la cola si el formulario es inválido', async () => {
    const fixture = TestBed.createComponent(ColasPanelComponent);
    await fixture.whenStable();
    fixture.componentInstance['crear']();
    expect(servicio.crearCola).not.toHaveBeenCalled();
  });

  it('crea la cola con los datos del formulario', async () => {
    const fixture = TestBed.createComponent(ColasPanelComponent);
    await fixture.whenStable();
    const comp = fixture.componentInstance as unknown as {
      formulario: { patchValue(v: object): void };
      crear(): void;
    };
    comp.formulario.patchValue({ name: 'pedidos.queue', deadLetterExchange: 'dlx', deadLetterRoutingKey: 'pedidos.dlq' });
    comp.crear();
    expect(servicio.crearCola).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'pedidos.queue', deadLetterExchange: 'dlx', deadLetterRoutingKey: 'pedidos.dlq', durable: true })
    );
  });
});
