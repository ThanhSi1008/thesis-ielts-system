"use client";

import React, { useState } from "react";
import {
  SPEAKING_CRITERIA_LABELS,
  SPEAKING_CRITERIA_KEYS,
  SPEAKING_DESCRIPTORS,
} from "@/lib/calculator-data";
import BandDescriptorTable from "./BandDescriptorTable";

export default function SpeakingDescriptors() {
  const [highlightedBand, setHighlightedBand] = useState<number | null>(null);

  return (
    <BandDescriptorTable
      criteriaLabels={SPEAKING_CRITERIA_LABELS}
      criteriaKeys={SPEAKING_CRITERIA_KEYS}
      descriptors={SPEAKING_DESCRIPTORS}
      highlightedBand={highlightedBand}
      onBandSelect={setHighlightedBand}
      themeColor="rose"
    />
  );
}
