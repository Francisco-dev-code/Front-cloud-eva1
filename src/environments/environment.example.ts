export const environment = {
  production: false,

  apiUrl: 'http://localhost:8080/api',

  entra: {
    enabled: true,

    // Application (client) ID de la SPA Angular
    clientId: 'TU_ANGULAR_CLIENT_ID',

    // Directory (tenant) ID de Microsoft Entra ID
    tenantId: 'TU_TENANT_ID',

    // URI registrada en Entra ID
    redirectUri: 'http://localhost:4200',

    // Scope expuesto por la API
    apiScope: 'api://TU_API_CLIENT_ID/recurso.read'
  }
};

/*
  Configuración pendiente de completar por el equipo:

  1. Registrar la API en Microsoft Entra ID.
  2. Crear el scope delegado de lectura.
  3. Registrar esta aplicación como SPA.
  4. Registrar la redirect URI http://localhost:4200.
  5. Reemplazar los placeholders por valores reales.
  6. Confirmar que el backend valida el mismo issuer, audience y scope.
*/