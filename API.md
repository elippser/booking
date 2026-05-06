# API (cliente HTTP) — `booking-app/web`

Este documento describe **qué endpoints consume el front** desde `src/services/apiReservas.ts`, con qué método, headers y parámetros. No define un servidor HTTP propio de Next (no hay Route Handlers).

**Base URL**: `NEXT_PUBLIC_RESERVAS_API_BASE` (default `http://localhost:7070`), referida como `{BASE}`.

**Autenticación**: salvo indicación, todas las peticiones llevan:

```http
Content-Type: application/json
Authorization: Bearer <JWT staff>
```

El módulo `request()` parsea errores JSON con `error`, `message` o `details[]` y lanza `Error` con texto concatenado. Respuestas **204** o cuerpo vacío se tratan como `undefined`.

---

## 1. Reservas

| Función TS | Método | URL |
|------------|--------|-----|
| `listReservations` | `GET` | `{BASE}/api/v1/reservations` |
| `getReservation` | `GET` | `{BASE}/api/v1/reservations/{reservationId}` |
| `createReservation` | `POST` | `{BASE}/api/v1/reservations` |
| `updateReservationStatus` | `PATCH` | `{BASE}/api/v1/reservations/{reservationId}/status` |
| `updateInternalNotes` | `PATCH` | `{BASE}/api/v1/reservations/{reservationId}/notes` |

### `GET /api/v1/reservations`

**Query** (siempre enviado por el cliente):

- `propertyId` (requerido)
- `status`, `checkIn`, `checkOut`, `channel` (opcionales, strings ISO/fecha según backend)

### `POST /api/v1/reservations`

**Body**: coincide con `CreateReservationPayload` en `src/types/reservas.ts` (campos alineados al `reservationCreateSchema` del API). El front envía `guestId`, fechas ISO, `adults`/`children`, `channel`, etc.

### `PATCH .../status`

**Body**: `{ "status": ReservationStatus, "reason"?: string }`

### `PATCH .../notes`

**Body**: `{ "internalNotes": string }`

---

## 2. Disponibilidad

| Función TS | Método | URL |
|------------|--------|-----|
| `checkAvailability` | `GET` | `{BASE}/api/v1/availability` |
| `getAvailabilityCalendar` | `GET` | `{BASE}/api/v1/availability/calendar` |

### `GET /api/v1/availability`

**Query**:

- `propertyId`, `checkIn`, `checkOut` (requeridos)
- `adults`, `children` (opcionales)

> El cliente **no** envía `promoCode` en esta función; el backend sí lo soporta en la misma ruta.

### `GET /api/v1/availability/calendar`

**Query**: `propertyId`, `from`, `to` (ISO date).

---

## 3. Categorías

| Función TS | Método | URL |
|------------|--------|-----|
| `listCategories` | `GET` | `{BASE}/api/v1/categories` |

**Query**: `propertyId` (requerido).

---

## 4. Planes tarifarios (rate plans)

| Función TS | Método | URL |
|------------|--------|-----|
| `listRatePlans` | `GET` | `{BASE}/api/v1/rate-plans` |
| `createRatePlan` | `POST` | `{BASE}/api/v1/rate-plans` |
| `updateRatePlan` | `PATCH` | `{BASE}/api/v1/rate-plans/{ratePlanId}` |
| `deleteRatePlan` | `DELETE` | `{BASE}/api/v1/rate-plans/{ratePlanId}` |

### `GET /api/v1/rate-plans`

**Query**: `propertyId` (requerido), `categoryId` (opcional).

### Cuerpos POST/PATCH

Alineados a `CreateRatePlanPayload` / parcial en `types/reservas.ts` y a los schemas Joi del API.

---

## 5. Promociones

| Función TS | Método | URL |
|------------|--------|-----|
| `listPromos` | `GET` | `{BASE}/api/v1/promos` |
| `createPromo` | `POST` | `{BASE}/api/v1/promos` |
| `updatePromo` | `PATCH` | `{BASE}/api/v1/promos/{promoId}` |
| `togglePromo` | `PATCH` | `{BASE}/api/v1/promos/{promoId}/toggle` |
| `deletePromo` | `DELETE` | `{BASE}/api/v1/promos/{promoId}` |

### `GET /api/v1/promos`

**Query**: `propertyId` (requerido).

### `PATCH .../toggle`

**Body**: `{ "isEnabled": boolean }`

---

## 6. Huéspedes (búsqueda) — **gap con backend**

| Función TS | Método | URL |
|------------|--------|-----|
| `searchGuestByEmail` | `GET` | `{BASE}/api/v1/guests/search?email=...` |

Comportamiento del cliente:

- **404** → retorna `null` (no encontrado).
- Otros errores → `throw Error`.

**Estado del repo**: `booking-app/api` **no expone** hoy `GET /api/v1/guests/search`. Para que “Nueva reserva” funcione end-to-end hace falta implementar ese endpoint en booking-api (proxy a guests-app o consulta Mongo compartida) o cambiar el cliente para apuntar a **guests-app** directamente.

---

## 7. Referencia cruzada

Contrato detallado del servidor: [`../api/API.md`](../api/API.md).

---

*Generado a partir de `booking-app/web/src/services/apiReservas.ts`.*
