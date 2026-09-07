import { useState } from "react";

/**
 * Paginación en cliente para listas ya cargadas en memoria (las colas de
 * agente traen todo de una y filtran/ordenan localmente). `items` debe venir
 * ya filtrado/ordenado — normalmente el resultado de un `useMemo`.
 *
 * La página se recorta al rango válido en cada render: si un filtro achica la
 * lista, te quedás en la última página con contenido en vez de saltar a la
 * primera, y no hace falta resetear el estado a mano al cambiar de filtro.
 */
export function usePagination<T>(items: T[], pageSize = 8) {
  const [page, setPage] = useState(1);

  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const pagina = Math.min(page, pageCount);
  const pageItems = items.slice((pagina - 1) * pageSize, pagina * pageSize);

  return { page: pagina, setPage, pageCount, pageItems };
}
