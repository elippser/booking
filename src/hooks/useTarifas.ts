"use client";

import { useCallback, useEffect, useState } from "react";
import type { CreateRatePlanPayload, RatePlan } from "@/types/reservas";
import {
  createRatePlan as apiCreateRatePlan,
  deleteRatePlan as apiDeleteRatePlan,
  listRatePlans,
  updateRatePlan as apiUpdateRatePlan,
} from "@/services/apiReservas";

export function useTarifas(
  token: string,
  propertyId: string,
  categoryId?: string,
) {
  const [ratePlans, setRatePlans] = useState<RatePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!token || !propertyId) {
      setRatePlans([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await listRatePlans(token, propertyId, categoryId);
      setRatePlans(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setRatePlans([]);
    } finally {
      setLoading(false);
    }
  }, [token, propertyId, categoryId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const createRatePlan = useCallback(
    async (payload: CreateRatePlanPayload) => {
      const created = await apiCreateRatePlan(token, payload);
      setRatePlans((prev) => [...prev, created]);
      return created;
    },
    [token],
  );

  const updateRatePlan = useCallback(
    async (ratePlanId: string, payload: Partial<CreateRatePlanPayload>) => {
      const updated = await apiUpdateRatePlan(token, ratePlanId, payload);
      setRatePlans((prev) =>
        prev.map((p) => (p.ratePlanId === ratePlanId ? updated : p)),
      );
      return updated;
    },
    [token],
  );

  const deleteRatePlan = useCallback(
    async (ratePlanId: string) => {
      await apiDeleteRatePlan(token, ratePlanId);
      setRatePlans((prev) => prev.filter((p) => p.ratePlanId !== ratePlanId));
    },
    [token],
  );

  return {
    ratePlans,
    loading,
    error,
    refetch,
    createRatePlan,
    updateRatePlan,
    deleteRatePlan,
  };
}
