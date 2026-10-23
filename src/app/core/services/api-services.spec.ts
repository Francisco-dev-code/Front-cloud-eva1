import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { LibroService } from './libro.service';
import { PrestamoService } from './prestamo.service';
import { AutorService } from './autor.service';
import { environment } from '../../../environments/environment';

describe('Servicios HTTP', () => {
  const base = environment.apiUrl.replace(/\/+$/, '');
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('CRUD base usa {apiUrl}/api/{recurso}', () => {
    TestBed.inject(AutorService).getAll().subscribe();
    http.expectOne(`${base}/api/autores`).flush([]);
  });

  it('buscar libros incluye el prefijo /api', () => {
    TestBed.inject(LibroService).buscar('java').subscribe();
    const req = http.expectOne((r) => r.url === `${base}/api/libros/buscar`);
    expect(req.request.params.get('q')).toBe('java');
    req.flush([]);
  });

  it('devolver préstamo usa PATCH /api/prestamos/{id}/devolver', () => {
    TestBed.inject(PrestamoService).devolver(5).subscribe();
    const req = http.expectOne(`${base}/api/prestamos/5/devolver`);
    expect(req.request.method).toBe('PATCH');
    req.flush({});
  });

  it('préstamos por usuario usa /api/prestamos/usuario/{id}', () => {
    TestBed.inject(PrestamoService).porUsuario(3).subscribe();
    http.expectOne(`${base}/api/prestamos/usuario/3`).flush([]);
  });
});
