"use client";

import { useCallback, useMemo, useState } from "react";
import ContextGate from "@/components/shared/ContextGate/ContextGate";
import { useAppContext } from "@/hooks/useAppContext";
import { useReservas } from "@/hooks/useReservas";
import { updateReservationStatus } from "@/services/apiReservas";
import type { ReservationStatus } from "@/types/reservas";
import { formatLongSpanishDate, toISODateLocal } from "@/utils/dateFormat";
import CheckinList from "./CheckinList";
import CheckoutList from "./CheckoutList";
import styles from "./PanelDia.module.css";

function PanelDiaInner() {
  const { token, propertyId } = useAppContext();
  const today = useMemo(() => toISODateLocal(new Date()), []);
  const titleDate = useMemo(
    () => formatLongSpanishDate(new Date()),
    [],
  );

  const checkInFilters = useMemo(() => ({ checkIn: today }), [today]);
  const checkOutFilters = useMemo(() => ({ checkOut: today }), [today]);

  const {
    reservations: checkIns,
    loading: loadingIn,
    error: errorIn,
    refetch: refetchIn,
  } = useReservas(token, propertyId, checkInFilters);

  const {
    reservations: checkOuts,
    loading: loadingOut,
    error: errorOut,
    refetch: refetchOut,
  } = useReservas(token, propertyId, checkOutFilters);

  const [busyId, setBusyId] = useState<string | null>(null);

  const refreshAll = useCallback(() => {
    void refetchIn();
    void refetchOut();
  }, [refetchIn, refetchOut]);

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
    [token, refreshAll],
  );

  const loading = loadingIn || loadingOut;
  const error = errorIn || errorOut;

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <h1 className={styles.title}>Panel del día — {titleDate}</h1>
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
          today={today}
          items={checkIns}
          onStatusChange={handleStatus}
          busyId={busyId}
        />
        <CheckoutList
          today={today}
          items={checkOuts}
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
