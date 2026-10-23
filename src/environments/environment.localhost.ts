// Usado con `npm run start:local`: mismo login con Entra ID, pero la API
// se consume directamente desde el backend Spring Boot local (sin API Gateway).
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080',
  entra: {
    enabled: true,
    // true si el tenant permite auto-registro (Entra External ID). Si es false, «Crear cuenta» usa el login normal.
    selfSignUp: true,
    clientId: '22394faa-e1a7-4f07-a4df-fda6bf538d33',
    tenantId: 'a94e2d64-6e37-4765-8ceb-bfe6bc09932b',
    redirectUri: 'http://localhost:4200',
    apiScope: 'api://a328191c-fd63-40fc-8994-b9260a828929/recurso.read'
  }
};
