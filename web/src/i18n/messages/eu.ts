import type { Messages } from "./es";

/** Euskara. */
export const eu: Messages = {
  meta: { title: "OrientaT · Izapideen laguntzailea", language: "Hizkuntza" },
  brand: { descriptor: "Izapideen laguntzailea" },
  header: { extension: "Luzapena" },
  hero: {
    title: "Zer izapide egin behar duzu?",
    subtitle: "Galdetu zure hitzekin. Zer den, zer behar duzun eta non egin esango dizugu.",
  },
  extension: {
    eyebrow: "Luzapena",
    title: "Webgune ofizialaren barruan laguntzen dizu.",
    intro:
      "Txatak orientatu egiten zaitu. Luzapenak urrats bat haratago egiten du: egoitza elektronikoan bertan gidatzen zaitu, pantailaz pantaila, zure izenean ezer egin gabe.",
    steps: [
      {
        title: "Ireki egoitzaren ondoan",
        text: "Alboko panel bat zure nabigatzailean, webgune ofizialaren ondoan: Zerga Agentzia, Gizarte Segurantza, DGT…",
      },
      {
        title: "Esan zer egin nahi duzun",
        text: "«Nire errentaren zirriborroa ikusi nahi dut». Ez duzu izapidearen izena jakin beharrik.",
      },
      {
        title: "Orri egokira eramaten zaitu",
        text: "Zure ordez nabigatzen du: estekei jarraitzen die, eta menuak eta fitxak irekitzen ditu formulariora iritsi arte.",
      },
      {
        title: "Non idatzi erakusten dizu",
        text: "Eremu bakoitza lauki batekin markatzen du eta zer jarri esaten dizu. Zuk idazten, sinatzen eta aurkezten duzu.",
      },
    ],
    does: {
      title: "Zure ordez egiten duena",
      items: [
        "Estekei jarraitu eta menuak edo fitxak ireki",
        "Izapidearen orri zehatzera eraman",
        "Eremu bakoitza erakutsi eta zer jarri azaldu",
      ],
    },
    never: {
      title: "Inoiz egiten ez duena",
      items: [
        "Zure datuak idatzi edo aukerak hautatu",
        "Sinatu, ordaindu, gorde edo aurkeztu",
        "Ezagutzen dituen webgune ofizialetatik irten",
      ],
    },
    soon: "Laster Chrome eta Safarirako",
    mock: {
      field: "DNI / NIE",
      hint: "Zuk idatzi",
      hintText: "Zure NAN zenbakia, letrarekin.",
      validity: "Baliozkotasun-data",
      panelTitle: "Laguntzailea",
      user: "Nire errentaren zirriborroa ikusi nahi dut",
      bot: "**Renta WEB** zerbitzura eraman zaitut. Sartzeko, idatzi zure NANa lauki horian.",
      botNext: "Idatzita duzunean, sakatu zuk «Continuar».",
      composer: "Idatzi hemen…",
    },
  },
  footer: {
    disclaimer:
      "Zerbitzu ez-ofiziala, Espainiako Gobernuarekin loturarik gabea. Informazioa orientagarria da: aurkeztu aurretik, kontsultatu beti egoitza elektronikoa. Armarria, Samuel Mòdol eta Manu Homieren birdiseinuaren arabera.",
  },
  chat: {
    suggestions: ["Nola funtzionatzen du luzapenak?", "NIEa behar dut", "Nola egin errenta-aitorpena?", "Langabezian geratu naiz"],
    placeholder: "Idatzi zer izapide behar duzun…",
    footnote: "Ez da ezer bidaltzen zuk berretsi gabe",
    title: "Izapideen laguntzailea",
    reset: "Berria",
    reading: "Zure kontsulta irakurtzen…",
    consulted: (label) => `Kontsultatua: ${label}`,
    send: "Bidali",
    stop: "Gelditu",
    thinking: "Pentsatzen…",
    thoughtFew: "Segundo batzuez pentsatu du",
    thoughtFor: (s) => `${s} s pentsatu du`,
    sources: (n) => (n === 1 ? "Iturri ofizial 1" : `${n} iturri ofizial`),
    tool: {
      status: {
        "approval-requested": "Onarpenaren zain",
        "approval-responded": "Erantzunda",
        "input-available": "Abian",
        "input-streaming": "Zain",
        "output-available": "Eginda",
        "output-denied": "Ukatuta",
        "output-error": "Errorea",
      },
      params: "Parametroak",
      result: "Emaitza",
      error: "Errorea",
    },
  },
  tools: {
    buscar_tramite: { running: "Izapideen katalogoan bilatzen…", done: "Izapideen katalogoa" },
    buscar_cita: { running: "Aurretiko hitzorduetarako hutsuneak bilatzen…", done: "Aurretiko hitzordua" },
  },
  cards: {
    needs: (done, total) => `Zer behar duzun · ${done}/${total}`,
    bookCta: "Bilatu hitzordua",
    official: "Fitxa ofiziala",
    askCita: (titulo) => `Bilatu hitzordua niretzat: ${titulo}`,
    citaEyebrow: (titulo) => `Aurretiko hitzordua · ${titulo}`,
    confirmNote: "Azken berrespena zuk egiten duzu egoitzan.",
    reserveCta: "Erreserbatu hutsune hau",
    askReserve: (titulo, oficina, fecha, hora) => `Erreserbatu hitzordua (${titulo}): ${oficina}, ${fecha}, ${hora}`,
  },
  replies: {
    extension:
      "Luzapena **zure nabigatzaileko alboko panel bat** da, webgune ofizialaren ondoan irekitzen dena (Zerga Agentzia, Gizarte Segurantza, DGT, SEPE, zure udala…). Honela funtzionatzen du:\n\n" +
      "1. **Zer egin nahi duzun esaten diozu**, zure hitzekin: *«nire errentaren zirriborroa ikusi nahi dut»*.\n" +
      "2. **Orri egokira eramaten zaitu**: estekei jarraitzen die, eta menuak eta fitxak irekitzen ditu zure ordez, ezagutzen dituen webgune ofizialen barruan bakarrik.\n" +
      "3. **Non idatzi erakusten dizu**: eremu bakoitza lauki hori batekin inguratzen du eta zer jarri esaten dizu, adibidez *«Zure NANa, letrarekin»*.\n" +
      "4. **Zuk idazten, sinatzen eta aurkezten duzu.** Luzapenak ez ditu inoiz zure datuak betetzen, ez du aukerarik hautatzen, eta ez du bidaltzeko, sinatzeko, ordaintzeko edo gordetzeko botoirik sakatzen.\n\n" +
      "Horrela ez zara egoitzan galtzen, eta aurkezten den guztia zuk egin duzu. Laster egongo da eskuragarri Chrome eta Safarirako.",
    estado:
      "**Zure** espedienteen egoera ikusteko, **Herritarren Karpetan** identifikatu behar duzu Cl@ve, ziurtagiri digitala edo NANe erabiliz: han agertzen dira Estatuko Administrazio Orokorrarekin irekita dituzun izapideak eta haien jakinarazpenak.\n\n" +
      "Zer izapide den esaten badidazu, zer fasetan egon ohi den eta zenbat irauten duen azalduko dizut.",
    estadoSource: "Herritarren Karpeta",
    reserva:
      "Ederki. Aurretiko hitzorduaren orri ofiziala irekiko dizut, aukeratu duzun bulegoarekin eta datarekin. **Erreserba zuk berresten duzu han**, zure datuekin; nik ez dut ezer bidaltzen zure izenean.",
    citaReasoning: (titulo) => `«${titulo}» izapiderako hutsune libreak bilatzen ditut Madrilgo bulegoetan.`,
    citaFound:
      "**3 hutsune** aurkitu ditut. Aukeratu bat eta aurretiko hitzorduaren orri ofizialera eramango zaitut; **berrespena zuk egiten duzu**.",
    citaSource: (organismo) => `Aurretiko hitzordua · ${organismo}`,
    tramiteReasoning: (titulo, organismo) =>
      `Kontsulta «${titulo}» izapidearekin bat dator (${organismo}). Baldintzak, kostua eta aurkezteko bidea berrikusten ditut.`,
    tramiteText: (f) =>
      `**${f.titulo}**: ${f.organismo} arduratzen da. ${f.resumen}\n\n` +
      `${f.requisitos.length} gauza beharko dituzu; goian utzi dizkizut zerrenda gisa. ` +
      "Nahi baduzu, **hitzordua bilatuko dizut** edo urrats bakoitza azalduko dizut; zuk berrikusten eta sinatzen duzu beti.",
    tramiteSource: (organismo) => `${organismo} · fitxa ofiziala`,
    fallback:
      "**Behar duzun izapidea aurkitzen**, **zer dokumentu eraman** esaten, **hitzordua bilatzen** eta **urrats bakoitza** azaltzen lagun diezazuket.\n\n" +
      "Kontatu zer egin nahi duzun, adibidez: *«NIEa behar dut»*, *«Nola egin errenta-aitorpena?»* edo *«Langabezian geratu naiz»*.",
  },
  nieOffices: ["Alucheko komisaria", "Moratalazko komisaria", "Madrilgo Atzerritarren Bulegoa"],
  tramites: {
    nie: {
      titulo: "NIEaren esleipena",
      organismo: "Polizia Nazionala · Atzerritartasuna",
      resumen:
        "Atzerritarraren Identifikazio Zenbakia, Espainian lan egiteko, kontu bat irekitzeko edo kontratu bat sinatzeko beharrezkoa.",
      requisitos: [
        "EX-15 formularioa beteta",
        "Pasaportea edo nortasun-agiria, eta kopia",
        "Arrazoiaren egiaztagiria (lan-eskaintza, matrikula, salerosketa…)",
        "790 tasaren (012 kodea) ordainagiria",
      ],
      duracion: "Hitzorduaren egunean bertan, bulego gehienetan",
      coste: "790-012 tasa (kontsultatu indarreko zenbatekoa)",
    },
    padron: {
      titulo: "Udal erroldan alta ematea",
      organismo: "Udala",
      resumen:
        "Bizi zaren udalerrian izena ematea. Osasun-laguntzarako, eskolatzerako eta beste zerbitzu batzuetarako sarbidea ematen du.",
      requisitos: [
        "Nortasun-agiria (NAN, NIE edo pasaportea)",
        "Alokairu-kontratua, eskritura edo titularraren baimena",
        "Udalaren inskripzio-formularioa",
      ],
      duracion: "Berehala hitzorduan; ziurtagiria 1–7 egunean",
      coste: "Doan",
    },
    renta: {
      titulo: "Errenta-aitorpena (PFEZ)",
      organismo: "Zerga Agentzia",
      resumen:
        "PFEZaren urteko aurkezpena. Zirriborroa Renta WEB zerbitzuan berrikusten eta aurkezten da, Cl@ve, ziurtagiri edo erreferentzia-zenbakiarekin.",
      requisitos: [
        "Cl@ve, ziurtagiri digitala edo erreferentzia-zenbakia",
        "Ekitaldiko datu fiskalak",
        "IBANa, itzulketarako edo helbideratzeko",
      ],
      duracion: "Kanpaina apiriletik ekainera",
      coste: "Doan",
    },
    paro: {
      titulo: "Langabezia-prestazioa",
      organismo: "SEPE",
      resumen:
        "Kotizaziopeko prestazioaren eskaera, lan-harreman bat amaitu ondoren. 15 egun balioduneko epea dago eskatzeko.",
      requisitos: [
        "Enplegu-eskatzaile gisa izena ematea",
        "Enpresaren ziurtagiria (enpresak bidaltzen dio SEPEri)",
        "Nortasun-agiria eta kontu-zenbakia",
      ],
      duracion: "Ebazpena 15 egun baliodun ingurutan",
      coste: "Doan",
    },
    certificado: {
      titulo: "Pertsona fisikoaren ziurtagiri digitala",
      organismo: "FNMT-RCM",
      resumen:
        "Sinadura elektronikoa, ia edozein izapide sarean egiteko. Sarean eskatzen da, eta nortasuna bulego batean edo bideo bidez egiaztatzen da.",
      requisitos: [
        "NAN edo NIE",
        "Deskargarako nabigatzaile bateragarria",
        "Nortasunaren egiaztapena (aurrez aurre edo bideo-identifikazioa)",
      ],
      duracion: "Deskarga, nortasuna egiaztatu ondoren",
      coste: "Doan (aurrez aurre)",
    },
    clave: {
      titulo: "Cl@ve sisteman erregistratzea",
      organismo: "Espainiako Gobernua",
      resumen: "Administrazio elektronikorako identifikazio-sistema, erabiltzailearekin eta PINarekin edo aplikazioarekin.",
      requisitos: ["NAN edo NIE", "Telefono mugikorra", "Gonbidapen-gutuna, bideodeia edo aurrez aurreko erregistroa"],
      duracion: "Berehala, bideodei bidez",
      coste: "Doan",
    },
    "vida-laboral": {
      titulo: "Lan-bizitzaren txostena",
      organismo: "Gizarte Segurantza · Import@ss",
      resumen: "Gizarte Segurantzako alten eta bajen historia. Import@ss zerbitzuan berehala deskargatzen da.",
      requisitos: ["Cl@ve, ziurtagiri digitala edo SMSa erregistratutako mugikorrera"],
      duracion: "Berehala",
      coste: "Doan",
    },
    carnet: {
      titulo: "Gidabaimena berritzea",
      organismo: "DGT",
      resumen: "Iraungitzeagatiko berritzea. Izapidetzen duen azterketa-zentro batean egin daiteke.",
      requisitos: ["Gaitasun psikofisikoaren txostena", "Argazki berria", "Tasa ordaintzea"],
      duracion: "Behin-behineko baimena unean bertan",
      coste: "DGTren 4.1 tasa (kontsultatu indarreko zenbatekoa)",
    },
  },
};
