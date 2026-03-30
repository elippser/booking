"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import StatusBadge from "@/components/shared/StatusBadge/StatusBadge";
import type { Reservation, ReservationStatus } from "@/types/reservas";
import { dateOnly } from "@/utils/dateFormat";
import styles from "./CheckinList.module.css";

interface Props {
  today: string;
  items: Reservation[];
  onStatusChange: (
    reservationId: string,
    status: ReservationStatus,
    reason?: string,
  ) => Promise<void>;
  busyId: string | null;
}

export default function CheckinList({
  today,
  items,
  onStatusChange,
  busyId,
}: Props) {
  const searchParams = useSearchParams();
  const qs = searchParams.toString();
  const suffix = qs ? `?${qs}` : "";

  return (
    <div className={styles.column}>
      <h2 className={styles.heading}>Check-ins hoy ({items.length})</h2>
      <ul className={styles.list}>
        {items.length === 0 && (
          <li className={styles.empty}>No hay check-ins programados para hoy.</li>
        )}
        {items.map((r) => {
          const action =
            dateOnly(r.checkIn) === today
              ? r.status === "pending"
                ? { label: "Confirmar", next: "confirmed" as const }
                : r.status === "confirmed"
                  ? { label: "Check-in", next: "checked-in" as const }
                  : null
              : null;

          return (
            <li key={r.reservationId}>
              <Link
                href={`/reservas/${r.reservationId}${suffix}`}
                className={styles.card}
              >
                <div className={styles.row}>
                  <span className={styles.code}>{r.reservationCode}</span>
                  <StatusBadge status={r.status} />
                </div>
                <p className={styles.guest}>
                  {r.guest
                    ? `${r.guest.firstName} ${r.guest.lastName}`
                    : "Huésped"}
                </p>
                <p className={styles.meta}>
                  {r.categoryName ?? "Categoría"} · {r.adults} adulto
                  {r.adults !== 1 ? "s" : ""}
                  {r.children > 0
                    ? ` · ${r.children} niño${r.children !== 1 ? "s" : ""}`
                    : ""}
                </p>
                {action && (
                  <button
                    type="button"
                    className={styles.btn}
                    disabled={busyId === r.reservationId}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      void onStatusChange(r.reservationId, action.next);
                    }}
                  >
                    {busyId === r.reservationId ? "…" : action.label}
                  </button>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
