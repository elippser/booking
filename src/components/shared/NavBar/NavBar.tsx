"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import styles from "./NavBar.module.css";

const TABS = [
  { href: "/panel", label: "Panel del día" },
  { href: "/reservas", label: "Reservas" },
  { href: "/nueva", label: "Nueva reserva" },
  { href: "/tarifas", label: "Tarifas" },
] as const;

export default function NavBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const qs = searchParams.toString();
  const suffix = qs ? `?${qs}` : "";

  const isActive = (href: string) =>
    href === "/reservas"
      ? pathname === "/reservas" || pathname.startsWith("/reservas/")
      : pathname === href;

  return (
    <nav className={styles.nav}>
      {TABS.map((t) => (
        <Link
          key={t.href}
          href={`${t.href}${suffix}`}
          className={`${styles.tab} ${isActive(t.href) ? styles.active : ""}`}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
