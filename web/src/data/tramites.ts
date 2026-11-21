/**
 * Demo data. The catalogue links point at the real official portals; the person's
 * expedientes, references and dates are fictional, so the UI has something to show
 * before a backend exists. Replace `misTramites` / `actividad` with API calls.
 */

export type EstadoTramite = "accion" | "curso" | "completado" | "borrador";

export type Paso = {
  titulo: string;
  estado: "hecho" | "actual" | "pendiente";
  fecha?: string;
};

export type Tramite = {
  id: string;
  titulo: string;
  organismo: string;
  categoria: Categoria;
  estado: EstadoTramite;
  referencia: string;
  actualizado: string;
  plazo?: string;
  siguientePaso: string;
  pasos: Paso[];
  url: string;
};

export type Categoria =
  | "Extranjería"
  | "Impuestos"
  | "Empleo"
  | "Padrón"
  | "Identidad digital"
  | "Seguridad Social"
  | "Tráfico";

export type FichaCatalogo = {
  id: string;
  titulo: string;
  organismo: string;
  categoria: Categoria;
  resumen: string;
  requisitos: string[];
  duracion: string;
  coste: string;
  url: string;
  palabrasClave: string[];
};

export const catalogo: FichaCatalogo[] = [
  {
    id: "nie",
    titulo: "Asignación de NIE",
    organismo: "Policía Nacional · Extranjería",
    categoria: "Extranjería",
    resumen:
      "Número de Identidad de Extranjero, necesario para trabajar, abrir una cuenta o firmar un contrato en España.",
    requisitos: [
      "Formulario EX-15 cumplimentado",
      "Pasaporte o documento de identidad y copia",
      "Justificante del motivo (oferta de trabajo, matrícula, compraventa…)",
      "Justificante del pago de la tasa 790 código 012",
    ],
    duracion: "En el día de la cita, en la mayoría de oficinas",
    coste: "Tasa 790-012 (consulta el importe vigente)",
    url: "https://icp.administracionelectronica.gob.es/icpplus/index.html",
    palabrasClave: ["nie", "extranjer", "tie", "residencia", "ex-15"],
  },
  {
    id: "padron",
    titulo: "Alta en el padrón municipal",
    organismo: "Ayuntamiento",
    categoria: "Padrón",
    resumen:
      "Inscripción en el municipio donde vives. Da acceso a sanidad, escolarización y otros servicios.",
    requisitos: [
      "Documento de identidad (DNI, NIE o pasaporte)",
      "Contrato de alquiler, escritura o autorización del titular",
      "Formulario de inscripción del ayuntamiento",
    ],
    duracion: "Inmediato en la cita; certificado en 1–7 días",
    coste: "Gratuito",
    url: "https://administracion.gob.es/pag_Home/Tu-espacio-europeo/derechos-obligaciones/ciudadanos/residencia/empadronamiento.html",
    palabrasClave: ["padr", "empadron", "domicilio", "ayuntamiento"],
  },
  {
    id: "renta",
    titulo: "Declaración de la Renta (IRPF)",
    organismo: "Agencia Tributaria",
    categoria: "Impuestos",
    resumen:
      "Presentación anual del IRPF. El borrador se revisa y presenta en Renta WEB con Cl@ve, certificado o número de referencia.",
    requisitos: [
      "Cl@ve, certificado digital o número de referencia",
      "Datos fiscales del ejercicio",
      "IBAN para devolución o domiciliación",
    ],
    duracion: "Campaña de abril a junio",
    coste: "Gratuito",
    url: "https://sede.agenciatributaria.gob.es/Sede/Renta.html",
    palabrasClave: ["renta", "irpf", "hacienda", "declaraci", "borrador", "impuesto"],
  },
  {
    id: "paro",
    titulo: "Prestación por desempleo",
    organismo: "SEPE",
    categoria: "Empleo",
    resumen:
      "Solicitud de la prestación contributiva tras el fin de una relación laboral. Hay 15 días hábiles para pedirla.",
    requisitos: [
      "Inscripción como demandante de empleo",
      "Certificado de empresa (lo envía la empresa al SEPE)",
      "Documento de identidad y número de cuenta",
    ],
    duracion: "Resolución en unos 15 días hábiles",
    coste: "Gratuito",
    url: "https://sede.sepe.gob.es/",
    palabrasClave: ["paro", "desempleo", "sepe", "prestaci"],
  },
  {
    id: "certificado",
    titulo: "Certificado digital de persona física",
    organismo: "FNMT-RCM",
    categoria: "Identidad digital",
    resumen:
      "Firma electrónica para hacer casi cualquier trámite online. Se solicita online y se acredita la identidad en una oficina o por vídeo.",
    requisitos: [
      "DNI o NIE",
      "Navegador compatible para la descarga",
      "Acreditación de identidad (presencial o videoidentificación)",
    ],
    duracion: "Descarga tras acreditar la identidad",
    coste: "Gratuito (presencial)",
    url: "https://www.sede.fnmt.gob.es/certificados/persona-fisica",
    palabrasClave: ["certificado", "firma", "fnmt", "digital"],
  },
  {
    id: "clave",
    titulo: "Registro en Cl@ve",
    organismo: "Gobierno de España",
    categoria: "Identidad digital",
    resumen: "Sistema de identificación con usuario y PIN o app para la Administración electrónica.",
    requisitos: ["DNI o NIE", "Teléfono móvil", "Carta de invitación, videollamada o registro presencial"],
    duracion: "Inmediato por videollamada",
    coste: "Gratuito",
    url: "https://clave.gob.es/",
    palabrasClave: ["clave", "cl@ve", "pin", "identifica"],
  },
  {
    id: "vida-laboral",
    titulo: "Informe de vida laboral",
    organismo: "Seguridad Social · Import@ss",
    categoria: "Seguridad Social",
    resumen: "Historial de altas y bajas en la Seguridad Social. Se descarga al momento en Import@ss.",
    requisitos: ["Cl@ve, certificado digital o SMS al móvil registrado"],
    duracion: "Inmediato",
    coste: "Gratuito",
    url: "https://portal.seg-social.gob.es/wps/portal/importass/importass",
    palabrasClave: ["vida laboral", "seguridad social", "afiliaci", "cotiza"],
  },
  {
    id: "carnet",
    titulo: "Renovación del permiso de conducir",
    organismo: "DGT",
    categoria: "Tráfico",
    resumen: "Renovación por caducidad. Puede hacerse en un centro de reconocimiento que la tramite.",
    requisitos: ["Informe de aptitud psicofísica", "Fotografía reciente", "Pago de la tasa"],
    duracion: "Permiso provisional en el momento",
    coste: "Tasa DGT 4.1 (consulta el importe vigente)",
    url: "https://sede.dgt.gob.es/",
    palabrasClave: ["carnet", "conducir", "dgt", "permiso"],
  },
];

