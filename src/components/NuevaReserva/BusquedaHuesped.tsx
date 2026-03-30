"use client";

import { useState } from "react";
import { searchGuestByEmail } from "@/services/apiReservas";
import type { GuestSummary } from "@/types/reservas";
import styles from "./BusquedaHuesped.module.css";

export interface DraftGuest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  documentType: string;
  documentNumber: string;
  nationality: string;
}

export function emptyDraft(): DraftGuest {
  return {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    documentType: "DNI",
    documentNumber: "",
    nationality: "",
  };
}

interface Props {
  token: string;
  found: GuestSummary | null;
  draft: DraftGuest;
  onFound: (g: GuestSummary | null) => void;
  onDraft: (d: DraftGuest) => void;
}

function GuestForm({
  draft,
  onDraft,
}: {
  draft: DraftGuest;
  onDraft: (d: DraftGuest) => void;
}) {
  const field = (key: keyof DraftGuest, label: string, type = "text") => (
    <label className={styles.field}>
      <span>{label}</span>
      <input
        type={type}
        className={styles.input}
        value={draft[key]}
        onChange={(e) => onDraft({ ...draft, [key]: e.target.value })}
      />
    </label>
  );

  return (
    <div className={styles.formGrid}>
      {field("firstName", "Nombre")}
      {field("lastName", "Apellido")}
      {field("email", "Email", "email")}
      {field("phone", "Teléfono", "tel")}
      {field("documentType", "Tipo doc.")}
      {field("documentNumber", "Número doc.")}
      {field("nationality", "Nacionalidad")}
    </div>
  );
}

export default function BusquedaHuesped({
  token,
  found,
  draft,
  onFound,
  onDraft,
}: Props) {
  const [emailQuery, setEmailQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const search = async () => {
    const q = emailQuery.trim();
    if (!q) {
      setErr("Ingresá un email.");
      return;
    }
    setSearching(true);
    setErr(null);
    try {
      const g = await searchGuestByEmail(token, q);
      if (g) {
        onFound(g);
        onDraft({ ...emptyDraft(), email: g.email });
      } else {
        onFound(null);
        onDraft({ ...emptyDraft(), email: q });
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error al buscar");
      onFound(null);
    } finally {
      setSearching(false);
    }
  };

  const clearFound = () => {
    onFound(null);
    onDraft({ ...draft, email: emailQuery.trim() || draft.email });
  };

  return (
    <div className={styles.root}>
      <h3 className={styles.title}>Huésped</h3>
      <div className={styles.searchRow}>
        <input
          type="email"
          className={styles.input}
          placeholder="Buscar por email"
          value={emailQuery}
          onChange={(e) => setEmailQuery(e.target.value)}
        />
        <button
          type="button"
          className={styles.btn}
          onClick={() => void search()}
          disabled={searching}
        >
          {searching ? "…" : "Buscar"}
        </button>
      </div>
      {err && <p className={styles.error}>{err}</p>}

      {found && (
        <div className={styles.found}>
          <p className={styles.foundName}>
            Encontrado: {found.firstName} {found.lastName}
          </p>
          <p className={styles.foundMeta}>{found.email}</p>
          <button type="button" className={styles.linkish} onClick={clearFound}>
            No es esta persona — cargar otro
          </button>
        </div>
      )}

      {!found && <GuestForm draft={draft} onDraft={onDraft} />}
    </div>
  );
}
