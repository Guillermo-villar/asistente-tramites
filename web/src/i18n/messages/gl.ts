import type { Messages } from "./es";

/** Galego. */
export const gl: Messages = {
  meta: { title: "OrientaT · Asistente de trámites", language: "Idioma" },
  brand: { descriptor: "Asistente de trámites" },
  header: { extension: "A extensión" },
  hero: {
    title: "Que trámite tes que facer?",
    subtitle: "Pregúntao coas túas palabras. Dicímosche que é, que necesitas e onde facelo.",
  },
  extension: {
    eyebrow: "A extensión",
    title: "Acompáñate dentro da web oficial.",
    intro:
      "O chat oriéntate. A extensión vai un paso máis alá: guíate pola propia sede electrónica, pantalla a pantalla, sen facer nada no teu nome.",
    steps: [
      {
        title: "Ábrea xunto á sede",
        text: "Un panel lateral no teu navegador, ao carón da web oficial: Axencia Tributaria, Seguridade Social, DGT…",
      },
      {
        title: "Dille que queres facer",
        text: "«Quero ver o meu borrador da renda». Non fai falta saber como se chama o trámite.",
      },
      {
        title: "Lévate á páxina correcta",
        text: "Navega por ti: segue ligazóns, abre menús e lapelas ata chegar ao formulario.",
      },
      {
        title: "Indícache onde escribir",
        text: "Marca cada campo cun recadro e dite que poñer. Ti escribes, asinas e presentas.",
      },
    ],
    does: {
      title: "O que fai por ti",
      items: [
        "Seguir ligazóns e abrir menús ou lapelas",
        "Levarte á páxina exacta do trámite",
        "Indicarche cada campo e explicarche que poñer",
      ],
    },
    never: {
      title: "O que nunca fai",
      items: [
        "Escribir os teus datos ou escoller opcións",
        "Asinar, pagar, gardar ou presentar",
        "Saír das webs oficiais que coñece",
      ],
    },
    soon: "Proximamente para Chrome e Safari",
    mock: {
      field: "DNI / NIE",
      hint: "Escríbeo ti",
      hintText: "O teu número de DNI, coa letra.",
      validity: "Data de validez",
      panelTitle: "Asistente",
      user: "Quero ver o meu borrador da renda",
      bot: "Leveite a **Renta WEB**. Para entrar, escribe o teu DNI no recadro amarelo.",
      botNext: "Cando o teñas, preme ti «Continuar».",
      composer: "Escribe aquí…",
    },
  },
  footer: {
    disclaimer:
      "Servizo non oficial, non afiliado ao Goberno de España. A información é orientativa: consulta sempre a sede electrónica antes de presentar. Escudo segundo o redeseño de Samuel Mòdol e Manu Homie.",
  },
  chat: {
    suggestions: ["Como funciona a extensión?", "Necesito o NIE", "Como fago a renda?", "Quedei no paro"],
    placeholder: "Escribe que trámite necesitas…",
    footnote: "Non se envía nada sen a túa confirmación",
    title: "Asistente de trámites",
    reset: "Nova",
    reading: "Lendo a túa consulta…",
    consulted: (label) => `Consultado: ${label}`,
    send: "Enviar",
    stop: "Deter",
    thinking: "Pensando…",
    thoughtFew: "Pensou uns segundos",
    thoughtFor: (s) => `Pensou ${s} s`,
    sources: (n) => (n === 1 ? "1 fonte oficial" : `${n} fontes oficiais`),
    tool: {
      status: {
        "approval-requested": "Agardando aprobación",
        "approval-responded": "Respondido",
        "input-available": "En curso",
        "input-streaming": "Pendente",
        "output-available": "Feito",
        "output-denied": "Denegado",
        "output-error": "Erro",
      },
      params: "Parámetros",
      result: "Resultado",
      error: "Erro",
    },
  },
  tools: {
    buscar_tramite: { running: "Buscando no catálogo de trámites…", done: "Catálogo de trámites" },
    buscar_cita: { running: "Buscando ocos de cita previa…", done: "Cita previa" },
  },
  cards: {
    needs: (done, total) => `Que necesitas · ${done}/${total}`,
    bookCta: "Buscar cita",
    official: "Ficha oficial",
    askCita: (titulo) => `Búscame cita para ${titulo.toLowerCase()}`,
    citaEyebrow: (titulo) => `Cita previa · ${titulo}`,
    confirmNote: "A confirmación final fala ti na sede.",
    reserveCta: "Reservar este oco",
    askReserve: (titulo, oficina, fecha, hora) =>
      `Reserva a cita de ${titulo.toLowerCase()} en ${oficina}, o ${fecha} ás ${hora}`,
  },
  replies: {
    extension:
      "A extensión é un **panel lateral no teu navegador** que se abre xunto á web oficial (Axencia Tributaria, Seguridade Social, DGT, SEPE, o teu concello…). Funciona así:\n\n" +
      "1. **Dislle que queres facer**, coas túas palabras: *«quero ver o meu borrador da renda»*.\n" +
      "2. **Lévate á páxina correcta**: segue ligazóns e abre menús e lapelas por ti, só dentro das webs oficiais que coñece.\n" +
      "3. **Indícache onde escribir**: rodea cada campo cun recadro amarelo e dite que poñer, por exemplo *«O teu DNI, coa letra»*.\n" +
      "4. **Ti escribes, asinas e presentas.** A extensión nunca enche os teus datos, nin escolle opcións, nin preme botóns que envían, asinan, pagan ou gardan.\n\n" +
      "Así non te perdes na sede, e todo o que se presenta fixécheslo ti. Estará dispoñible axiña para Chrome e Safari.",
    estado:
      "Para ver o estado dos **teus** expedientes tes que identificarte en **Carpeta Cidadá** con Cl@ve, certificado dixital ou DNIe: aí aparecen os trámites abertos coa Administración Xeral do Estado e as súas notificacións.\n\n" +
      "Se me dis que trámite é, explícoche en que fase adoita estar e canto tarda.",
    estadoSource: "Carpeta Cidadá",
    reserva:
      "Perfecto. Ábroche a páxina oficial de cita previa coa oficina e a data que escolliches. **A reserva confírmala ti alí**, cos teus datos; eu non envío nada no teu nome.",
    citaReasoning: (titulo) => `Busco ocos libres para «${titulo}» nas oficinas de Madrid.`,
    citaFound:
      "Atopei **3 ocos**. Escolle un e lévote á páxina oficial de cita previa; **a confirmación fala ti**.",
    citaSource: (organismo) => `Cita previa · ${organismo}`,
    tramiteReasoning: (titulo, organismo) =>
      `A consulta encaixa con «${titulo}» (${organismo}). Reviso requisitos, custo e canle de presentación.`,
    tramiteText: (f) =>
      `**${f.titulo}** xestiónase con ${f.organismo}. ${f.resumen}\n\n` +
      `Necesitarás ${f.requisitos.length} cousas; déixochas arriba como lista. ` +
      "Se queres, **búscoche cita** ou explícoche cada paso; ti revisas e asinas sempre.",
    tramiteSource: (organismo) => `${organismo} · ficha oficial`,
    fallback:
      "Podo axudarche a **atopar o trámite** que necesitas, dicirche **que documentos levar**, **buscar cita** e explicarche **cada paso**.\n\n" +
      "Cóntame que queres facer, por exemplo: *«Necesito o NIE»*, *«Como fago a renda?»* ou *«Quedei no paro»*.",
  },
  nieOffices: ["Comisaría de Aluche", "Comisaría de Moratalaz", "Oficina de Estranxeiría de Madrid"],
  tramites: {
    nie: {
      titulo: "Asignación de NIE",
      organismo: "Policía Nacional · Estranxeiría",
      resumen:
        "Número de Identidade de Estranxeiro, necesario para traballar, abrir unha conta ou asinar un contrato en España.",
      requisitos: [
        "Formulario EX-15 cuberto",
        "Pasaporte ou documento de identidade e copia",
        "Xustificante do motivo (oferta de traballo, matrícula, compravenda…)",
        "Xustificante do pagamento da taxa 790 código 012",
      ],
      duracion: "No día da cita, na maioría das oficinas",
      coste: "Taxa 790-012 (consulta o importe vixente)",
    },
    padron: {
      titulo: "Alta no padrón municipal",
      organismo: "Concello",
      resumen: "Inscrición no municipio onde vives. Dá acceso á sanidade, á escolarización e a outros servizos.",
      requisitos: [
        "Documento de identidade (DNI, NIE ou pasaporte)",
        "Contrato de aluguer, escritura ou autorización do titular",
        "Formulario de inscrición do concello",
      ],
      duracion: "Inmediato na cita; certificado en 1–7 días",
      coste: "Gratuíto",
    },
    renta: {
      titulo: "Declaración da renda (IRPF)",
      organismo: "Axencia Tributaria",
      resumen:
        "Presentación anual do IRPF. O borrador revísase e preséntase en Renta WEB con Cl@ve, certificado ou número de referencia.",
      requisitos: [
        "Cl@ve, certificado dixital ou número de referencia",
        "Datos fiscais do exercicio",
        "IBAN para a devolución ou a domiciliación",
      ],
      duracion: "Campaña de abril a xuño",
      coste: "Gratuíto",
    },
    paro: {
      titulo: "Prestación por desemprego",
      organismo: "SEPE",
      resumen:
        "Solicitude da prestación contributiva tras o fin dunha relación laboral. Hai 15 días hábiles para pedila.",
      requisitos: [
        "Inscrición como demandante de emprego",
        "Certificado de empresa (envíao a empresa ao SEPE)",
        "Documento de identidade e número de conta",
      ],
      duracion: "Resolución nuns 15 días hábiles",
      coste: "Gratuíto",
    },
    certificado: {
      titulo: "Certificado dixital de persoa física",
      organismo: "FNMT-RCM",
      resumen:
        "Sinatura electrónica para facer case calquera trámite en liña. Solicítase en liña e acredítase a identidade nunha oficina ou por vídeo.",
      requisitos: [
        "DNI ou NIE",
        "Navegador compatible para a descarga",
        "Acreditación da identidade (presencial ou videoidentificación)",
      ],
      duracion: "Descarga tras acreditar a identidade",
      coste: "Gratuíto (presencial)",
    },
    clave: {
      titulo: "Rexistro en Cl@ve",
      organismo: "Goberno de España",
      resumen: "Sistema de identificación con usuario e PIN ou app para a Administración electrónica.",
      requisitos: ["DNI ou NIE", "Teléfono móbil", "Carta de invitación, videochamada ou rexistro presencial"],
      duracion: "Inmediato por videochamada",
      coste: "Gratuíto",
    },
    "vida-laboral": {
      titulo: "Informe de vida laboral",
      organismo: "Seguridade Social · Import@ss",
      resumen: "Historial de altas e baixas na Seguridade Social. Descárgase ao momento en Import@ss.",
      requisitos: ["Cl@ve, certificado dixital ou SMS ao móbil rexistrado"],
      duracion: "Inmediato",
      coste: "Gratuíto",
    },
    carnet: {
      titulo: "Renovación do permiso de conducir",
      organismo: "DGT",
      resumen: "Renovación por caducidade. Pode facerse nun centro de recoñecemento que a tramite.",
      requisitos: ["Informe de aptitude psicofísica", "Fotografía recente", "Pagamento da taxa"],
      duracion: "Permiso provisional no momento",
      coste: "Taxa DGT 4.1 (consulta o importe vixente)",
    },
  },
};
