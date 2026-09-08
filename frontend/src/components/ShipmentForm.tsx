// src/components/ShipmentForm.tsx
//
// Formulario de una sola página para /consulta/nueva: un solo formulario con
// secciones en tarjetas (antes era un wizard multi-paso).
//
// IMPORTANTE — por qué está tipado así:
// Este componente produce exactamente un `WizardFormData` (src/lib/types.ts),
// el mismo objeto que ya consume `evaluarEnvio()` en src/lib/api.ts, que a su
// vez lo transforma al contrato real del backend en
// `buildShipmentEvaluationRequest()` (src/lib/shipmentMapping.ts).
//
// Esto es intencional: NO reconstruyo el payload del backend aquí. Si algún
// día el motor de reglas cambia su contrato, el único archivo que hay que
// tocar sigue siendo shipmentMapping.ts — este formulario no se entera.
//
// origin_country / transport_type / shipment_modality dejaron de estar fijos
// por el modelo de casillero: ahora son campos editables del formulario (ver
// sección "Logística" más abajo), y se validan/mapean 1:1 en
// shipmentMapping.ts (ya no hay constantes hardcodeadas ahí).

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { paisesDisponibles, chipsSugeridos } from "@/lib/mockData";
import {
  declaracionesEspecialesVacias,
  type WizardFormData,
  type TipoBateriaLitio,
  type CategoriaLiquido,
  type OtraMercanciaPeligrosa,
  type TipoProductoOrganico,
  type TipoRegulacionMedica,
  type TransportType,
  type ShipmentModality,
} from "@/lib/types";

/* ============================================================================
 * Catálogos label <-> código.
 * El código (value) es exactamente lo que shipmentMapping.ts reenvía al
 * motor de reglas sin transformar — por eso NUNCA se guarda el label en el
 * estado del formulario, solo se usa para mostrarlo en el Select.
 * ==========================================================================*/

const BATTERY_TYPE_OPTIONS: { value: TipoBateriaLitio; label: string }[] = [
  { value: "lithium_ion", label: "Litio-ion" },
  { value: "lithium_metal", label: "Litio-metal" },
  { value: "installed_in_equipment", label: "Instalada dentro del equipo" },
  { value: "packed_with_equipment", label: "Empacada junto al equipo" },
];

const LIQUID_CATEGORY_OPTIONS: { value: CategoriaLiquido; label: string }[] = [
  { value: "cosmetic", label: "Cosmético" },
  { value: "alcoholic_beverage", label: "Bebida alcohólica" },
  { value: "perfume", label: "Perfume" },
  { value: "cleaning_product", label: "Producto de limpieza" },
  { value: "medicinal", label: "Medicinal" },
  { value: "food_liquid", label: "Líquido alimenticio" },
  { value: "other", label: "Otro" },
];

const OTHER_DANGEROUS_GOODS_OPTIONS: { value: OtraMercanciaPeligrosa; label: string }[] = [
  { value: "compressed_gas", label: "Gas comprimido" },
  { value: "corrosive", label: "Corrosivo" },
  { value: "magnetic_material", label: "Material magnético" },
  { value: "flammable_solid", label: "Sólido inflamable" },
  { value: "oxidizer", label: "Oxidante" },
  { value: "radioactive", label: "Radiactivo" },
  { value: "explosive", label: "Explosivo" },
  { value: "other", label: "Otro" },
];

const ORGANIC_TYPE_OPTIONS: { value: TipoProductoOrganico; label: string }[] = [
  { value: "fresh_food", label: "Alimento fresco" },
  { value: "processed_food", label: "Alimento procesado" },
  { value: "untreated_wood", label: "Madera sin tratar" },
  { value: "treated_wood", label: "Madera tratada" },
  { value: "live_plant", label: "Planta viva" },
  { value: "seeds", label: "Semillas" },
  { value: "animal_origin_product", label: "Producto de origen animal" },
  { value: "vegetal_origin_product", label: "Producto de origen vegetal" },
  { value: "other", label: "Otro" },
];

