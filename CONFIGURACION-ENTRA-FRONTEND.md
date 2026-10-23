# Configuración de Microsoft Entra ID (frontend)

Estado: **habilitado** (`entra.enabled = true`).

| Dato | Dónde |
|---|---|
| Client ID de la SPA, Tenant ID, scope de la API | `src/environments/environment*.ts` |
| Redirect URI | `http://localhost:4200` (registrada como SPA en Entra ID) |
| Scope | `api://<API_CLIENT_ID>/recurso.read` |

Flujo: Authorization Code + PKCE → Access Token JWT → `Authorization: Bearer` en cada llamada a `{apiUrl}/api/*` → API Gateway → backend.

Para otro dominio de despliegue: registrar su URL como Redirect URI (SPA) y actualizar `redirectUri` en el environment.

## Acceso público + login obligatorio para solicitudes

- Todas las páginas son visibles sin sesión (ya no hay `canActivate` en las rutas).
- Cualquier solicitud a `{apiUrl}/api/*` sin sesión se bloquea en `auth-required.interceptor.ts` y redirige a `/registro?returnUrl=...`.
- `/registro`: «Crear cuenta» (auto-registro) o «Ya tengo cuenta» (login con Entra ID). Al volver del login, el usuario regresa a la página donde estaba.
- `entra.selfSignUp`: `true` solo si el tenant soporta auto-registro (Entra External ID). Si es un tenant de empleados, ponerlo en `false` y crear las cuentas desde Entra.
- El Authenticator (MFA) se exige en Entra ID (Security defaults o Acceso condicional), no en el front.