export const misTramites: Tramite[] = [
  {
    id: "t-nie",
    titulo: "Asignación de NIE",
    organismo: "Policía Nacional · Extranjería",
    categoria: "Extranjería",
    estado: "accion",
    referencia: "EX15-2026-118430",
    actualizado: "2026-11-20T17:40:00",
    plazo: "2026-11-26",
    siguientePaso: "Confirma la cita del 26 nov y paga la tasa 790-012",
    url: "https://icp.administracionelectronica.gob.es/icpplus/index.html",
    pasos: [
      { titulo: "Formulario EX-15", estado: "hecho", fecha: "2026-11-14" },
      { titulo: "Cita previa", estado: "actual", fecha: "2026-11-20" },
      { titulo: "Pago de la tasa", estado: "pendiente" },
      { titulo: "Comparecencia", estado: "pendiente" },
    ],
  },
  {
    id: "t-padron",
    titulo: "Alta en el padrón",
    organismo: "Ayuntamiento de Madrid",
    categoria: "Padrón",
    estado: "curso",
    referencia: "PAD-28079-55120",
    actualizado: "2026-11-18T10:05:00",
    siguientePaso: "El ayuntamiento está revisando la documentación",
    url: "https://sede.madrid.es/",
    pasos: [
      { titulo: "Solicitud presentada", estado: "hecho", fecha: "2026-11-12" },
      { titulo: "Revisión", estado: "actual", fecha: "2026-11-18" },
      { titulo: "Certificado", estado: "pendiente" },
    ],
  },
  {
    id: "t-clave",
    titulo: "Registro en Cl@ve",
    organismo: "Gobierno de España",
    categoria: "Identidad digital",
    estado: "completado",
    referencia: "CLV-7Q2M-KX",
    actualizado: "2026-11-09T12:30:00",
    siguientePaso: "Listo: ya puedes identificarte en las sedes electrónicas",
    url: "https://clave.gob.es/",
    pasos: [
      { titulo: "Videollamada", estado: "hecho", fecha: "2026-11-09" },
      { titulo: "Activación", estado: "hecho", fecha: "2026-11-09" },
    ],
  },
  {
    id: "t-vida",
    titulo: "Informe de vida laboral",
    organismo: "Seguridad Social",
    categoria: "Seguridad Social",
    estado: "completado",
    referencia: "VL-2026-11-06",
    actualizado: "2026-11-06T09:12:00",
    siguientePaso: "PDF descargado en Documentos",
    url: "https://portal.seg-social.gob.es/wps/portal/importass/importass",
    pasos: [{ titulo: "Descarga", estado: "hecho", fecha: "2026-11-06" }],
  },
  {
    id: "t-cert",
    titulo: "Certificado digital FNMT",
    organismo: "FNMT-RCM",
    categoria: "Identidad digital",
    estado: "borrador",
    referencia: "—",
    actualizado: "2026-11-03T19:20:00",
    siguientePaso: "Retoma la solicitud: falta elegir el modo de acreditación",
    url: "https://www.sede.fnmt.gob.es/certificados/persona-fisica",
    pasos: [
      { titulo: "Solicitud online", estado: "actual" },
      { titulo: "Acreditación", estado: "pendiente" },
      { titulo: "Descarga", estado: "pendiente" },
    ],
  },
];

