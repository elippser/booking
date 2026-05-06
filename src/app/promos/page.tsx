import { Suspense } from "react";
import PromosList from "@/components/Promos/PromosList";

export default function PromosPage() {
  return (
    <Suspense fallback={null}>
      <PromosList />
    </Suspense>
  );
}
