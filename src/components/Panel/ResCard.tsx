"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Reservation, ReservationStatus } from "@/types/reservas";
import styles from "./ResCard.module.css";

const AVATAR_GRADIENTS = [
  ["#4f6ef7", "#7c3aed"],
  ["#059669", "#0891b2"],
  ["#d97706", "#dc2626"],
  ["#7c3aed", "#db2777"],
  ["#0891b2", "#059669"],
  ["#dc2626", "#d97706"],
  ["#db2777", "#7c3aed"],
  ["#4f6ef7", "#059669"],
];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function avatarGradient(seed: string): string {
  const [a, b] = AVATAR_GRADIENTS[hashString(seed) % AVATAR_GRADIENTS.length];
  return `linear-gradient(135deg, ${a}, ${b})`;
}

function initials(first?: string, last?: string): string {
  const f = first?.trim()?.[0] ?? "";
  const l = last?.trim()?.[0] ?? "";
  return (f + l).toUpperCase() || "??";
}

function dotClass(status: ReservationStatus): string {
  switch (status) {
    case "confirmed":
    case "checked-in":
    case "checked-out":
      return "var(--status-confirmed)";
    case "pending":
      return "var(--status-pending)";
    case "cancelled":
    case "no-show":
      return "var(--danger)";
    default:
      return "var(--text-muted)";
  }
}

interface Props {
  reservation: Reservation;
  /** "checkin" muestra noches, "checkout" muestra "Estadía Xn" */
  variant: "checkin" | "checkout";
  rightAction?: { label: string; onClick: () => void; disabled?: boolean };
}

export default function ResCard({ reservation: r, variant, rightAction }: Props) {
  const searchParams = useSearchParams();
  const qs = searchParams.toString();
  const suffix = qs ? `?${qs}` : "";

  const guestName = r.guest
    ? `${r.guest.firstName} ${r.guest.lastName}`
    : "Huésped";
  const inits = r.guest ? initials(r.guest.firstName, r.guest.lastName) : "?";
  const seed = r.guestId || r.reservationId;
  const cat = r.categoryName ?? "Categoría";
  const guests =
    `${r.adults} adulto${r.adults !== 1 ? "s" : ""}` +
    (r.children > 0
      ? `, ${r.children} niño${r.children !== 1 ? "s" : ""}`
      : "");
  const room = r.assignedUnitName ?? r.assignedUnitId ?? "—";
  const nightsLabel =
    variant === "checkin" ? `${r.nights} noches` : `Estadía ${r.nights}n`;

  return (
    <Link
      href={`/reservas/${r.reservationId}${suffix}`}
      className={styles.card}
    >
      <span className={styles.statusDot} style={{ background: dotClass(r.status) }} />
      <div className={styles.avatar} style={{ background: avatarGradient(seed) }}>
        {inits}
      </div>
      <div className={styles.info}>
        <div className={styles.name}>{guestName}</div>
        <div className={styles.detail}>
          {cat} · {guests}
        </div>
      </div>
      <div className={styles.right}>
        <span className={styles.room}>{room}</span>
        <span className={styles.nights}>{nightsLabel}</span>
        <span className={styles.code}>{r.reservationCode}</span>
        {rightAction && (
          <button
            type="button"
            className={styles.action}
            disabled={rightAction.disabled}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              rightAction.onClick();
            }}
          >
            {rightAction.label}
          </button>
        )}
      </div>
    </Link>
  );
}

export const __resCardStyles = styles;