export type Actividad = {
  id: string;
  fecha: string;
  actor: "asistente" | "tu" | "organismo";
  titulo: string;
  detalle?: string;
  tramiteId?: string;
};

export const actividad: Actividad[] = [
  {
    id: "a1",
    fecha: "2026-11-20T17:40:00",
    actor: "asistente",
    titulo: "Encontró cita para el NIE",
    detalle: "Comisaría de Aluche, 26 nov a las 09:20. Pendiente de tu confirmación.",
    tramiteId: "t-nie",
  },
  {
    id: "a2",
    fecha: "2026-11-18T10:05:00",
    actor: "organismo",
    titulo: "El ayuntamiento recibió tu solicitud de padrón",
    detalle: "Estado: en revisión.",
    tramiteId: "t-padron",
  },
  {
    id: "a3",
    fecha: "2026-11-14T11:22:00",
    actor: "tu",
    titulo: "Firmaste y enviaste el formulario EX-15",
    tramiteId: "t-nie",
  },
  {
    id: "a4",
    fecha: "2026-11-14T11:02:00",
    actor: "asistente",
    titulo: "Rellenó el EX-15 con tus datos",
    detalle: "Revisaste 14 campos antes de firmar.",
    tramiteId: "t-nie",
  },
  {
    id: "a5",
    fecha: "2026-11-12T16:48:00",
    actor: "tu",
    titulo: "Presentaste el alta en el padrón",
    tramiteId: "t-padron",
  },
  {
    id: "a6",
    fecha: "2026-11-09T12:30:00",
    actor: "organismo",
    titulo: "Cl@ve activado",
    tramiteId: "t-clave",
  },
  {
    id: "a7",
    fecha: "2026-11-06T09:12:00",
    actor: "asistente",
    titulo: "Descargó tu informe de vida laboral",
    detalle: "Guardado en Documentos.",
    tramiteId: "t-vida",
  },
];

export const estadoLabel: Record<EstadoTramite, string> = {
  accion: "Requiere acción",
  curso: "En curso",
  completado: "Completado",
  borrador: "Borrador",
};

export function buscarEnCatalogo(texto: string): FichaCatalogo | undefined {
  const t = texto.toLowerCase();
  return catalogo.find((f) => f.palabrasClave.some((k) => t.includes(k)));
}

const fechaCorta = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short" });
const fechaHora = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export const formatFecha = (iso: string) => fechaCorta.format(new Date(iso));
export const formatFechaHora = (iso: string) => fechaHora.format(new Date(iso));

/** Whole days from today to `iso` (negative when it is in the past). */
export function diasHasta(iso: string, hoy = new Date()) {
  const a = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const d = new Date(iso);
  const b = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}
