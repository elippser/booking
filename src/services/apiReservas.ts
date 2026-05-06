import type {
  AvailabilityResult,
  CalendarRow,
  Category,
  CreatePromoPayload,
  CreateRatePlanPayload,
  CreateReservationPayload,
  GuestSummary,
  Promo,
  RatePlan,
  Reservation,
  ReservaFilters,
} from "@/types/reservas";
import { env } from "@/config/env";

const BASE = env.reservasApiBase;

function headers(token: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function request<T>(input: string, init: RequestInit): Promise<T> {
  const res = await fetch(input, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as {
      message?: string;
      error?: string;
      details?: string[];
    };
    const base =
      typeof body.message === "string"
        ? body.message
        : typeof body.error === "string"
          ? body.error
          : `Error ${res.status}`;
    const detail = Array.isArray(body.details) && body.details.length
      ? ` ${body.details.join("; ")}`
      : "";
    throw new Error(`${base}${detail}`.trim());
  }
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  if (!text.trim()) return undefined as T;
  return JSON.parse(text) as T;
}

function buildReservationQuery(
  propertyId: string,
  filters?: ReservaFilters,
): string {
  const url = new URL(`${BASE}/api/v1/reservations`);
  url.searchParams.set("propertyId", propertyId);
  if (filters?.status) url.searchParams.set("status", filters.status);
  if (filters?.checkIn) url.searchParams.set("checkIn", filters.checkIn);
  if (filters?.checkOut) url.searchParams.set("checkOut", filters.checkOut);
  if (filters?.channel) url.searchParams.set("channel", filters.channel);
  return url.toString();
}

export async function listReservations(
  token: string,
  filters: ReservaFilters & { propertyId: string },
): Promise<Reservation[]> {
  const { propertyId, ...rest } = filters;
  return request<Reservation[]>(buildReservationQuery(propertyId, rest), {
    headers: headers(token),
  });
}

export async function getReservation(
  token: string,
  reservationId: string,
): Promise<Reservation> {
  return request<Reservation>(
    `${BASE}/api/v1/reservations/${reservationId}`,
    {
      headers: headers(token),
    },
  );
}

export async function createReservation(
  token: string,
  payload: CreateReservationPayload,
): Promise<Reservation> {
  return request<Reservation>(`${BASE}/api/v1/reservations`, {
    method: "POST",
    headers: headers(token),
    body: JSON.stringify(payload),
  });
}

export async function updateReservationStatus(
  token: string,
  reservationId: string,
  status: Reservation["status"],
  reason?: string,
): Promise<Reservation> {
  return request<Reservation>(
    `${BASE}/api/v1/reservations/${reservationId}/status`,
    {
      method: "PATCH",
      headers: headers(token),
      body: JSON.stringify({ status, reason }),
    },
  );
}

export async function updateInternalNotes(
  token: string,
  reservationId: string,
  notes: string,
): Promise<Reservation> {
  return request<Reservation>(
    `${BASE}/api/v1/reservations/${reservationId}/notes`,
    {
      method: "PATCH",
      headers: headers(token),
      body: JSON.stringify({ internalNotes: notes }),
    },
  );
}

export async function checkAvailability(
  token: string,
  params: {
    propertyId: string;
    checkIn: string;
    checkOut: string;
    adults?: number;
    children?: number;
  },
): Promise<AvailabilityResult[]> {
  const url = new URL(`${BASE}/api/v1/availability`);
  url.searchParams.set("propertyId", params.propertyId);
  url.searchParams.set("checkIn", params.checkIn);
  url.searchParams.set("checkOut", params.checkOut);
  if (params.adults != null)
    url.searchParams.set("adults", String(params.adults));
  if (params.children != null)
    url.searchParams.set("children", String(params.children));
  return request<AvailabilityResult[]>(url.toString(), {
    headers: headers(token),
  });
}

export async function searchGuestByEmail(
  token: string,
  email: string,
): Promise<GuestSummary | null> {
  const url = new URL(`${BASE}/api/v1/guests/search`);
  url.searchParams.set("email", email.trim());
  const res = await fetch(url.toString(), { headers: headers(token) });
  if (res.status === 404) return null;
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      typeof body.message === "string" ? body.message : `Error ${res.status}`,
    );
  }
  return res.json();
}

