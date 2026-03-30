"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import ContextGate from "@/components/shared/ContextGate/ContextGate";
import { useAppContext } from "@/hooks/useAppContext";
import { checkAvailability, createReservation } from "@/services/apiReservas";
import type { AvailabilityResult, ReservationChannel } from "@/types/reservas";
import { CHANNEL_LABELS } from "@/types/reservas";
import type { GuestSummary } from "@/types/reservas";
import BusquedaHuesped, { emptyDraft, type DraftGuest } from "./BusquedaHuesped";
import DisponibilidadSelector from "./DisponibilidadSelector";
import styles from "./NuevaReservaForm.module.css";

function nightsBetween(checkIn: string, checkOut: string): number {
  const a = new Date(checkIn.slice(0, 10) + "T12:00:00");
  const b = new Date(checkOut.slice(0, 10) + "T12:00:00");
  const n = Math.round((b.getTime() - a.getTime()) / 86400000);
  return Math.max(0, n);
}

function NuevaReservaFormInner() {
  const { token, propertyId } = useAppContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const qs = searchParams.toString();
  const suffix = qs ? `?${qs}` : "";

  const [step, setStep] = useState<1 | 2>(1);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [channel, setChannel] = useState<ReservationChannel>("direct");
  const [availability, setAvailability] = useState<AvailabilityResult[]>([]);
  const [selected, setSelected] = useState<AvailabilityResult | null>(null);
  const [guestFound, setGuestFound] = useState<GuestSummary | null>(null);
  const [guestDraft, setGuestDraft] = useState<DraftGuest>(() => emptyDraft());
  const [specialRequests, setSpecialRequests] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const nights = useMemo(
    () =>
      checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 0,
    [checkIn, checkOut],
  );

  const searchAvailability = async () => {
    if (!checkIn || !checkOut) {
      setErr("Completá fechas de check-in y check-out.");
      return;
    }
    if (nights <= 0) {
      setErr("La fecha de salida debe ser posterior al check-in.");
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const rows = await checkAvailability(token, {
        propertyId,
        checkIn,
        checkOut,
        adults,
        children,
      });
      setAvailability(rows);
      setSelected(null);
      if (rows.length > 0) setStep(2);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error al buscar disponibilidad");
      setAvailability([]);
    } finally {
      setBusy(false);
    }
  };

  const totalPreview = useMemo(() => {
    if (!selected || nights <= 0) return null;
    const p = selected.pricePerNight;
    if (p == null) return null;
    const cur = selected.currency ?? "USD";
    return { amount: p * nights, currency: cur };
  }, [selected, nights]);

  const submit = async () => {
    if (!selected) {
      setErr("Seleccioná una categoría.");
      return;
    }
    if (!guestFound) {
      const d = guestDraft;
      if (
        !d.firstName.trim() ||
        !d.lastName.trim() ||
        !d.email.trim() ||
        !d.phone.trim() ||
        !d.documentNumber.trim()
      ) {
        setErr("Completá los datos del huésped.");
        return;
      }
    }

    setBusy(true);
    setErr(null);
    try {
      const total =
        totalPreview?.amount ??
        (selected.pricePerNight != null
          ? selected.pricePerNight * nights
          : 0);
      const currency = totalPreview?.currency ?? selected.currency ?? "USD";

      const created = await createReservation(token, {
        propertyId,
        categoryId: selected.categoryId,
        guestId: guestFound?.guestId,
        guest: guestFound
          ? undefined
          : {
              firstName: guestDraft.firstName.trim(),
              lastName: guestDraft.lastName.trim(),
              email: guestDraft.email.trim(),
              phone: guestDraft.phone.trim(),
              document: {
                type: guestDraft.documentType.trim() || "DNI",
                number: guestDraft.documentNumber.trim(),
              },
              nationality: guestDraft.nationality.trim() || "—",
            },
        checkIn,
        checkOut,
        adults,
        children,
        channel,
        status: "confirmed",
        specialRequests: specialRequests.trim() || undefined,
        internalNotes: internalNotes.trim() || undefined,
        totalAmount: total,
        currency,
      });

      router.push(`/reservas/${created.reservationId}${suffix}`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error al crear la reserva");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.root}>
      <h1 className={styles.title}>Nueva reserva</h1>

      {step === 1 && (
        <section className={styles.card}>
          <div className={styles.row4}>
            <label className={styles.field}>
              <span>Check-in</span>
              <input
                type="date"
                className={styles.input}
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
              />
            </label>
            <label className={styles.field}>
              <span>Check-out</span>
              <input
                type="date"
                className={styles.input}
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
              />
            </label>
            <label className={styles.field}>
              <span>Adultos</span>
              <select
                className={styles.input}
                value={adults}
                onChange={(e) => setAdults(Number(e.target.value))}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.field}>
              <span>Niños</span>
              <select
                className={styles.input}
                value={children}
                onChange={(e) => setChildren(Number(e.target.value))}
              >
                {[0, 1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className={styles.field}>
            <span>Canal de origen</span>
            <select
              className={styles.input}
              value={channel}
              onChange={(e) =>
                setChannel(e.target.value as ReservationChannel)
              }
            >
              {(Object.keys(CHANNEL_LABELS) as ReservationChannel[]).map(
                (c) => (
                  <option key={c} value={c}>
                    {CHANNEL_LABELS[c]}
                  </option>
                ),
              )}
            </select>
          </label>
          {err && <p className={styles.error}>{err}</p>}
          <button
            type="button"
            className={styles.primary}
            onClick={() => void searchAvailability()}
            disabled={busy}
          >
            {busy ? "Buscando…" : "Buscar disponibilidad"}
          </button>
        </section>
      )}

      {step === 2 && (
        <>
          <button
            type="button"
            className={styles.back}
            onClick={() => {
              setStep(1);
              setErr(null);
            }}
          >
            ← Volver al paso 1
          </button>

          <section className={styles.card}>
            <h2 className={styles.subtitle}>Categoría</h2>
            <DisponibilidadSelector
              results={availability}
              selectedId={selected?.categoryId ?? null}
              onSelect={setSelected}
            />
            {selected && (
              <p className={styles.summary}>
                Categoría:{" "}
                <strong>{selected.categoryName ?? selected.categoryId}</strong>
                {selected.pricePerNight != null && (
                  <>
                    {" "}
                    · {selected.currency ?? "USD"} {selected.pricePerNight}/noche
                    {nights > 0 && (
                      <>
                        {" "}
                        · Total estimado: {selected.currency ?? "USD"}{" "}
                        {selected.pricePerNight * nights}
                      </>
                    )}
                  </>
                )}
              </p>
            )}
          </section>

          <section className={styles.card}>
            <BusquedaHuesped
              token={token}
              found={guestFound}
              draft={guestDraft}
              onFound={setGuestFound}
              onDraft={setGuestDraft}
            />
          </section>

          <section className={styles.card}>
            <label className={styles.field}>
              <span>Solicitudes especiales</span>
              <textarea
                className={styles.textarea}
                rows={2}
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
              />
            </label>
            <label className={styles.field}>
              <span>Notas internas</span>
              <textarea
                className={styles.textarea}
                rows={2}
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
              />
            </label>
          </section>

          {err && <p className={styles.error}>{err}</p>}
          <button
            type="button"
            className={styles.primary}
            onClick={() => void submit()}
            disabled={busy || !selected}
          >
            {busy ? "Creando…" : "Crear reserva"}
          </button>
        </>
      )}
    </div>
  );
}

export default function NuevaReservaForm() {
  return (
    <ContextGate>
      <NuevaReservaFormInner />
    </ContextGate>
  );
}
