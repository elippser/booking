"use client";

import type { Reservation, ReservationStatus } from "@/types/reservas";
import { dateOnly } from "@/utils/dateFormat";
import ResCard from "./ResCard";
import styles from "./CheckinList.module.css";
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
  if (dateOnly(r.checkIn) !== today) return undefined;
  const busy = busyId === r.reservationId;
  if (r.status === "pending") {
    return {
      label: busy ? "…" : "Confirmar",
      disabled: busy,
      onClick: () => void onStatusChange(r.reservationId, "confirmed"),
    };
  }
  if (r.status === "confirmed") {
    return {
      label: busy ? "…" : "Check-in",
      disabled: busy,
      onClick: () => void onStatusChange(r.reservationId, "checked-in"),
    };
  }
  return undefined;
}

export default function CheckinList({
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
        <span className={styles.colLabel}>Check-ins</span>
        <span className={`${styles.colBadge} ${styles.green}`}>
          {countToday} hoy
        </span>
      </div>

      <div className={resStyles.dateBox}>
        <div className={resStyles.dateBoxLabel}>Hoy — {todayLabel}</div>
      </div>

      {itemsToday.length === 0 ? (
        <div className={resStyles.empty}>
          No hay check-ins programados para hoy.
        </div>
      ) : (
        <ul className={resStyles.list}>
          {itemsToday.map((r) => (
            <li key={r.reservationId}>
              <ResCard
                reservation={r}
                variant="checkin"
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
        <div className={resStyles.empty}>Sin check-ins para mañana.</div>
      ) : (
        <ul className={resStyles.list}>
          {itemsTomorrow.map((r) => (
            <li key={r.reservationId}>
              <ResCard
                reservation={r}
                variant="checkin"
                rightAction={pickAction(r, tomorrow, busyId, onStatusChange)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
