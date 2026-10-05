"use client";

/**
 * Tiny coordination signal between the preloader and the page intro.
 * The hero waits for "ready" so its timeline is never hidden behind the loader;
 * if the loader is skipped, ready fires immediately.
 */
const EVENT = "pas:ready";
let ready = false;

export function markAppReady(): void {
  if (ready) return;
  ready = true;
  window.dispatchEvent(new Event(EVENT));
}

export function onAppReady(callback: () => void): () => void {
  if (ready || document.documentElement.classList.contains("preloader-skip")) {
    callback();
    return () => {};
  }
  const handler = () => callback();
  window.addEventListener(EVENT, handler, { once: true });
  return () => window.removeEventListener(EVENT, handler);
}
