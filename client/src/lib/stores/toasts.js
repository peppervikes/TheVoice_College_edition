import { writable } from 'svelte/store';

export const toasts = writable([]);

export function addToast(message, type = 'info', duration = 3000) {
  const id = Math.floor(Math.random() * 10000);
  
  toasts.update((all) => [{ id, message, type }, ...all]);

  if (duration) {
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }
}

export function removeToast(id) {
  toasts.update((all) => all.filter((t) => t.id !== id));
}
