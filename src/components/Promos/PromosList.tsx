"use client";

import { useState } from "react";
import ContextGate from "@/components/shared/ContextGate/ContextGate";
import { useAppContext } from "@/hooks/useAppContext";
import { useCategories } from "@/hooks/useCategories";
import { usePromos } from "@/hooks/usePromos";
import type { Promo } from "@/types/reservas";
import PromoCard from "./PromoCard";
import PromoWizardModal from "./PromoWizardModal";
import PromoEditModal from "./PromoEditModal";
import styles from "./Promos.module.css";

function PromosListInner() {
  const { token, propertyId } = useAppContext();
  const { categories } = useCategories(token, propertyId);
  const {
    promos,
    loading,
    error,
    refetch,
    create,
    update,
    toggle,
    remove,
  } = usePromos(token, propertyId);

  const [wizardOpen, setWizardOpen] = useState(false);
  const [editing, setEditing] = useState<Promo | null>(null);
  const [editTab, setEditTab] = useState<"datos" | "studio">("datos");
  const [deleteTarget, setDeleteTarget] = useState<Promo | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const openEdit = (p: Promo, tab: "datos" | "studio" = "datos") => {
    setEditing(p);
    setEditTab(tab);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteBusy(true);
    try {
      await remove(deleteTarget.promoId);
      setDeleteTarget(null);
    } finally {
      setDeleteBusy(false);
    }
  };

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Promociones</h1>
          <p className={styles.subtitle}>
            Descuentos y campañas que se aplican al motor de reservas
          </p>
        </div>
        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.newBtn}
            onClick={() => setWizardOpen(true)}
          >
            + Nueva promoción
          </button>
          <button
            type="button"
            className={styles.refresh}
            onClick={() => void refetch()}
            disabled={loading}
            title="Actualizar"
          >
            ↻
          </button>
        </div>
      </header>

      {error && <p className={styles.error}>{error}</p>}

      {!loading && promos.length === 0 && !error && (
        <p className={styles.muted}>
          No hay promociones todavía. Creá la primera con "+ Nueva promoción".
        </p>
      )}

      <div className={styles.grid}>
        {promos.map((p) => (
          <PromoCard
            key={p.promoId}
            promo={p}
            categories={categories}
            onEdit={(tab) => openEdit(p, tab)}
            onDelete={() => setDeleteTarget(p)}
            onToggle={(enabled) => void toggle(p.promoId, enabled)}
          />
        ))}
      </div>

      {wizardOpen && (
        <PromoWizardModal
          propertyId={propertyId}
          categories={categories}
          onClose={() => setWizardOpen(false)}
          onCreated={async (payload) => {
            await create(payload);
            setWizardOpen(false);
          }}
        />
      )}

      {editing && (
        <PromoEditModal
          promo={editing}
          categories={categories}
          tab={editTab}
          onTabChange={setEditTab}
          onClose={() => setEditing(null)}
          onSave={async (patch) => {
            await update(editing.promoId, patch);
            setEditing(null);
          }}
        />
      )}

      {deleteTarget && (
        <div
          className={styles.overlay}
          role="presentation"
          onClick={(e) =>
            e.target === e.currentTarget && !deleteBusy && setDeleteTarget(null)
          }
        >
          <div className={styles.modal} style={{ maxWidth: 400 }} role="dialog" aria-modal>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>Eliminar promoción</div>
            </div>
            <div className={styles.modalBody}>
              ¿Seguro que querés eliminar <strong>{deleteTarget.name}</strong>?
            </div>
            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.btnGhost}
                onClick={() => setDeleteTarget(null)}
                disabled={deleteBusy}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={styles.btnDangerSolid}
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

export default function PromosList() {
  return (
    <ContextGate>
      <PromosListInner />
    </ContextGate>
  );
}
