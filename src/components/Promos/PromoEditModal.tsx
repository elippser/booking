"use client";

import { useEffect, useState } from "react";
import type {
  Category,
  CreatePromoPayload,
  Promo,
} from "@/types/reservas";
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
  promo: Promo;
  categories: Category[];
  tab: "datos" | "studio";
  onTabChange: (tab: "datos" | "studio") => void;
  onClose: () => void;
  onSave: (patch: Partial<CreatePromoPayload>) => Promise<void>;
}

function promoToForm(p: Promo): PromoFormState {
  // El backend guarda discountValue con signo (negativo = descuento, positivo = recargo).
  // El form lo muestra como (direction, |valor|) para que sea claro al user.
  const direction: "discount" | "surcharge" =
    p.discountType !== "price_override" && p.discountValue > 0
      ? "surcharge"
      : "discount";
  const absValue = Math.abs(p.discountValue);
  return {
    type: p.type,
    name: p.name,
    description: p.description ?? "",
    code: p.code ?? "",
    startDate: p.startDate ? p.startDate.slice(0, 10) : "",
    endDate: p.endDate ? p.endDate.slice(0, 10) : "",
    appliesToAllCategories: p.appliesToAllCategories,
    categoryIds: p.categoryIds ?? [],
    discountType: p.discountType,
    discountValue: String(absValue),
    direction,
    currency: p.currency ?? "USD",
    minNights: p.minNights != null ? String(p.minNights) : "",
    minAdvanceDays: p.minAdvanceDays != null ? String(p.minAdvanceDays) : "",
    maxUses: p.maxUses != null ? String(p.maxUses) : "",
    oneUsePerGuest: p.oneUsePerGuest,
    studio: {
      showInWeb: p.studio?.showInWeb ?? false,
      image: p.studio?.image ?? "",
      title: p.studio?.title ?? "",
      description: p.studio?.description ?? "",
      badge: p.studio?.badge ?? "",
      cta: p.studio?.cta ?? "",
    },
  };
}

export default function PromoEditModal({
  promo,
  categories,
  tab,
  onTabChange,
  onClose,
  onSave,
}: Props) {
  const [state, setState] = useState<PromoFormState>(() => promoToForm(promo));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setState(promoToForm(promo));
  }, [promo]);

  const submit = async () => {
    setErr(null);
    const validation = validatePromoForm(state);
    if (validation) {
      setErr(validation);
      return;
    }
    setBusy(true);
    try {
      const payload = formToPayload(state, promo.propertyId);
      // Para PATCH no hace falta repetir propertyId
      const { propertyId: _ignored, ...patch } = payload;
      void _ignored;
      await onSave(patch);
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
      <div className={styles.modal} role="dialog" aria-modal>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>{promo.name}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div className={styles.modalTabs}>
              <div
                className={`${styles.modalTab} ${tab === "datos" ? styles.active : ""}`}
                onClick={() => onTabChange("datos")}
              >
                Datos
              </div>
              <div
                className={`${styles.modalTab} ${styles.studio} ${
                  tab === "studio" ? styles.active : ""
                }`}
                onClick={() => onTabChange("studio")}
              >
                ✦ Studio
              </div>
            </div>
            <button
              type="button"
              className={styles.modalClose}
              onClick={onClose}
              disabled={busy}
            >
              ×
            </button>
          </div>
        </div>

        <div className={styles.modalBody}>
          {err && <div className={styles.errorBox}>{err}</div>}
          {tab === "datos" ? (
            <>
              <PromoDatosForm
                state={state}
                setState={setState}
                categories={categories}
              />
              <PromoPreciosForm state={state} setState={setState} />
            </>
          ) : (
            <PromoStudioForm state={state} setState={setState} />
          )}
        </div>

        <div className={styles.modalFooter}>
          <button
            type="button"
            className={styles.btnGhost}
            onClick={onClose}
            disabled={busy}
          >
            Cancelar
          </button>
          <button
            type="button"
            className={styles.btnSave}
            onClick={() => void submit()}
            disabled={busy}
          >
            {busy ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}
