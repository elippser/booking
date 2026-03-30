# Guía de diseño — Plataforma PMS (Elippser)

Esta guía define el sistema de diseño de la aplicación para mantener consistencia al integrar microservicios u otras apps. Usa estas variables, clases y convenciones en otros repos para replicar los estilos.

---

## 1. Resumen

- **Tema:** claro / oscuro / sistema (según preferencia del SO).
- **Color de acento:** configurable por workspace/dashboard; por defecto `#2f74df`.
- **Aplicación:** clase en la raíz del documento (`<html>`) + variables CSS en `:root` / `document.documentElement`.

---

## 2. Sistema de temas (Light / Dark)

### 2.1 Modos

| Modo     | Descripción |
|----------|-------------|
| `light`  | Tema claro fijo. |
| `dark`   | Tema oscuro fijo. |
| `system` | Sigue `prefers-color-scheme` del sistema. |

### 2.2 Cómo se aplica

- Se añade **una sola clase** en el elemento raíz (`<html>`):
  - **Tema claro:** `app-theme-light`
  - **Tema oscuro:** `app-theme-dark`
- Además se setea el atributo **`data-app-theme-mode`** en la raíz con valor `"light"` o `"dark"` (valor efectivo tras resolver `system`).

En otro repo, para replicar:

```html
<html class="app-theme-light" data-app-theme-mode="light">
<!-- o -->
<html class="app-theme-dark" data-app-theme-mode="dark">
```

Los estilos que dependen del tema deben usar el selector global:

```css
/* Solo tema claro */
:global(.app-theme-light) .miComponente { ... }

/* Solo tema oscuro */
:global(.app-theme-dark) .miComponente { ... }

/* Atributo (por si se prefiere) */
[data-app-theme-mode="dark"] .miComponente { ... }
```

### 2.3 Colores por tema

Variables que la app define en la raíz según tema (además del acento):

| Variable | Light | Dark |
|----------|--------|------|
| `--app-surface` | `rgba(255, 255, 255, 0.88)` | `rgba(20, 20, 25, 0.85)` |
| `--app-surface-glow` | `0px 8px 20px rgba(0, 0, 0, 0.14)` | `0px 10px 22px rgba(0, 0, 0, 0.35)` |
| `--app-surface-border` | `rgba(0, 0, 0, 0.06)` | `rgba(255, 255, 255, 0.12)` |
| `--app-surface-overlay` | `inset 0 1px 0 0 rgba(255, 255, 255, 0.65), inset 0 0 0 1px rgba(255, 255, 255, 0.32)` | `inset 0 1px 0 0 rgba(255, 255, 255, 0.06), inset 0 0 0 1px rgba(255, 255, 255, 0.08)` |

Fondo global (opcional):

- `--app-bg-color`: color sólido de fondo (p. ej. `transparent` o `#f3f4f6`).
- `--app-bg-image`: imagen de fondo (p. ej. `none` o `url('...')`).

Contenedor de contenido (área principal):

- **Light:** clase `contentShellLight`: fondo `#ffffffad`, borde superior `#ededed`, texto implícito oscuro.
- **Dark:** clase `contentShellDark`: fondo `#000000bf`, borde superior `#202020cf`, texto `#cbd5e1`.

Cards en contenido:

- **Light:** fondo `#cacaca7d`, borde `#c8c8c8`, `border-radius: 11px`.
- **Dark:** fondo `#00000042`, borde `#303030`, `border-radius: 11px`.

Top bar:

- **Light:** fondo `rgba(255, 255, 255, 0.86)`, borde inferior `rgba(226, 232, 240, 0.9)`, texto `#0f172a`.
- **Dark:** fondo `rgba(18, 20, 28, 0.647)`, borde inferior `rgba(63, 63, 70, 0.7)`, texto `#e2e8f0`.

Sidebar (NavBuilder):

- **Light:** fondo `rgba(255, 255, 255, 0.7)`, borde `rgba(137, 137, 137, 0.3)`, texto `#1f2937`.
- **Dark:** se usa `.darkMode` en el sidebar con fondos/bordes más oscuros y texto claro.

---

## 3. Color de acento

### 3.1 Valor por defecto

- **Hex por defecto:** `#2f74df`.
- Configurable por workspace/dashboard (`theme.accentColor`). Se aplica en tiempo de ejecución en la raíz del documento.

### 3.2 Variables CSS derivadas

Todas se definen en `<html>` (o contenedor raíz que imite el layout). En otro repo, definirlas en `:root` o en el mismo elemento donde se pone la clase de tema.

