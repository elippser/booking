"use client";

import type { ReactNode } from "react";
import { useAppContext } from "@/hooks/useAppContext";
import styles from "./ContextGate.module.css";

export default function ContextGate({ children }: { children: ReactNode }) {
  const { isReady } = useAppContext();

  if (!isReady) {
    return (
      <div className={styles.wrap}>
        <p className={styles.title}>Contexto requerido</p>
        <p className={styles.text}>
          Abrí esta app con los parámetros de consulta{" "}
          <code>companyId</code>, <code>propertyId</code> y <code>token</code>{" "}
          (JWT del staff). Opcional: <code>spaceId</code>, <code>theme</code>,{" "}
          <code>accent</code>.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
