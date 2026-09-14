import { Autor } from './autor.model';
import { Categoria } from './categoria.model';

export interface Libro {
  id?: number;
  titulo: string;
  isbn: string;
  editorial?: string;
  anioPublicacion?: number;
  cantidadTotal: number;
  cantidadDisponible: number;
  autorId: number;
  categoriaId: number;
  // Campos opcionales que la API puede devolver ya "expandidos"
  autor?: Autor;
  categoria?: Categoria;
}
