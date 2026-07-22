document.addEventListener('DOMContentLoaded', () => {
  const section = document.getElementById('discover-yourself');
  if (!section) return;
  const v2 = section.querySelector('.discover-yourself-v2');
  const v3 = section.querySelector('.discover-yourself-v3');
  const divider = section.querySelector('.discover-yourself-divider');

  const clamp01 = (n) => Math.min(1, Math.max(0, n));
  const setWipe = (el, progress) => {
    el.style.clipPath = `inset(0 ${100 - progress * 100}% 0 0)`;
  };

  // section is taller than the viewport and pinned via position: sticky,
  // so the extra scroll distance while it's pinned (rect.height - vh)
  // is what drives the wipe, not raw page scroll position
  const update = () => {
    const vh = window.innerHeight;
    const rect = section.getBoundingClientRect();
    const scrollableRange = rect.height - vh;
    const progress = scrollableRange > 0 ? clamp01(-rect.top / scrollableRange) : 0;

    const v2Progress = clamp01(progress / 0.5);
    const v3Progress = clamp01((progress - 0.5) / 0.5);
    setWipe(v2, v2Progress);
    setWipe(v3, v3Progress);

    // divider tracks the leading edge of whichever layer is actively wiping
    if (progress <= 0 || progress >= 1) {
      divider.style.opacity = '0';
    } else {
      const edge = progress < 0.5 ? v2Progress * 100 : v3Progress * 100;
      divider.style.left = `${edge}%`;
      divider.style.opacity = '1';
    }
  };

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
});
