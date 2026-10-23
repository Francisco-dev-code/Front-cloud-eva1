import { msalInterceptorConfigFactory } from './auth.config';
import { environment } from '../../../environments/environment';

describe('Configuración MSAL', () => {
  it('protege todas las rutas {apiUrl}/api/* con el scope de la API', () => {
    const map = msalInterceptorConfigFactory().protectedResourceMap;
    const key = `${environment.apiUrl.replace(/\/+$/, '')}/api/*`;
    expect(map.get(key)).toEqual([environment.entra.apiScope]);
  });
});
