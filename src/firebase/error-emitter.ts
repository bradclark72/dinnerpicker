// src/firebase/error-emitter.ts
type Listener = (err: Error) => void;
const listeners = new Set<Listener>();
export function emitFirebaseError(err: Error) { listeners.forEach((l) => l(err)); }
export function onFirebaseError(cb: Listener) { listeners.add(cb); return () => listeners.delete(cb); }
