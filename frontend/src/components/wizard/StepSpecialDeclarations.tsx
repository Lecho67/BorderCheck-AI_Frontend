import { Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { Chip } from "@/components/ui/Chip";
import type { DeclaracionesEspeciales, OtraMercanciaPeligrosa } from "@/lib/types";

interface StepSpecialDeclarationsProps {
  value: DeclaracionesEspeciales;
  onChange: (value: DeclaracionesEspeciales) => void;
  onSubmit: () => void;
  onBack: () => void;
}

const OPCIONES_BATERIA = ["lithium_ion", "lithium_metal", "installed_in_equipment", "packed_with_equipment"];
const OPCIONES_LIQUIDO = ["cosmetic", "alcoholic_beverage", "perfume", "cleaning_product", "medicinal", "food_liquid", "other"];
const OPCIONES_ORGANICO = ["fresh_food", "processed_food", "untreated_wood", "treated_wood", "live_plant", "seeds", "animal_origin_product", "vegetal_origin_product", "other"];
const OPCIONES_MEDICO = ["otc_medication", "prescription_medication", "cosmetic", "medical_device", "controlled_substance", "supplement"];

const OTRAS_MERCANCIAS: { valor: OtraMercanciaPeligrosa; etiqueta: string }[] = [
  { valor: "compressed_gas", etiqueta: "Gas comprimido" },
  { valor: "corrosive", etiqueta: "Corrosivo" },
  { valor: "magnetic_material", etiqueta: "Material magnético" },
  { valor: "flammable_solid", etiqueta: "Sólido inflamable" },
  { valor: "oxidizer", etiqueta: "Oxidante" },
  { valor: "radioactive", etiqueta: "Radioactivo" },
  { valor: "explosive", etiqueta: "Explosivo" },
];

export function StepSpecialDeclarations({ value, onChange, onSubmit, onBack }: StepSpecialDeclarationsProps) {
  const set = (patch: Partial<DeclaracionesEspeciales>) => onChange({ ...value, ...patch });

  return (
    <div>
      <p className="text-xs font-semibold text-brand-blue uppercase tracking-wide mb-2">Paso 4 de 4 · Opcional</p>
      <h2 className="text-2xl font-semibold text-slate-900 mb-2">¿Tu envío tiene alguna condición especial?</h2>
      <p className="text-sm text-slate-500 mb-6">
        Marca solo lo que aplique. Esta información determina si se requieren certificados o si hay restricciones de transporte aéreo.
      </p>

      <div className="space-y-5">
        <div className="rounded-xl border border-slate-200 p-4">
          <Checkbox
            label="Contiene baterías de litio (celulares, laptops, power banks...)"
            checked={value.contieneBateriaLitio}
            onChange={() => set({ contieneBateriaLitio: !value.contieneBateriaLitio })}
          />
          {value.contieneBateriaLitio && (
            <div className="grid sm:grid-cols-2 gap-3 mt-4">
              <Select
                options={OPCIONES_BATERIA}
                value={value.bateria?.tipo ?? ""}
                onChange={(tipo) => set({ bateria: { ...value.bateria, tipo: tipo as any } })}
                placeholder="Tipo de batería"
              />
              <Input
                label="Capacidad (Watt-hora)"
                type="number"
                value={value.bateria?.wattHora ?? ""}
                onChange={(e) => set({ bateria: { ...value.bateria!, wattHora: e.target.value ? Number(e.target.value) : undefined } })}
                placeholder="Ej: 50"
              />
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 p-4">
          <Checkbox
            label="Contiene líquidos, geles o aerosoles (perfumes, cosméticos, bebidas...)"
            checked={value.contieneLiquidos}
            onChange={() => set({ contieneLiquidos: !value.contieneLiquidos })}
          />
          {value.contieneLiquidos && (
            <div className="grid sm:grid-cols-2 gap-3 mt-4">
              <Select
                options={OPCIONES_LIQUIDO}
                value={value.liquido?.categoria ?? ""}
                onChange={(categoria) => set({ liquido: { ...value.liquido, categoria: categoria as any } })}
                placeholder="Categoría del líquido"
              />
              <Input
                label="Volumen total (ml)"
                type="number"
                value={value.liquido?.volumenTotalMl ?? ""}
                onChange={(e) => set({ liquido: { ...value.liquido!, volumenTotalMl: e.target.value ? Number(e.target.value) : undefined } })}
                placeholder="Ej: 100"
              />
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 p-4">
          <p className="text-sm font-medium text-slate-700 mb-3">
            ¿Contiene otras mercancías peligrosas? (opcional)
          </p>
          <div className="flex flex-wrap gap-2">
            {OTRAS_MERCANCIAS.map(({ valor, etiqueta }) => {
              const activo = value.otrasMercanciasPeligrosas.includes(valor);
              return (
                <Chip
                  key={valor}
                  label={etiqueta}
                  active={activo}
                  onClick={() =>
                    set({
                      otrasMercanciasPeligrosas: activo
                        ? value.otrasMercanciasPeligrosas.filter((v) => v !== valor)
                        : [...value.otrasMercanciasPeligrosas, valor],
                    })
                  }
                />
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 p-4">
          <Checkbox
            label="Es un producto orgánico o de origen biológico (alimentos, plantas, semillas, madera...)"
            checked={value.esOrganicoOBiologico}
            onChange={() => set({ esOrganicoOBiologico: !value.esOrganicoOBiologico })}
          />
          {value.esOrganicoOBiologico && (
            <div className="mt-4">
              <Select
                options={OPCIONES_ORGANICO}
                value={value.organico?.tipo ?? ""}
                onChange={(tipo) => set({ organico: { ...value.organico, tipo: tipo as any } })}
                placeholder="Tipo de producto"
              />
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 p-4">
          <Checkbox
            label="Es un medicamento o producto médicamente regulado"
            checked={value.esMedicamentoRegulado}
            onChange={() => set({ esMedicamentoRegulado: !value.esMedicamentoRegulado })}
          />
          {value.esMedicamentoRegulado && (
            <div className="mt-4">
              <Select
                options={OPCIONES_MEDICO}
                value={value.medico?.tipo ?? ""}
                onChange={(tipo) => set({ medico: { ...value.medico, tipo: tipo as any } })}
                placeholder="Tipo de regulación médica"
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <Button variant="secondary" onClick={onBack}>← Atrás</Button>
        <Button onClick={onSubmit} className="flex-1 sm:flex-none flex items-center justify-center gap-2">
          <Search className="w-4 h-4" /> Verificar envío
        </Button>
      </div>
    </div>
  );
}
