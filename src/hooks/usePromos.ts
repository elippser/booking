"use client";

import { useCallback, useEffect, useState } from "react";
import type { CreatePromoPayload, Promo } from "@/types/reservas";
import {
  createPromo as apiCreate,
  deletePromo as apiDelete,
  listPromos,
  togglePromo as apiToggle,
  updatePromo as apiUpdate,
} from "@/services/apiReservas";

export function usePromos(token: string, propertyId: string) {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!token || !propertyId) {
      setPromos([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await listPromos(token, propertyId);
      setPromos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setPromos([]);
    } finally {
      setLoading(false);
    }
  }, [token, propertyId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const create = useCallback(
    async (payload: CreatePromoPayload) => {
      const created = await apiCreate(token, payload);
      setPromos((prev) => [created, ...prev]);
      return created;
    },
    [token]
  );

  const update = useCallback(
    async (promoId: string, patch: Partial<CreatePromoPayload>) => {
      const updated = await apiUpdate(token, promoId, patch);
      setPromos((prev) => prev.map((p) => (p.promoId === promoId ? updated : p)));
      return updated;
    },
    [token]
  );

  const toggle = useCallback(
    async (promoId: string, isEnabled: boolean) => {
      const updated = await apiToggle(token, promoId, isEnabled);
      setPromos((prev) => prev.map((p) => (p.promoId === promoId ? updated : p)));
      return updated;
    },
    [token]
  );

  const remove = useCallback(
    async (promoId: string) => {
      await apiDelete(token, promoId);
      setPromos((prev) => prev.filter((p) => p.promoId !== promoId));
    },
    [token]
  );

  return { promos, loading, error, refetch, create, update, toggle, remove };
}
