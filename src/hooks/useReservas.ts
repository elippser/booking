"use client";

import { useCallback, useEffect, useState } from "react";
import type { Reservation, ReservaFilters } from "@/types/reservas";
import {
  listReservations,
  updateInternalNotes,
  updateReservationStatus,
} from "@/services/apiReservas";

export function useReservas(
  token: string,
  propertyId: string,
  filters: ReservaFilters,
) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!token || !propertyId) {
      setReservations([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await listReservations(token, {
        propertyId,
        ...filters,
      });
      setReservations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setReservations([]);
    } finally {
      setLoading(false);
    }
  }, [token, propertyId, filters]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const setStatus = useCallback(
    async (
      reservationId: string,
      status: Reservation["status"],
      reason?: string,
    ) => {
      const updated = await updateReservationStatus(
        token,
        reservationId,
        status,
        reason,
      );
      setReservations((prev) =>
        prev.map((r) => (r.reservationId === reservationId ? updated : r)),
      );
      return updated;
    },
    [token],
  );

  const saveNotes = useCallback(
    async (reservationId: string, notes: string) => {
      const updated = await updateInternalNotes(token, reservationId, notes);
      setReservations((prev) =>
        prev.map((r) => (r.reservationId === reservationId ? updated : r)),
      );
      return updated;
    },
    [token],
  );

  return {
    reservations,
    loading,
    error,
    refetch,
    setStatus,
    saveNotes,
  };
}
