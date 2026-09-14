import { Libro } from './libro.model';
import { Usuario } from './usuario.model';

export type EstadoPrestamo = 'ACTIVO' | 'DEVUELTO' | 'ATRASADO';

export interface Prestamo {
  id?: number;
  libroId: number;
  usuarioId: number;
  fechaPrestamo: string;            // ISO yyyy-MM-dd
  fechaDevolucionEsperada: string;  // ISO yyyy-MM-dd
  fechaDevolucionReal?: string | null;
  estado: EstadoPrestamo;
  observaciones?: string;
  // Campos opcionales "expandidos"
  libro?: Libro;
  usuario?: Usuario;
}
