/**
 * Persistencia del contexto PMS cuando la app corre embebida (iframe desde pms-core).
 * Evita perder token / companyId / propertyId si el router de Next no reenvía query en alguna navegación.
 */

const PREFIX = "elippser_pms_embed_";

const KEYS = {
  token: `${PREFIX}token`,
  companyId: `${PREFIX}companyId`,
  propertyId: `${PREFIX}propertyId`,
  spaceId: `${PREFIX}spaceId`,
  theme: `${PREFIX}theme`,
  accent: `${PREFIX}accent`,
} as const;

export interface EmbedSnapshot {
  token: string;
  companyId: string;
  propertyId: string;
  spaceId: string;
  theme: string;
  accent: string;
}

export function emptyEmbed(): EmbedSnapshot {
  return {
    token: "",
    companyId: "",
    propertyId: "",
    spaceId: "",
    theme: "",
    accent: "",
  };
}

export function readEmbedFromStorage(): EmbedSnapshot {
  if (typeof window === "undefined") return emptyEmbed();
  return {
    token: sessionStorage.getItem(KEYS.token) ?? "",
    companyId: sessionStorage.getItem(KEYS.companyId) ?? "",
    propertyId: sessionStorage.getItem(KEYS.propertyId) ?? "",
    spaceId: sessionStorage.getItem(KEYS.spaceId) ?? "",
    theme: sessionStorage.getItem(KEYS.theme) ?? "",
    accent: sessionStorage.getItem(KEYS.accent) ?? "",
  };
}

/** Guarda en sessionStorage cualquier valor presente en la query (sobreescribe). */
export function persistEmbedFromSearchParams(params: {
  get: (k: string) => string | null;
}): void {
  if (typeof window === "undefined") return;
  const t = params.get("token");
  if (t) sessionStorage.setItem(KEYS.token, t);
  const c = params.get("companyId");
  if (c) sessionStorage.setItem(KEYS.companyId, c);
  const p = params.get("propertyId");
  if (p) sessionStorage.setItem(KEYS.propertyId, p);
  const s = params.get("spaceId");
  if (s) sessionStorage.setItem(KEYS.spaceId, s);
  const th = params.get("theme");
  if (th) sessionStorage.setItem(KEYS.theme, th);
  const a = params.get("accent");
  if (a) sessionStorage.setItem(KEYS.accent, a);
}

export function mergeEmbed(
  url: EmbedSnapshot,
  stored: EmbedSnapshot,
): EmbedSnapshot {
  return {
    token: url.token || stored.token,
    companyId: url.companyId || stored.companyId,
    propertyId: url.propertyId || stored.propertyId,
    spaceId: url.spaceId || stored.spaceId,
    theme: url.theme || stored.theme,
    accent: url.accent || stored.accent,
  };
}

export function snapshotFromSearchParams(params: {
  get: (k: string) => string | null;
}): EmbedSnapshot {
  return {
    token: params.get("token") ?? "",
    companyId: params.get("companyId") ?? "",
    propertyId: params.get("propertyId") ?? "",
    spaceId: params.get("spaceId") ?? "",
    theme: params.get("theme") ?? "",
    accent: params.get("accent") ?? "",
  };
}
