"use client";

import { useMemo, useState } from "react";
import ContextGate from "@/components/shared/ContextGate/ContextGate";
import { useAppContext } from "@/hooks/useAppContext";
import { useTarifas } from "@/hooks/useTarifas";
import type { CreateRatePlanPayload, RatePlan } from "@/types/reservas";
import TarifaModal, { type CategoryOption } from "./TarifaModal";
import styles from "./TarifasList.module.css";

function TarifasListInner() {
  const { token, propertyId } = useAppContext();
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const categoryIdForHook = categoryFilter || undefined;

  const {
    ratePlans,
    loading,
    error,
    refetch,
    createRatePlan,
    updateRatePlan,
    deleteRatePlan,
  } = useTarifas(token, propertyId, categoryIdForHook);

  const categories: CategoryOption[] = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of ratePlans) {
      const label = p.categoryName ?? p.categoryId;
      if (!map.has(p.categoryId)) map.set(p.categoryId, label);
    }
    return Array.from(map.entries()).map(([categoryId, label]) => ({
      categoryId,
      label,
    }));
  }, [ratePlans]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<RatePlan | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RatePlan | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setModalMode("create");
    setModalOpen(true);
  };

  const openEdit = (p: RatePlan) => {
    setEditing(p);
    setModalMode("edit");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
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

  const categoryOptionsForModal: CategoryOption[] =
    categories.length > 0
      ? categories
      : [{ categoryId: "", label: "Ingresá categoryId en el modal" }];

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <h1 className={styles.title}>Tarifas &amp; Disponibilidad</h1>
        <button type="button" className={styles.newBtn} onClick={openCreate}>
          + Nueva
        </button>
      </header>

      <div className={styles.filterBar}>
        <label className={styles.filterField}>
          <span>Categoría</span>
          <select
            className={styles.select}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c.categoryId} value={c.categoryId}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className={styles.ghost}
          onClick={() => refetch()}
          disabled={loading}
        >
          ↻ Actualizar
        </button>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {loading && <p className={styles.muted}>Cargando…</p>}

      <ul className={styles.list}>
        {!loading &&
          ratePlans.map((p) => (
            <li key={p.ratePlanId} className={styles.card}>
              <div className={styles.cardTop}>
                <h2 className={styles.planName}>{p.name}</h2>
                <span
                  className={
                    p.isActive ? styles.badgeOn : styles.badgeOff
                  }
                >
                  {p.isActive ? "Activa" : "Inactiva"}
                </span>
              </div>
              <p className={styles.meta}>
                {p.categoryName ?? p.categoryId} · {p.startDate.slice(0, 10)}{" "}
                → {p.endDate.slice(0, 10)}
              </p>
              <p className={styles.price}>
                {p.currency} {p.pricePerNight}/noche
                {p.minNights != null && (
                  <span className={styles.min}>
                    {" "}
                    · Mínimo {p.minNights} noches
                  </span>
                )}
              </p>
              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.linkBtn}
                  onClick={() => openEdit(p)}
                >
                  Editar
                </button>
                <button
                  type="button"
                  className={styles.dangerBtn}
                  onClick={() => setDeleteTarget(p)}
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
      </ul>

      {!loading && ratePlans.length === 0 && (
        <p className={styles.muted}>No hay tarifas para mostrar.</p>
      )}

      <TarifaModal
        open={modalOpen}
        mode={modalMode}
        propertyId={propertyId}
        categories={categoryOptionsForModal.filter((c) => c.categoryId)}
        initial={editing}
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
            <h3 className={styles.confirmTitle}>Eliminar tarifa</h3>
            <p className={styles.confirmText}>
              ¿Seguro que querés eliminar{" "}
              <strong>{deleteTarget.name}</strong>?
            </p>
            <div className={styles.confirmActions}>
              <button
                type="button"
                className={styles.ghost}
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

export default function TarifasList() {
  return (
    <ContextGate>
      <TarifasListInner />
    </ContextGate>
  );
}
