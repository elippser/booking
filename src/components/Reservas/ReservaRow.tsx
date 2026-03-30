"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import StatusBadge from "@/components/shared/StatusBadge/StatusBadge";
import type { Reservation } from "@/types/reservas";
import { formatShortStayRange } from "@/utils/dateFormat";
import styles from "./ReservaRow.module.css";

interface Props {
  reservation: Reservation;
}

export default function ReservaRow({ reservation: r }: Props) {
  const searchParams = useSearchParams();
  const qs = searchParams.toString();
  const suffix = qs ? `?${qs}` : "";

  const guest = r.guest
    ? `${r.guest.firstName} ${r.guest.lastName}`
    : "—";

  return (
    <tr className={styles.row}>
      <td className={styles.code}>
        <Link
          href={`/reservas/${r.reservationId}${suffix}`}
          className={styles.link}
        >
          {r.reservationCode.length > 6
            ? `${r.reservationCode.slice(0, 4)}…`
            : r.reservationCode}
        </Link>
      </td>
      <td>{guest}</td>
      <td className={styles.dates}>
        {formatShortStayRange(r.checkIn, r.checkOut)}
      </td>
      <td>{r.categoryName ?? "—"}</td>
      <td>
        <StatusBadge status={r.status} />
      </td>
    </tr>
  );
}
