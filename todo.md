# pms-app-reservas — frontend-pms
> Next.js 15 · App Router · CSS Modules · TypeScript · Marzo 2026

---

## Responsabilidad

Interfaz interna para staff. Gestión completa de reservas, check-in/out, carga manual y tarifas. Se monta dentro del shell de Elippser via iframe o Multi-Zone. Autenticación via JWT del pms-core.

---

## Variables de entorno

env
NEXT_PUBLIC_RESERVAS_API_BASE=http://localhost:5001
NEXT_PUBLIC_CORE_API_URL=http://localhost:4000


---

## Parámetros de montaje

La app recibe contexto via query params:


?companyId=...&propertyId=...&spaceId=...&token=...


El token es el JWT del staff (pms-core). Se usa en todas las llamadas al backend.

---

## Estructura de archivos


frontend-pms/src/
├── app/
│   ├── layout.tsx
│   ├── globals.css
│   ├── page.tsx                          → redirect a /panel
│   ├── panel/
│   │   └── page.tsx                      → Panel del día
│   ├── reservas/
│   │   ├── page.tsx                      → Lista de reservas
│   │   └── [reservationId]/
│   │       └── page.tsx                  → Detalle de reserva
│   ├── nueva/
│   │   └── page.tsx                      → Carga manual
│   └── tarifas/
│       └── page.tsx                      → Gestión de rate plans
├── components/
│   ├── Panel/
│   │   ├── PanelDia.tsx
│   │   ├── PanelDia.module.css
│   │   ├── CheckinList.tsx
│   │   ├── CheckinList.module.css
│   │   ├── CheckoutList.tsx
│   │   └── CheckoutList.module.css
│   ├── Reservas/
│   │   ├── ReservasList.tsx
│   │   ├── ReservasList.module.css
│   │   ├── ReservaRow.tsx
│   │   ├── ReservaRow.module.css
│   │   ├── ReservaFilters.tsx
│   │   └── ReservaFilters.module.css
│   ├── ReservaDetalle/
│   │   ├── ReservaDetalle.tsx
│   │   ├── ReservaDetalle.module.css
│   │   ├── StatusTimeline.tsx
│   │   ├── StatusTimeline.module.css
│   │   ├── GuestInfo.tsx
│   │   └── AccionesReserva.tsx
│   ├── NuevaReserva/
│   │   ├── NuevaReservaForm.tsx
│   │   ├── NuevaReservaForm.module.css
│   │   ├── BusquedaHuesped.tsx
│   │   └── DisponibilidadSelector.tsx
│   ├── Tarifas/
│   │   ├── TarifasList.tsx
│   │   ├── TarifasList.module.css
│   │   ├── TarifaModal.tsx
│   │   └── TarifaModal.module.css
│   └── shared/
│       ├── AppShell/
│       │   ├── AppShell.tsx
│       │   └── AppShell.module.css
│       ├── StatusBadge/
│       │   ├── StatusBadge.tsx
│       │   └── StatusBadge.module.css
│       └── NavBar/
│           ├── NavBar.tsx
│           └── NavBar.module.css
├── hooks/
│   ├── useAppContext.ts
│   ├── useReservas.ts
│   └── useTarifas.ts
├── services/
│   └── apiReservas.ts
└── types/
    └── reservas.ts


---

## Tipos

Archivo: src/types/reservas.ts

typescript
export type ReservationStatus =
  | "pending"
  | "confirmed"
  | "checked-in"
  | "checked-out"
  | "cancelled"
  | "no-show";

export type ReservationChannel = "direct" | "phone" | "ota";