const TRANSPORT_TYPE_OPTIONS: { value: TransportType; label: string }[] = [
  { value: "air", label: "Aéreo" },
  { value: "sea", label: "Marítimo" },
  { value: "land", label: "Terrestre" },
  { value: "postal_courier", label: "Mensajería" },
];

const SHIPMENT_MODALITY_OPTIONS: { value: ShipmentModality; label: string }[] = [
  { value: "commercial_shipment", label: "Envío comercial" },
  { value: "personal_shipment_gift", label: "Envío personal / regalo" },
  { value: "checked_baggage", label: "Equipaje facturado" },
  { value: "carry_on_baggage", label: "Equipaje de mano" },
];

const MEDICAL_TYPE_OPTIONS: { value: TipoRegulacionMedica; label: string }[] = [
  { value: "otc_medication", label: "Medicamento de venta libre" },
  { value: "prescription_medication", label: "Medicamento con receta" },
  { value: "cosmetic", label: "Cosmético regulado" },
  { value: "medical_device", label: "Dispositivo médico" },
  { value: "controlled_substance", label: "Sustancia controlada" },
  { value: "supplement", label: "Suplemento" },
];

/** Envuelve el <Select> genérico del design system (options: string[]) para
 * que trabaje con pares {value, label} sin cambiar ui/Select.tsx. */
function EnumSelect<T extends string>({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: T | undefined;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
  placeholder?: string;
}) {
  const currentLabel = options.find((o) => o.value === value)?.label ?? "";
  return (
    <Select
      options={options.map((o) => o.label)}
      value={currentLabel}
      onChange={(label) => {
        const found = options.find((o) => o.label === label);
        if (found) onChange(found.value);
      }}
      placeholder={placeholder}
    />
  );
}

/* ============================================================================
 * Estado inicial
 * ==========================================================================*/

function emptyFormData(): WizardFormData {
  return {
    paisOrigen: "",
    transportType: "",
    shipmentModality: "",
    paisDestino: "",
    categoria: "",
    descripcionItem: "",
    pesoKg: undefined,
    valorDeclaradoUsd: undefined,
    cantidadUnidades: 1,
    partidaArancelariaTentativa: "",
    declaracionesEspeciales: declaracionesEspecialesVacias(),
  };
}

type FormErrors = Partial<
  Record<
    | "paisOrigen"
    | "transportType"
    | "shipmentModality"
    | "paisDestino"
    | "descripcionItem"
    | "pesoKg"
    | "valorDeclaradoUsd",
    string
  >
>;

function validate(data: WizardFormData): FormErrors {
  const errors: FormErrors = {};
  if (!data.paisOrigen) errors.paisOrigen = "Selecciona un país de origen.";
  if (!data.transportType) errors.transportType = "Selecciona un tipo de transporte.";
  if (!data.shipmentModality) errors.shipmentModality = "Selecciona una modalidad de envío.";
  if (!data.paisDestino) errors.paisDestino = "Selecciona un país de destino.";
  if (!data.descripcionItem.trim()) errors.descripcionItem = "Describe el producto.";
  if (data.pesoKg == null || data.pesoKg <= 0) errors.pesoKg = "El peso debe ser mayor a 0.";
  if (data.valorDeclaradoUsd == null || data.valorDeclaradoUsd < 0)
    errors.valorDeclaradoUsd = "El valor declarado (USD) es obligatorio.";
  return errors;
}

/* ============================================================================
 * UI helpers
 * ==========================================================================*/

