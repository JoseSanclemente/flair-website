document.addEventListener('DOMContentLoaded', () => {
  const section = document.getElementById('discover-yourself');
  if (!section) return;
  const v2 = section.querySelector('.discover-yourself-v2');
  const v3 = section.querySelector('.discover-yourself-v3');

  const clamp01 = (n) => Math.min(1, Math.max(0, n));
  const setWipe = (el, progress) => {
    el.style.clipPath = `inset(0 ${100 - progress * 100}% 0 0)`;
  };

  // progress is local state driven by captured wheel/touch delta while the
  // section owns scroll, not by page scroll position
  let progress = 0;
  let engaged = false;
  // once released at an edge, don't re-engage until the section actually
  // leaves the pinned range, otherwise release() immediately re-triggers engage()
  let exitedAt = null; // 'start' | 'end' | null
  let renderQueued = false;

  const render = () => {
    renderQueued = false;
    setWipe(v2, clamp01(progress / 0.5));
    setWipe(v3, clamp01((progress - 0.5) / 0.5));
  };
  const scheduleRender = () => {
    if (!renderQueued) {
      renderQueued = true;
      requestAnimationFrame(render);
    }
  };

  const isPinned = () => {
    const rect = section.getBoundingClientRect();
    return rect.top <= 0 && rect.bottom > window.innerHeight;
  };

  const engage = () => {
    if (engaged) return;
    engaged = true;
    exitedAt = null;
    if (window.lenis) window.lenis.stop();
  };

  const release = (edge) => {
    if (!engaged) return;
    engaged = false;
    exitedAt = edge;
    if (window.lenis) window.lenis.start();
  };

  window.addEventListener(
    'scroll',
    () => {
      if (engaged) return;
      if (!isPinned()) {
        exitedAt = null;
        return;
      }
      if (exitedAt) return;
      if (progress <= 0 || progress >= 1) engage();
    },
    { passive: true },
  );

  const applyDelta = (delta) => {
    const next = clamp01(progress + delta);
    if (next === progress) {
      if (progress <= 0 && delta < 0) release('start');
      else if (progress >= 1 && delta > 0) release('end');
      return;
    }
    progress = next;
    scheduleRender();
  };

  window.addEventListener(
    'wheel',
    (e) => {
      if (!engaged) return;
      e.preventDefault();
      applyDelta(e.deltaY / 1200);
    },
    { passive: false },
  );

  let touchStartY = null;

  window.addEventListener(
    'touchstart',
    (e) => {
      touchStartY = e.touches[0].clientY;
    },
    { passive: true },
  );

  window.addEventListener(
    'touchmove',
    (e) => {
      if (touchStartY === null) return;
      const y = e.touches[0].clientY;

      if (!engaged) {
        if (isPinned() && !exitedAt && (progress <= 0 || progress >= 1)) {
          engage();
        } else {
          touchStartY = y;
          return;
        }
      }

      e.preventDefault();
      const delta = touchStartY - y;
      touchStartY = y;
      applyDelta(delta / 300);
    },
    { passive: false },
  );

  render();
});
