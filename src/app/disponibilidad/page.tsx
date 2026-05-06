import { Suspense } from "react";
import DisponibilidadGrid from "@/components/Disponibilidad/DisponibilidadGrid";

export default function DisponibilidadPage() {
  return (
    <Suspense fallback={null}>
      <DisponibilidadGrid />
    </Suspense>
  );
}
