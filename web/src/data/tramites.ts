/**
 * Catalogue of common trámites. The links point at the real official portals; summaries and
 * requirements are a simplified guide, so always check the official page before applying.
 */

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
    palabrasClave: ["nie", "extranjer", "residencia", "ex-15"],
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

export function buscarEnCatalogo(texto: string): FichaCatalogo | undefined {
  const t = texto.toLowerCase();
  return catalogo.find((f) => f.palabrasClave.some((k) => t.includes(k)));
}
