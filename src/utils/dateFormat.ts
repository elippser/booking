const MONTHS_ES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
] as const;

const WEEKDAYS_ES = [
  "domingo",
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
] as const;

export function toISODateLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** "2026-03-24" o ISO full → compara solo fecha local */
export function dateOnly(iso: string): string {
  return iso.slice(0, 10);
}

export function formatLongSpanishDate(d: Date): string {
  const wd = WEEKDAYS_ES[d.getDay()];
  const day = d.getDate();
  const month = MONTHS_ES[d.getMonth()];
  const year = d.getFullYear();
  return `${wd} ${day} de ${month} de ${year}`;
}

/** Rango corto tipo "1→5 abr" */
export function formatShortStayRange(checkIn: string, checkOut: string): string {
  const a = new Date(checkIn.slice(0, 10) + "T12:00:00");
  const b = new Date(checkOut.slice(0, 10) + "T12:00:00");
  const da = a.getDate();
  const db = b.getDate();
  const ma = MONTHS_ES[a.getMonth()].slice(0, 3);
  const mb = MONTHS_ES[b.getMonth()].slice(0, 3);
  if (a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()) {
    return `${da}→${db} ${ma}`;
  }
  return `${da} ${ma} → ${db} ${mb}`;
}
