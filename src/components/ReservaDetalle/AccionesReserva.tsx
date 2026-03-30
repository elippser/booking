"use client";

import { useState } from "react";
import type { Reservation, ReservationStatus } from "@/types/reservas";
import { STATUS_LABELS, VALID_TRANSITIONS } from "@/types/reservas";
import { updateReservationStatus } from "@/services/apiReservas";
import styles from "./AccionesReserva.module.css";

const BUTTON_LABEL: Partial<Record<ReservationStatus, string>> = {
  confirmed: "Confirmar",
  "checked-in": "Check-in",
  "checked-out": "Check-out",
  cancelled: "Cancelar",
  "no-show": "No-show",
};

interface Props {
  token: string;
  reservation: Reservation;
  onUpdated: (r: Reservation) => void;
}

export default function AccionesReserva({
  token,
  reservation,
  onUpdated,
}: Props) {
  const [modal, setModal] = useState<ReservationStatus | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const allowed = VALID_TRANSITIONS[reservation.status] ?? [];

  const close = () => {
    setModal(null);
    setReason("");
    setErr(null);
  };

  const submit = async () => {
    if (!modal) return;
    if (modal === "cancelled" && !reason.trim()) {
      setErr("Indicá el motivo de cancelación.");
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const updated = await updateReservationStatus(
        token,
        reservation.reservationId,
        modal,
        modal === "cancelled" ? reason.trim() : undefined,
      );
      onUpdated(updated);
      close();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>Acciones</h2>
      <div className={styles.row}>
        {allowed.map((next) => (
          <button
            key={next}
            type="button"
            className={styles.btn}
            onClick={() => setModal(next)}
          >
            {BUTTON_LABEL[next] ?? STATUS_LABELS[next]}
          </button>
        ))}
        {allowed.length === 0 && (
          <p className={styles.muted}>No hay acciones disponibles.</p>
        )}
      </div>

      {modal != null && (
        <div
          className={styles.overlay}
          role="presentation"
          onClick={(e) => e.target === e.currentTarget && !busy && close()}
        >
          <div className={styles.dialog} role="dialog" aria-modal>
            <h3 className={styles.dialogTitle}>
              Confirmar: {STATUS_LABELS[modal]}
            </h3>
            {modal === "cancelled" && (
              <label className={styles.field}>
                <span>Motivo de cancelación</span>
                <textarea
                  className={styles.textarea}
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Motivo…"
                />
              </label>
            )}
            {err && <p className={styles.error}>{err}</p>}
            <div className={styles.dialogActions}>
              <button
                type="button"
                className={styles.ghost}
                onClick={close}
                disabled={busy}
              >
                Volver
              </button>
              <button
                type="button"
                className={styles.primary}
                onClick={() => void submit()}
                disabled={busy}
              >
                {busy ? "…" : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
