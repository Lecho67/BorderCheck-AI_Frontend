export type TipoLegal = "terminos" | "habeas_data";

export const CONTENIDO_LEGAL: Record<TipoLegal, { titulo: string; cuerpo: string[] }> = {
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
