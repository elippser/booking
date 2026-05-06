# Arquitectura — `booking-app/web` (`elippser-pms-booking-web`)

Aplicación **Next.js 16** (React 19) para **staff del PMS**: panel operativo del día, listado y detalle de reservas, alta manual, tarifas, calendario de disponibilidad y administración de promociones. Consume la API de reservas (`booking-app/api`) y asume que el usuario llega **embebido desde pms-core** con contexto en query string (iframe u otra shell).

---

## 1. Stack

| Pieza | Versión / nota |
|-------|----------------|
| Next.js | `16.2.1` (App Router, `src/app`) |
| React | `19.2.4` |
| TypeScript | `^5` |
| Auth cliente | `jwt-decode` (solo lectura del payload del JWT staff para `role`) |
| Estilos | CSS Modules en componentes; tema claro/oscuro vía clases en `document.documentElement` |

**Scripts** (`package.json`):

- `dev`: `next dev -p 8000`
- `build` / `start` / `lint`: estándar Next + ESLint

---

## 2. Despliegue y rutas públicas

### 2.1 `basePath` y assets

`next.config.ts` define:

- **`basePath`**: `/reservas`
- **`assetPrefix`**: `/reservas-static`

Efectos:

- Las URLs de la app son **`/reservas/...`** respecto al host (ej. `https://dominio.com/reservas/panel`).
- Los estáticos se sirven bajo el prefijo configurado para CDN/proxy.
- Redirect raíz del host: `/` → `/reservas` (`basePath: false` en la regla).

**Importante para integradores**: los links internos usan rutas relativas al app (`/panel`, `/reservas`); Next resuelve el `basePath` automáticamente en `<Link>` y `redirect()`.

### 2.2 Entrada

- `src/app/page.tsx` reenvía a **`/panel`** preservando query params: `companyId`, `propertyId`, `token`, `spaceId`, `theme`, `accent`.

---

## 3. Estructura de carpetas

```
src/
├── app/                    # Rutas App Router
│   ├── layout.tsx          # Shell global, ThemeProvider, script de tema/accent
│   ├── page.tsx            # Redirect → /panel
│   ├── panel/
│   ├── reservas/           # Lista + [reservationId] detalle
│   ├── nueva/
│   ├── tarifas/
│   ├── disponibilidad/
│   └── promos/
├── components/             # UI por dominio + shared (NavBar, AppShell, ContextGate)
├── hooks/                  # useAppContext, useReservas, useTarifas, usePromos, etc.
├── services/
│   └── apiReservas.ts      # Cliente HTTP → booking-api
├── config/
│   └── env.ts              # NEXT_PUBLIC_* 
├── types/
│   └── reservas.ts         # Tipos alineados al backend
└── utils/
    ├── embedContext.ts     # sessionStorage para contexto embebido
    ├── dateFormat.ts
    └── themeUtils.ts
```

No hay **Route Handlers** (`app/api/.../route.ts`): toda la lógica de negocio remota va al backend `booking-app/api`.

---

## 4. Contexto embebido (PMS)

### 4.1 Query params esperados

El flujo diseñado (ver `ContextGate`) exige al menos:

- `companyId`
- `propertyId`
- `token` — JWT del staff (mismo que valida `booking-app/api` vía `STAFF_JWT_SECRET` o `CORE_API_URL`)

Opcionales: `spaceId`, `theme` (`light` | `dark` | `system`), `accent` (hex 6 sin `#` en query; el script en `layout` valida y aplica CSS variables).

### 4.2 Persistencia

`src/utils/embedContext.ts` guarda en **`sessionStorage`** claves con prefijo `elippser_pms_embed_*` para no perder contexto si el router no reenvía la query en alguna navegación.

`useAppContext` (`src/hooks/useAppContext.ts`):

1. En `useEffect`, persiste desde `useSearchParams()` lo que venga en la URL.
2. En `useMemo`, fusiona URL + storage (`mergeEmbed`).
3. Expone `isReady` cuando hay `companyId`, `propertyId` y `token`.
4. Decodifica `role` del JWT con `jwt-decode` (`owner` | `admin` | `staff`; fallback `staff`).

### 4.3 Navegación

`NavBar` construye links con **`searchParams.toString()`** como sufijo, de modo que **token y propertyId viajan en cada pestaña** (`/panel`, `/reservas`, etc.).

### 4.4 ContextGate

Componente que muestra pantalla de “Contexto requerido” si `!isReady`. Se usa dentro de pantallas que necesitan API (ej. `PanelDia` envuelve el contenido real con `ContextGate`).

---

## 5. Tema y accesibilidad visual

`layout.tsx` inyecta un **inline script** antes del árbol React que:

- Lee `theme` y `accent` de `location.search`.
- Aplica `app-theme-light` / `app-theme-dark` en `<html>` según preferencia o `prefers-color-scheme`.
- Si `accent` es hex válido de 6 caracteres, setea `--accent-color`, `--accent-soft`, etc.

`ThemeProvider` (`src/components/theme/ThemeProvider.tsx`) complementa el comportamiento en cliente si aplica.

---

## 6. Dominios de UI (mapa funcional)

| Ruta (relativa al `basePath`) | Rol |
|-------------------------------|-----|
| `/panel` | Arribos y salidas del día / mañana; cambio de estado de reservas. |
| `/reservas` | Listado filtrable; enlace a detalle. |
| `/reservas/[reservationId]` | Detalle, timeline de estado, notas internas, acciones. |
| `/nueva` | Flujo nueva reserva: huésped, disponibilidad, envío a API. |
| `/tarifas` | CRUD de planes tarifario (roles owner/admin en mutaciones vía API). |
| `/disponibilidad` | Calendario por categoría (`/availability/calendar`). |
| `/promos` | Listado y formularios de promociones. |

La autorización fina de **mutación** de tarifas la aplica el backend (`requireRole`); el front solo refleja `role` del JWT para UX.

---

## 7. Datos y hooks

Patrón habitual:

- Hooks (`useReservas`, `useTarifas`, `usePromos`, `useAvailabilityCalendar`, `useCategories`) llaman funciones de `apiReservas.ts` con el `token` de `useAppContext`.
- Estados de carga y error locales en componentes o hooks.

Tipos compartidos: `src/types/reservas.ts` (reservas, filtros, promos, categorías, calendario) — deben mantenerse alineados con `booking-app/api`.

---

## 8. Variables de entorno

Definidas en `src/config/env.ts` (todas **`NEXT_PUBLIC_`** para uso en browser):

| Variable | Default local | Uso |
|----------|---------------|-----|
| `NEXT_PUBLIC_RESERVAS_API_BASE` | `http://localhost:7070` | Base de `booking-app/api` |
| `NEXT_PUBLIC_CORE_API_URL` | `http://localhost:3030` | Referencia para futuras integraciones directas al core desde el front (el cliente principal de reservas es `apiReservas`) |

---

## 9. Limitaciones y acoplamientos

1. **Sin BFF**: el navegador llama directamente a `booking-app/api` con el Bearer del staff; CORS del API debe permitir el origen del front.
2. **`searchGuestByEmail`** en `apiReservas.ts` apunta a `GET /api/v1/guests/search` en la misma base de reservas; **ese endpoint no está implementado en `booking-app/api` actual**. La UI de “Nueva reserva” puede fallar en la búsqueda hasta existir un proxy en booking-api o guests-app.
3. **`companyId`** se expone en contexto pero las llamadas documentadas del API de reservas filtran por `propertyId`; la pertenencia empresa-propiedad se asume validada en core al emitir el token.

---

*Documento alineado con el código en `booking-app/web/src`.*
