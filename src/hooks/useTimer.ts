"use client";

import { useRef, useCallback } from "react";

export function useTimer() {
  const startTime = useRef<number | null>(null);

  const start = useCallback(() => {
    startTime.current = performance.now();
  }, []);

  const elapsed = useCallback((): number => {
    if (startTime.current === null) return 0;
    return Math.round(performance.now() - startTime.current);
  }, []);

  const reset = useCallback(() => {
    startTime.current = null;
  }, []);

  return { start, elapsed, reset };
}