export async function listRatePlans(
  token: string,
  propertyId: string,
  categoryId?: string,
): Promise<RatePlan[]> {
  const url = new URL(`${BASE}/api/v1/rate-plans`);
  url.searchParams.set("propertyId", propertyId);
  if (categoryId) url.searchParams.set("categoryId", categoryId);
  return request<RatePlan[]>(url.toString(), {
    headers: headers(token),
  });
}

export async function createRatePlan(
  token: string,
  payload: CreateRatePlanPayload,
): Promise<RatePlan> {
  return request<RatePlan>(`${BASE}/api/v1/rate-plans`, {
    method: "POST",
    headers: headers(token),
    body: JSON.stringify(payload),
  });
}

export async function updateRatePlan(
  token: string,
  ratePlanId: string,
  payload: Partial<CreateRatePlanPayload>,
): Promise<RatePlan> {
  return request<RatePlan>(`${BASE}/api/v1/rate-plans/${ratePlanId}`, {
    method: "PATCH",
    headers: headers(token),
    body: JSON.stringify(payload),
  });
}

export async function deleteRatePlan(
  token: string,
  ratePlanId: string,
): Promise<void> {
  await request<void>(`${BASE}/api/v1/rate-plans/${ratePlanId}`, {
    method: "DELETE",
    headers: headers(token),
  });
}

export async function listCategories(
  token: string,
  propertyId: string,
): Promise<Category[]> {
  const url = new URL(`${BASE}/api/v1/categories`);
  url.searchParams.set("propertyId", propertyId);
  return request<Category[]>(url.toString(), {
    headers: headers(token),
  });
}

export async function getAvailabilityCalendar(
  token: string,
  params: { propertyId: string; from: string; to: string },
): Promise<CalendarRow[]> {
  const url = new URL(`${BASE}/api/v1/availability/calendar`);
  url.searchParams.set("propertyId", params.propertyId);
  url.searchParams.set("from", params.from);
  url.searchParams.set("to", params.to);
  return request<CalendarRow[]>(url.toString(), {
    headers: headers(token),
  });
}

export async function listPromos(
  token: string,
  propertyId: string,
): Promise<Promo[]> {
  const url = new URL(`${BASE}/api/v1/promos`);
  url.searchParams.set("propertyId", propertyId);
  return request<Promo[]>(url.toString(), { headers: headers(token) });
}

export async function createPromo(
  token: string,
  payload: CreatePromoPayload,
): Promise<Promo> {
  return request<Promo>(`${BASE}/api/v1/promos`, {
    method: "POST",
    headers: headers(token),
    body: JSON.stringify(payload),
  });
}

export async function updatePromo(
  token: string,
  promoId: string,
  patch: Partial<CreatePromoPayload>,
): Promise<Promo> {
  return request<Promo>(`${BASE}/api/v1/promos/${promoId}`, {
    method: "PATCH",
    headers: headers(token),
    body: JSON.stringify(patch),
  });
}

export async function togglePromo(
  token: string,
  promoId: string,
  isEnabled: boolean,
): Promise<Promo> {
  return request<Promo>(`${BASE}/api/v1/promos/${promoId}/toggle`, {
    method: "PATCH",
    headers: headers(token),
    body: JSON.stringify({ isEnabled }),
  });
}

export async function deletePromo(
  token: string,
  promoId: string,
): Promise<void> {
  await request<void>(`${BASE}/api/v1/promos/${promoId}`, {
    method: "DELETE",
    headers: headers(token),
  });
}
