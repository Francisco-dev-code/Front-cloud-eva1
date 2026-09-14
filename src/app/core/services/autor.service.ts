import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiBaseService } from './api-base.service';
import { Autor } from '../models/autor.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AutorService extends ApiBaseService<Autor> {
  protected resource = 'autores';

  constructor(http: HttpClient) {
    super(http, environment.apiUrl);
  }
}
