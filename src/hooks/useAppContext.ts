"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { jwtDecode } from "jwt-decode";
import type { AppContext } from "@/types/reservas";
import {
  emptyEmbed,
  mergeEmbed,
  persistEmbedFromSearchParams,
  readEmbedFromStorage,
  snapshotFromSearchParams,
} from "@/utils/embedContext";

interface JwtPayload {
  userId?: string;
  companyId?: string;
  role?: "owner" | "admin" | "staff";
  email?: string;
}

function getRoleFromToken(token: string): "owner" | "admin" | "staff" {
  if (!token) return "staff";
  try {
    const payload = jwtDecode<JwtPayload>(token);
    const role = payload?.role;
    if (role === "owner" || role === "admin" || role === "staff") return role;
    return "staff";
  } catch {
    return "staff";
  }
}

export function useAppContext(): AppContext & { isReady: boolean } {
  const params = useSearchParams();

  useEffect(() => {
    persistEmbedFromSearchParams(params);
  }, [params]);

  return useMemo(() => {
    const fromUrl = snapshotFromSearchParams(params);
    const stored =
      typeof window !== "undefined" ? readEmbedFromStorage() : emptyEmbed();
    const merged =
      typeof window !== "undefined" ? mergeEmbed(fromUrl, stored) : fromUrl;

    const companyId = merged.companyId;
    const propertyId = merged.propertyId;
    const token = merged.token;
    const spaceId = merged.spaceId || undefined;
    const role = getRoleFromToken(token);

    return {
      companyId,
      propertyId,
      spaceId,
      token,
      role,
      isReady: !!(companyId && propertyId && token),
    };
  }, [params]);
}
