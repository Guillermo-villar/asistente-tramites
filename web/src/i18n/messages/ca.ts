import type { Messages } from "./es";

/** Català. */
export const ca: Messages = {
  meta: { title: "OrientaT · Assistent de tràmits", language: "Idioma" },
  brand: { descriptor: "Assistent de tràmits" },
  header: { extension: "L'extensió" },
  hero: {
    title: "Quin tràmit has de fer?",
    subtitle: "Pregunta-ho amb les teves paraules. Et diem què és, què necessites i on fer-ho.",
  },
  extension: {
    eyebrow: "L'extensió",
    title: "T'acompanya dins del web oficial.",
    intro:
      "El xat t'orienta. L'extensió va un pas més enllà: et guia per la mateixa seu electrònica, pantalla a pantalla, sense fer res en nom teu.",
    steps: [
      {
        title: "Obre-la al costat de la seu",
        text: "Un panell lateral al teu navegador, al costat del web oficial: Agència Tributària, Seguretat Social, DGT…",
      },
      {
        title: "Digues-li què vols fer",
        text: "«Vull veure el meu esborrany de la renda». No cal saber com es diu el tràmit.",
      },
      {
        title: "Et porta a la pàgina correcta",
        text: "Navega per tu: segueix enllaços, obre menús i pestanyes fins a arribar al formulari.",
      },
      {
        title: "T'assenyala on escriure",
        text: "Marca cada casella amb un requadre i et diu què hi has de posar. Tu escrius, signes i presentes.",
      },
    ],
    does: {
      title: "El que fa per tu",
      items: [
        "Seguir enllaços i obrir menús o pestanyes",
        "Portar-te a la pàgina exacta del tràmit",
        "Assenyalar-te cada camp i explicar-te què hi has de posar",
      ],
    },
    never: {
      title: "El que no fa mai",
      items: [
        "Escriure les teves dades o triar opcions",
        "Signar, pagar, desar o presentar",
        "Sortir dels webs oficials que coneix",
      ],
    },
    soon: "Aviat per a Chrome i Safari",
    mock: {
      field: "DNI / NIE",
      hint: "Escriu-ho tu",
      hintText: "El teu número de DNI, amb la lletra.",
      validity: "Data de validesa",
      panelTitle: "Assistent",
      user: "Vull veure el meu esborrany de la renda",
      bot: "T'he portat a **Renta WEB**. Per entrar, escriu el teu DNI al requadre groc.",
      botNext: "Quan el tinguis, prem tu «Continuar».",
      composer: "Escriu aquí…",
    },
  },
  footer: {
    disclaimer:
      "Servei no oficial, no afiliat al Govern d'Espanya. La informació és orientativa: consulta sempre la seu electrònica abans de presentar res. Escut segons el redisseny de Samuel Mòdol i Manu Homie.",
  },
  chat: {
    suggestions: ["Com funciona l'extensió?", "Necessito el NIE", "Com faig la renda?", "M'he quedat a l'atur"],
    placeholder: "Escriu quin tràmit necessites…",
    footnote: "No s'envia res sense la teva confirmació",
    title: "Assistent de tràmits",
    reset: "Nova",
    reading: "Llegint la teva consulta…",
    consulted: (label) => `Consultat: ${label}`,
    send: "Envia",
    stop: "Atura",
    thinking: "Pensant…",
    thoughtFew: "Ha pensat uns segons",
    thoughtFor: (s) => `Ha pensat ${s} s`,
    sources: (n) => (n === 1 ? "1 font oficial" : `${n} fonts oficials`),
    tool: {
      status: {
        "approval-requested": "Esperant aprovació",
        "approval-responded": "Respost",
        "input-available": "En curs",
        "input-streaming": "Pendent",
        "output-available": "Fet",
        "output-denied": "Denegat",
        "output-error": "Error",
      },
      params: "Paràmetres",
      result: "Resultat",
      error: "Error",
    },
  },
  tools: {
    buscar_tramite: { running: "Cercant al catàleg de tràmits…", done: "Catàleg de tràmits" },
    buscar_cita: { running: "Cercant forats de cita prèvia…", done: "Cita prèvia" },
  },
  cards: {
    needs: (done, total) => `Què necessites · ${done}/${total}`,
    bookCta: "Cerca cita",
    official: "Fitxa oficial",
    askCita: (titulo) => `Cerca'm cita per a ${titulo.toLowerCase()}`,
    citaEyebrow: (titulo) => `Cita prèvia · ${titulo}`,
    confirmNote: "La confirmació final la fas tu a la seu.",
    reserveCta: "Reserva aquest forat",
    askReserve: (titulo, oficina, fecha, hora) =>
      `Reserva la cita de ${titulo.toLowerCase()} a ${oficina}, el ${fecha} a les ${hora}`,
  },
  replies: {
    extension:
      "L'extensió és un **panell lateral al teu navegador** que s'obre al costat del web oficial (Agència Tributària, Seguretat Social, DGT, SEPE, el teu ajuntament…). Funciona així:\n\n" +
      "1. **Li dius què vols fer**, amb les teves paraules: *«vull veure el meu esborrany de la renda»*.\n" +
      "2. **Et porta a la pàgina correcta**: segueix enllaços i obre menús i pestanyes per tu, només dins dels webs oficials que coneix.\n" +
      "3. **T'assenyala on escriure**: envolta cada casella amb un requadre groc i et diu què hi has de posar, per exemple *«El teu DNI, amb la lletra»*.\n" +
      "4. **Tu escrius, signes i presentes.** L'extensió mai no omple les teves dades, ni tria opcions, ni prem botons que envien, signen, paguen o desen.\n\n" +
      "Així no et perds a la seu, i tot el que es presenta ho has fet tu. Aviat estarà disponible per a Chrome i Safari.",
    estado:
      "Per veure l'estat dels **teus** expedients t'has d'identificar a **Carpeta Ciutadana** amb Cl@ve, certificat digital o DNIe: hi apareixen els tràmits oberts amb l'Administració General de l'Estat i les seves notificacions.\n\n" +
      "Si em dius quin tràmit és, t'explico en quina fase sol estar i quant triga.",
    estadoSource: "Carpeta Ciutadana",
    reserva:
      "Perfecte. T'obro la pàgina oficial de cita prèvia amb l'oficina i la data que has triat. **La reserva la confirmes tu allà**, amb les teves dades; jo no envio res en nom teu.",
    citaReasoning: (titulo) => `Busco forats lliures per a «${titulo}» a les oficines de Madrid.`,
    citaFound:
      "He trobat **3 forats**. Tria'n un i et porto a la pàgina oficial de cita prèvia; **la confirmació la fas tu**.",
    citaSource: (organismo) => `Cita prèvia · ${organismo}`,
    tramiteReasoning: (titulo, organismo) =>
      `La consulta encaixa amb «${titulo}» (${organismo}). Reviso requisits, cost i canal de presentació.`,
    tramiteText: (f) =>
      `**${f.titulo}** es gestiona amb ${f.organismo}. ${f.resumen}\n\n` +
      `Necessitaràs ${f.requisitos.length} coses; te les deixo a dalt com a llista. ` +
      "Si vols, **et busco cita** o t'explico cada pas; tu revises i signes sempre.",
    tramiteSource: (organismo) => `${organismo} · fitxa oficial`,
    fallback:
      "Puc ajudar-te a **trobar el tràmit** que necessites, dir-te **quins documents has de portar**, **buscar cita** i explicar-te **cada pas**.\n\n" +
      "Explica'm què vols fer, per exemple: *«Necessito el NIE»*, *«Com faig la renda?»* o *«M'he quedat a l'atur»*.",
  },
  nieOffices: ["Comissaria d'Aluche", "Comissaria de Moratalaz", "Oficina d'Estrangeria de Madrid"],
  tramites: {
    nie: {
      titulo: "Assignació de NIE",
      organismo: "Policia Nacional · Estrangeria",
      resumen:
        "Número d'Identitat d'Estranger, necessari per treballar, obrir un compte o signar un contracte a Espanya.",
      requisitos: [
        "Formulari EX-15 emplenat",
        "Passaport o document d'identitat i còpia",
        "Justificant del motiu (oferta de feina, matrícula, compravenda…)",
        "Justificant del pagament de la taxa 790 codi 012",
      ],
      duracion: "El mateix dia de la cita, a la majoria d'oficines",
      coste: "Taxa 790-012 (consulta l'import vigent)",
    },
    padron: {
      titulo: "Alta al padró municipal",
      organismo: "Ajuntament",
      resumen: "Inscripció al municipi on vius. Dona accés a la sanitat, l'escolarització i altres serveis.",
      requisitos: [
        "Document d'identitat (DNI, NIE o passaport)",
        "Contracte de lloguer, escriptura o autorització del titular",
        "Formulari d'inscripció de l'ajuntament",
      ],
      duracion: "Immediat a la cita; certificat en 1–7 dies",
      coste: "Gratuït",
    },
    renta: {
      titulo: "Declaració de la renda (IRPF)",
      organismo: "Agència Tributària",
      resumen:
        "Presentació anual de l'IRPF. L'esborrany es revisa i es presenta a Renta WEB amb Cl@ve, certificat o número de referència.",
      requisitos: [
        "Cl@ve, certificat digital o número de referència",
        "Dades fiscals de l'exercici",
        "IBAN per a la devolució o la domiciliació",
      ],
      duracion: "Campanya d'abril a juny",
      coste: "Gratuït",
    },
    paro: {
      titulo: "Prestació per desocupació",
      organismo: "SEPE",
      resumen:
        "Sol·licitud de la prestació contributiva després de la fi d'una relació laboral. Hi ha 15 dies hàbils per demanar-la.",
      requisitos: [
        "Inscripció com a demandant d'ocupació",
        "Certificat d'empresa (l'envia l'empresa al SEPE)",
        "Document d'identitat i número de compte",
      ],
      duracion: "Resolució en uns 15 dies hàbils",
      coste: "Gratuït",
    },
    certificado: {
      titulo: "Certificat digital de persona física",
      organismo: "FNMT-RCM",
      resumen:
        "Signatura electrònica per fer gairebé qualsevol tràmit en línia. Se sol·licita en línia i s'acredita la identitat en una oficina o per vídeo.",
      requisitos: [
        "DNI o NIE",
        "Navegador compatible per a la descàrrega",
        "Acreditació de la identitat (presencial o videoidentificació)",
      ],
      duracion: "Descàrrega després d'acreditar la identitat",
      coste: "Gratuït (presencial)",
    },
    clave: {
      titulo: "Registre a Cl@ve",
      organismo: "Govern d'Espanya",
      resumen: "Sistema d'identificació amb usuari i PIN o app per a l'Administració electrònica.",
      requisitos: ["DNI o NIE", "Telèfon mòbil", "Carta d'invitació, videotrucada o registre presencial"],
      duracion: "Immediat per videotrucada",
      coste: "Gratuït",
    },
    "vida-laboral": {
      titulo: "Informe de vida laboral",
      organismo: "Seguretat Social · Import@ss",
      resumen: "Historial d'altes i baixes a la Seguretat Social. Es descarrega a l'instant a Import@ss.",
      requisitos: ["Cl@ve, certificat digital o SMS al mòbil registrat"],
      duracion: "Immediat",
      coste: "Gratuït",
    },
    carnet: {
      titulo: "Renovació del permís de conduir",
      organismo: "DGT",
      resumen: "Renovació per caducitat. Es pot fer en un centre de reconeixement que la tramiti.",
      requisitos: ["Informe d'aptitud psicofísica", "Fotografia recent", "Pagament de la taxa"],
      duracion: "Permís provisional al moment",
      coste: "Taxa DGT 4.1 (consulta l'import vigent)",
    },
  },
};
