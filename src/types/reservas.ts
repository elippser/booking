export type ReservationStatus =
  | "pending"
  | "confirmed"
  | "checked-in"
  | "checked-out"
  | "cancelled"
  | "no-show";

export type ReservationChannel = "direct" | "phone" | "ota";

export interface GuestSummary {
  guestId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  document: { type: string; number: string };
  nationality: string;
}

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
  /** Historial de estados si el backend lo envía */
  statusHistory?: ReservationStatusEvent[];
}

export interface ReservationStatusEvent {
  status: ReservationStatus;
  at: string;
  previousStatus?: ReservationStatus;
  reason?: string;
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

export interface AppContext {
  companyId: string;
  propertyId: string;
  spaceId?: string;
  token: string;
  role: "owner" | "admin" | "staff";
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

export interface AvailabilityResult {
  categoryId: string;
  categoryName?: string;
  availableUnits?: number;
  pricePerNight?: number;
  currency?: string;
}

export interface Category {
  categoryId: string;
  name: string;
  description?: string;
  photos?: string[];
  capacity?: { adults: number; children: number };
  amenities?: string[];
  basePrice?: { amount: number; currency: string };
  unitCount?: number;
}

export interface CalendarDay {
  date: string;
  availableUnits: number;
}

export interface CalendarRow {
  categoryId: string;
  name: string;
  totalUnits: number;
  days: CalendarDay[];
}

export type PromoType = "auto" | "code";
export type PromoDiscountType = "percentage" | "fixed_amount" | "price_override";
export type PromoStatus = "active" | "scheduled" | "expired" | "inactive";

export interface PromoStudio {
  showInWeb: boolean;
  image?: string;
  title?: string;
  description?: string;
  badge?: string;
  cta?: string;
}

export interface Promo {
  promoId: string;
  propertyId: string;
  name: string;
  description?: string;
  type: PromoType;
  code?: string;
  startDate?: string;
  endDate?: string;
  appliesToAllCategories: boolean;
  categoryIds: string[];
  discountType: PromoDiscountType;
  discountValue: number;
  currency?: string;
  minNights?: number;
  minAdvanceDays?: number;
  maxUses?: number;
  oneUsePerGuest: boolean;
  isEnabled: boolean;
  studio: PromoStudio;
  status: PromoStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePromoPayload {
  propertyId: string;
  name: string;
  description?: string;
  type: PromoType;
  code?: string;
  startDate?: string;
  endDate?: string;
  appliesToAllCategories: boolean;
  categoryIds: string[];
  discountType: PromoDiscountType;
  discountValue: number;
  currency?: string;
  minNights?: number;
  minAdvanceDays?: number;
  maxUses?: number;
  oneUsePerGuest?: boolean;
  isEnabled?: boolean;
  studio?: PromoStudio;
}

export interface AppliedPromoSummary {
  promoId: string;
  name: string;
  discountType: PromoDiscountType;
  discountValue: number;
  deltaPerNight: number;
  deltaTotal: number;
  deltaPercent?: number;
  code?: string;
}

export interface CreateReservationPayload {
  propertyId: string;
  categoryId: string;
  guestId?: string;
  guest?: Omit<GuestSummary, "guestId"> & { guestId?: string };
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  channel: ReservationChannel;
  status?: ReservationStatus;
  specialRequests?: string;
  internalNotes?: string;
  totalAmount?: number;
  currency?: string;
}

export interface CreateRatePlanPayload {
  propertyId: string;
  categoryId: string;
  name: string;
  startDate: string;
  endDate: string;
  pricePerNight: number;
  currency: string;
  minNights?: number;
  isActive?: boolean;
}

export const CHANNEL_LABELS: Record<ReservationChannel, string> = {
  direct: "Directo",
  phone: "Teléfono",
  ota: "OTA",
};

export const CURRENCY_OPTIONS = ["USD", "ARS", "EUR", "BRL"] as const;
