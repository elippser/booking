/**
 * Convierte un color hex a rgba para variables derivadas del acento (style-guide).
 */
export function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace(/^#/, "");
  if (!/^[0-9A-Fa-f]{6}$/.test(h)) return `rgba(47, 116, 223, ${alpha})`; // fallback #2f74df
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Normaliza un valor de acento desde la URL (con o sin #).
 */
export function parseAccentHex(value: string | null): string {
  if (!value || typeof value !== "string") return "#2f74df";
  const cleaned = value.replace(/^#/, "").trim();
  if (/^[0-9A-Fa-f]{6}$/.test(cleaned)) return `#${cleaned}`;
  if (/^[0-9A-Fa-f]{3}$/.test(cleaned)) {
    const r = parseInt(cleaned[0] + cleaned[0], 16);
    const g = parseInt(cleaned[1] + cleaned[1], 16);
    const b = parseInt(cleaned[2] + cleaned[2], 16);
    return `rgb(${r}, ${g}, ${b})`;
  }
  return "#2f74df";
}

/**
 * Calcula si el acento es claro u oscuro para --accent-contrast (texto sobre acento).
 */
function getAccentContrast(hex: string): "#ffffff" | "#0f172a" {
  const h = hex.replace(/^#/, "");
  if (h.length !== 6) return "#ffffff";
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.5 ? "#0f172a" : "#ffffff";
}

/**
 * Aplica las variables CSS de acento en el elemento raíz (document.documentElement).
 */
export function applyAccentVariables(
  element: HTMLElement,
  accentHex: string,
): void {
  const root = element.style;
  root.setProperty("--accent-color", accentHex);
  root.setProperty("--accent-soft", hexToRgba(accentHex, 0.16));
  root.setProperty("--accent-strong", hexToRgba(accentHex, 0.28));
  root.setProperty("--accent-text", "#ffffff");
  root.setProperty("--accent-contrast", getAccentContrast(accentHex));
  root.setProperty("--accent", accentHex);
  root.setProperty("--accent-hover", accentHex);
  root.setProperty("--accent-light", hexToRgba(accentHex, 0.16));
}

export type ThemeMode = "light" | "dark";

/**
 * Resuelve el tema efectivo (light/dark) desde preferencia del sistema si theme es "system".
 */
export function resolveTheme(
  themeParam: string | null,
  prefersDark: boolean,
): ThemeMode {
  const t = (themeParam ?? "system").toLowerCase();
  if (t === "light") return "light";
  if (t === "dark") return "dark";
  return prefersDark ? "dark" : "light";
}
