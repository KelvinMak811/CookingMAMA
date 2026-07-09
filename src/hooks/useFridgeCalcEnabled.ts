"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "smartcook_use_fridge_calc";

export function useFridgeCalcEnabled(defaultEnabled = true) {
  const [enabled, setEnabled] = useState(defaultEnabled);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === "0") setEnabled(false);
      else if (raw === "1") setEnabled(true);
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = (next: boolean) => {
    setEnabled(next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
    } catch {
      /* ignore */
    }
  };

  return { enabled, setEnabled: toggle };
}
