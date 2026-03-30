import { Suspense } from "react";
import TarifasList from "@/components/Tarifas/TarifasList";

export default function TarifasPage() {
  return (
    <Suspense fallback={null}>
      <TarifasList />
    </Suspense>
  );
}
