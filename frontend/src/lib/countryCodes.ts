/**
 * Mapea las opciones de país mostradas en el wizard (con emoji, en
 * `mockData.paisesDisponibles`) a los códigos que el backend de evaluación
 * de envíos (motor de reglas) espera: ISO 3166-1 alpha-2/alpha-3.
 *
 * Si agregas un país nuevo a `paisesDisponibles`, agrégalo también aquí o
 * `buildShipmentEvaluationRequest` lanzará un error explícito en vez de
 * enviar un código inválido al backend.
 */
export interface CountryInfo {
  alpha2: string;
  alpha3: string;
  /** Moneda local, usada solo como referencia informativa en la UI. */
  currency: string;
}

export const COUNTRY_INFO_BY_LABEL: Record<string, CountryInfo> = {
  "🇺🇸 Estados Unidos": { alpha2: "US", alpha3: "USA", currency: "USD" },
  "🇲🇽 México": { alpha2: "MX", alpha3: "MEX", currency: "MXN" },
  "🇨🇴 Colombia": { alpha2: "CO", alpha3: "COL", currency: "COP" },
  "🇪🇸 España": { alpha2: "ES", alpha3: "ESP", currency: "EUR" },
  "🇦🇷 Argentina": { alpha2: "AR", alpha3: "ARG", currency: "ARS" },
  "🇨🇱 Chile": { alpha2: "CL", alpha3: "CHL", currency: "CLP" },
  "🇧🇷 Brasil": { alpha2: "BR", alpha3: "BRA", currency: "BRL" },
  "🇵🇪 Perú": { alpha2: "PE", alpha3: "PER", currency: "PEN" },
};

export function getCountryInfo(label: string): CountryInfo {
  const info = COUNTRY_INFO_BY_LABEL[label];
  if (!info) {
    throw new Error(
      `País de destino "${label}" no tiene un código ISO configurado en countryCodes.ts.`
    );
  }
  return info;
}
