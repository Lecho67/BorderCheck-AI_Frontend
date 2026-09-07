import { describe, it, expect } from "vitest";
import { getCountryInfo } from "./countryCodes";

describe("getCountryInfo", () => {
  it("resuelve una etiqueta conocida a sus códigos ISO", () => {
    expect(getCountryInfo("Colombia")).toMatchObject({ alpha2: "CO", alpha3: "COL" });
  });

  it("lanza un error explícito para una etiqueta sin configurar", () => {
    expect(() => getCountryInfo("Japón")).toThrow(/no tiene un código ISO configurado/i);
  });
});
