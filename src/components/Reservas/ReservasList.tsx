"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import ContextGate from "@/components/shared/ContextGate/ContextGate";
import { useAppContext } from "@/hooks/useAppContext";
import { useReservas } from "@/hooks/useReservas";
import type { ReservaFilters as RF } from "@/types/reservas";
import ReservaFilters from "./ReservaFilters";
import ReservaRow from "./ReservaRow";
import styles from "./ReservasList.module.css";

function ReservasListInner() {
  const { token, propertyId } = useAppContext();
  const searchParams = useSearchParams();
  const qs = searchParams.toString();
  const suffix = qs ? `?${qs}` : "";

  const [filters, setFilters] = useState<RF>({});

  const apiFilters = useMemo(() => {
    const { search: _s, ...rest } = filters;
    return rest;
  }, [filters.status, filters.checkIn, filters.checkOut, filters.channel]);

  const { reservations, loading, error, refetch } = useReservas(
    token,
    propertyId,
    apiFilters,
  );

  const filtered = useMemo(() => {
    const q = filters.search?.trim().toLowerCase();
    if (!q) return reservations;
    return reservations.filter((r) => {
      const code = r.reservationCode.toLowerCase();
      const name = r.guest
        ? `${r.guest.firstName} ${r.guest.lastName}`.toLowerCase()
        : "";
      return code.includes(q) || name.includes(q);
    });
  }, [reservations, filters.search]);

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <h1 className={styles.title}>Reservas</h1>
        <Link href={`/nueva${suffix}`} className={styles.newBtn}>
          + Nueva
        </Link>
      </header>

      <ReservaFilters value={filters} onChange={setFilters} />

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Cód.</th>
              <th>Huésped</th>
              <th>Fechas</th>
              <th>Cat.</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className={styles.muted}>
                  Cargando…
                </td>
              </tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={5} className={styles.muted}>
                  No hay reservas con estos criterios.
                </td>
              </tr>
            )}
            {!loading &&
              filtered.map((r) => <ReservaRow key={r.reservationId} reservation={r} />)}
          </tbody>
        </table>
      </div>

      <p className={styles.footer}>
        <button
          type="button"
          className={styles.ghost}
          onClick={() => refetch()}
          disabled={loading}
        >
          ↻ Actualizar
        </button>
      </p>
    </div>
  );
}

export default function ReservasList() {
  return (
    <ContextGate>
      <ReservasListInner />
    </ContextGate>
  );
}