export interface Reservation {
  reservationId: string;
  reservationCode: string;
  propertyId: string;
  categoryId: string;
  categoryName?: string;
  assignedUnitId?: string;
  assignedUnitName?: string;
  guestId: string;
  guest?: GuestSummary;
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  children: number;
  totalAmount: number;
  currency: string;
  status: ReservationStatus;
  channel: ReservationChannel;
  specialRequests?: string;
  internalNotes?: string;
  cancelledAt?: string;
  cancelledReason?: string;
  createdByUserId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GuestSummary {
  guestId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  document: { type: string; number: string };
  nationality: string;
}

export interface RatePlan {
  ratePlanId: string;
  propertyId: string;
  categoryId: string;
  categoryName?: string;
  name: string;
  startDate: string;
  endDate: string;
  pricePerNight: number;
  currency: string;
  minNights?: number;
  isActive: boolean;
}

export interface ReservaFilters {
  status?: ReservationStatus;
  checkIn?: string;
  checkOut?: string;
  channel?: ReservationChannel;
  search?: string;
}

export const STATUS_LABELS: Record<ReservationStatus, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  "checked-in": "Alojado",
  "checked-out": "Check-out",
  cancelled: "Cancelada",
  "no-show": "No show",
};

export const STATUS_COLORS: Record<ReservationStatus, string> = {
  pending: "#eab308",
  confirmed: "#22c55e",
  "checked-in": "#47c5ff",
  "checked-out": "#6b7280",
  cancelled: "#ef4444",
  "no-show": "#f97316",
};

export const VALID_TRANSITIONS: Record<ReservationStatus, ReservationStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["checked-in", "cancelled", "no-show"],
  "checked-in": ["checked-out"],
  "checked-out": [],
  cancelled: [],
  "no-show": [],
};


---

## Servicio — apiReservas.ts

typescript
const BASE = process.env.NEXT_PUBLIC_RESERVAS_API_BASE;

// Reservas — staff
listReservations(token, filters: ReservaFilters & { propertyId: string }): Promise<Reservation[]>
  → GET /api/v1/reservations?propertyId=...&status=...&checkIn=...

getReservation(token, reservationId): Promise<Reservation>
  → GET /api/v1/reservations/:reservationId

createReservation(token, payload): Promise<Reservation>
  → POST /api/v1/reservations

updateReservationStatus(token, reservationId, status, reason?): Promise<Reservation>
  → PATCH /api/v1/reservations/:reservationId/status

updateInternalNotes(token, reservationId, notes): Promise<Reservation>
  → PATCH /api/v1/reservations/:reservationId/notes

// Disponibilidad
checkAvailability(token, params): Promise<AvailabilityResult[]>
  → GET /api/v1/availability?propertyId=...&checkIn=...&checkOut=...

// Rate Plans
listRatePlans(token, propertyId, categoryId?): Promise<RatePlan[]>
  → GET /api/v1/rate-plans?propertyId=...&categoryId=...

createRatePlan(token, payload): Promise<RatePlan>
  → POST /api/v1/rate-plans

updateRatePlan(token, ratePlanId, payload): Promise<RatePlan>
  → PATCH /api/v1/rate-plans/:ratePlanId

deleteRatePlan(token, ratePlanId): Promise<void>
  → DELETE /api/v1/rate-plans/:ratePlanId


---

## NavBar — navegación entre vistas

Barra superior simple con links a las 5 vistas. Marca el link activo con usePathname().


[Panel del día]  [Reservas]  [Nueva reserva]  [Tarifas]


Visible en todas las páginas via layout.tsx.

---

## Vista — Panel del día (/panel)

Vista operativa del día. Muestra check-ins y check-outs de hoy en dos columnas.


┌─────────────────────────────────────────────────────┐
│ Panel del día — Martes 24 de marzo 2026             │
├──────────────────────┬──────────────────────────────┤
│ Check-ins hoy (3)    │ Check-outs hoy (2)           │
├──────────────────────┼──────────────────────────────┤
│ RES-2026-XKQP        │ RES-2026-ABCD                │
│ Juan Pérez           │ María García                 │
│ Hab. Doble Estándar  │ Suite Junior                 │
│ 2 adultos            │ 2 adultos                    │
│ ● Confirmada         │ ● Alojado                    │
│ [Check-in]           │ [Check-out]                  │
│                      │                              │
│ RES-2026-WXYZ        │ RES-2026-EFGH                │
│ Carlos López         │ Ana Martínez                 │
│ Suite Presidencial   │ Hab. Doble Estándar          │
│ 2 adultos · 1 niño   │ 1 adulto                     │
│ ● Pendiente          │ ● Alojado                    │
│ [Confirmar]          │ [Check-out]                  │
└──────────────────────┴──────────────────────────────┘


