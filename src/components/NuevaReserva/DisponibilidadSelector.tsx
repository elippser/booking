"use client";

import type { AvailabilityResult } from "@/types/reservas";
import styles from "./DisponibilidadSelector.module.css";

interface Props {
  results: AvailabilityResult[];
  selectedId: string | null;
  onSelect: (row: AvailabilityResult) => void;
}

export default function DisponibilidadSelector({
  results,
  selectedId,
  onSelect,
}: Props) {
  if (results.length === 0) {
    return (
      <p className={styles.empty}>
        No hay categorías disponibles para esas fechas.
      </p>
    );
  }

  return (
    <ul className={styles.list}>
      {results.map((row) => {
        const active = row.categoryId === selectedId;
        return (
          <li key={row.categoryId}>
            <button
              type="button"
              className={`${styles.card} ${active ? styles.active : ""}`}
              onClick={() => onSelect(row)}
            >
              <span className={styles.name}>
                {row.categoryName ?? row.categoryId}
              </span>
              <span className={styles.price}>
                {row.currency ?? "USD"}{" "}
                {row.pricePerNight != null ? row.pricePerNight : "—"}/noche
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
