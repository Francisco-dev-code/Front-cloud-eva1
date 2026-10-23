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
  autorNombre?: string;      // lo entrega el backend (LibroDTO)
  categoriaNombre?: string;  // lo entrega el backend (LibroDTO)
  autor?: Autor;
  categoria?: Categoria;
}