*Comportamiento:*
- Al montar → listReservations() filtrando por checkIn = hoy (check-ins) y checkOut = hoy (check-outs)
- Botón acción principal por estado:
  - pending → botón "Confirmar" → updateReservationStatus("confirmed")
  - confirmed + checkIn hoy → botón "Check-in" → updateReservationStatus("checked-in")
  - checked-in + checkOut hoy → botón "Check-out" → updateReservationStatus("checked-out")
- Click en la tarjeta → navegar a /reservas/:reservationId
- Refresco manual con botón ↻

---

## Vista — Lista de reservas (/reservas)


┌─────────────────────────────────────────────────────┐
│ Reservas                              [+ Nueva]     │
├─────────────────────────────────────────────────────┤
│ [Todos ▾] [Fecha ▾] [Canal ▾] [Buscar...        ]  │
├──────┬──────────────┬────────────┬────────┬────────┤
│ Cód  │ Huésped      │ Fechas     │ Cat.   │ Estado │
├──────┼──────────────┼────────────┼────────┼────────┤
│ XK.. │ Juan Pérez   │ 1→5 abr   │ Doble  │ ●Conf. │
│ AB.. │ María García │ 24→28 mar │ Suite  │ ●Aloj. │
│ WX.. │ Carlos López │ 10→15 abr │ Presid.│ ●Pend. │
└──────┴──────────────┴────────────┴────────┴────────┘


*Filtros:*
- Estado: Todos / Pendiente / Confirmada / Alojado / Check-out / Cancelada / No-show
- Fecha: rango de checkIn
- Canal: Todos / Directo / Teléfono / OTA
- Búsqueda: por código o nombre de huésped (filtro local en memoria)

*Comportamiento:*
- Al montar → listReservations() con propertyId del contexto
- Click en fila → navegar a /reservas/:reservationId
- Botón "+ Nueva" → navegar a /nueva

---

## Vista — Detalle de reserva (/reservas/[reservationId])


┌─────────────────────────────────────────────────────┐
│ ← Volver    RES-2026-XKQP          ● Confirmada    │
├───────────────────────┬─────────────────────────────┤
│ Huésped               │ Reserva                     │
│                       │                             │
│ Juan Pérez            │ Hab. Doble Estándar         │
│ juan@email.com        │ 1 abr → 5 abr · 4 noches   │
│ +54 11 1234-5678      │ 2 adultos · 0 niños         │
│ DNI: 12345678         │ USD 600 total               │
│ Argentina             │ Canal: Directo              │
│                       │                             │
├───────────────────────┴─────────────────────────────┤
│ Solicitudes especiales                              │
│ Piso alto, cuna para bebé                          │
├─────────────────────────────────────────────────────┤
│ Notas internas                                      │
│ [_____________________________________________]     │
│                                          [Guardar] │
├─────────────────────────────────────────────────────┤
│ Historial de estado                                 │
│ ○ Pendiente → Confirmada  24/03 10:30              │
│ ○ Creada    24/03 09:15                            │
├─────────────────────────────────────────────────────┤
│ Acciones                                            │
│ [Check-in]  [Cancelar]  [No-show]                  │
└─────────────────────────────────────────────────────┘


*Componente StatusTimeline:*
Muestra el historial de cambios de estado de la reserva en orden cronológico.

*Componente AccionesReserva:*
Muestra solo las acciones válidas según el estado actual usando VALID_TRANSITIONS. Cada acción abre un modal de confirmación antes de ejecutar.

*Modal de cancelación:* pide motivo de cancelación (campo de texto) antes de confirmar.

*Check-in:* al ejecutar → el backend asigna unidad automáticamente → mostrar el nombre de la unidad asignada en la vista.

---

## Vista — Nueva reserva (/nueva)

Formulario de carga manual en dos pasos:

### Paso 1 — Buscar disponibilidad


