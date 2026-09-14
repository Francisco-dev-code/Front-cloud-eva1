import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Servicio genérico con las operaciones CRUD estándar contra un recurso REST.
 * Cada servicio de entidad extiende esta clase indicando su "resource" (ruta).
 *
 * Se asume que el backend expone endpoints REST convencionales:
 *   GET    {baseUrl}/{resource}          -> listar todo (o paginado con query params)
 *   GET    {baseUrl}/{resource}/{id}     -> obtener por id
 *   POST   {baseUrl}/{resource}          -> crear
 *   PUT    {baseUrl}/{resource}/{id}     -> actualizar
 *   DELETE {baseUrl}/{resource}/{id}     -> eliminar
 */
export abstract class ApiBaseService<T> {
  protected abstract resource: string;

  constructor(
    protected http: HttpClient,
    protected baseUrl: string
  ) {}

  private get url(): string {
    return `${this.baseUrl}/${this.resource}`;
  }

  getAll(params?: HttpParams | Record<string, string | number>): Observable<T[]> {
    return this.http.get<T[]>(this.url, { params });
  }

  getById(id: number): Observable<T> {
    return this.http.get<T>(`${this.url}/${id}`);
  }

  create(item: T): Observable<T> {
    return this.http.post<T>(this.url, item);
  }

  update(id: number, item: T): Observable<T> {
    return this.http.put<T>(`${this.url}/${id}`, item);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
