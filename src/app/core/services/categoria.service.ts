import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiBaseService } from './api-base.service';
import { Categoria } from '../models/categoria.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CategoriaService extends ApiBaseService<Categoria> {
  protected resource = 'categorias';

  constructor(http: HttpClient) {
    super(http, environment.apiUrl);
  }
}
