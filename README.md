# Biblioteca (Angular + Angular Material)

Sistema de gestión de biblioteca hecho en Angular standalone (v21) con Angular Material.

## Módulos incluidos
- **Inicio**: panel con totales de cada módulo.
- **Libros**: CRUD completo + buscador (título, autor, ISBN).
- **Autores**: CRUD completo.
- **Categorías**: CRUD completo.
- **Usuarios**: CRUD completo.
- **Préstamos**: CRUD + registrar devolución rápida.

## Instalación

```bash
npm install
npm start
```

La app queda disponible en `http://localhost:4200`.

## Conexión con el backend

El frontend consume una API REST vía `HttpClient`. La URL base se configura en:

- `src/environments/environment.development.ts` (desarrollo)
- `src/environments/environment.ts` (producción)

Por defecto apunta a `http://localhost:8080/api`. Cámbiala según donde despliegues tu backend Java.

### Endpoints esperados por el frontend

| Recurso     | Endpoints                                                                 |
|-------------|----------------------------------------------------------------------------|
| Categorías  | `GET/POST /categorias`, `GET/PUT/DELETE /categorias/{id}`                |
| Autores     | `GET/POST /autores`, `GET/PUT/DELETE /autores/{id}`                      |
| Libros      | `GET/POST /libros`, `GET/PUT/DELETE /libros/{id}`, `GET /libros/buscar?q=` |
| Usuarios    | `GET/POST /usuarios`, `GET/PUT/DELETE /usuarios/{id}`                    |
| Préstamos   | `GET/POST /prestamos`, `GET/PUT/DELETE /prestamos/{id}`, `PATCH /prestamos/{id}/devolver`, `GET /prestamos/usuario/{id}` |

Las clases Java sugeridas para implementar este backend se entregan por separado (ver `backend-java-clases.txt`).

## Estructura del proyecto

```
src/app/
  core/
    models/       -> interfaces TypeScript (Libro, Autor, Categoria, Usuario, Prestamo)
    services/      -> servicios HTTP (uno por entidad + clase base genérica)
  shared/
    layout/        -> toolbar + menú lateral
    confirm-dialog/-> diálogo de confirmación reutilizable
  features/
    home/
    libros/        -> listado + diálogo de formulario
    autores/
    categorias/
    usuarios/
    prestamos/
```
