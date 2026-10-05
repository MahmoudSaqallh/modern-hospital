"use client";

import { useSyncExternalStore } from "react";

/**
 * The patient's current time, refreshed every minute. Returns `null` during
 * server rendering and hydration, so time-dependent UI (availability, "today")
 * renders a skeleton first and never causes a hydration mismatch.
 */
let current: Date | null = null;
let timer: ReturnType<typeof setInterval> | undefined;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!timer) {
    timer = setInterval(() => {
      current = new Date();
      listeners.forEach((l) => l());
    }, 60_000);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = undefined;
    }
  };
}

function getSnapshot(): Date {
  if (!current) current = new Date();
  return current;
}

function getServerSnapshot(): Date | null {
  return null;
}

export function useClientNow(): Date | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
