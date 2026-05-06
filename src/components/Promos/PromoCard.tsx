"use client";

import type { Category, Promo } from "@/types/reservas";
import styles from "./Promos.module.css";

interface Props {
  promo: Promo;
  categories: Category[];
  onEdit: (tab: "datos" | "studio") => void;
  onDelete: () => void;
  onToggle: (enabled: boolean) => void;
}

const STATUS_LABELS: Record<Promo["status"], string> = {
  active: "Activa",
  inactive: "Inactiva",
  scheduled: "Programada",
  expired: "Expirada",
};

const STATUS_CLASSES: Record<Promo["status"], string> = {
  active: styles.statusActive,
  inactive: styles.statusInactive,
  scheduled: styles.statusScheduled,
  expired: styles.statusExpired,
};

function discountIcon(p: Promo): { className: string; emoji: string } {
  if (p.discountValue > 0) return { className: styles.iconSurcharge, emoji: "📈" };
  if (p.type === "code") return { className: styles.iconCode, emoji: "🏷️" };
  return { className: styles.iconAuto, emoji: "⚡" };
}

function discountDisplay(p: Promo): { value: string; sub: string; color: string } {
  if (p.discountType === "percentage") {
    const sign = p.discountValue > 0 ? "+" : "";
    const color =
      p.discountValue > 0 ? "var(--danger)" : "var(--status-confirmed)";
    return {
      value: `${sign}${p.discountValue}%`,
      sub: p.discountValue > 0 ? "sobre precio base" : "de descuento",
      color,
    };
  }
  if (p.discountType === "fixed_amount") {
    const sign = p.discountValue > 0 ? "+" : "";
    const color =
      p.discountValue > 0 ? "var(--danger)" : "var(--status-confirmed)";
    return {
      value: `${sign}${p.currency || ""} ${Math.abs(p.discountValue)}`,
      sub: p.discountValue > 0 ? "recargo" : "descuento",
      color,
    };
  }
  return {
    value: `${p.currency || ""} ${Math.abs(p.discountValue)}`,
    sub: "precio fijo",
    color: "var(--accent-color)",
  };
}

function formatRange(p: Promo): string {
  const fmt = (iso?: string) => (iso ? iso.slice(0, 10) : null);
  const a = fmt(p.startDate);
  const b = fmt(p.endDate);
  if (a && b) return `${a} → ${b}`;
  if (a) return `Desde ${a}`;
  if (b) return `Hasta ${b}`;
  return "Sin vencimiento";
}

export default function PromoCard({
  promo,
  categories,
  onEdit,
  onDelete,
  onToggle,
}: Props) {
  const icon = discountIcon(promo);
  const disc = discountDisplay(promo);

  const catLabel = promo.appliesToAllCategories
    ? "Todas las categorías"
    : promo.categoryIds.length === 1
    ? categories.find((c) => c.categoryId === promo.categoryIds[0])?.name ||
      "1 categoría"
    : `${promo.categoryIds.length} categorías`;

  return (
    <div
      className={`${styles.card} ${
        promo.status === "active" || promo.status === "scheduled"
          ? styles.cardActive
          : ""
      }`}
    >
      <div className={styles.cardHead}>
        <div className={`${styles.icon} ${icon.className}`}>{icon.emoji}</div>
        <div className={styles.info}>
          <div className={styles.name}>{promo.name}</div>
          <div className={styles.desc}>
            {promo.description ||
              (promo.type === "code" ? "Requiere código" : "Aplicación automática")}
          </div>
        </div>
        <div className={styles.discount}>
          <div className={styles.discountVal} style={{ color: disc.color }}>
            {disc.value}
          </div>
          <div className={styles.discountType}>{disc.sub}</div>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.tag}>
          <span className={styles.dot} style={{ background: "var(--accent-color)" }} />
          {formatRange(promo)}
        </div>
        <div className={styles.tag}>{catLabel}</div>
        {promo.type === "code" && promo.code && (
          <div className={styles.tag}>
            Código: <b>{promo.code}</b>
          </div>
        )}
        {promo.minNights != null && (
          <div className={styles.tag}>Mín. {promo.minNights} noches</div>
        )}
        {promo.studio?.showInWeb && <div className={`${styles.tag} ${styles.studioTag}`}>✦ En web</div>}
      </div>

      <div className={styles.footer}>
        <div className={`${styles.status} ${STATUS_CLASSES[promo.status]}`}>
          {STATUS_LABELS[promo.status]}
        </div>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.btnXs}
            onClick={() => onEdit("studio")}
            title="Editar Studio"
          >
            ✦ Studio
          </button>
          <button
            type="button"
            className={styles.btnXs}
            onClick={() => onEdit("datos")}
          >
            Editar
          </button>
          <button
            type="button"
            className={`${styles.btnXs} ${styles.danger}`}
            onClick={onDelete}
          >
            Eliminar
          </button>
          <label className={styles.toggle} title={promo.isEnabled ? "Activa" : "Desactivada"}>
            <input
              type="checkbox"
              checked={promo.isEnabled}
              onChange={(e) => onToggle(e.target.checked)}
            />
            <div className={styles.slider} />
          </label>
        </div>
      </div>
    </div>
  );
}
