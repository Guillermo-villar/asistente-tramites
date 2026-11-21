import { useEffect, useState } from "react";

/**
 * Live data: the day's BOE summary from the BOE open-data API
 * (https://www.boe.es/datosabiertos/api/boe/sumario/AAAAMMDD, CORS-enabled, no key).
 * There is no BOE on Sundays or some holidays, so it walks back up to a week.
 */
export type BoeItem = { id: string; titulo: string; departamento: string; url: string };
export type BoeSumario = { fecha: string; numero: string; items: BoeItem[]; total: number };

type Raw = { identificador: string; titulo: string; url_html?: string };
type RawDep = { nombre: string; epigrafe?: { item: Raw | Raw[] } | { item: Raw | Raw[] }[]; item?: Raw | Raw[] };
type RawSec = { codigo: string; departamento?: RawDep | RawDep[] };

const arr = <T,>(x: T | T[] | undefined): T[] => (x === undefined ? [] : Array.isArray(x) ? x : [x]);
const ymd = (d: Date) =>
  `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;

export async function fetchSumario(signal?: AbortSignal): Promise<BoeSumario | null> {
  const day = new Date();
  for (let i = 0; i < 7; i++, day.setDate(day.getDate() - 1)) {
    const res = await fetch(`https://www.boe.es/datosabiertos/api/boe/sumario/${ymd(day)}`, {
      headers: { Accept: "application/json" },
      signal,
    });
    if (!res.ok) continue;
    const json = await res.json();
    const diario = json?.data?.sumario?.diario?.[0];
    if (!diario) continue;

    const secciones = arr<RawSec>(diario.seccion);
    let total = 0;
    const items: BoeItem[] = [];
    for (const sec of secciones) {
      for (const dep of arr(sec.departamento)) {
        const raws = [...arr(dep.item), ...arr(dep.epigrafe).flatMap((e) => arr(e.item))];
        total += raws.length;
        // Section I (general provisions) is what changes rules for citizens.
        if (sec.codigo === "1") {
          for (const r of raws) {
            items.push({
              id: r.identificador,
              titulo: r.titulo,
              departamento: dep.nombre,
              url: r.url_html ?? `https://www.boe.es/diario_boe/txt.php?id=${r.identificador}`,
            });
          }
        }
      }
    }
    const f = json.data.sumario.metadatos.fecha_publicacion as string;
    return {
      fecha: `${f.slice(0, 4)}-${f.slice(4, 6)}-${f.slice(6, 8)}`,
      numero: diario.numero,
      items,
      total,
    };
  }
  return null;
}

export function useBoe() {
  const [state, setState] = useState<{ data: BoeSumario | null; loading: boolean; error: boolean }>({
    data: null,
    loading: true,
    error: false,
  });
  useEffect(() => {
    const ctrl = new AbortController();
    fetchSumario(ctrl.signal)
      .then((data) => setState({ data, loading: false, error: data === null }))
      .catch((e) => {
        if ((e as Error).name !== "AbortError") setState({ data: null, loading: false, error: true });
      });
    return () => ctrl.abort();
  }, []);
  return state;
}
