"use client";

import { useCallback, useEffect, useState } from "react";
import type { CalendarRow } from "@/types/reservas";
import { getAvailabilityCalendar } from "@/services/apiReservas";

export function useAvailabilityCalendar(
  token: string,
  propertyId: string,
  from: string,
  to: string
) {
  const [rows, setRows] = useState<CalendarRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!token || !propertyId || !from || !to) {
      setRows([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getAvailabilityCalendar(token, {
        propertyId,
        from,
        to,
      });
      setRows(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [token, propertyId, from, to]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { rows, loading, error, refetch };
}
