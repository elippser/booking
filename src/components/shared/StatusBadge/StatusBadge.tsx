import type { ReservationStatus } from "@/types/reservas";
import { STATUS_LABELS } from "@/types/reservas";
import styles from "./StatusBadge.module.css";

const STATUS_CLASS: Record<ReservationStatus, string> = {
  pending: styles.pending,
  confirmed: styles.confirmed,
  "checked-in": styles.checkedIn,
  "checked-out": styles.checkedOut,
  cancelled: styles.cancelled,
  "no-show": styles.noShow,
};

interface Props {
  status: ReservationStatus;
}

export default function StatusBadge({ status }: Props) {
  return (
    <span className={`${styles.badge} ${STATUS_CLASS[status] ?? ""}`}>
      <span className={styles.dot} />
      {STATUS_LABELS[status]}
    </span>
  );
}
