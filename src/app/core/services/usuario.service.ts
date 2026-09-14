import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiBaseService } from './api-base.service';
import { Usuario } from '../models/usuario.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UsuarioService extends ApiBaseService<Usuario> {
  protected resource = 'usuarios';

  constructor(http: HttpClient) {
    super(http, environment.apiUrl);
  }
}
