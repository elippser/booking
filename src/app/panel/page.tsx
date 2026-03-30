import { Suspense } from "react";
import PanelDia from "@/components/Panel/PanelDia";

export default function PanelPage() {
  return (
    <Suspense fallback={null}>
      <PanelDia />
    </Suspense>
  );
}
