import { Suspense } from "react";
import NuevaReservaForm from "@/components/NuevaReserva/NuevaReservaForm";

export default function NuevaPage() {
  return (
    <Suspense fallback={null}>
      <NuevaReservaForm />
    </Suspense>
  );
}
