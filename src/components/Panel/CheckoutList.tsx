"use client";

import type { Reservation, ReservationStatus } from "@/types/reservas";
import { dateOnly } from "@/utils/dateFormat";
import ResCard from "./ResCard";
import styles from "./CheckoutList.module.css";
import resStyles from "./ResCard.module.css";

interface Props {
  today: string;
  tomorrow: string;
  todayLabel: string;
  tomorrowLabel: string;
  itemsToday: Reservation[];
  itemsTomorrow: Reservation[];
  countToday: number;
  onStatusChange: (
    reservationId: string,
    status: ReservationStatus
  ) => Promise<void>;
  busyId: string | null;
}

function pickAction(
  r: Reservation,
  today: string,
  busyId: string | null,
  onStatusChange: Props["onStatusChange"]
) {
  if (dateOnly(r.checkOut) !== today) return undefined;
  if (r.status !== "checked-in") return undefined;
  const busy = busyId === r.reservationId;
  return {
    label: busy ? "…" : "Check-out",
    disabled: busy,
    onClick: () => void onStatusChange(r.reservationId, "checked-out"),
  };
}

export default function CheckoutList({
  today,
  tomorrow,
  todayLabel,
  tomorrowLabel,
  itemsToday,
  itemsTomorrow,
  countToday,
  onStatusChange,
  busyId,
}: Props) {
  return (
    <div className={styles.column}>
      <div className={styles.colHeader}>
        <span className={styles.colLabel}>Check-outs</span>
        <span className={styles.colBadge}>{countToday} hoy</span>
      </div>

      <div className={resStyles.dateBox}>
        <div className={resStyles.dateBoxLabel}>Hoy — {todayLabel}</div>
      </div>

      {itemsToday.length === 0 ? (
        <div className={resStyles.empty}>
          No hay check-outs programados para hoy.
        </div>
      ) : (
        <ul className={resStyles.list}>
          {itemsToday.map((r) => (
            <li key={r.reservationId}>
              <ResCard
                reservation={r}
                variant="checkout"
                rightAction={pickAction(r, today, busyId, onStatusChange)}
              />
            </li>
          ))}
        </ul>
      )}

      <div className={resStyles.dateBox}>
        <div className={resStyles.dateBoxLabel}>Mañana — {tomorrowLabel}</div>
      </div>

      {itemsTomorrow.length === 0 ? (
        <div className={resStyles.empty}>Sin check-outs para mañana.</div>
      ) : (
        <ul className={resStyles.list}>
          {itemsTomorrow.map((r) => (
            <li key={r.reservationId}>
              <ResCard
                reservation={r}
                variant="checkout"
                rightAction={pickAction(r, tomorrow, busyId, onStatusChange)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