| Variable | Uso | Ejemplo / Notas |
|----------|-----|------------------|
| `--accent-color` | Color principal de acento. | `#2f74df` (o el elegido por el usuario). |
| `--accent-soft` | Fondos suaves y bordes discretos. | `rgba(r, g, b, 0.16)` del acento. |
| `--accent-strong` | Fondos más intensos (hover, estados activos). | `rgba(r, g, b, 0.28)` del acento. |
| `--accent-text` | Texto sobre acento (botones primarios). | `#ffffff`. |
| `--accent-contrast` | Texto legible sobre acento (puede ser blanco o negro según contraste). | Calculado según luminancia del acento. |

Fórmula recomendada para derivar `--accent-soft` y `--accent-strong` desde un hex:

- `--accent-soft`: `hexToRgba(accentHex, 0.16)`
- `--accent-strong`: `hexToRgba(accentHex, 0.28)`

### 3.3 Dónde usar el color de acento

- **Botones primarios / CTA:** `background: var(--accent-color); color: var(--accent-text);` (y opcionalmente `border-color: var(--accent-color)`).
- **Botones secundarios / ghost:** `background: var(--accent-soft); border: 1px solid var(--accent-color); color: var(--accent-color)`.
- **Enlaces y textos destacados:** `color: var(--accent-color)`.
- **Bordes de focus:** `border-color: var(--accent-color); box-shadow: 0 0 0 2px var(--accent-soft)` (o 3px según componente).
- **Pestañas activas:** borde o fondo con `var(--accent-color)`.
- **Inputs (focus):** `border-color: var(--accent-color); outline/box-shadow` con `var(--accent-soft)`.
- **Checkbox/Radio nativos:** `accent-color: var(--accent-color)`.
- **Indicadores activos (sidebar, tabs):** `border-left` o borde con `var(--accent-color)`.
- **Cards destacadas / selección:** `border-color: var(--accent-color); box-shadow: 0 0 0 1.5px var(--accent-color)`.
- **Iconos de acción o estado activo:** `color: var(--accent-color)`.

No usar el acento para:

- Texto largo de lectura.
- Fondos de grandes superficies (solo en pequeñas áreas de énfasis).

---

## 4. Paleta de colores de interfaz

### 4.1 Texto

| Contexto | Light | Dark |
|----------|--------|------|
| Principal | `#0f172a` | `#f8fafc` / `#e2e8f0` |
| Secundario / muted | `#475569` | `#cbd5e1` |
| Sobre acento | `#ffffff` | `#ffffff` |

### 4.2 Fondos y bordes (referencia)

- **Light:** fondos claros (`#ffffff`, `#f8fafc`, `rgba(255,255,255,0.9)`), bordes `rgba(0,0,0,0.06)`–`rgba(148,163,184,0.3)`.
- **Dark:** fondos oscuros (`#1a1d26`, `rgba(18,20,28,0.65)`, `#1c1c1c78`), bordes `rgba(255,255,255,0.08)`–`#303030`.

### 4.3 Notificaciones (NotificationsCenter)

- **Light:** card `#ffffff`, borde `rgba(148, 163, 184, 0.4)`.
- **Dark:** card `#1a1d26`, borde `rgba(255, 255, 255, 0.1)`.

---

## 5. Tipografía

- **Fuente principal:** `Outfit, sans-serif` (sidebar y zonas que lo usen).
- **Fallback general:** `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", Helvetica, Arial, sans-serif`.

Tamaños típicos:

- **Título de página:** `24px`, `margin-bottom: 16px`.
- **Títulos de sección:** `13px`–`15px`, `font-weight: 600`–`700`.
- **Cuerpo:** `13px`–`16px`.
- **Ayuda / secundario:** `12px`, a veces `opacity: 0.75`–`0.8`.

---

## 6. Layout y espaciado

- **Sidebar ancho expandido:** `275px` (variable `--sidebar-width`).
- **Sidebar colapsado:** `59px`.
- **Altura top bar:** `50px`.
- **Contenedor principal:** `margin-left: var(--sidebar-width); width: calc(100vw - var(--sidebar-width)); padding-top: 50px`.
- **Content shell (páginas internas):** `padding: 16px`, `gap` entre bloques `16px`.
- **Transición de sidebar:** `0.25s cubic-bezier(0.4, 0, 0.2, 1)`.

---

## 7. Border radius

