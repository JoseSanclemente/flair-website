// shared helpers for the pinned-section scroll-wipe effect used by
// how-it-works.js and discover-yourself.js
const clamp01 = (n) => Math.min(1, Math.max(0, n));

const setWipe = (el, progress) => {
  el.style.clipPath = `inset(0 ${100 - progress * 100}% 0 0)`;
};

// section is taller than the viewport and pinned via position: sticky,
// so the extra scroll distance while it's pinned (rect.height - vh)
// is what drives progress, not raw page scroll position
const getPinnedProgress = (section) => {
  const vh = window.innerHeight;
  const rect = section.getBoundingClientRect();
  const scrollableRange = rect.height - vh;
  return scrollableRange > 0 ? clamp01(-rect.top / scrollableRange) : 0;
};

// runs all registered callbacks inside a single rAF tick per scroll/resize
// event, so multiple sections reading layout don't force redundant reflows
const scrollTickCallbacks = [];
let scrollTickScheduled = false;

const scheduleScrollTick = () => {
  if (scrollTickScheduled) return;
  scrollTickScheduled = true;
  requestAnimationFrame(() => {
    scrollTickScheduled = false;
    scrollTickCallbacks.forEach((cb) => cb());
  });
};

const onScrollTick = (cb) => {
  scrollTickCallbacks.push(cb);
  window.addEventListener('scroll', scheduleScrollTick, { passive: true });
  window.addEventListener('resize', scheduleScrollTick);
};
