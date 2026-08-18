export interface FaqItem {
  id: string;
  categoria: "Aduanas Colombia" | "Casillero" | "Pagos y Tributos";
  pregunta: string;
  respuesta: string;
}

export const CATEGORIAS = ["Aduanas Colombia", "Casillero", "Pagos y Tributos"] as const;

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: "aduana-limite-valor",
    categoria: "Aduanas Colombia",
    pregunta: "¿Cuál es el valor máximo para importar sin pagar aranceles?",
    respuesta:
      "En Colombia, los envíos de mensajería con valor FOB de hasta USD 200 pueden estar exentos de arancel bajo el régimen de tráfico postal, aunque siguen pagando IVA si superan los USD 200. Este límite puede cambiar según la normativa vigente de la DIAN, así que confirmá siempre el valor actualizado antes de tu envío.",
  },
  {
    id: "aduana-productos-restringidos",
    categoria: "Aduanas Colombia",
    pregunta: "¿Qué productos están restringidos o prohibidos para importar?",
    respuesta:
      "Entre otros: armas y municiones, sustancias controladas, medicamentos sin registro INVIMA, productos que infrinjan derechos de marca, baterías de litio sueltas (fuera de un dispositivo) sin declaración especial, y productos de origen animal o vegetal sin permiso del ICA. Usá 'Nueva consulta' para chequear tu producto puntual.",
  },
  {
    id: "aduana-partida-arancelaria",
    categoria: "Aduanas Colombia",
    pregunta: "¿Qué es la partida arancelaria y por qué es importante?",
    respuesta:
      "Es el código HS que clasifica tu producto según un estándar internacional y determina qué arancel e impuestos aplican. Una clasificación incorrecta puede generar retrasos, multas o el bloqueo del envío en aduana.",
  },
  {
    id: "casillero-que-es",
    categoria: "Casillero",
    pregunta: "¿Qué es el casillero virtual y cómo funciona?",
    respuesta:
      "Es una dirección física en el país de origen que te asignamos para tus compras online. Cuando el paquete llega, lo consolidamos y lo enviamos a tu país. Podés ver el estado de tus paquetes en la sección Casillero de tu panel.",
  },
  {
    id: "casillero-tiempos",
    categoria: "Casillero",
    pregunta: "¿Cuánto tarda un paquete en llegar desde el casillero?",
    respuesta:
      "Depende del método de envío y del país de destino, pero en general entre 5 y 15 días hábiles desde que sale del casillero, sin contar el tiempo de liberación en aduana si tu envío queda en revisión.",
  },
  {
    id: "casillero-consolidacion",
    categoria: "Casillero",
    pregunta: "¿Puedo consolidar varias compras en un solo envío?",
    respuesta:
      "Sí. Podés recibir varios paquetes en tu casillero y pedir que se consoliden en un único envío, lo que suele reducir el costo de flete frente a enviarlos por separado.",
  },
  {
    id: "pagos-como-se-calculan",
    categoria: "Pagos y Tributos",
    pregunta: "¿Cómo se calculan los tributos de mi envío?",
    respuesta:
      "Se calculan sobre el valor CIF (costo + seguro + flete), aplicando la tasa de arancel de la partida arancelaria del producto, más IVA cuando aplica. Podés ver un desglose estimado (flete, arancel y total) en el resultado de cada consulta.",
  },
  {
    id: "pagos-metodos",
    categoria: "Pagos y Tributos",
    pregunta: "¿Qué métodos de pago aceptan para los tributos de aduana?",
    respuesta:
      "Los tributos de nacionalización generalmente se pagan a través de la agencia de aduanas o el operador logístico antes de la entrega final. Los métodos varían según el operador; consultá con tu agente asignado los detalles de tu envío.",
  },
  {
    id: "pagos-envio-bloqueado",
    categoria: "Pagos y Tributos",
    pregunta: "¿Qué pasa si mi envío queda en Precaución o Bloqueo?",
    respuesta:
      "'Precaución' generalmente requiere documentación adicional (factura, permisos) antes de continuar. 'Bloqueo' significa que el envío no cumple la normativa vigente y no puede nacionalizarse sin resolver la causa. En ambos casos, un agente humano revisa el caso desde el Panel de Agente.",
  },
];