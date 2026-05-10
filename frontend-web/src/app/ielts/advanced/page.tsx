"use client";

import React, { Suspense } from "react";
import AdvancedContent from "./AdvancedContent";

export default function IeltsAdvancedPracticePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading...</div>}>
      <AdvancedContent embedded />
    </Suspense>
  );
}
