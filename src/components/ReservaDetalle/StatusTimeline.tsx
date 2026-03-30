import type { Reservation } from "@/types/reservas";
import { STATUS_LABELS } from "@/types/reservas";
import styles from "./StatusTimeline.module.css";

function formatDt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${day}/${month} ${h}:${m}`;
}

interface Props {
  reservation: Reservation;
}

export default function StatusTimeline({ reservation }: Props) {
  const history = reservation.statusHistory;

  const items: { key: string; text: string; at: string }[] = [];

  if (history?.length) {
    const sorted = [...history].sort(
      (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime(),
    );
    sorted.forEach((ev, i) => {
      const prev = ev.previousStatus
        ? STATUS_LABELS[ev.previousStatus]
        : "—";
      const next = STATUS_LABELS[ev.status];
      items.push({
        key: `${ev.at}-${i}`,
        text:
          ev.previousStatus != null
            ? `${prev} → ${next}`
            : STATUS_LABELS[ev.status],
        at: ev.at,
      });
    });
  } else {
    items.push({
      key: "created",
      text: "Reserva creada",
      at: reservation.createdAt,
    });
    if (reservation.updatedAt !== reservation.createdAt) {
      items.push({
        key: "updated",
        text: `Estado: ${STATUS_LABELS[reservation.status]}`,
        at: reservation.updatedAt,
      });
    }
  }

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>Historial de estado</h2>
      <ul className={styles.list}>
        {items.map((it) => (
          <li key={it.key} className={styles.item}>
            <span className={styles.dot} />
            <span className={styles.text}>{it.text}</span>
            <span className={styles.time}>{formatDt(it.at)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
