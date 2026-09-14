\# Configuración futura de Microsoft Entra ID

\## Estado actual

El frontend Angular tiene MSAL instalado y preparado, pero la conexión real con Microsoft Entra ID permanece deshabilitada porque todavía no se cuenta con permisos ni credenciales de configuración del tenant.

Configuración actual:

```ts

entra.enabled = false

```


\## Arquitectura


```text

Usuario

&#x20; ↓

Frontend Angular

&#x20; ↓ Authorization Code + PKCE

Microsoft Entra ID

&#x20; ↓ Access Token JWT

API Gateway o Backend

&#x20; ↓

Base de datos

```
\## Datos requeridos

Solicitar al administrador o docente:

```text

ANGULAR\_CLIENT\_ID=

TENANT\_ID=

API\_CLIENT\_ID=

API\_SCOPE=

API\_BASE\_URL=

REDIRECT\_URI=http://localhost:4200

```
\## Aplicación frontend

Registrar una aplicación como:

```text

biblioteca-angular

```

Tipo de plataforma:



```text

Single-page application (SPA)

```



URI de redirección:



```text

http://localhost:4200

```



No crear client secret para la SPA.



\## API



La API debe exponer un scope delegado, por ejemplo:



```text

api://<API\_CLIENT\_ID>/recurso.read

```



Para operaciones de escritura se puede utilizar:



```text

api://<API\_CLIENT\_ID>/recurso.write

```



\## Configuración del frontend



Actualizar los archivos de ambiente:



```ts

export const environment = {

&#x20; production: false,

&#x20; apiUrl: 'http://localhost:8080/api',

&#x20; entra: {

&#x20;   enabled: true,

&#x20;   clientId: '<ANGULAR\_CLIENT\_ID>',

&#x20;   tenantId: '<TENANT\_ID>',

&#x20;   redirectUri: 'http://localhost:4200',

&#x20;   apiScope: 'api://<API\_CLIENT\_ID>/recurso.read'

&#x20; }

};

```



\## Validaciones posteriores



1\. Iniciar el backend.

2\. Ejecutar el frontend con `npm start`.

3\. Presionar Iniciar sesión.

4\. Completar el login en Microsoft Entra ID.

5\. Confirmar el retorno a `http://localhost:4200`.

6\. Verificar que la cuenta aparezca en el layout.

7\. Consultar una ruta protegida.

8\. Confirmar que la petición incluya `Authorization: Bearer`.

9\. Validar respuestas 200, 401 y 403.

10\. Registrar la evidencia E2E.



\## Nunca versionar



No guardar:



```text

Access Tokens

Refresh Tokens

Client Secrets

Contraseñas

Credenciales administrativas

```



\## Dependencias



La validación final depende de:



\- acceso al tenant Microsoft Entra ID;

\- registro de la aplicación Angular;

\- registro de la API;

\- scopes de la API;

\- configuración del backend;

\- configuración CORS;

\- API Gateway, si corresponde.

