"use client";

import type {
  Category,
  CreatePromoPayload,
  PromoDiscountType,
  PromoStudio,
  PromoType,
} from "@/types/reservas";
import styles from "./Promos.module.css";

export type PromoFormState = {
  type: PromoType;
  name: string;
  description: string;
  code: string;
  startDate: string;
  endDate: string;
  appliesToAllCategories: boolean;
  categoryIds: string[];
  discountType: PromoDiscountType;
  /** Siempre positivo en el form. El signo se aplica según `direction` al serializar. */
  discountValue: string;
  /** Solo aplica si discountType es percentage o fixed_amount. */
  direction: "discount" | "surcharge";
  currency: string;
  minNights: string;
  minAdvanceDays: string;
  maxUses: string;
  oneUsePerGuest: boolean;
  studio: PromoStudio;
};

export const emptyPromoForm = (): PromoFormState => ({
  type: "auto",
  name: "",
  description: "",
  code: "",
  startDate: "",
  endDate: "",
  appliesToAllCategories: true,
  categoryIds: [],
  discountType: "percentage",
  discountValue: "",
  direction: "discount",
  currency: "USD",
  minNights: "",
  minAdvanceDays: "",
  maxUses: "",
  oneUsePerGuest: false,
  studio: {
    showInWeb: false,
    image: "",
    title: "",
    description: "",
    badge: "",
    cta: "",
  },
});

export function validatePromoForm(s: PromoFormState): string | null {
  if (!s.name.trim()) return "Falta el nombre interno.";
  if (s.type === "code" && !s.code.trim()) return "Ingresá el código de descuento.";
  const v = Number(s.discountValue);
  if (Number.isNaN(v) || s.discountValue.trim() === "") {
    return "Ingresá el valor del descuento.";
  }
  if (v < 0) {
    return "Ingresá un número positivo. Para alternar entre descuento y recargo usá el selector.";
  }
  if (s.discountType === "percentage" && v > 100) {
    return "El porcentaje debe estar entre 0 y 100.";
  }
  if (s.discountType === "price_override" && v <= 0) {
    return "El precio fijo debe ser mayor a 0.";
  }
  if (s.startDate && s.endDate && s.startDate > s.endDate) {
    return "La vigencia hasta debe ser igual o posterior a desde.";
  }
  if (!s.appliesToAllCategories && s.categoryIds.length === 0) {
    return "Elegí al menos una categoría, o activá 'todas'.";
  }
  return null;
}

export function formToPayload(
  s: PromoFormState,
  propertyId: string
): CreatePromoPayload {
  const absVal = Math.abs(Number(s.discountValue));
  // percentage / fixed_amount usan signo: descuento = negativo, recargo = positivo.
  // price_override es siempre positivo (precio fijo por noche).
  const signed =
    s.discountType === "price_override"
      ? absVal
      : s.direction === "surcharge"
        ? absVal
        : -absVal;

  const payload: CreatePromoPayload = {
    propertyId,
    name: s.name.trim(),
    description: s.description.trim() || undefined,
    type: s.type,
    appliesToAllCategories: s.appliesToAllCategories,
    categoryIds: s.appliesToAllCategories ? [] : s.categoryIds,
    discountType: s.discountType,
    discountValue: signed,
    isEnabled: true,
    studio: s.studio,
    oneUsePerGuest: s.oneUsePerGuest,
  };
  if (s.type === "code") payload.code = s.code.trim().toUpperCase();
  if (s.startDate) payload.startDate = s.startDate;
  if (s.endDate) payload.endDate = s.endDate;
  if (s.discountType !== "percentage") payload.currency = s.currency;
  if (s.minNights) payload.minNights = Number(s.minNights);
  if (s.minAdvanceDays) payload.minAdvanceDays = Number(s.minAdvanceDays);
  if (s.maxUses) payload.maxUses = Number(s.maxUses);
  return payload;
}

interface DatosProps {
  state: PromoFormState;
  setState: React.Dispatch<React.SetStateAction<PromoFormState>>;
  categories: Category[];
}

