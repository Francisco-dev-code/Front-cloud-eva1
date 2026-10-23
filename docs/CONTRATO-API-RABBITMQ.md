# Contrato API: microservicio administrador de RabbitMQ y notificaciones

Todas las rutas se consumen vía API Gateway: `{apiUrl}/api/...` con `Authorization: Bearer <JWT de Entra ID>`.
Errores: cuerpo JSON `{ "message": "..." }` (el frontend lo muestra al usuario).

## Administrador (`/api/rabbit`)

| Método | Ruta | Cuerpo / parámetros | Respuesta |
|---|---|---|---|
| GET | `/api/rabbit/queues` | — | `[{ name, durable, deadLetterExchange?, deadLetterRoutingKey?, messageTtl?, messages?, consumers? }]` |
| POST | `/api/rabbit/queues` | `{ name, durable, deadLetterExchange?, deadLetterRoutingKey?, messageTtl? }` | 201 + cola |
| DELETE | `/api/rabbit/queues/{name}` | — | 204 |
| GET | `/api/rabbit/exchanges` | — | `[{ name, type, durable, autoDelete? }]` (`type`: direct, topic, fanout, headers) |
| POST | `/api/rabbit/exchanges` | `{ name, type, durable, autoDelete }` | 201 + exchange |
| DELETE | `/api/rabbit/exchanges/{name}` | — | 204 |
| GET | `/api/rabbit/bindings` | — | `[{ exchange, queue, routingKey }]` |
| POST | `/api/rabbit/bindings` | `{ exchange, queue, routingKey }` | 201 + binding |
| DELETE | `/api/rabbit/bindings?exchange=&queue=&routingKey=` | query params | 204 |
| POST | `/api/rabbit/publish` | `{ exchange, routingKey, payload }` (payload = texto/JSON) | 202 |

## Notificaciones (`/api/notificaciones`)

`GET /api/notificaciones` → `[{ id, tipo, destinatario?, mensaje, estado, cola?, fecha }]`

- `tipo`: `NOTIFICACION` | `TICKET` | `DOCUMENTO`
- `estado`: `PENDIENTE` | `PROCESADO` | `FALLIDO`
- `fecha`: ISO date-time

## Flujo de demostración sugerido

1. **Colas**: crear `dlq.queue` y `notificaciones.queue` (esta con DLX `dlx.exchange` y routing key `dlq`).
2. **Exchanges**: crear `dlx.exchange` (direct) y `pedidos.exchange` (direct o topic).
3. **Bindings**: `dlx.exchange → dlq.queue (dlq)` y `pedidos.exchange → notificaciones.queue (pedido.creado)`.
4. **Publicar mensaje**: `pedidos.exchange` + `pedido.creado` → aparece en **Notificaciones** como `PROCESADO`.
5. Publicar un mensaje inválido (el consumidor lo rechaza) → llega a `dlq.queue` y el backend lo registra en logs.
6. Eliminar bindings, colas y exchanges desde la UI para demostrar la gestión completa.

> CORS en backend/API Gateway: permitir el origen del frontend, los métodos GET/POST/DELETE y el header `Authorization`.