┌─────────────────────────────────────────────────────┐
│ Nueva reserva                                       │
├─────────────────────────────────────────────────────┤
│ Check-in     Check-out    Adultos   Niños           │
│ [01/04/26]   [05/04/26]   [2 ▾]    [0 ▾]           │
│                                                     │
│ Canal de origen                                     │
│ [Directo ▾]                                         │
│                                                     │
│ [  Buscar disponibilidad  ]                         │
└─────────────────────────────────────────────────────┘


Al buscar → muestra DisponibilidadSelector con las categorías disponibles.

### Paso 2 — Completar reserva


┌─────────────────────────────────────────────────────┐
│ Categoría seleccionada: Hab. Doble Estándar         │
│ USD 150/noche · Total: USD 600                      │
├─────────────────────────────────────────────────────┤
│ Huésped                                             │
│ Buscar por email: [_______________] [Buscar]        │
│                                                     │
│ → Si existe: muestra nombre y datos                 │
│ → Si no existe: formulario de datos básicos         │
│   Nombre, Apellido, Email, Teléfono,                │
│   Tipo doc, Número doc, Nacionalidad                │
├─────────────────────────────────────────────────────┤
│ Solicitudes especiales                              │
│ [_____________________________________________]     │
│                                                     │
│ Notas internas                                      │
│ [_____________________________________________]     │
│                                                     │
│ [  Crear reserva  ]                                 │
└─────────────────────────────────────────────────────┘


*BusquedaHuesped:*
- Busca huésped por email en pms-auth-guests via el backend
- Si existe → pre-rellena datos y muestra perfil encontrado
- Si no existe → muestra formulario completo de datos del huésped
- Al crear reserva con huésped nuevo → el backend crea el perfil en pms-auth-guests

*Comportamiento al confirmar:*
- createReservation() con status: "confirmed" (staff confirma en el acto)
- Redirigir a /reservas/:reservationId

---

## Vista — Tarifas (/tarifas)


┌─────────────────────────────────────────────────────┐
│ Tarifas & Disponibilidad              [+ Nueva]     │
├─────────────────────────────────────────────────────┤
│ [Todas las categorías ▾]                            │
├─────────────────────────────────────────────────────┤
│ Temporada Alta 2026                                 │
│ Hab. Doble Estándar · 1 dic → 28 feb               │
│ USD 220/noche · Mínimo 3 noches                    │
│ ● Activa          [Editar] [Eliminar]               │
│                                                     │
│ Semana Santa 2026                                   │
│ Suite Junior · 17 abr → 21 abr                     │
│ USD 380/noche                                       │
│ ● Activa          [Editar] [Eliminar]               │
└─────────────────────────────────────────────────────┘


*TarifaModal — crear / editar:*

Campos:
- Nombre del plan (requerido)
- Categoría (selector, requerido)
- Fecha inicio (requerido)
- Fecha fin (requerido)
- Precio por noche (requerido)
- Moneda (selector: USD, ARS, EUR, BRL)
- Mínimo de noches (opcional)

*Eliminar:* modal de confirmación → deleteRatePlan() → soft delete.

---

## Orden de implementación


1.  globals.css — variables CSS
2.  src/types/reservas.ts
3.  src/services/apiReservas.ts
4.  src/hooks/useAppContext.ts
5.  src/hooks/useReservas.ts
6.  src/hooks/useTarifas.ts
7.  src/components/shared/AppShell/
8.  src/components/shared/StatusBadge/
9.  src/components/shared/NavBar/
10. src/app/layout.tsx
11. src/components/Panel/ — PanelDia + CheckinList + CheckoutList
12. src/app/panel/page.tsx
13. src/components/Reservas/ — ReservasList + ReservaRow + ReservaFilters
14. src/app/reservas/page.tsx
15. src/components/ReservaDetalle/ — todos los subcomponentes
16. src/app/reservas/[reservationId]/page.tsx
17. src/components/NuevaReserva/ — form + búsqueda huésped + disponibilidad
18. src/app/nueva/page.tsx
19. src/components/Tarifas/ — TarifasList + TarifaModal
20. src/app/tarifas/page.tsx
21. src/app/page.tsx — redirect a /panel