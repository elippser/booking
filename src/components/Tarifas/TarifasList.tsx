"use client";

import { useMemo, useState } from "react";
import ContextGate from "@/components/shared/ContextGate/ContextGate";
import { useAppContext } from "@/hooks/useAppContext";
import { useCategories } from "@/hooks/useCategories";
import { useTarifas } from "@/hooks/useTarifas";
import type {
  Category,
  CreateRatePlanPayload,
  RatePlan,
} from "@/types/reservas";
import TarifaModal, { type CategoryOption } from "./TarifaModal";
import styles from "./TarifasList.module.css";

const PLAN_DOT_COLORS = [
  "var(--status-pending)",
  "var(--accent-color)",
  "var(--status-confirmed)",
  "var(--danger)",
  "#7c3aed",
];

function planDotColor(planId: string): string {
  let h = 0;
  for (let i = 0; i < planId.length; i++) h = (h * 31 + planId.charCodeAt(i)) | 0;
  return PLAN_DOT_COLORS[Math.abs(h) % PLAN_DOT_COLORS.length];
}

function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString("es-AR")}`;
  }
}

function formatRange(startIso: string, endIso: string): string {
  const a = new Date(startIso);
  const b = new Date(endIso);
  const sameYear = a.getFullYear() === b.getFullYear();
  const opts: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
  };
  const aStr = a.toLocaleDateString("es-AR", opts);
  const bStr = b.toLocaleDateString("es-AR", {
    ...opts,
    year: sameYear ? undefined : "numeric",
  });
  return `${aStr} – ${bStr}`;
}

function TarifasListInner() {
  const { token, propertyId } = useAppContext();
  const { categories, error: catsError, refetch: refetchCats } = useCategories(
    token,
    propertyId
  );
  const {
    ratePlans,
    loading,
    error: ratesError,
    refetch: refetchRates,
    createRatePlan,
    updateRatePlan,
    deleteRatePlan,
  } = useTarifas(token, propertyId);

  const error = catsError || ratesError;
  const refresh = () => {
    void refetchCats();
    void refetchRates();
  };

  const plansByCategory = useMemo(() => {
    const map = new Map<string, RatePlan[]>();
    for (const p of ratePlans) {
      const list = map.get(p.categoryId) || [];
      list.push(p);
      map.set(p.categoryId, list);
    }
    return map;
  }, [ratePlans]);

  /** Listado de tarjetas: mostrar categorías aunque unitCount sea 0 o venga undefined del API. */
  const displayCategories = useMemo(() => categories, [categories]);

  /** El modal y los rate plans usan el mismo criterio: todas las categorías de la propiedad. */
  const categoryOptionsForModal: CategoryOption[] = useMemo(
    () =>
      categories.map((c) => ({
        categoryId: c.categoryId,
        label: c.name,
      })),
    [categories]
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<RatePlan | null>(null);
  const [presetCategoryId, setPresetCategoryId] = useState<string | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<RatePlan | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const openCreate = (categoryId?: string) => {
    setEditing(null);
    setModalMode("create");
    setPresetCategoryId(categoryId);
    setModalOpen(true);
  };

  const openEdit = (p: RatePlan) => {
    setEditing(p);
    setPresetCategoryId(undefined);
    setModalMode("edit");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setPresetCategoryId(undefined);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteBusy(true);
    try {
      await deleteRatePlan(deleteTarget.ratePlanId);
      setDeleteTarget(null);
    } finally {
      setDeleteBusy(false);
    }
  };

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Tarifas</h1>
          <p className={styles.subtitle}>
            Precio base por categoría y Rate Plans activos
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <button
            type="button"
            className={styles.newBtn}
            onClick={() => openCreate()}
            disabled={categories.length === 0}
          >
            + Nuevo Rate Plan
          </button>
          <button
            type="button"
            className={styles.refresh}
            onClick={refresh}
            disabled={loading}
            title="Actualizar"
          >
            ↻
          </button>
        </div>
      </header>

      {error && <p className={styles.error}>{error}</p>}

      {!loading && categories.length === 0 && !error && (
        <p className={styles.muted}>
          No hay categorías para esta propiedad. Creá categorías en habitaciones
          y volvé a actualizar.
        </p>
      )}

      <div className={styles.grid}>
        {displayCategories.map((cat) => (
          <CategoryCard
            key={cat.categoryId}
            category={cat}
            plans={plansByCategory.get(cat.categoryId) ?? []}
            onAddPlan={() => openCreate(cat.categoryId)}
            onEditPlan={openEdit}
            onDeletePlan={(p) => setDeleteTarget(p)}
          />
        ))}
      </div>

      <TarifaModal
        open={modalOpen}
        mode={modalMode}
        propertyId={propertyId}
        categories={categoryOptionsForModal}
        initial={editing}
        presetCategoryId={presetCategoryId}
        onClose={closeModal}
        onSave={async (payload: CreateRatePlanPayload) => {
          await createRatePlan(payload);
        }}
        onUpdate={async (id, payload) => {
          await updateRatePlan(id, payload);
        }}
      />

      {deleteTarget && (
        <div
          className={styles.overlay}
          role="presentation"
          onClick={(e) =>
            e.target === e.currentTarget && !deleteBusy && setDeleteTarget(null)
          }
        >
          <div className={styles.confirmDialog} role="dialog" aria-modal>
            <h3 className={styles.confirmTitle}>Eliminar Rate Plan</h3>
            <p className={styles.confirmText}>
              ¿Seguro que querés eliminar <strong>{deleteTarget.name}</strong>?
            </p>
            <div className={styles.confirmActions}>
              <button
                type="button"
                className={styles.ghostBtn}
                onClick={() => setDeleteTarget(null)}
                disabled={deleteBusy}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={styles.dangerSolid}
                onClick={() => void handleDelete()}
                disabled={deleteBusy}
              >
                {deleteBusy ? "…" : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface CategoryCardProps {
  category: Category;
  plans: RatePlan[];
  onAddPlan: () => void;
  onEditPlan: (p: RatePlan) => void;
  onDeletePlan: (p: RatePlan) => void;
}

function CategoryCard({
  category,
  plans,
  onAddPlan,
  onEditPlan,
  onDeletePlan,
}: CategoryCardProps) {
  const baseAmount = category.basePrice?.amount ?? 0;
  const baseCurrency = category.basePrice?.currency ?? "USD";
  const cap = category.capacity;
  const sub = `${category.unitCount ?? 0} unidad${
    category.unitCount === 1 ? "" : "es"
  }${cap ? ` · ${cap.adults} adulto${cap.adults !== 1 ? "s" : ""} máx` : ""}`;

  return (
    <div className={styles.card}>
      <div className={styles.cardHead}>
        <div>
          <div className={styles.catName}>{category.name}</div>
          <div className={styles.catSub}>{sub}</div>
        </div>
        <div className={styles.base}>
          <div className={styles.baseLabel}>Precio base</div>
          <div className={styles.basePrice}>
            {formatMoney(baseAmount, baseCurrency)}{" "}
            <span>/ noche</span>
          </div>
        </div>
      </div>

      <div className={styles.plans}>
        {plans.length === 0 ? (
          <div className={styles.noPlans}>Sin Rate Plans configurados</div>
        ) : (
          plans.map((p) => {
            const delta =
              baseAmount > 0
                ? Math.round(((p.pricePerNight - baseAmount) / baseAmount) * 100)
                : null;
            const deltaClass =
              delta == null
                ? null
                : delta >= 0
                ? styles.deltaUp
                : styles.deltaDown;
            return (
              <div key={p.ratePlanId} className={styles.planRow}>
                <div className={styles.rpLeft}>
                  <span
                    className={styles.rpDot}
                    style={{ background: planDotColor(p.ratePlanId) }}
                  />
                  <div>
                    <div className={styles.rpName}>{p.name}</div>
                    <div className={styles.rpDates}>
                      {formatRange(p.startDate, p.endDate)}
                    </div>
                  </div>
                </div>
                <div className={styles.rpRight}>
                  <span className={styles.rpPrice}>
                    {formatMoney(p.pricePerNight, p.currency)}
                  </span>
                  {delta != null && (
                    <span className={`${styles.rpDelta} ${deltaClass}`}>
                      {delta >= 0 ? "+" : ""}
                      {delta}%
                    </span>
                  )}
                  <div className={styles.rpActions}>
                    <button
                      type="button"
                      className={styles.rpEdit}
                      onClick={() => onEditPlan(p)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className={styles.rpDelete}
                      onClick={() => onDeletePlan(p)}
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className={styles.cardFooter}>
        <button
          type="button"
          className={`${styles.btnSm} ${styles.btnPrimary}`}
          onClick={onAddPlan}
        >
          + Rate Plan
        </button>
      </div>
    </div>
  );
}

export default function TarifasList() {
  return (
    <ContextGate>
      <TarifasListInner />
    </ContextGate>
  );
}
