import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiBaseService } from './api-base.service';
import { Notificacion } from '../models/mensajeria.model';
import { environment } from '../../../environments/environment';

/** GET /api/notificaciones: resultado de las tareas asíncronas procesadas por los consumidores. */
@Injectable({ providedIn: 'root' })
export class NotificacionService extends ApiBaseService<Notificacion> {
  protected resource = 'notificaciones';

  constructor(http: HttpClient) {
    super(http, environment.apiUrl);
  }
}