export function PromoDatosForm({ state, setState, categories }: DatosProps) {
  const togglePill = (categoryId: string) => {
    if (categoryId === "all") {
      setState((s) => ({ ...s, appliesToAllCategories: true, categoryIds: [] }));
      return;
    }
    setState((s) => {
      const has = s.categoryIds.includes(categoryId);
      const next = has
        ? s.categoryIds.filter((c) => c !== categoryId)
        : [...s.categoryIds, categoryId];
      return {
        ...s,
        appliesToAllCategories: next.length === 0,
        categoryIds: next,
      };
    });
  };

  return (
    <>
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Tipo de promoción</div>
        <div className={styles.typeSelector}>
          <div
            className={`${styles.typeOpt} ${state.type === "auto" ? styles.selected : ""}`}
            onClick={() => setState((s) => ({ ...s, type: "auto" }))}
          >
            <div className={styles.typeOptIcon}>⚡</div>
            <div className={styles.typeOptLabel}>Automática</div>
            <div className={styles.typeOptSub}>Se aplica sola por fechas</div>
          </div>
          <div
            className={`${styles.typeOpt} ${state.type === "code" ? styles.selected : ""}`}
            onClick={() => setState((s) => ({ ...s, type: "code" }))}
          >
            <div className={styles.typeOptIcon}>🏷️</div>
            <div className={styles.typeOptLabel}>Código de descuento</div>
            <div className={styles.typeOptSub}>El huésped ingresa un código</div>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Identificación</div>
        <div className={styles.row}>
          <div className={styles.group}>
            <label className={styles.label}>Nombre interno</label>
            <input
              className={styles.input}
              value={state.name}
              onChange={(e) => setState((s) => ({ ...s, name: e.target.value }))}
              placeholder="Ej: Temporada Alta Verano 2026"
            />
            <div className={styles.helper}>
              Solo visible para vos. El nombre público se configura en Studio.
            </div>
          </div>
        </div>
        {state.type === "code" && (
          <div className={styles.row}>
            <div className={styles.group}>
              <label className={styles.label}>Código de descuento</label>
              <input
                className={styles.input}
                value={state.code}
                onChange={(e) =>
                  setState((s) => ({ ...s, code: e.target.value.toUpperCase() }))
                }
                placeholder="Ej: VERANO25"
                style={{ fontFamily: "var(--font-mono)", letterSpacing: 2 }}
              />
              <div className={styles.helper}>
                En el motor de reservas el descuento solo aplica si el huésped escribe este
                mismo código en el buscador (campo &quot;Código&quot; / promoción).
              </div>
            </div>
          </div>
        )}
        <div className={styles.row}>
          <div className={styles.group}>
            <label className={styles.label}>Vigencia desde</label>
            <input
              type="date"
              className={styles.input}
              value={state.startDate}
              onChange={(e) =>
                setState((s) => ({ ...s, startDate: e.target.value }))
              }
            />
          </div>
          <div className={styles.group}>
            <label className={styles.label}>Vigencia hasta</label>
            <input
              type="date"
              className={styles.input}
              value={state.endDate}
              onChange={(e) =>
                setState((s) => ({ ...s, endDate: e.target.value }))
              }
            />
            <div className={styles.helper}>Dejá vacío para sin vencimiento.</div>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Categorías que aplica</div>
        <div className={styles.pills}>
          <div
            className={`${styles.pill} ${state.appliesToAllCategories ? styles.selected : ""}`}
            onClick={() => togglePill("all")}
          >
            Todas
          </div>
          {categories.map((c) => (
            <div
              key={c.categoryId}
              className={`${styles.pill} ${
                state.categoryIds.includes(c.categoryId) ? styles.selected : ""
              }`}
              onClick={() => togglePill(c.categoryId)}
            >
              {c.name}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export function PromoPreciosForm({
  state,
  setState,
}: {
  state: PromoFormState;
  setState: React.Dispatch<React.SetStateAction<PromoFormState>>;
}) {
  return (
    <>
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Ajuste de precio</div>
        <div className={styles.row}>
          <div className={styles.group}>
            <label className={styles.label}>Tipo</label>
            <select
              className={styles.select}
              value={state.discountType}
              onChange={(e) =>
                setState((s) => ({
                  ...s,
                  discountType: e.target.value as PromoFormState["discountType"],
                }))
              }
            >
              <option value="percentage">Porcentaje (%)</option>
              <option value="fixed_amount">Monto fijo</option>
              <option value="price_override">Precio override (fijo por noche)</option>
            </select>
          </div>
          {state.discountType !== "price_override" && (
            <div className={styles.group}>
              <label className={styles.label}>Aplicación</label>
              <select
                className={styles.select}
                value={state.direction}
                onChange={(e) =>
                  setState((s) => ({
                    ...s,
                    direction: e.target.value as "discount" | "surcharge",
                  }))
                }
              >
                <option value="discount">Descuento (resta al precio base)</option>
                <option value="surcharge">Recargo (suma al precio base)</option>
              </select>
            </div>
          )}
          <div className={styles.group}>
            <label className={styles.label}>Valor</label>
            <input
              type="number"
              min={0}
              className={styles.input}
              value={state.discountValue}
              onChange={(e) =>
                setState((s) => ({ ...s, discountValue: e.target.value }))
              }
              placeholder="Ej: 20"
            />
            <div className={styles.helper}>
              {state.discountType === "price_override"
                ? "Precio fijo por noche que reemplaza al base."
                : state.direction === "discount"
                  ? "Cuánto se descuenta al precio base."
                  : "Cuánto se suma al precio base."}
            </div>
          </div>
          {state.discountType !== "percentage" && (
            <div className={styles.group}>
              <label className={styles.label}>Moneda</label>
              <select
                className={styles.select}
                value={state.currency}
                onChange={(e) =>
                  setState((s) => ({ ...s, currency: e.target.value }))
                }
              >
                <option value="USD">USD</option>
                <option value="ARS">ARS</option>
                <option value="EUR">EUR</option>
                <option value="BRL">BRL</option>
              </select>
            </div>
          )}
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Restricciones opcionales</div>
        <div className={styles.restrictionsGrid}>
          <div className={styles.restrictionItem}>
            <div>
              <div className={styles.restrictionLabel}>Mínimo de noches</div>
              <div className={styles.restrictionSub}>Aplica si N noches o más</div>
            </div>
            <input
              type="number"
              min={1}
              className={`${styles.input} ${styles.restrictionInput}`}
              value={state.minNights}
              onChange={(e) =>
                setState((s) => ({ ...s, minNights: e.target.value }))
              }
              placeholder="—"
            />
          </div>
          <div className={styles.restrictionItem}>
            <div>
              <div className={styles.restrictionLabel}>Anticipación mínima</div>
              <div className={styles.restrictionSub}>Días antes del check-in</div>
            </div>
            <input
              type="number"
              min={0}
              className={`${styles.input} ${styles.restrictionInput}`}
              value={state.minAdvanceDays}
              onChange={(e) =>
                setState((s) => ({ ...s, minAdvanceDays: e.target.value }))
              }
              placeholder="—"
            />
          </div>
          <div className={styles.restrictionItem}>
            <div>
              <div className={styles.restrictionLabel}>Máximo de usos</div>
              <div className={styles.restrictionSub}>Sólo se guarda (sin enforce aún)</div>
            </div>
            <input
              type="number"
              min={1}
              className={`${styles.input} ${styles.restrictionInput}`}
              value={state.maxUses}
              onChange={(e) =>
                setState((s) => ({ ...s, maxUses: e.target.value }))
              }
              placeholder="∞"
            />
          </div>
          <div className={styles.restrictionItem}>
            <div>
              <div className={styles.restrictionLabel}>Un uso por huésped</div>
              <div className={styles.restrictionSub}>Sólo se guarda (sin enforce aún)</div>
            </div>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={state.oneUsePerGuest}
                onChange={(e) =>
                  setState((s) => ({ ...s, oneUsePerGuest: e.target.checked }))
                }
              />
              <div className={styles.slider} />
            </label>
          </div>
        </div>
      </div>
    </>
  );
}

export function PromoStudioForm({
  state,
  setState,
}: {
  state: PromoFormState;
  setState: React.Dispatch<React.SetStateAction<PromoFormState>>;
}) {
  const setStudio = (patch: Partial<PromoStudio>) =>
    setState((s) => ({ ...s, studio: { ...s.studio, ...patch } }));

  return (
    <>
      <div className={styles.studioBanner}>
        <div className={styles.studioIcon}>✦</div>
        <div>
          <div className={styles.studioBannerTitle}>Laupser Studio</div>
          <div className={styles.studioBannerSub}>
            Configurá cómo se verá esta promo en el sitio web del hotel
          </div>
        </div>
      </div>

      <div className={styles.studioToggleRow}>
        <div className={styles.studioToggleInfo}>
          <div className={styles.studioToggleTitle}>
            Mostrar esta promo en el sitio web
          </div>
          <div className={styles.studioToggleSub}>
            Si está activo, el componente de promos la renderizará en la web
          </div>
        </div>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={state.studio.showInWeb}
            onChange={(e) => setStudio({ showInWeb: e.target.checked })}
          />
          <div className={styles.slider} />
        </label>
      </div>

      {state.studio.showInWeb && (
        <>
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Imagen</div>
            <div className={styles.row}>
              <div className={styles.group}>
                <label className={styles.label}>URL de la imagen</label>
                <input
                  className={styles.input}
                  value={state.studio.image || ""}
                  onChange={(e) => setStudio({ image: e.target.value })}
                  placeholder="https://..."
                />
                <div className={styles.helper}>JPG o PNG · Recomendado 800×400px</div>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionTitle}>Textos públicos</div>
            <div className={styles.row}>
              <div className={styles.group}>
                <label className={styles.label}>Título público</label>
                <input
                  className={styles.input}
                  value={state.studio.title || ""}
                  onChange={(e) => setStudio({ title: e.target.value })}
                  placeholder="Ej: ¡Verano con todo!"
                />
              </div>
            </div>
            <div className={styles.row}>
              <div className={styles.group}>
                <label className={styles.label}>Descripción</label>
                <textarea
                  className={styles.textarea}
                  value={state.studio.description || ""}
                  onChange={(e) => setStudio({ description: e.target.value })}
                  placeholder="Ej: Reservá antes del 30 de junio y disfrutá del verano…"
                />
              </div>
            </div>
            <div className={styles.row}>
              <div className={styles.group}>
                <label className={styles.label}>Badge</label>
                <input
                  className={styles.input}
                  value={state.studio.badge || ""}
                  onChange={(e) => setStudio({ badge: e.target.value })}
                  placeholder="Ej: -20% OFF"
                />
              </div>
              <div className={styles.group}>
                <label className={styles.label}>Texto del botón CTA</label>
                <input
                  className={styles.input}
                  value={state.studio.cta || ""}
                  onChange={(e) => setStudio({ cta: e.target.value })}
                  placeholder="Ej: Reservar ahora"
                />
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
