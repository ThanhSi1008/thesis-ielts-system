import React, { Suspense } from "react";
import SpeakingCatalogContent from "./SpeakingCatalogContent";

export default function SpeakingCatalogPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading...</div>}>
      <SpeakingCatalogContent />
    </Suspense>
  );
}
