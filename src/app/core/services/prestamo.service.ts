import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiBaseService } from './api-base.service';
import { Prestamo } from '../models/prestamo.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PrestamoService extends ApiBaseService<Prestamo> {
  protected resource = 'prestamos';

  constructor(http: HttpClient) {
    super(http, environment.apiUrl);
  }

  /** Registra la devolución de un préstamo (requiere endpoint: PATCH /prestamos/{id}/devolver) */
  devolver(id: number): Observable<Prestamo> {
    return this.http.patch<Prestamo>(`${this.url}/${id}/devolver`, {});
  }

  /** Préstamos activos de un usuario (requiere endpoint: GET /prestamos/usuario/{usuarioId}) */
  porUsuario(usuarioId: number): Observable<Prestamo[]> {
    return this.http.get<Prestamo[]>(`${this.url}/usuario/${usuarioId}`);
  }
}
