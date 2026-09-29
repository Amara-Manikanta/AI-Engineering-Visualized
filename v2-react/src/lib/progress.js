import { useSyncExternalStore } from "react";

/* ---------------------------------------------------------------------------
   Pages the reader has marked as read, kept in localStorage on this device.

   A tiny external store so every component showing a tick (the sidebar, the
   page footer, the learning paths) updates together, including across tabs
   via the storage event. Storage can be missing or throw (private windows,
   blocked site data); then marks simply last for this visit.
--------------------------------------------------------------------------- */

const KEY = "mani-notes:read:v1";
const listeners = new Set();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

let current = load();

function emit() {
  listeners.forEach((l) => l());
}

function save(next) {
  current = next;
  try {
    localStorage.setItem(KEY, JSON.stringify([...next]));
  } catch {
    /* keep the in-memory copy */
  }
  emit();
}

function subscribe(listener) {
  listeners.add(listener);
  const onStorage = (e) => {
    if (e.key === KEY) {
      current = load();
      emit();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useReadPages() {
  return useSyncExternalStore(subscribe, () => current, () => current);
}

export function setRead(path, read) {
  const next = new Set(current);
  if (read) next.add(path);
  else next.delete(path);
  save(next);
}
