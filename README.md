# Pedidos360 / Biblioteca — Frontend (Angular 21 + Angular Material)

Frontend standalone de Angular con login mediante **Microsoft Entra ID (MSAL)**. Consume el backend Spring Boot a través de **AWS API Gateway** enviando el JWT en cada llamada.

## Módulos
Inicio · Libros (CRUD + búsqueda) · Autores · Categorías · Usuarios · Préstamos (CRUD + devolución) · **Notificaciones** · **Mensajería (RabbitMQ)**. Todas las vistas requieren sesión iniciada.

### Mensajería con RabbitMQ (EFT)
- **Mensajería**: administración del microservicio de RabbitMQ — crear/eliminar **colas** (con DLX/routing key de **DLQ** y TTL), **exchanges** y **bindings**, y **publicar mensajes de prueba** (productor).
- **Notificaciones**: tareas asíncronas procesadas por los consumidores (notificaciones, tickets, documentos) con estado `PENDIENTE/PROCESADO/FALLIDO`; actualización manual o automática cada 5 s.
- Contrato de endpoints y flujo de demostración: [`docs/CONTRATO-API-RABBITMQ.md`](docs/CONTRATO-API-RABBITMQ.md).

## Ejecutar
```bash
npm ci
npm start              # usa el API Gateway (environment.ts)
npm run start:local    # usa el backend local http://localhost:8080
npm test               # pruebas unitarias (Vitest)
npm run build:prod     # build de producción en dist/
```
App en `http://localhost:4200` (esta URL debe estar registrada como *Redirect URI* de tipo SPA en Entra ID).

## Arquitectura de autenticación
```
Angular (MSAL, Authorization Code + PKCE)
   │  login redirect ─────────► Microsoft Entra ID
   │◄──────── Access Token JWT ─┘
   │  Authorization: Bearer <JWT>   (MsalInterceptor)
   ▼
AWS API Gateway ──► Backend Spring Boot (EC2) ── valida firma, issuer y audience
```
- `core/auth/auth.config.ts`: instancia MSAL, guard e interceptor. El interceptor adjunta el token a **toda** URL `{apiUrl}/api/*`.
- `core/auth/auth.guard.ts`: protege todas las rutas (login automático por redirect).
- `core/interceptors/api-error.interceptor.ts`: manejo de 401/403/404/500.

## Configuración (`src/environments/`)
| Archivo | Uso |
|---|---|
| `environment.ts` | Por defecto (dev y prod): API Gateway |
| `environment.localhost.ts` | `npm run start:local`: backend en localhost:8080 |
| `environment.example.ts` | Plantilla |

`apiUrl` es la URL **base sin `/api`**; los servicios construyen `{apiUrl}/api/{recurso}`. Los IDs de tenant/cliente no son secretos; nunca agregues client secrets al repositorio.

## Endpoints consumidos
| Recurso | Endpoints |
|---|---|
| Categorías | `GET/POST /api/categorias`, `GET/PUT/DELETE /api/categorias/{id}` |
| Autores | `GET/POST /api/autores`, `GET/PUT/DELETE /api/autores/{id}` |
| Libros | `GET/POST /api/libros`, `GET/PUT/DELETE /api/libros/{id}`, `GET /api/libros/buscar?q=` |
| Usuarios | `GET/POST /api/usuarios`, `GET/PUT/DELETE /api/usuarios/{id}` |
| Mensajería | `/api/rabbit/queues\|exchanges\|bindings` (GET/POST/DELETE), `POST /api/rabbit/publish` |
| Notificaciones | `GET /api/notificaciones` |
| Préstamos | `GET/POST /api/prestamos`, `GET/PUT/DELETE /api/prestamos/{id}`, `PATCH /api/prestamos/{id}/devolver`, `GET /api/prestamos/usuario/{id}` |

## Requisitos del backend / Gateway
- CORS permitiendo el origen del frontend (`http://localhost:4200` y el dominio desplegado) y el header `Authorization`.
- El token debe coincidir con la validación del backend (issuer y audience; revisar `requestedAccessTokenVersion` en el manifiesto de la API en Entra ID).

## Estructura
```
src/app/
  core/ auth/ · interceptors/ · models/ · services/
  shared/ layout/ · confirm-dialog/
  features/ home · libros · autores · categorias · usuarios · prestamos · mensajeria · notificaciones
```
