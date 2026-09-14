import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiBaseService } from './api-base.service';
import { Libro } from '../models/libro.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class LibroService extends ApiBaseService<Libro> {
  protected resource = 'libros';

  constructor(http: HttpClient) {
    super(http, environment.apiUrl);
  }

  /** Busca libros por título, autor o ISBN (requiere soporte en el backend: GET /libros/buscar?q=) */
  buscar(q: string): Observable<Libro[]> {
    return this.http.get<Libro[]>(`${environment.apiUrl}/${this.resource}/buscar`, {
      params: { q }
    });
  }
}
