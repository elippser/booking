"use client";

import { useCallback, useMemo, useState } from "react";
import ContextGate from "@/components/shared/ContextGate/ContextGate";
import { useAppContext } from "@/hooks/useAppContext";
import { useReservas } from "@/hooks/useReservas";
import { updateReservationStatus } from "@/services/apiReservas";
import type { ReservationStatus } from "@/types/reservas";
import {
  formatLongSpanishDate,
  formatShortSpanishDate,
  toISODateLocal,
} from "@/utils/dateFormat";
import CheckinList from "./CheckinList";
import CheckoutList from "./CheckoutList";
import styles from "./PanelDia.module.css";

function PanelDiaInner() {
  const { token, propertyId } = useAppContext();
  const [dayOffset, setDayOffset] = useState(0);

  const baseDay = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + dayOffset);
    return d;
  }, [dayOffset]);

  const nextDay = useMemo(() => {
    const d = new Date(baseDay);
    d.setDate(d.getDate() + 1);
    return d;
  }, [baseDay]);

  const baseIso = useMemo(() => toISODateLocal(baseDay), [baseDay]);
  const nextIso = useMemo(() => toISODateLocal(nextDay), [nextDay]);

  const checkInTodayFilters = useMemo(() => ({ checkIn: baseIso }), [baseIso]);
  const checkInTomorrowFilters = useMemo(
    () => ({ checkIn: nextIso }),
    [nextIso]
  );
  const checkOutTodayFilters = useMemo(() => ({ checkOut: baseIso }), [baseIso]);
  const checkOutTomorrowFilters = useMemo(
    () => ({ checkOut: nextIso }),
    [nextIso]
  );

  const inToday = useReservas(token, propertyId, checkInTodayFilters);
  const inTomorrow = useReservas(token, propertyId, checkInTomorrowFilters);
  const outToday = useReservas(token, propertyId, checkOutTodayFilters);
  const outTomorrow = useReservas(token, propertyId, checkOutTomorrowFilters);

  const [busyId, setBusyId] = useState<string | null>(null);

  const refreshAll = useCallback(() => {
    void inToday.refetch();
    void inTomorrow.refetch();
    void outToday.refetch();
    void outTomorrow.refetch();
  }, [inToday.refetch, inTomorrow.refetch, outToday.refetch, outTomorrow.refetch]);

  const handleStatus = useCallback(
    async (reservationId: string, status: ReservationStatus) => {
      setBusyId(reservationId);
      try {
        await updateReservationStatus(token, reservationId, status);
        refreshAll();
      } finally {
        setBusyId(null);
      }
    },
    [token, refreshAll]
  );

  const loading =
    inToday.loading || inTomorrow.loading || outToday.loading || outTomorrow.loading;
  const error =
    inToday.error || inTomorrow.error || outToday.error || outTomorrow.error;

  const checkInCountToday = inToday.reservations.length;
  const checkOutCountToday = outToday.reservations.length;

  const dayLabel = formatLongSpanishDate(baseDay);
  const todayLabel = formatShortSpanishDate(baseDay);
  const tomorrowLabel = formatShortSpanishDate(nextDay);

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Panel del día</h1>
          <p className={styles.subtitle}>
            Vista operativa de movimientos de hoy y mañana
          </p>
        </div>
        <div className={styles.dayNav}>
          <button
            type="button"
            onClick={() => setDayOffset((o) => o - 1)}
            aria-label="Día anterior"
          >
            ‹
          </button>
          <div className={styles.dayCenter}>
            <div className={styles.dayLabel}>{dayLabel}</div>
            <div className={styles.daySub}>2 días visibles</div>
          </div>
          <button
            type="button"
            onClick={() => setDayOffset((o) => o + 1)}
            aria-label="Día siguiente"
          >
            ›
          </button>
        </div>
        <button
          type="button"
          className={styles.refresh}
          onClick={() => refreshAll()}
          disabled={loading}
          title="Actualizar"
        >
          ↻
        </button>
      </header>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.grid}>
        <CheckinList
          today={baseIso}
          tomorrow={nextIso}
          todayLabel={todayLabel}
          tomorrowLabel={tomorrowLabel}
          itemsToday={inToday.reservations}
          itemsTomorrow={inTomorrow.reservations}
          countToday={checkInCountToday}
          onStatusChange={handleStatus}
          busyId={busyId}
        />
        <CheckoutList
          today={baseIso}
          tomorrow={nextIso}
          todayLabel={todayLabel}
          tomorrowLabel={tomorrowLabel}
          itemsToday={outToday.reservations}
          itemsTomorrow={outTomorrow.reservations}
          countToday={checkOutCountToday}
          onStatusChange={handleStatus}
          busyId={busyId}
        />
      </div>
    </div>
  );
}

export default function PanelDia() {
  return (
    <ContextGate>
      <PanelDiaInner />
    </ContextGate>
  );
}
