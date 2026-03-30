import type { GuestSummary } from "@/types/reservas";
import styles from "./GuestInfo.module.css";

interface Props {
  guest?: GuestSummary;
}

export default function GuestInfo({ guest }: Props) {
  if (!guest) {
    return (
      <section className={styles.section}>
        <h2 className={styles.heading}>Huésped</h2>
        <p className={styles.muted}>Sin datos de huésped.</p>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>Huésped</h2>
      <p className={styles.name}>
        {guest.firstName} {guest.lastName}
      </p>
      <p className={styles.line}>{guest.email}</p>
      <p className={styles.line}>{guest.phone}</p>
      <p className={styles.line}>
        {guest.document.type}: {guest.document.number}
      </p>
      <p className={styles.line}>{guest.nationality}</p>
    </section>
  );
}
