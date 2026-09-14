import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Servicio genérico con las operaciones CRUD estándar contra un recurso REST.
 *
 * Cada servicio de entidad extiende esta clase indicando su recurso.
 *
 * Las URL generadas quedan así:
 *
 * GET    {baseUrl}/api/{resource}
 * GET    {baseUrl}/api/{resource}/{id}
 * POST   {baseUrl}/api/{resource}
 * PUT    {baseUrl}/api/{resource}/{id}
 * DELETE {baseUrl}/api/{resource}/{id}
 */
export abstract class ApiBaseService<T> {
  protected abstract resource: string;

  constructor(
    protected http: HttpClient,
    protected baseUrl: string
  ) {}

  private get url(): string {
    const normalizedBaseUrl = this.baseUrl.replace(/\/+$/, '');

    return `${normalizedBaseUrl}/api/${this.resource}`;
  }

  getAll(
    params?: HttpParams | Record<string, string | number>
  ): Observable<T[]> {
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
