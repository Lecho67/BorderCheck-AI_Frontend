import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useFocusTrap } from "@/hooks/useFocusTrap";

type TipoModal = "terminos" | "habeas_data";

interface Props {
  tipo: TipoModal;
  onClose: () => void;
}

const CONTENIDO: Record<TipoModal, { titulo: string; cuerpo: string[] }> = {
  terminos: {
    titulo: "Términos y Condiciones del Servicio",
    cuerpo: [
      "1. Objeto. Easy CUSTOMS presta servicios de casillero virtual, evaluación preliminar de envíos internacionales y acompañamiento en trámites aduaneros. Las evaluaciones generadas por IA son orientativas y no reemplazan una resolución aduanera oficial.",
      "2. Responsabilidad del usuario. El usuario declara que la información suministrada (identidad, descripción de mercancía, valores declarados) es veraz y completa. La inexactitud en estos datos puede derivar en el bloqueo del envío, sanciones aduaneras o la suspensión del servicio.",
      "3. Verificación de identidad. Para operar el servicio de casillero y trámites aduaneros, el usuario debe verificar su identidad mediante documento oficial vigente (CC, CE, Pasaporte o NIT).",
      "4. Documentos y tributos. El usuario es responsable de aportar los documentos exigidos para su envío y de asumir el pago de los tributos aduaneros que correspondan.",
      "5. Modificaciones. Easy CUSTOMS podrá actualizar estos términos; los cambios sustanciales se notificarán a través de la plataforma.",
    ],
  },
  habeas_data: {
    titulo: "Política de Tratamiento de Datos Personales (Habeas Data — Ley 1581 de 2012)",
    cuerpo: [
      "1. Responsable del tratamiento. Easy CUSTOMS actúa como responsable del tratamiento de los datos personales suministrados por el usuario, incluyendo datos de identificación (nombre, documento de identidad), contacto y datos relativos a sus envíos.",
      "2. Finalidad. Los datos se recolectan para: verificar la identidad del usuario conforme a la normativa aduanera, gestionar el servicio de casillero, evaluar y tramitar envíos, y dar cumplimiento a obligaciones legales frente a autoridades aduaneras y tributarias.",
      "3. Derechos del titular. Conforme a la Ley 1581 de 2012 y sus decretos reglamentarios, el usuario tiene derecho a conocer, actualizar, rectificar y solicitar la supresión de sus datos, así como a revocar la autorización otorgada, salvo que exista un deber legal de conservación.",
      "4. Documento de identidad. La fotografía del documento de identidad se almacena en un espacio de acceso restringido y se utiliza exclusivamente para fines de verificación de identidad ante la plataforma y, cuando corresponda, ante las autoridades aduaneras.",
      "5. Autorización. Al aceptar esta política, el usuario autoriza expresa e inequívocamente el tratamiento de sus datos personales para los fines aquí descritos.",
    ],
  },
};

export function KycModal({ tipo, onClose }: Props) {
  const contenido = CONTENIDO[tipo];
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, true);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={dialogRef}
        className="flex max-h-[80vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow"
      >
        <div className="flex items-center justify-between border-b border-slate-100 p-4">
          <h2 className="text-sm font-semibold text-slate-900">{contenido.titulo}</h2>
          <button onClick={onClose} aria-label="Cerrar" className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto p-4 text-sm leading-relaxed text-slate-600">
          {contenido.cuerpo.map((parrafo, i) => (
            <p key={i}>{parrafo}</p>
          ))}
        </div>
        <div className="border-t border-slate-100 p-4">
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-brand-blue px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-blue-hover"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}