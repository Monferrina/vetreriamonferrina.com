// Chiusure straordinarie della vetreria (ferie, festività): src/data/chiusure.json.
// Le date sono stringhe AAAA-MM-GG del calendario italiano, confrontate come stringhe: con un
// Date locale il fuso del browser sposterebbe il giorno a cavallo della mezzanotte.
export interface Chiusura {
  dal: string;
  al: string;
  motivo: string;
}

// Giorni prima dell'inizio in cui compare l'avviso (scelta di Marco, 14/10/2026).
const PREAVVISO_GIORNI = 14;

function menoGiorni(data: string, giorni: number): string {
  const [a, m, g] = data.split('-').map(Number);
  return new Date(Date.UTC(a, m - 1, g - giorni)).toISOString().slice(0, 10);
}

// Le chiusure da annunciare oggi, tutte: dal preavviso fino all'ultimo giorno compreso. Generica
// sulle sole date, così lo script del browser le passa insieme all'elemento da mostrare.
export function chiusureDaMostrare<T extends Pick<Chiusura, 'dal' | 'al'>>(
  chiusure: T[],
  oggi: string
): T[] {
  return chiusure.filter((c) => menoGiorni(c.dal, PREAVVISO_GIORNI) <= oggi && oggi <= c.al);
}

// Oggi nel calendario italiano, come AAAA-MM-GG (il formato di 'sv-SE').
export const oggiInItalia = (adesso = new Date()) =>
  new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Rome' }).format(adesso);
