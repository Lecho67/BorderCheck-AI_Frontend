import { describe, it, expect } from "vitest";
import { badgeVerdictoClasses, dotVerdictoClasses } from "./verdictBadge";

describe("verdictBadge", () => {
  it("mapea cada veredicto conocido a su paleta", () => {
    expect(badgeVerdictoClasses("APROBADO")).toContain("emerald");
    expect(badgeVerdictoClasses("BLOQUEO")).toContain("red");
    expect(badgeVerdictoClasses("PRECAUCION")).toContain("amber");
    expect(badgeVerdictoClasses("REQUIERE_DOCUMENTACION")).toContain("orange");
  });

  it("usa slate como fallback para valores desconocidos", () => {
    expect(badgeVerdictoClasses("CUALQUIER_COSA")).toContain("slate");
    expect(dotVerdictoClasses("")).toContain("slate");
  });
});
