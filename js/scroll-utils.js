// shared helpers for the pinned-section scroll-wipe effect used by
// how-it-works.js and discover-yourself.js
const clamp01 = (n) => Math.min(1, Math.max(0, n));

const setWipe = (el, progress) => {
  el.style.clipPath = `inset(0 ${100 - progress * 100}% 0 0)`;
};
