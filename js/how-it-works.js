document.addEventListener('DOMContentLoaded', () => {
  const section = document.getElementById('how-it-works');
  const bw = section.querySelector('.how-it-works-bw');
  const text = section.querySelector('.how-it-works-text');
  const black = section.querySelector('.how-it-works-black');
  const outlineText = section.querySelector('.how-it-works-outline-text');
  const logoNav = document.getElementById('logo-nav');
  const stepsWrap = document.getElementById('how-it-works-steps');

  const clamp01 = (n) => Math.min(1, Math.max(0, n));
  const setWipe = (el, progress) => {
    el.style.clipPath = `inset(0 ${100 - progress * 100}% 0 0)`;
  };

  const update = () => {
    const vh = window.innerHeight;
    const rect = section.getBoundingClientRect();
    // section is taller than the viewport and pinned via position: sticky,
    // so the extra scroll distance while it's pinned (rect.height - vh)
    // is what drives the wipe, not raw page scroll position
    const scrollableRange = rect.height - vh;
    const progress = scrollableRange > 0 ? clamp01(-rect.top / scrollableRange) : 0;

    // b&w + text wipe across the first half of the pinned scroll, black
    // wipe across the second half, so the order is purely scroll-driven
    const bwProgress = clamp01(progress / 0.5);
    const blackProgress = clamp01((progress - 0.5) / 0.5);

    setWipe(bw, bwProgress);
    setWipe(text, bwProgress);
    setWipe(black, blackProgress);
    setWipe(outlineText, blackProgress);

    // black stays clamped at full coverage all the way through the steps
    // section below (same black background), but once that section has
    // scrolled fully past, the page underneath is light again — a 1px
    // tolerance since the true max scroll position lands at a sub-pixel
    // fraction above 0, never exactly 0
    const pastBlackSection = stepsWrap.getBoundingClientRect().bottom <= 1;
    logoNav.classList.toggle('logo-white', blackProgress > 0 && !pastBlackSection);
  };

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();

  // steps below scroll normally, driving the counter line + marker fill
  // directly from scroll position so both move 1:1 with the user
  const counter = document.querySelector('.how-it-works-counter');
  const counterItems = Array.from(document.querySelectorAll('.how-it-works-counter-item'));
  const counterLine = document.querySelector('.how-it-works-counter-line');
  const counterLineFill = document.querySelector('.how-it-works-counter-line-fill');
  const markers = counterItems.map((item) => item.querySelector('.marker'));

  // slide-up + fade-in + slight rotation as each step's number enters view
  const stepNumbers = Array.from(document.querySelectorAll('.how-it-works-step-number'));
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle('in-view', entry.isIntersecting);
      });
    },
    { threshold: 0.35 },
  );
  stepNumbers.forEach((el) => revealObserver.observe(el));

  // each marker's position along the line, as a 0-1 fraction, so a marker
  // only fills once the fill has actually grown far enough to reach it
  let markerFractions = [];

  const layoutLine = () => {
    const counterRect = counter.getBoundingClientRect();
    const markerRects = markers.map((m) => m.getBoundingClientRect());
    const firstCenterY = markerRects[0].top + markerRects[0].height / 2 - counterRect.top;
    const lastRect = markerRects[markerRects.length - 1];
    const lastCenterY = lastRect.top + lastRect.height / 2 - counterRect.top;
    const span = lastCenterY - firstCenterY;

    counterLine.style.left = `${markerRects[0].left + markerRects[0].width / 2 - counterRect.left}px`;
    counterLine.style.top = `${firstCenterY}px`;
    counterLine.style.height = `${span}px`;

    markerFractions = markerRects.map((r) => {
      const centerY = r.top + r.height / 2 - counterRect.top;
      return span > 0 ? (centerY - firstCenterY) / span : 0;
    });
  };

  const updateLineProgress = () => {
    const vh = window.innerHeight;
    const rect = stepsWrap.getBoundingClientRect();
    const total = rect.height - vh;
    const progress = total > 0 ? clamp01(-rect.top / total) : 0;

    // tracks live scroll position 1:1, growing and shrinking with it
    counterLineFill.style.height = `${progress * 100}%`;
    counterItems.forEach((item, i) => {
      item.classList.toggle('active', progress >= markerFractions[i]);
    });
  };

  layoutLine();
  updateLineProgress();
  window.addEventListener('scroll', updateLineProgress, { passive: true });
  window.addEventListener('resize', () => {
    layoutLine();
    updateLineProgress();
  });
});
