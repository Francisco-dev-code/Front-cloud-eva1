/** Extrae un mensaje legible de un error HTTP del backend (ErrorResponse) o devuelve uno por defecto. */
export function mensajeError(error: unknown, porDefecto: string): string {
  const e = error as { error?: { message?: string; mensaje?: string } | null } | null;
  return e?.error?.message ?? e?.error?.mensaje ?? porDefecto;
}
