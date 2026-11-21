import type { Messages } from "./es";

/** English. */
export const en: Messages = {
  meta: { title: "OrientaT · Procedures assistant", language: "Language" },
  brand: { descriptor: "Procedures assistant" },
  header: { extension: "The extension" },
  hero: {
    title: "Which procedure do you need to do?",
    subtitle: "Ask in your own words. We'll tell you what it is, what you need and where to do it.",
  },
  extension: {
    eyebrow: "The extension",
    title: "It walks you through the official website.",
    intro:
      "The chat points you in the right direction. The extension goes one step further: it guides you through the official e-government site itself, screen by screen, without doing anything on your behalf.",
    steps: [
      {
        title: "Open it next to the official site",
        text: "A side panel in your browser, next to the official website: Tax Agency, Social Security, DGT…",
      },
      {
        title: "Tell it what you want to do",
        text: "“I want to see my tax return draft”. You don't need to know what the procedure is called.",
      },
      {
        title: "It takes you to the right page",
        text: "It navigates for you: it follows links and opens menus and tabs until it reaches the form.",
      },
      {
        title: "It shows you where to type",
        text: "It marks each field with a box and tells you what to enter. You type, sign and submit.",
      },
    ],
    does: {
      title: "What it does for you",
      items: [
        "Follow links and open menus or tabs",
        "Take you to the exact page for the procedure",
        "Point out each field and explain what to enter",
      ],
    },
    never: {
      title: "What it never does",
      items: [
        "Type your details or choose options",
        "Sign, pay, save or submit",
        "Leave the official websites it knows",
      ],
    },
    soon: "Coming soon for Chrome and Safari",
    mock: {
      field: "DNI / NIE",
      hint: "You type",
      hintText: "Your DNI number, with the letter.",
      validity: "Expiry date",
      panelTitle: "Assistant",
      user: "I want to see my tax return draft",
      bot: "I've taken you to **Renta WEB**. To sign in, type your DNI in the yellow box.",
      botNext: "Once it's in, press “Continuar” yourself.",
      composer: "Type here…",
    },
  },
  footer: {
    disclaimer:
      "Unofficial service, not affiliated with the Government of Spain. The information is for guidance only: always check the official e-government site before submitting anything. Coat of arms based on the redesign by Samuel Mòdol and Manu Homie.",
  },
  chat: {
    suggestions: ["How does the extension work?", "I need an NIE", "How do I file my tax return?", "I've lost my job"],
    placeholder: "Type the procedure you need…",
    footnote: "Nothing is sent without your confirmation",
    title: "Procedures assistant",
    reset: "New",
    reading: "Reading your question…",
    consulted: (label) => `Checked: ${label}`,
    send: "Send",
    stop: "Stop",
    thinking: "Thinking…",
    thoughtFew: "Thought for a few seconds",
    thoughtFor: (s) => `Thought for ${s} s`,
    sources: (n) => (n === 1 ? "1 official source" : `${n} official sources`),
    tool: {
      status: {
        "approval-requested": "Awaiting approval",
        "approval-responded": "Responded",
        "input-available": "Running",
        "input-streaming": "Pending",
        "output-available": "Done",
        "output-denied": "Denied",
        "output-error": "Error",
      },
      params: "Parameters",
      result: "Result",
      error: "Error",
    },
  },
  tools: {
    buscar_tramite: { running: "Searching the procedures catalogue…", done: "Procedures catalogue" },
    buscar_cita: { running: "Looking for appointment slots…", done: "Appointments" },
  },
  cards: {
    needs: (done, total) => `What you need · ${done}/${total}`,
    bookCta: "Find an appointment",
    official: "Official page",
    askCita: (titulo) => `Find me an appointment for: ${titulo}`,
    citaEyebrow: (titulo) => `Appointment · ${titulo}`,
    confirmNote: "You make the final confirmation on the official site.",
    reserveCta: "Book this slot",
    askReserve: (titulo, oficina, fecha, hora) => `Book the appointment (${titulo}) at ${oficina} on ${fecha} at ${hora}`,
  },
  replies: {
    extension:
      "The extension is a **side panel in your browser** that opens next to the official website (Tax Agency, Social Security, DGT, SEPE, your town hall…). Here's how it works:\n\n" +
      "1. **You tell it what you want to do**, in your own words: *“I want to see my tax return draft”*.\n" +
      "2. **It takes you to the right page**: it follows links and opens menus and tabs for you, only within the official websites it knows.\n" +
      "3. **It shows you where to type**: it draws a yellow box around each field and tells you what to enter, for example *“Your DNI, with the letter”*.\n" +
      "4. **You type, sign and submit.** The extension never fills in your details, picks options or presses buttons that send, sign, pay or save.\n\n" +
      "That way you don't get lost on the official site, and everything submitted was done by you. It will be available soon for Chrome and Safari.",
    estado:
      "To see the status of **your** cases you need to sign in to **Carpeta Ciudadana** with Cl@ve, a digital certificate or your electronic DNI: it lists your open procedures with the central government and their notifications.\n\n" +
      "If you tell me which procedure it is, I'll explain what stage it's usually at and how long it takes.",
    estadoSource: "Carpeta Ciudadana",
    reserva:
      "Great. I'll open the official appointment page with the office and date you chose. **You confirm the booking there**, with your details; I don't send anything on your behalf.",
    citaReasoning: (titulo) => `Looking for free slots for “${titulo}” at offices in Madrid.`,
    citaFound:
      "I found **3 slots**. Pick one and I'll take you to the official appointment page; **you make the confirmation**.",
    citaSource: (organismo) => `Appointments · ${organismo}`,
    tramiteReasoning: (titulo, organismo) =>
      `The question matches “${titulo}” (${organismo}). Checking requirements, cost and how to apply.`,
    tramiteText: (f) =>
      `**${f.titulo}** is handled by ${f.organismo}. ${f.resumen}\n\n` +
      `You'll need ${f.requisitos.length} things; I've listed them above. ` +
      "If you like, **I can find you an appointment** or walk you through each step; you always review and sign.",
    tramiteSource: (organismo) => `${organismo} · official page`,
    fallback:
      "I can help you **find the procedure** you need, tell you **which documents to bring**, **find an appointment** and explain **each step**.\n\n" +
      "Tell me what you want to do, for example: *“I need an NIE”*, *“How do I file my tax return?”* or *“I've lost my job”*.",
  },
  nieOffices: ["Aluche police station", "Moratalaz police station", "Madrid Immigration Office"],
  tramites: {
    nie: {
      titulo: "NIE assignment",
      organismo: "National Police · Immigration",
      resumen: "Foreigner Identity Number, needed to work, open a bank account or sign a contract in Spain.",
      requisitos: [
        "Completed EX-15 form",
        "Passport or ID document, plus a copy",
        "Proof of the reason (job offer, enrolment, property purchase…)",
        "Proof of payment of fee 790, code 012",
      ],
      duracion: "On the day of the appointment, at most offices",
      coste: "Fee 790-012 (check the current amount)",
    },
    padron: {
      titulo: "Registering on the municipal census (padrón)",
      organismo: "Town hall",
      resumen: "Registration in the municipality where you live. It gives access to healthcare, schooling and other services.",
      requisitos: [
        "ID document (DNI, NIE or passport)",
        "Rental contract, title deed or the owner's authorisation",
        "The town hall's registration form",
      ],
      duracion: "Immediate at the appointment; certificate in 1–7 days",
      coste: "Free",
    },
    renta: {
      titulo: "Income tax return (IRPF)",
      organismo: "Tax Agency",
      resumen:
        "Annual IRPF filing. The draft is reviewed and filed in Renta WEB with Cl@ve, a certificate or a reference number.",
      requisitos: [
        "Cl@ve, digital certificate or reference number",
        "Tax data for the year",
        "IBAN for the refund or direct debit",
      ],
      duracion: "Campaign from April to June",
      coste: "Free",
    },
    paro: {
      titulo: "Unemployment benefit",
      organismo: "SEPE",
      resumen: "Application for contributory benefit after a job ends. You have 15 working days to apply.",
      requisitos: [
        "Registration as a jobseeker",
        "Company certificate (the employer sends it to SEPE)",
        "ID document and bank account number",
      ],
      duracion: "Decision in about 15 working days",
      coste: "Free",
    },
    certificado: {
      titulo: "Digital certificate for individuals",
      organismo: "FNMT-RCM",
      resumen:
        "An electronic signature for doing almost any procedure online. You apply online and verify your identity at an office or by video.",
      requisitos: [
        "DNI or NIE",
        "A compatible browser for the download",
        "Identity verification (in person or by video)",
      ],
      duracion: "Download after verifying your identity",
      coste: "Free (in person)",
    },
    clave: {
      titulo: "Registering for Cl@ve",
      organismo: "Government of Spain",
      resumen: "Identification system for e-government, with a username and PIN or an app.",
      requisitos: ["DNI or NIE", "Mobile phone", "Invitation letter, video call or in-person registration"],
      duracion: "Immediate by video call",
      coste: "Free",
    },
    "vida-laboral": {
      titulo: "Employment history report (vida laboral)",
      organismo: "Social Security · Import@ss",
      resumen: "Record of your registrations and terminations with Social Security. Downloaded instantly from Import@ss.",
      requisitos: ["Cl@ve, digital certificate or SMS to your registered mobile"],
      duracion: "Immediate",
      coste: "Free",
    },
    carnet: {
      titulo: "Driving licence renewal",
      organismo: "DGT",
      resumen: "Renewal on expiry. It can be done at a medical test centre that handles the paperwork.",
      requisitos: ["Fitness-to-drive medical report", "Recent photo", "Payment of the fee"],
      duracion: "Temporary licence on the spot",
      coste: "DGT fee 4.1 (check the current amount)",
    },
  },
};
