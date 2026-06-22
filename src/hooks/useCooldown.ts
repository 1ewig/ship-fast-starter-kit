"use client";

import { useState, useEffect, useCallback } from "react";

const PREFIX = "cooldown:";

function readSaved(key: string): number {
  if (typeof window === "undefined") return 0;
  const raw = localStorage.getItem(PREFIX + key);
  if (!raw) return 0;
  const remaining = Math.ceil((parseInt(raw, 10) - Date.now()) / 1000);
  return Math.max(0, remaining);
}

function writeSaved(key: string, seconds: number) {
  localStorage.setItem(PREFIX + key, String(Date.now() + seconds * 1000));
}

function clearSaved(key: string) {
  localStorage.removeItem(PREFIX + key);
}

export function useCooldown(key: string) {
  const [cooldown, setCooldown] = useState(() => readSaved(key));

  useEffect(() => {
    if (cooldown <= 0) {
      clearSaved(key);
      return;
    }
    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearSaved(key);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown, key]);

  const start = useCallback(
    (seconds: number) => {
      writeSaved(key, seconds);
      setCooldown(seconds);
    },
    [key]
  );

  const reset = useCallback(() => {
    clearSaved(key);
    setCooldown(0);
  }, [key]);

  return { cooldown, start, reset };
}
