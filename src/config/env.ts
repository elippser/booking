/**
 * Variables de entorno públicas (NEXT_PUBLIC_*).
 * Definir en `.env.local` (local) o en el panel de Vercel (producción).
 */
export const env = {
  reservasApiBase:
    process.env.NEXT_PUBLIC_RESERVAS_API_BASE ?? "http://localhost:7070",
  coreApiUrl:
    process.env.NEXT_PUBLIC_CORE_API_URL ?? "http://localhost:3030",
} as const;
