"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import ContextGate from "@/components/shared/ContextGate/ContextGate";
import StatusBadge from "@/components/shared/StatusBadge/StatusBadge";
import { useAppContext } from "@/hooks/useAppContext";
import { getReservation, updateInternalNotes } from "@/services/apiReservas";
import type { Reservation } from "@/types/reservas";
import { CHANNEL_LABELS } from "@/types/reservas";
import { dateOnly, formatShortStayRange } from "@/utils/dateFormat";
import AccionesReserva from "./AccionesReserva";
import GuestInfo from "./GuestInfo";
import StatusTimeline from "./StatusTimeline";
import styles from "./ReservaDetalle.module.css";

function ReservaDetalleInner() {
  const params = useParams();
  const searchParams = useSearchParams();
  const reservationId = params.reservationId as string;
  const qs = searchParams.toString();
  const suffix = qs ? `?${qs}` : "";

  const { token } = useAppContext();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [notesSaving, setNotesSaving] = useState(false);
  const [notesErr, setNotesErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token || !reservationId) return;
    setLoading(true);
    setError(null);
    try {
      const r = await getReservation(token, reservationId);
      setReservation(r);
      setNotes(r.internalNotes ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
      setReservation(null);
    } finally {
      setLoading(false);
    }
  }, [token, reservationId]);

  useEffect(() => {
    void load();
  }, [load]);

  const saveNotes = async () => {
    if (!token || !reservation) return;
    setNotesSaving(true);
    setNotesErr(null);
    try {
      const updated = await updateInternalNotes(
        token,
        reservation.reservationId,
        notes,
      );
      setReservation(updated);
    } catch (e) {
      setNotesErr(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setNotesSaving(false);
    }
  };

  if (loading) {
    return <p className={styles.muted}>Cargando…</p>;
  }
  if (error || !reservation) {
    return <p className={styles.error}>{error ?? "Reserva no encontrada."}</p>;
  }

  const r = reservation;

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <Link href={`/reservas${suffix}`} className={styles.back}>
          ← Volver
        </Link>
        <div className={styles.headerMid}>
          <span className={styles.code}>{r.reservationCode}</span>
          <StatusBadge status={r.status} />
        </div>
      </header>

      <div className={styles.grid}>
        <GuestInfo guest={r.guest} />
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Reserva</h2>
          <p className={styles.line}>
            {r.categoryName ?? "Categoría"} ·{" "}
            {r.assignedUnitName && (
              <span className={styles.unit}>
                Unidad: {r.assignedUnitName}
                <br />
              </span>
            )}
            {formatShortStayRange(r.checkIn, r.checkOut)} · {r.nights} noches
          </p>
          <p className={styles.line}>
            {r.adults} adulto{r.adults !== 1 ? "s" : ""} · {r.children} niño
            {r.children !== 1 ? "s" : ""}
          </p>
          <p className={styles.line}>
            {r.currency} {r.totalAmount} total
          </p>
          <p className={styles.line}>
            Canal: {CHANNEL_LABELS[r.channel]}
          </p>
          <p className={styles.lineMuted}>
            Check-in: {dateOnly(r.checkIn)} · Check-out: {dateOnly(r.checkOut)}
          </p>
        </section>
      </div>

      <section className={styles.block}>
        <h2 className={styles.blockTitle}>Solicitudes especiales</h2>
        <p className={styles.blockBody}>
          {r.specialRequests?.trim() || "—"}
        </p>
      </section>

      <section className={styles.block}>
        <h2 className={styles.blockTitle}>Notas internas</h2>
        <textarea
          className={styles.textarea}
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        {notesErr && <p className={styles.error}>{notesErr}</p>}
        <div className={styles.notesActions}>
          <button
            type="button"
            className={styles.saveBtn}
            onClick={() => void saveNotes()}
            disabled={notesSaving}
          >
            {notesSaving ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </section>

      <StatusTimeline reservation={r} />

      <AccionesReserva
        token={token}
        reservation={r}
        onUpdated={(up) => setReservation(up)}
      />
    </div>
  );
}

export default function ReservaDetalle() {
  return (
    <ContextGate>
      <ReservaDetalleInner />
    </ContextGate>
  );
}
