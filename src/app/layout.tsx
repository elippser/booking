import type { Metadata } from "next";
import { Suspense } from "react";
import AppShell from "@/components/shared/AppShell/AppShell";
import ThemeProvider from "@/components/theme/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Elippser PMS - Reservas",
  description: "Gestión de reservas para propiedades",
};

const themeScript = `
(function() {
  var q = new URLSearchParams(typeof location !== 'undefined' ? location.search : '');
  var theme = (q.get('theme') || 'system').toLowerCase();
  var accent = (q.get('accent') || '').trim().replace(/^#/, '');
  var mode = theme === 'light' ? 'light' : theme === 'dark' ? 'dark' : (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  var root = document.documentElement;
  root.classList.remove('app-theme-light', 'app-theme-dark');
  root.classList.add('app-theme-' + mode);
  root.setAttribute('data-app-theme-mode', mode);
  if (accent && /^[0-9A-Fa-f]{6}$/.test(accent)) {
    var r = parseInt(accent.slice(0,2), 16), g = parseInt(accent.slice(2,4), 16), b = parseInt(accent.slice(4,6), 16);
    var hex = '#' + accent;
    root.style.setProperty('--accent-color', hex);
    root.style.setProperty('--accent-soft', 'rgba(' + r + ',' + g + ',' + b + ',0.16)');
    root.style.setProperty('--accent-strong', 'rgba(' + r + ',' + g + ',' + b + ',0.28)');
    root.style.setProperty('--accent-text', '#ffffff');
    root.style.setProperty('--accent-contrast', (0.2126*r/255 + 0.7152*g/255 + 0.0722*b/255 > 0.5 ? '#0f172a' : '#ffffff'));
    root.style.setProperty('--accent', hex);
    root.style.setProperty('--accent-hover', hex);
    root.style.setProperty('--accent-light', 'rgba(' + r + ',' + g + ',' + b + ',0.16)');
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <Suspense fallback={null}>
          <ThemeProvider>
            <AppShell>{children}</AppShell>
          </ThemeProvider>
        </Suspense>
      </body>
    </html>
  );
}
