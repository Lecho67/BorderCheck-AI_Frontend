import { describe, it, expect } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { usePagination } from "./usePagination";

const rango = (n: number) => Array.from({ length: n }, (_, i) => i + 1);

describe("usePagination", () => {
  it("corta la primera página según el tamaño", () => {
    const { result } = renderHook(() => usePagination(rango(20), 8));

    expect(result.current.page).toBe(1);
    expect(result.current.pageCount).toBe(3);
    expect(result.current.pageItems).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it("setPage avanza y devuelve el bloque correspondiente", () => {
    const { result } = renderHook(() => usePagination(rango(20), 8));

    act(() => result.current.setPage(3));

    expect(result.current.page).toBe(3);
    expect(result.current.pageItems).toEqual([17, 18, 19, 20]);
  });

  it("recorta la página al rango válido cuando la lista se achica", () => {
    const { result, rerender } = renderHook(({ items }) => usePagination(items, 8), {
      initialProps: { items: rango(20) },
    });

    act(() => result.current.setPage(3));
    expect(result.current.page).toBe(3);

    rerender({ items: rango(5) });

    expect(result.current.pageCount).toBe(1);
    expect(result.current.page).toBe(1);
    expect(result.current.pageItems).toEqual([1, 2, 3, 4, 5]);
  });

  it("una lista vacía tiene una sola página", () => {
    const { result } = renderHook(() => usePagination<number>([], 8));

    expect(result.current.pageCount).toBe(1);
    expect(result.current.pageItems).toEqual([]);
  });
});
