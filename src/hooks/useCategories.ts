"use client";

import { useCallback, useEffect, useState } from "react";
import type { Category } from "@/types/reservas";
import { listCategories } from "@/services/apiReservas";

export function useCategories(token: string, propertyId: string) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!token || !propertyId) {
      setCategories([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await listCategories(token, propertyId);
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [token, propertyId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { categories, loading, error, refetch };
}
