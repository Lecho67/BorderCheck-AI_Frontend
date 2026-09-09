import { useState } from "react";
import { Calculator, AlertTriangle } from "lucide-react";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const tiposProducto = [
  "Electrónica",
  "Ropa y textiles",
  "Cosméticos y perfumería",
  "Documentos",
  "Otro / general",
];

const paisesOrigen = ["Estados Unidos", "China", "España", "México"];

// Tasas de arancel estimadas por tipo de producto — solo para fines demostrativos.
const arancelPorTipo: Record<string, number> = {
  "Electrónica": 0.15,
  "Ropa y textiles": 0.1,
  "Cosméticos y perfumería": 0.2,
  "Documentos": 0,
  "Otro / general": 0.12,
};

// Tipos de producto con mayor probabilidad de requerir revisión normativa adicional.
const tiposConAdvertencia = new Set(["Cosméticos y perfumería", "Electrónica"]);

interface Estimado {
  flete: number;
  arancel: number;
  total: number;
  conAdvertencia: boolean;
}

export function ShippingCalculator() {
  const [tipoProducto, setTipoProducto] = useState("");
  const [valorUsd, setValorUsd] = useState("");
  const [paisOrigen, setPaisOrigen] = useState("");
  const [estimado, setEstimado] = useState<Estimado | null>(null);

  const puedeCalcular = tipoProducto && paisOrigen && Number(valorUsd) > 0;

  const calcular = () => {
    const valor = Number(valorUsd);
    const tasaArancel = arancelPorTipo[tipoProducto] ?? 0.12;
    const flete = Math.max(8, valor * 0.08); // flete base estimado
    const arancel = valor * tasaArancel;
    const total = flete + arancel;

    setEstimado({
      flete,
      arancel,
      total,
      conAdvertencia: tiposConAdvertencia.has(tipoProducto),
    });
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 max-w-xl mx-auto">
      <div className="flex items-center gap-2 justify-center mb-1">
        <Calculator className="w-4 h-4 text-cobalt" />
        <p className="text-xs font-semibold text-cobalt uppercase tracking-wide">
          Calculadora de envíos e impuestos
        </p>
      </div>
      <h3 className="text-lg font-semibold text-slate-900 text-center mb-1">
        Estima flete y aranceles antes de enviar
      </h3>
      <p className="text-sm text-slate-500 text-center mb-6">
        Una aproximación rápida calculada por IA según el tipo de producto y su valor declarado.
      </p>

      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-slate-500 mb-1 block">Tipo de producto</label>
          <Select
            options={tiposProducto}
            value={tipoProducto}
            onChange={setTipoProducto}
            placeholder="Selecciona el tipo de producto..."
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            label="Valor declarado (USD)"
            type="number"
            value={valorUsd}
            onChange={(e) => setValorUsd(e.target.value)}
            placeholder="100"
          />
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">País de origen</label>
            <Select
              options={paisesOrigen}
              value={paisOrigen}
              onChange={setPaisOrigen}
              placeholder="Selecciona el origen..."
            />
          </div>
        </div>

        <Button disabled={!puedeCalcular} onClick={calcular} className="w-full">
          Calcular estimado
        </Button>
      </div>

      {estimado && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 mt-6">
          <div className="flex justify-between text-sm text-slate-600 mb-2">
            <span>Flete estimado</span>
            <span className="font-mono-data">${estimado.flete.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-600 mb-3">
            <span>Aranceles estimados</span>
            <span className="font-mono-data">${estimado.arancel.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-base font-semibold text-slate-900 pt-3 border-t border-slate-200">
            <span>Total estimado</span>
            <span className="font-mono-data">${estimado.total.toFixed(2)}</span>
          </div>

          {estimado.conAdvertencia && (
            <div className="mt-4 flex items-start gap-2 text-xs text-verdict-amber-text bg-verdict-amber-bg rounded-lg p-3">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Este tipo de producto suele requerir documentación adicional. Verifica el diagnóstico
                completo antes de despachar.
              </span>
            </div>
          )}

          <p className="text-xs text-slate-400 mt-4 text-center">
            Estimación preliminar generada por IA — sujeta a clasificación arancelaria final.
          </p>
        </div>
      )}
    </div>
  );
}