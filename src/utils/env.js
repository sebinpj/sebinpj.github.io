export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const saveData = () =>
  navigator.connection?.saveData === true;

export const isTouchPrimary = () =>
  window.matchMedia('(pointer: coarse)').matches;

export function webgl2Supported() {
  try {
    const canvas = document.createElement('canvas');
    return !!canvas.getContext('webgl2');
  } catch {
    return false;
  }
}

export function onIdle(fn, timeout = 1500) {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(fn, { timeout });
  } else {
    setTimeout(fn, timeout);
  }
}
