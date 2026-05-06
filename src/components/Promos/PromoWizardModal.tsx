"use client";

import React, { useState } from "react";
import type { Category, CreatePromoPayload } from "@/types/reservas";
import {
  PromoDatosForm,
  PromoPreciosForm,
  PromoStudioForm,
  emptyPromoForm,
  formToPayload,
  validatePromoForm,
  type PromoFormState,
} from "./PromoForm";
import styles from "./Promos.module.css";

interface Props {
  propertyId: string;
  categories: Category[];
  onClose: () => void;
  onCreated: (payload: CreatePromoPayload) => Promise<void>;
}

const STEPS = [
  { n: 1, label: "Datos operativos" },
  { n: 2, label: "Precios y restricciones" },
  { n: 3, label: "Studio (web)" },
] as const;

export default function PromoWizardModal({
  propertyId,
  categories,
  onClose,
  onCreated,
}: Props) {
  const [state, setState] = useState<PromoFormState>(emptyPromoForm());
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const goNext = () => {
    setErr(null);
    if (step === 1) {
      if (!state.name.trim()) {
        setErr("Falta el nombre interno.");
        return;
      }
      if (state.type === "code" && !state.code.trim()) {
        setErr("Ingresá el código.");
        return;
      }
      setStep(2);
      return;
    }
    if (step === 2) {
      const validation = validatePromoForm(state);
      if (validation) {
        setErr(validation);
        return;
      }
      setStep(3);
      return;
    }
  };

  const submit = async () => {
    setErr(null);
    const validation = validatePromoForm(state);
    if (validation) {
      setErr(validation);
      return;
    }
    setBusy(true);
    try {
      await onCreated(formToPayload(state, propertyId));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error al crear");
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
      <div className={styles.modal} role="dialog" aria-modal>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>Nueva promoción</div>
          <button
            type="button"
            className={styles.modalClose}
            onClick={onClose}
            disabled={busy}
          >
            ×
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.stepperHeader}>
            {STEPS.map((s, idx) => (
              <React.Fragment key={s.n}>
                <div className={styles.stepItem}>
                  <div
                    className={`${styles.stepCircle} ${
                      step > s.n ? styles.done : step === s.n ? styles.current : ""
                    }`}
                  >
                    {step > s.n ? "✓" : s.n}
                  </div>
                  <div
                    className={`${styles.stepLabel} ${
                      step > s.n ? styles.done : step === s.n ? styles.current : ""
                    }`}
                  >
                    {s.label}
                  </div>
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`${styles.stepLine} ${step > s.n ? styles.done : ""}`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          {err && <div className={styles.errorBox}>{err}</div>}

          {step === 1 && (
            <PromoDatosForm
              state={state}
              setState={setState}
              categories={categories}
            />
          )}
          {step === 2 && <PromoPreciosForm state={state} setState={setState} />}
          {step === 3 && <PromoStudioForm state={state} setState={setState} />}
        </div>

        <div className={styles.modalFooter}>
          {step > 1 && (
            <button
              type="button"
              className={styles.btnGhost}
              onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
              disabled={busy}
            >
              ← Atrás
            </button>
          )}
          {step < 3 ? (
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={goNext}
              disabled={busy}
            >
              Siguiente →
            </button>
          ) : (
            <button
              type="button"
              className={styles.btnSave}
              onClick={() => void submit()}
              disabled={busy}
            >
              {busy ? "Guardando…" : "✓ Guardar promoción"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