const SectionCard: React.FC<{ title: string; description?: string; children: React.ReactNode }> = ({
  title,
  description,
  children,
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 mb-6">
    <h3 className="text-base font-semibold text-slate-800">{title}</h3>
    {description && <p className="text-sm text-slate-500 mt-0.5 mb-4">{description}</p>}
    <div className="space-y-4 mt-4">{children}</div>
  </div>
);

const ToggleRow: React.FC<{
  label: string;
  checked: boolean;
  onChange: () => void;
  children?: React.ReactNode;
}> = ({ label, checked, onChange, children }) => (
  <div className="rounded-xl border border-slate-200 p-4">
    <Checkbox label={label} checked={checked} onChange={onChange} />
    {checked && children && (
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 pl-6 border-l-2 border-brand-blue/20">
        {children}
      </div>
    )}
  </div>
);

/* ============================================================================
 * Componente principal
 * ==========================================================================*/

interface ShipmentFormProps {
  onSubmit: (data: WizardFormData) => void | Promise<void>;
  isSubmitting: boolean;
}

export function ShipmentForm({ onSubmit, isSubmitting }: ShipmentFormProps) {
  const [form, setForm] = useState<WizardFormData>(emptyFormData());
  const [errors, setErrors] = useState<FormErrors>({});

  const decl = form.declaracionesEspeciales ?? declaracionesEspecialesVacias();

  function update(patch: Partial<WizardFormData>) {
    setForm((prev) => ({ ...prev, ...patch }));
  }

  function updateDecl(patch: Partial<typeof decl>) {
    update({ declaracionesEspeciales: { ...decl, ...patch } });
  }

  function toggleOtraMercancia(code: OtraMercanciaPeligrosa) {
    const actuales = decl.otrasMercanciasPeligrosas;
    const yaEsta = actuales.includes(code);
    updateDecl({
      otrasMercanciasPeligrosas: yaEsta
        ? actuales.filter((c) => c !== code)
        : [...actuales, code],
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validation = validate(form);
    setErrors(validation);
    if (Object.keys(validation).length === 0) {
      onSubmit(form);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* ==================== Logística ==================== */}
      <SectionCard title="Logística" description="Origen, transporte y modalidad del envío">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">
              País de origen <span className="text-red-500">*</span>
            </label>
            <Select
              options={paisesDisponibles}
              value={form.paisOrigen}
              onChange={(paisOrigen) => update({ paisOrigen })}
              placeholder="Selecciona un país"
            />
            {errors.paisOrigen && <p className="text-xs text-red-600 mt-1">{errors.paisOrigen}</p>}
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">
              Tipo de transporte <span className="text-red-500">*</span>
            </label>
            <EnumSelect
              value={form.transportType || undefined}
              onChange={(transportType) => update({ transportType })}
              options={TRANSPORT_TYPE_OPTIONS}
              placeholder="Selecciona una opción"
            />
            {errors.transportType && <p className="text-xs text-red-600 mt-1">{errors.transportType}</p>}
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-slate-500 mb-1 block">
              Modalidad de envío <span className="text-red-500">*</span>
            </label>
            <EnumSelect
              value={form.shipmentModality || undefined}
              onChange={(shipmentModality) => update({ shipmentModality })}
              options={SHIPMENT_MODALITY_OPTIONS}
              placeholder="Selecciona una opción"
            />
            {errors.shipmentModality && (
              <p className="text-xs text-red-600 mt-1">{errors.shipmentModality}</p>
            )}
          </div>
        </div>
      </SectionCard>

      {/* ==================== Destino y producto ==================== */}
      <SectionCard title="Destino y producto" description="¿A dónde va el envío y qué contiene?">
        <div>
          <label className="text-xs font-medium text-slate-500 mb-1 block">
            País de destino <span className="text-red-500">*</span>
          </label>
          <Select
            options={paisesDisponibles}
            value={form.paisDestino}
            onChange={(paisDestino) => update({ paisDestino })}
            placeholder="Selecciona un país"
          />
          {errors.paisDestino && <p className="text-xs text-red-600 mt-1">{errors.paisDestino}</p>}
        </div>

        <div>
          <label className="text-xs font-medium text-slate-500 mb-1 block">Categoría</label>
          <Input
            value={form.categoria ?? ""}
            onChange={(e) => update({ categoria: e.target.value })}
            placeholder="Ej. Electrónica"
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {chipsSugeridos.map((chip) => (
              <button
                type="button"
                key={chip}
                onClick={() => update({ categoria: chip })}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                  form.categoria === chip
                    ? "bg-brand-blue text-white border-brand-blue"
                    : "border-slate-300 text-slate-600 hover:border-brand-blue"
                }`}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-500 mb-1 block">
            Descripción del producto <span className="text-red-500">*</span>
          </label>
          <Textarea
            rows={3}
            maxLength={1000}
            value={form.descripcionItem}
            onChange={(e) => update({ descripcionItem: e.target.value })}
            placeholder="Ej. Audífonos inalámbricos con estuche de carga"
            error={errors.descripcionItem}
          />
        </div>
      </SectionCard>

      {/* ==================== Detalles del envío ==================== */}
      <SectionCard title="Detalles del envío" description="Peso, valor y cantidad declarados">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Peso (kg) *"
            type="number"
            step="0.01"
            min={0.01}
            value={form.pesoKg ?? ""}
            onChange={(e) => update({ pesoKg: e.target.value === "" ? undefined : Number(e.target.value) })}
            error={errors.pesoKg}
          />
          <Input
            label="Valor declarado (USD) *"
            type="number"
            step="0.01"
            min={0}
            value={form.valorDeclaradoUsd ?? ""}
            onChange={(e) =>
              update({ valorDeclaradoUsd: e.target.value === "" ? undefined : Number(e.target.value) })
            }
            error={errors.valorDeclaradoUsd}
          />
          <Input
            label="Cantidad de unidades"
            type="number"
            min={1}
            value={form.cantidadUnidades ?? 1}
            onChange={(e) => update({ cantidadUnidades: Number(e.target.value) || 1 })}
          />
          <Input
            label="Partida arancelaria (HS Code) — opcional"
            value={form.partidaArancelariaTentativa ?? ""}
            onChange={(e) => update({ partidaArancelariaTentativa: e.target.value })}
            placeholder="Ej. 8517.62"
          />
        </div>
        <p className="text-xs text-slate-400">
          Si dejas la partida arancelaria en blanco, la IA la inferirá a partir de la categoría y la
          descripción.
        </p>
      </SectionCard>

      {/* ==================== Declaraciones especiales ==================== */}
      <SectionCard
        title="Declaraciones especiales"
        description="Marca solo lo que aplique a tu envío"
      >
        <ToggleRow
          label="Contiene batería de litio"
          checked={decl.contieneBateriaLitio}
          onChange={() => updateDecl({ contieneBateriaLitio: !decl.contieneBateriaLitio })}
        >
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Tipo de batería</label>
            <EnumSelect
              value={decl.bateria?.tipo}
              onChange={(tipo) => updateDecl({ bateria: { ...decl.bateria, tipo } })}
              options={BATTERY_TYPE_OPTIONS}
              placeholder="Selecciona un tipo"
            />
          </div>
          <Input
            label="Watt-hora (Wh)"
            type="number"
            min={0}
            value={decl.bateria?.wattHora ?? ""}
            onChange={(e) =>
              updateDecl({
                bateria: { ...decl.bateria, wattHora: e.target.value === "" ? undefined : Number(e.target.value) },
              })
            }
          />
          <Input
            label="Contenido de litio (g)"
            type="number"
            min={0}
            value={decl.bateria?.gramosLitio ?? ""}
            onChange={(e) =>
              updateDecl({
                bateria: {
                  ...decl.bateria,
                  gramosLitio: e.target.value === "" ? undefined : Number(e.target.value),
                },
              })
            }
          />
          <Input
            label="Cantidad de baterías"
            type="number"
            min={1}
            value={decl.bateria?.cantidad ?? ""}
            onChange={(e) =>
              updateDecl({
                bateria: { ...decl.bateria, cantidad: e.target.value === "" ? undefined : Number(e.target.value) },
              })
            }
          />
        </ToggleRow>

        <ToggleRow
          label="Contiene líquidos, geles o aerosoles"
          checked={decl.contieneLiquidos}
          onChange={() => updateDecl({ contieneLiquidos: !decl.contieneLiquidos })}
        >
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Categoría del líquido</label>
            <EnumSelect
              value={decl.liquido?.categoria}
              onChange={(categoria) => updateDecl({ liquido: { ...decl.liquido, categoria } })}
              options={LIQUID_CATEGORY_OPTIONS}
              placeholder="Selecciona una categoría"
            />
          </div>
          <Input
            label="Volumen total (ml)"
            type="number"
            min={0}
            value={decl.liquido?.volumenTotalMl ?? ""}
            onChange={(e) =>
              updateDecl({
                liquido: {
                  ...decl.liquido,
                  volumenTotalMl: e.target.value === "" ? undefined : Number(e.target.value),
                },
              })
            }
          />
          <div className="sm:col-span-2">
            <Checkbox
              label="Es inflamable"
              checked={decl.liquido?.esInflamable ?? false}
              onChange={() =>
                updateDecl({ liquido: { ...decl.liquido, esInflamable: !decl.liquido?.esInflamable } })
              }
            />
          </div>
        </ToggleRow>

        <div className="rounded-xl border border-slate-200 p-4">
          <p className="text-sm font-medium text-slate-700 mb-3">
            Otras mercancías peligrosas (selecciona las que apliquen)
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {OTHER_DANGEROUS_GOODS_OPTIONS.map((opt) => (
              <Checkbox
                key={opt.value}
                label={opt.label}
                checked={decl.otrasMercanciasPeligrosas.includes(opt.value)}
                onChange={() => toggleOtraMercancia(opt.value)}
              />
            ))}
          </div>
        </div>

        <ToggleRow
          label="Es un producto orgánico o biológico"
          checked={decl.esOrganicoOBiologico}
          onChange={() => updateDecl({ esOrganicoOBiologico: !decl.esOrganicoOBiologico })}
        >
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Tipo de producto</label>
            <EnumSelect
              value={decl.organico?.tipo}
              onChange={(tipo) => updateDecl({ organico: { ...decl.organico, tipo } })}
              options={ORGANIC_TYPE_OPTIONS}
              placeholder="Selecciona un tipo"
            />
          </div>
          <div className="flex flex-col gap-2 justify-center">
            <Checkbox
              label="Es perecedero"
              checked={decl.organico?.esPerecedero ?? false}
              onChange={() =>
                updateDecl({ organico: { ...decl.organico, esPerecedero: !decl.organico?.esPerecedero } })
              }
            />
            <Checkbox
              label="Tiene certificado fitosanitario"
              checked={decl.organico?.tieneCertificadoFitosanitario ?? false}
              onChange={() =>
                updateDecl({
                  organico: {
                    ...decl.organico,
                    tieneCertificadoFitosanitario: !decl.organico?.tieneCertificadoFitosanitario,
                  },
                })
              }
            />
          </div>
        </ToggleRow>

        <ToggleRow
          label="Es un medicamento o producto médicamente regulado"
          checked={decl.esMedicamentoRegulado}
          onChange={() => updateDecl({ esMedicamentoRegulado: !decl.esMedicamentoRegulado })}
        >
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Tipo de regulación</label>
            <EnumSelect
              value={decl.medico?.tipo}
              onChange={(tipo) => updateDecl({ medico: { ...decl.medico, tipo } })}
              options={MEDICAL_TYPE_OPTIONS}
              placeholder="Selecciona un tipo"
            />
          </div>
          <div className="flex items-center">
            <Checkbox
              label="Es sustancia controlada"
              checked={decl.medico?.esSustanciaControlada ?? false}
              onChange={() =>
                updateDecl({
                  medico: { ...decl.medico, esSustanciaControlada: !decl.medico?.esSustanciaControlada },
                })
              }
            />
          </div>
        </ToggleRow>
      </SectionCard>

      <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? "Evaluando envío..." : "Evaluar envío"}
      </Button>
    </form>
  );
}