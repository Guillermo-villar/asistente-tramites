import type { FichaCatalogo, FichaTexto, TramiteId } from "@/data/tramites";

/**
 * Spanish (castellano): the reference language. Its shape defines `Messages`; every other
 * language file must match it. Markdown (`**bold**`, `*italic*`) is allowed in chat replies and
 * in `extension.mock.bot`.
 */
export const es = {
  meta: { title: "OrientaT · Asistente de trámites", language: "Idioma" },
  /** The name, OrientaT, is fixed in every language (see `Wordmark`); only the descriptor is translated. */
  brand: { descriptor: "Asistente de trámites" },
  header: { extension: "La extensión" },
  hero: {
    title: "¿Qué trámite tienes que hacer?",
    subtitle: "Pregúntalo con tus palabras. Te decimos qué es, qué necesitas y dónde hacerlo.",
  },
  extension: {
    eyebrow: "La extensión",
    title: "Te acompaña dentro de la web oficial.",
    intro:
      "El chat te orienta. La extensión va un paso más allá: te guía por la propia sede electrónica, pantalla a pantalla, sin hacer nada en tu nombre.",
    steps: [
      {
        title: "Ábrela junto a la sede",
        text: "Un panel lateral en tu navegador, al lado de la web oficial: Agencia Tributaria, Seguridad Social, DGT…",
      },
      {
        title: "Dile qué quieres hacer",
        text: "«Quiero ver mi borrador de la renta». No hace falta saber cómo se llama el trámite.",
      },
      {
        title: "Te lleva a la página correcta",
        text: "Navega por ti: sigue enlaces, abre menús y pestañas hasta llegar al formulario.",
      },
      {
        title: "Te señala dónde escribir",
        text: "Marca cada casilla con un recuadro y te dice qué poner. Tú escribes, firmas y presentas.",
      },
    ],
    does: {
      title: "Lo que hace por ti",
      items: [
        "Seguir enlaces y abrir menús o pestañas",
        "Llevarte a la página exacta del trámite",
        "Señalarte cada campo y explicarte qué poner",
      ],
    },
    never: {
      title: "Lo que nunca hace",
      items: [
        "Escribir tus datos o elegir opciones",
        "Firmar, pagar, guardar o presentar",
        "Salir de las webs oficiales que conoce",
      ],
    },
    soon: "Próximamente para Chrome y Safari",
    mock: {
      field: "DNI / NIE",
      hint: "Escribe tú",
      hintText: "Tu número de DNI, con la letra.",
      validity: "Fecha de validez",
      panelTitle: "Asistente",
      user: "Quiero ver mi borrador de la renta",
      bot: "Te he llevado a **Renta WEB**. Para entrar, escribe tu DNI en el recuadro amarillo.",
      botNext: "Cuando lo tengas, pulsa tú «Continuar».",
      composer: "Escribe aquí…",
    },
  },
  footer: {
    disclaimer:
      "Servicio no oficial, no afiliado al Gobierno de España. La información es orientativa: consulta siempre la sede electrónica antes de presentar. Escudo según el rediseño de Samuel Mòdol y Manu Homie.",
  },
  chat: {
    suggestions: ["¿Cómo funciona la extensión?", "Necesito el NIE", "¿Cómo hago la renta?", "Me he quedado en paro"],
    placeholder: "Escribe qué trámite necesitas…",
    footnote: "Nada se envía sin tu confirmación",
    title: "Asistente de trámites",
    reset: "Nueva",
    reading: "Leyendo tu consulta…",
    consulted: (label: string) => `Consultado: ${label}`,
    send: "Enviar",
    stop: "Detener",
    thinking: "Pensando…",
    thoughtFew: "Pensó unos segundos",
    thoughtFor: (s: number) => `Pensó ${s} s`,
    sources: (n: number) => (n === 1 ? "1 fuente oficial" : `${n} fuentes oficiales`),
    tool: {
      status: {
        "approval-requested": "Esperando aprobación",
        "approval-responded": "Respondido",
        "input-available": "En curso",
        "input-streaming": "Pendiente",
        "output-available": "Hecho",
        "output-denied": "Denegado",
        "output-error": "Error",
      },
      params: "Parámetros",
      result: "Resultado",
      error: "Error",
    },
  },
  tools: {
    buscar_tramite: { running: "Buscando en el catálogo de trámites…", done: "Catálogo de trámites" },
    buscar_cita: { running: "Buscando huecos de cita previa…", done: "Cita previa" },
  } as Record<string, { running: string; done: string }>,
  cards: {
    needs: (done: number, total: number) => `Qué necesitas · ${done}/${total}`,
    bookCta: "Buscar cita",
    official: "Ficha oficial",
    askCita: (titulo: string) => `Búscame cita para ${titulo.toLowerCase()}`,
    citaEyebrow: (titulo: string) => `Cita previa · ${titulo}`,
    confirmNote: "La confirmación final la haces tú en la sede.",
    reserveCta: "Reservar este hueco",
    askReserve: (titulo: string, oficina: string, fecha: string, hora: string) =>
      `Reserva la cita de ${titulo.toLowerCase()} en ${oficina}, el ${fecha} a las ${hora}`,
  },
  replies: {
    extension:
      "La extensión es un **panel lateral en tu navegador** que se abre junto a la web oficial (Agencia Tributaria, Seguridad Social, DGT, SEPE, tu ayuntamiento…). Funciona así:\n\n" +
      "1. **Le dices qué quieres hacer**, con tus palabras: *«quiero ver mi borrador de la renta»*.\n" +
      "2. **Te lleva a la página correcta**: sigue enlaces y abre menús y pestañas por ti, solo dentro de las webs oficiales que conoce.\n" +
      "3. **Te señala dónde escribir**: rodea cada casilla con un recuadro amarillo y te dice qué poner, por ejemplo *«Tu DNI, con la letra»*.\n" +
      "4. **Tú escribes, firmas y presentas.** La extensión nunca rellena tus datos, ni elige opciones, ni pulsa botones que envían, firman, pagan o guardan.\n\n" +
      "Así no te pierdes en la sede, y todo lo que se presenta lo has hecho tú. Estará disponible pronto para Chrome y Safari.",
    estado:
      "Para ver el estado de **tus** expedientes tienes que identificarte en **Carpeta Ciudadana** con Cl@ve, certificado digital o DNIe: ahí aparecen los trámites abiertos con la Administración General del Estado y sus notificaciones.\n\n" +
      "Si me dices qué trámite es, te explico en qué fase suele estar y cuánto tarda.",
    estadoSource: "Carpeta Ciudadana",
    reserva:
      "Perfecto. Te abro la página oficial de cita previa con la oficina y la fecha que has elegido. **La reserva la confirmas tú allí**, con tus datos; yo no envío nada en tu nombre.",
    citaReasoning: (titulo: string) => `Busco huecos libres para «${titulo}» en las oficinas de Madrid.`,
    citaFound:
      "He encontrado **3 huecos**. Elige uno y te llevo a la página oficial de cita previa; **la confirmación la haces tú**.",
    citaSource: (organismo: string) => `Cita previa · ${organismo}`,
    tramiteReasoning: (titulo: string, organismo: string) =>
      `La consulta encaja con «${titulo}» (${organismo}). Reviso requisitos, coste y canal de presentación.`,
    tramiteText: (f: FichaCatalogo) =>
      `**${f.titulo}** se gestiona con ${f.organismo}. ${f.resumen}\n\n` +
      `Necesitarás ${f.requisitos.length} cosas; te las dejo arriba como lista. ` +
      "Si quieres, **te busco cita** o te explico cada paso; tú revisas y firmas siempre.",
    tramiteSource: (organismo: string) => `${organismo} · ficha oficial`,
    fallback:
      "Puedo ayudarte a **encontrar el trámite** que necesitas, decirte **qué documentos llevar**, **buscar cita** y explicarte **cada paso**.\n\n" +
      "Cuéntame qué quieres hacer, por ejemplo: *«Necesito el NIE»*, *«¿Cómo hago la renta?»* o *«Me he quedado en paro»*.",
  },
  /** Demo offices for NIE appointments (fictional slots, real office names). */
  nieOffices: ["Comisaría de Aluche", "Comisaría de Moratalaz", "Oficina de Extranjería de Madrid"],
  tramites: {
    nie: {
      titulo: "Asignación de NIE",
      organismo: "Policía Nacional · Extranjería",
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
    },
    padron: {
      titulo: "Alta en el padrón municipal",
      organismo: "Ayuntamiento",
      resumen: "Inscripción en el municipio donde vives. Da acceso a sanidad, escolarización y otros servicios.",
      requisitos: [
        "Documento de identidad (DNI, NIE o pasaporte)",
        "Contrato de alquiler, escritura o autorización del titular",
        "Formulario de inscripción del ayuntamiento",
      ],
      duracion: "Inmediato en la cita; certificado en 1–7 días",
      coste: "Gratuito",
    },
    renta: {
      titulo: "Declaración de la Renta (IRPF)",
      organismo: "Agencia Tributaria",
      resumen:
        "Presentación anual del IRPF. El borrador se revisa y presenta en Renta WEB con Cl@ve, certificado o número de referencia.",
      requisitos: [
        "Cl@ve, certificado digital o número de referencia",
        "Datos fiscales del ejercicio",
        "IBAN para devolución o domiciliación",
      ],
      duracion: "Campaña de abril a junio",
      coste: "Gratuito",
    },
    paro: {
      titulo: "Prestación por desempleo",
      organismo: "SEPE",
      resumen:
        "Solicitud de la prestación contributiva tras el fin de una relación laboral. Hay 15 días hábiles para pedirla.",
      requisitos: [
        "Inscripción como demandante de empleo",
        "Certificado de empresa (lo envía la empresa al SEPE)",
        "Documento de identidad y número de cuenta",
      ],
      duracion: "Resolución en unos 15 días hábiles",
      coste: "Gratuito",
    },
    certificado: {
      titulo: "Certificado digital de persona física",
      organismo: "FNMT-RCM",
      resumen:
        "Firma electrónica para hacer casi cualquier trámite online. Se solicita online y se acredita la identidad en una oficina o por vídeo.",
      requisitos: [
        "DNI o NIE",
        "Navegador compatible para la descarga",
        "Acreditación de identidad (presencial o videoidentificación)",
      ],
      duracion: "Descarga tras acreditar la identidad",
      coste: "Gratuito (presencial)",
    },
    clave: {
      titulo: "Registro en Cl@ve",
      organismo: "Gobierno de España",
      resumen: "Sistema de identificación con usuario y PIN o app para la Administración electrónica.",
      requisitos: ["DNI o NIE", "Teléfono móvil", "Carta de invitación, videollamada o registro presencial"],
      duracion: "Inmediato por videollamada",
      coste: "Gratuito",
    },
    "vida-laboral": {
      titulo: "Informe de vida laboral",
      organismo: "Seguridad Social · Import@ss",
      resumen: "Historial de altas y bajas en la Seguridad Social. Se descarga al momento en Import@ss.",
      requisitos: ["Cl@ve, certificado digital o SMS al móvil registrado"],
      duracion: "Inmediato",
      coste: "Gratuito",
    },
    carnet: {
      titulo: "Renovación del permiso de conducir",
      organismo: "DGT",
      resumen: "Renovación por caducidad. Puede hacerse en un centro de reconocimiento que la tramite.",
      requisitos: ["Informe de aptitud psicofísica", "Fotografía reciente", "Pago de la tasa"],
      duracion: "Permiso provisional en el momento",
      coste: "Tasa DGT 4.1 (consulta el importe vigente)",
    },
  } as Record<TramiteId, FichaTexto>,
};

export type Messages = typeof es;