- **Scrollbar:** `4px`.
- **Botones estándar:** `8px`–`10px`.
- **Cards en content shell:** `11px`.
- **Cards de notificación / modales:** `16px`.
- **Avatares / iconos:** `6px`–`15px` según tamaño.
- **Tabs / chips:** `12px`.

---

## 8. Sombras y efectos

- **Content shell light:** sin sombra fuerte; cards con borde.
- **Content shell dark:** idem; contraste por borde.
- **Superficies elevadas (según tema):** usar `--app-surface-glow` si está definido.
- **Botones hover:** p. ej. `0 12px 32px rgba(15, 23, 42, 0.12)` en light.
- **Backdrop:** la app usa `backdrop-filter: blur(30px)` / `blur(45px)` en top bar y content shell.

---

## 9. Scrollbars

- **Ancho:** `8px` (global) o `3px` en sidebar.
- **Thumb light:** `#bfcedc`, hover `#aaccec`.
- **Track light:** `#f5faff`, `border-radius: 4px`.
- En dark, usar tonos grises oscuros para thumb/track manteniendo contraste accesible.

---

## 10. Componentes reutilizables (clases / variables)

### 10.1 Botones en content shell

- **Primario:**  
  `background: var(--accent-strong, var(--accent-color)); border: 1px solid var(--accent-color); color: var(--accent-text); border-radius: 10px; padding: 10px 14px; font-weight: 600;`
- **Ghost / secundario:**  
  `background: var(--accent-soft); border: 1px solid var(--accent-color); color: var(--accent-color); border-radius: 10px; padding: 10px 14px; font-weight: 600;`

### 10.2 Cards en content shell

- **Light:** `.contentShellLight .card` / `.appCard` → `background: #cacaca7d; border: 1px solid #c8c8c8; border-radius: 11px; padding: 10px;`
- **Dark:** `.contentShellDark .card` / `.appCard` → `background: #00000042; border: 1px solid #303030; border-radius: 11px; padding: 10px;`

### 10.3 Inputs con acento

- Focus: `border-color: var(--accent-color); outline: 2px solid var(--accent-soft);` (o `box-shadow: 0 0 0 3px var(--accent-soft)`).
- `accent-color: var(--accent-color)` en checkboxes/radios.

### 10.4 Theme primitives (ThemePrimitives.module.css)

- **Surface card:** fondo y borde según tema; en dark: `background: #1c1c1c78; border: 1px solid #3838385e; color: #cbd5e1`.
- **Button primary:** `background: var(--accent-color); color: var(--accent-contrast, #ffffff)`.
- **Button ghost:** light `#dcdcdc` / dark `#444444`; borde y hover con acento.

---

## 11. Cómo aplicar en otro repo

1. **Raíz del documento:**  
   Añadir la clase de tema y, si aplica, el atributo:
   - `class="app-theme-light"` o `class="app-theme-dark"`.
   - `data-app-theme-mode="light"` o `data-app-theme-mode="dark"`.

2. **Variables en la raíz:**  
   Definir en `:root` (o en el mismo elemento que tenga la clase de tema):
   - `--accent-color`, `--accent-soft`, `--accent-strong`, `--accent-text`, `--accent-contrast`.
   - Opcional: `--app-surface`, `--app-surface-glow`, `--app-surface-border`, `--app-surface-overlay`, `--app-bg-color`, `--app-bg-image`, `--sidebar-width`.

3. **Estilos por tema:**  
   Usar selectores `:global(.app-theme-light)` y `:global(.app-theme-dark)` (o `[data-app-theme-mode="light"]` / `[data-app-theme-mode="dark"]`) para cualquier componente que cambie con el tema.

4. **Acento:**  
   Usar siempre las variables `--accent-*` para botones, enlaces, focus, bordes activos y elementos destacados, para que un solo cambio de `--accent-color` (y sus derivadas) actualice toda la UI.

5. **Tipografía y espaciado:**  
   Reutilizar fuentes (Outfit + system fallback), tamaños (12–24px) y espaciados (16px, 10–14px en botones) para cohesión visual con la app principal.

---

## 12. Resumen de variables CSS

```css
/* Tema (definidas en raíz según theme.mode) */
--app-surface
--app-surface-glow
--app-surface-border
--app-surface-overlay
--app-bg-color
--app-bg-image

/* Acento (definidas en raíz desde theme.accentColor) */
--accent-color
--accent-soft
--accent-strong
--accent-text
--accent-contrast

/* Layout */
--sidebar-width
```

Con esta guía, cualquier microservicio o app externa puede replicar el mismo look & feel usando la misma raíz de tema, variables de acento y convenciones de light/dark descritas aquí.
