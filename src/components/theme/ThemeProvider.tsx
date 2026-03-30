"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import {
  applyAccentVariables,
  parseAccentHex,
  resolveTheme,
} from "@/utils/themeUtils";

/**
 * Lee theme y accent de la URL (para iframe desde el PMS) y aplica
 * clase + data-app-theme-mode en <html> y variables de acento en la raíz.
 * Parámetros esperados:
 *   - theme: "light" | "dark" | "system" (default: system)
 *   - accent: hex con o sin # (default: #2f74df)
 */
export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const themeParam = searchParams.get("theme");
    const accentParam = searchParams.get("accent");
    const prefersDark =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    const mode = resolveTheme(themeParam, prefersDark);

    const root = document.documentElement;

    root.classList.remove("app-theme-light", "app-theme-dark");
    root.classList.add(`app-theme-${mode}`);
    root.setAttribute("data-app-theme-mode", mode);

    const accentHex = parseAccentHex(accentParam);
    applyAccentVariables(root, accentHex);
  }, [searchParams]);

  useEffect(() => {
    const themeParam = searchParams.get("theme")?.toLowerCase();
    if (themeParam !== "system") return;

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const mode = mq.matches ? "dark" : "light";
      const root = document.documentElement;
      root.classList.remove("app-theme-light", "app-theme-dark");
      root.classList.add(`app-theme-${mode}`);
      root.setAttribute("data-app-theme-mode", mode);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [searchParams]);

  return <>{children}</>;
}
