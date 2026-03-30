"use client";

import type {
  ReservationChannel,
  ReservationStatus,
  ReservaFilters as RF,
} from "@/types/reservas";
import { CHANNEL_LABELS, STATUS_LABELS } from "@/types/reservas";
import styles from "./ReservaFilters.module.css";

interface Props {
  value: RF;
  onChange: (next: RF) => void;
}

const STATUS_VALUES: ReservationStatus[] = [
  "pending",
  "confirmed",
  "checked-in",
  "checked-out",
  "cancelled",
  "no-show",
];

const CHANNEL_VALUES: ReservationChannel[] = ["direct", "phone", "ota"];

export default function ReservaFilters({ value, onChange }: Props) {
  return (
    <div className={styles.bar}>
      <label className={styles.field}>
        <span className={styles.label}>Estado</span>
        <select
          className={styles.select}
          value={value.status ?? ""}
          onChange={(e) =>
            onChange({
              ...value,
              status: (e.target.value || undefined) as ReservationStatus | undefined,
            })
          }
        >
          <option value="">Todos</option>
          {STATUS_VALUES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Check-in desde</span>
        <input
          type="date"
          className={styles.input}
          value={value.checkIn ?? ""}
          onChange={(e) =>
            onChange({
              ...value,
              checkIn: e.target.value || undefined,
            })
          }
        />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Check-in hasta</span>
        <input
          type="date"
          className={styles.input}
          value={value.checkOut ?? ""}
          onChange={(e) =>
            onChange({
              ...value,
              checkOut: e.target.value || undefined,
            })
          }
        />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Canal</span>
        <select
          className={styles.select}
          value={value.channel ?? ""}
          onChange={(e) =>
            onChange({
              ...value,
              channel: (e.target.value || undefined) as
                | ReservationChannel
                | undefined,
            })
          }
        >
          <option value="">Todos</option>
          {CHANNEL_VALUES.map((c) => (
            <option key={c} value={c}>
              {CHANNEL_LABELS[c]}
            </option>
          ))}
        </select>
      </label>

      <label className={`${styles.field} ${styles.grow}`}>
        <span className={styles.label}>Buscar</span>
        <input
          type="search"
          className={styles.input}
          placeholder="Código o nombre de huésped"
          value={value.search ?? ""}
          onChange={(e) =>
            onChange({
              ...value,
              search: e.target.value || undefined,
            })
          }
        />
      </label>
    </div>
  );
}
