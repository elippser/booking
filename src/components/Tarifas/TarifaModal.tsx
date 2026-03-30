"use client";

import { useEffect, useMemo, useState } from "react";
import type { CreateRatePlanPayload, RatePlan } from "@/types/reservas";
import { CURRENCY_OPTIONS } from "@/types/reservas";
import styles from "./TarifaModal.module.css";

export interface CategoryOption {
  categoryId: string;
  label: string;
}

interface Props {
  open: boolean;
  mode: "create" | "edit";
  propertyId: string;
  categories: CategoryOption[];
  initial?: RatePlan | null;
  onClose: () => void;
  onSave: (payload: CreateRatePlanPayload) => Promise<void>;
  onUpdate: (
    ratePlanId: string,
    payload: Partial<CreateRatePlanPayload>,
  ) => Promise<void>;
}

export default function TarifaModal({
  open,
  mode,
  propertyId,
  categories,
  initial,
  onClose,
  onSave,
  onUpdate,
}: Props) {
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [pricePerNight, setPricePerNight] = useState("");
  const [currency, setCurrency] = useState<(typeof CURRENCY_OPTIONS)[number]>(
    "USD",
  );
  const [minNights, setMinNights] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const fallbackCategory = useMemo(
    () => categories[0]?.categoryId ?? "",
    [categories],
  );

  useEffect(() => {
    if (!open) return;
    setErr(null);
    if (mode === "edit" && initial) {
      setName(initial.name);
      setCategoryId(initial.categoryId);
      setStartDate(initial.startDate.slice(0, 10));
      setEndDate(initial.endDate.slice(0, 10));
      setPricePerNight(String(initial.pricePerNight));
      setCurrency(initial.currency as (typeof CURRENCY_OPTIONS)[number]);
      setMinNights(
        initial.minNights != null ? String(initial.minNights) : "",
      );
    } else {
      setName("");
      setCategoryId(fallbackCategory);
      setStartDate("");
      setEndDate("");
      setPricePerNight("");
      setCurrency("USD");
      setMinNights("");
    }
  }, [open, mode, initial, fallbackCategory]);

  if (!open) return null;

  const submit = async () => {
    const cat = categoryId.trim() || fallbackCategory;
    if (!name.trim() || !cat || !startDate || !endDate) {
      setErr("Completá nombre, categoría y fechas.");
      return;
    }
    const price = Number(pricePerNight);
    if (Number.isNaN(price) || price < 0) {
      setErr("Precio por noche inválido.");
      return;
    }
    const minN = minNights.trim() === "" ? undefined : Number(minNights);
    if (minN !== undefined && (Number.isNaN(minN) || minN < 1)) {
      setErr("Mínimo de noches inválido.");
      return;
    }

    setBusy(true);
    setErr(null);
    try {
      if (mode === "create") {
        await onSave({
          propertyId,
          categoryId: cat,
          name: name.trim(),
          startDate,
          endDate,
          pricePerNight: price,
          currency,
          minNights: minN,
          isActive: true,
        });
      } else if (initial) {
        await onUpdate(initial.ratePlanId, {
          categoryId: cat,
          name: name.trim(),
          startDate,
          endDate,
          pricePerNight: price,
          currency,
          minNights: minN,
        });
      }
      onClose();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className={styles.overlay}
      role="presentation"
      onClick={(e) => e.target === e.currentTarget && !busy && onClose()}
    >
      <div className={styles.dialog} role="dialog" aria-modal>
        <h2 className={styles.title}>
          {mode === "create" ? "Nueva tarifa" : "Editar tarifa"}
        </h2>

        <label className={styles.field}>
          <span>Nombre del plan</span>
          <input
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>

        <label className={styles.field}>
          <span>Categoría</span>
          {categories.length > 0 ? (
            <select
              className={styles.input}
              value={categoryId || fallbackCategory}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c.categoryId} value={c.categoryId}>
                  {c.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              className={styles.input}
              placeholder="categoryId"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            />
          )}
        </label>

        <div className={styles.row2}>
          <label className={styles.field}>
            <span>Fecha inicio</span>
            <input
              type="date"
              className={styles.input}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </label>
          <label className={styles.field}>
            <span>Fecha fin</span>
            <input
              type="date"
              className={styles.input}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </label>
        </div>

        <div className={styles.row2}>
          <label className={styles.field}>
            <span>Precio / noche</span>
            <input
              type="number"
              min={0}
              step="0.01"
              className={styles.input}
              value={pricePerNight}
              onChange={(e) => setPricePerNight(e.target.value)}
            />
          </label>
          <label className={styles.field}>
            <span>Moneda</span>
            <select
              className={styles.input}
              value={currency}
              onChange={(e) =>
                setCurrency(e.target.value as (typeof CURRENCY_OPTIONS)[number])
              }
            >
              {CURRENCY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className={styles.field}>
          <span>Mínimo de noches (opcional)</span>
          <input
            type="number"
            min={1}
            className={styles.input}
            value={minNights}
            onChange={(e) => setMinNights(e.target.value)}
            placeholder="—"
          />
        </label>

        {err && <p className={styles.error}>{err}</p>}

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.ghost}
            onClick={onClose}
            disabled={busy}
          >
            Cancelar
          </button>
          <button
            type="button"
            className={styles.primary}
            onClick={() => void submit()}
            disabled={busy}
          >
            {busy ? "…" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
