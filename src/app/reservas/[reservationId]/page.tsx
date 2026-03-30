import { Suspense } from "react";
import ReservaDetalle from "@/components/ReservaDetalle/ReservaDetalle";

export default function ReservaDetallePage() {
  return (
    <Suspense fallback={null}>
      <ReservaDetalle />
    </Suspense>
  );
}
