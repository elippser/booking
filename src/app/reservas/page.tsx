import { Suspense } from "react";
import ReservasList from "@/components/Reservas/ReservasList";

export default function ReservasPage() {
  return (
    <Suspense fallback={null}>
      <ReservasList />
    </Suspense>
  );
}
