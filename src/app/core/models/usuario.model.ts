export interface Usuario {
  id?: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  direccion?: string;
  fechaRegistro?: string; // ISO yyyy-MM-dd
  activo?: boolean;
}
