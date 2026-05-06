"use client";

import { useMemo, useState } from "react";
import ContextGate from "@/components/shared/ContextGate/ContextGate";
import { useAppContext } from "@/hooks/useAppContext";
import { useAvailabilityCalendar } from "@/hooks/useAvailabilityCalendar";
import { toISODateLocal } from "@/utils/dateFormat";
import styles from "./DisponibilidadGrid.module.css";

const WEEKDAYS_SHORT = ["D", "L", "M", "X", "J", "V", "S"];
const MONTHS_ES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

const WINDOW_DAYS = 20;

interface DialogData {
  categoryName: string;
  totalUnits: number;
  date: string;
  availableUnits: number;
}

function DisponibilidadGridInner() {
  const { token, propertyId } = useAppContext();
  const [offset, setOffset] = useState(0);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const fromDate = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + offset * WINDOW_DAYS);
    return d;
  }, [today, offset]);

  const toDate = useMemo(() => {
    const d = new Date(fromDate);
    d.setDate(d.getDate() + WINDOW_DAYS - 1);
    return d;
  }, [fromDate]);

  const fromIso = useMemo(() => toISODateLocal(fromDate), [fromDate]);
  const toIso = useMemo(() => toISODateLocal(toDate), [toDate]);
  const todayIso = useMemo(() => toISODateLocal(today), [today]);

  const { rows, loading, error } = useAvailabilityCalendar(
    token,
    propertyId,
    fromIso,
    toIso
  );

  const days = useMemo(() => {
    const arr: { iso: string; date: Date }[] = [];
    const cursor = new Date(fromDate);
    for (let i = 0; i < WINDOW_DAYS; i++) {
      arr.push({ iso: toISODateLocal(cursor), date: new Date(cursor) });
      cursor.setDate(cursor.getDate() + 1);
    }
    return arr;
  }, [fromDate]);

  const monthLabel = useMemo(() => {
    const fromMonth = MONTHS_ES[fromDate.getMonth()];
    const toMonth = MONTHS_ES[toDate.getMonth()];
    const year = toDate.getFullYear();
    if (fromMonth === toMonth)
      return `${fromMonth.charAt(0).toUpperCase() + fromMonth.slice(1)} ${year}`;
    return `${fromMonth.charAt(0).toUpperCase() + fromMonth.slice(1)} – ${
      toMonth.charAt(0).toUpperCase() + toMonth.slice(1)
    } ${year}`;
  }, [fromDate, toDate]);

  const [dialog, setDialog] = useState<DialogData | null>(null);

  return (
    <div className={styles.root}>
      <div className={styles.controls}>
        <div>
          <h1 className={styles.title}>Disponibilidad</h1>
          <p className={styles.subtitle}>
            Unidades libres por categoría y por día
          </p>
        </div>
        <div className={styles.monthNav}>
          <button
            type="button"
            onClick={() => setOffset((o) => o - 1)}
            aria-label="Ventana anterior"
          >
            ‹
          </button>
          <div className={styles.monthLabel}>{monthLabel}</div>
          <button
            type="button"
            onClick={() => setOffset((o) => o + 1)}
            aria-label="Ventana siguiente"
          >
            ›
          </button>
        </div>
        <div className={styles.legend}>
          <div className={styles.legItem}>
            <span className={`${styles.legDot} ${styles.legFree}`} />
            Libre
          </div>
          <div className={styles.legItem}>
            <span className={`${styles.legDot} ${styles.legPartial}`} />
            Parcial
          </div>
          <div className={styles.legItem}>
            <span className={`${styles.legDot} ${styles.legFull}`} />
            Lleno
          </div>
          <div className={styles.legItem}>
            <span className={`${styles.legDot} ${styles.legBlocked}`} />
            Sin datos
          </div>
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {loading && <p className={styles.muted}>Cargando…</p>}

      {!loading && rows.length === 0 && !error && (
        <p className={styles.muted}>
          No hay categorías con unidades para esta propiedad.
        </p>
      )}

      {rows.length > 0 && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", paddingLeft: 8 }}>Categoría</th>
                {days.map((d) => {
                  const isToday = d.iso === todayIso;
                  return (
                    <th
                      key={d.iso}
                      className={`${styles.dayTh} ${
                        isToday ? styles.todayTh : ""
                      }`}
                    >
                      {d.date.getDate()}
                      <span className={styles.dayWd}>
                        {WEEKDAYS_SHORT[d.date.getDay()]}
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const dayMap = new Map(row.days.map((d) => [d.date, d.availableUnits]));
                return (
                  <tr key={row.categoryId}>
                    <td className={styles.catLabelCell}>
                      <div className={styles.catName}>{row.name}</div>
                      <div className={styles.catUnits}>
                        {row.totalUnits} unidad
                        {row.totalUnits === 1 ? "" : "es"}
                      </div>
                    </td>
                    {days.map((d) => {
                      const isToday = d.iso === todayIso;
                      const available = dayMap.get(d.iso);
                      const total = row.totalUnits;
                      let cellClass = styles.cellBlocked;
                      let display = "—";
                      if (available != null && total > 0) {
                        const ratio = available / total;
                        if (available === 0) cellClass = styles.cellFull;
                        else if (ratio < 0.5) cellClass = styles.cellPartial;
                        else cellClass = styles.cellFree;
                        display = String(available);
                      }
                      return (
                        <td key={d.iso}>
                          <button
                            type="button"
                            className={`${styles.cell} ${cellClass} ${
                              isToday ? styles.cellToday : ""
                            }`}
                            onClick={() =>
                              setDialog({
                                categoryName: row.name,
                                totalUnits: total,
                                date: d.iso,
                                availableUnits: available ?? total,
                              })
                            }
                          >
                            <span className={styles.cellNum}>{display}</span>
                            {available != null && total > 0 && (
                              <span className={styles.cellTotal}>de {total}</span>
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {dialog && (
        <div
          className={styles.overlay}
          role="presentation"
          onClick={(e) => e.target === e.currentTarget && setDialog(null)}
        >
          <div className={styles.dialog} role="dialog" aria-modal>
            <h3 className={styles.dialogTitle}>{dialog.categoryName}</h3>
            <p className={styles.dialogSub}>{dialog.date}</p>
            <div className={styles.dialogRow}>
              <span className={styles.dialogLabel}>Disponibles</span>
              <span className={styles.dialogVal}>{dialog.availableUnits}</span>
            </div>
            <div className={styles.dialogRow}>
              <span className={styles.dialogLabel}>Total unidades</span>
              <span className={styles.dialogVal}>{dialog.totalUnits}</span>
            </div>
            <div className={styles.dialogRow}>
              <span className={styles.dialogLabel}>Reservadas</span>
              <span className={styles.dialogVal}>
                {dialog.totalUnits - dialog.availableUnits}
              </span>
            </div>
            <button
              type="button"
              className={styles.dialogClose}
              onClick={() => setDialog(null)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DisponibilidadGrid() {
  return (
    <ContextGate>
      <DisponibilidadGridInner />
    </ContextGate>
  );
}
