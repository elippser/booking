"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import StatusBadge from "@/components/shared/StatusBadge/StatusBadge";
import type { Reservation, ReservationStatus } from "@/types/reservas";
import { dateOnly } from "@/utils/dateFormat";
import styles from "./CheckoutList.module.css";

interface Props {
  today: string;
  items: Reservation[];
  onStatusChange: (
    reservationId: string,
    status: ReservationStatus,
  ) => Promise<void>;
  busyId: string | null;
}

export default function CheckoutList({
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
      <h2 className={styles.heading}>Check-outs hoy ({items.length})</h2>
      <ul className={styles.list}>
        {items.length === 0 && (
          <li className={styles.empty}>
            No hay check-outs programados para hoy.
          </li>
        )}
        {items.map((r) => {
          const showCheckout =
            dateOnly(r.checkOut) === today && r.status === "checked-in";

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
                {showCheckout && (
                  <button
                    type="button"
                    className={styles.btn}
                    disabled={busyId === r.reservationId}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      void onStatusChange(r.reservationId, "checked-out");
                    }}
                  >
                    {busyId === r.reservationId ? "…" : "Check-out"}
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
