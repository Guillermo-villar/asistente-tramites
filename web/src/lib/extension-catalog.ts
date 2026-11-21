import { RAW_PLUGINS } from "../../../plugins/index";

/**
 * What the browser extension can guide, read straight from its site maps (plugins/*.json at the
 * repo root, the same files the extension loads). Add a map there and the web knows about it.
 * Types mirror the parts of src/plugins/schema.ts the web uses.
 */
export type LoginMethod =
  | "clave"
  | "clave_pin"
  | "clave_permanente"
  | "certificado"
  | "dnie"
  | "referencia"
  | "sms"
  | "sin_identificacion";

export type MapStep = { title: string; url?: string; guidance: string; person_does?: string };

export type MapProcedure = {
  id: string;
  title: string;
  summary: string;
  keywords: string[];
  entry_url: string;
  login: LoginMethod[];
  steps: MapStep[];
  you_need?: string[];
};

export type SiteMap = {
  id: string;
  name: string;
  authority: string;
  status: "verified" | "draft";
  domains: string[];
  home: string;
  procedures: MapProcedure[];
};

export const siteMaps = RAW_PLUGINS as SiteMap[];

export const loginLabel: Record<LoginMethod, string> = {
  clave: "Cl@ve",
  clave_pin: "Cl@ve PIN",
  clave_permanente: "Cl@ve permanente",
  certificado: "certificado digital",
  dnie: "DNIe",
  referencia: "número de referencia",
  sms: "SMS",
  sin_identificacion: "sin identificarte",
};

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9@ ]/g, " ");

/**
 * The procedure whose keywords best match `text`. A keyword matches when all its words appear in the
 * text, so "búscame cita para el dni" matches "cita dni"; longer keywords win.
 */
export function findProcedure(text: string): { site: SiteMap; procedure: MapProcedure } | undefined {
  const words = new Set(norm(text).split(/\s+/).filter(Boolean));
  let best: { site: SiteMap; procedure: MapProcedure; score: number } | undefined;
  for (const site of siteMaps) {
    for (const procedure of site.procedures) {
      for (const k of [...procedure.keywords, procedure.title]) {
        const kw = norm(k).split(/\s+/).filter((w) => w.length > 1);
        if (kw.length && kw.every((w) => words.has(w)) && (!best || kw.length > best.score)) {
          best = { site, procedure, score: kw.length };
        }
      }
    }
  }
  return best && { site: best.site, procedure: best.procedure };
}

/** The plan the web shows for doing a procedure with the extension. */
export type ExtensionPlan = {
  sitio: string;
  organismo: string;
  borrador: boolean;
  tramite: string;
  resumen: string;
  url: string;
  acceso: string[];
  necesitas: string[];
  pasos: { titulo: string; extension: string; tu: string | null }[];
  frase: string;
};

export function planFor(site: SiteMap, p: MapProcedure): ExtensionPlan {
  return {
    sitio: site.name,
    organismo: site.authority,
    borrador: site.status === "draft",
    tramite: p.title,
    resumen: p.summary,
    url: p.entry_url,
    acceso: p.login.map((l) => loginLabel[l]),
    necesitas: p.you_need ?? [],
    pasos: p.steps.map((s) => ({
      titulo: s.title,
      // The map's guidance is written for the assistant; the person gets what that means for them.
      extension: s.person_does
        ? "Te lleva a esta pantalla, te explica qué es cada cosa y señala con un recuadro dónde actuar."
        : "Lo hace por ti: navega hasta la información, la lee y te la explica.",
      tu: s.person_does ?? null,
    })),
    frase: p.title,
  };
}

/** Every procedure the extension knows, for the "what it can do" list. */
export const extensionProcedures = siteMaps.flatMap((site) =>
  site.procedures.map((procedure) => ({ site, procedure }))
);
