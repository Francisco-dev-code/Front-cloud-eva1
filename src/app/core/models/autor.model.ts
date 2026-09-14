export interface Autor {
  id?: number;
  nombre: string;
  apellido: string;
  nacionalidad?: string;
  fechaNacimiento?: string; // ISO yyyy-MM-dd
  biografia?: string;
}
