const isTouch = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;

// squares are fixed to the viewport so they can trail the cursor anywhere on
// screen; clip the layer to the hero's own bounding box on every scroll/resize
// so squares never paint over sections below the hero, even mid-scroll
document.addEventListener('DOMContentLoaded', () => {
  const intro = document.getElementById('intro');
  const orbitLayer = document.getElementById('orbit-layer');

  const clipToIntro = () => {
    const rect = intro.getBoundingClientRect();
    const top = Math.max(rect.top, 0);
    const bottom = Math.max(window.innerHeight - rect.bottom, 0);
    orbitLayer.style.clipPath = `inset(${top}px 0px ${bottom}px 0px)`;
  };

  clipToIntro();
  ScrollTrigger.create({
    trigger: intro,
    start: 'top bottom',
    end: 'bottom top',
    onUpdate: clipToIntro,
    onRefresh: clipToIntro,
  });
});

// tracked from page load so the real cursor position is already known by
// the time the hero reveals, instead of defaulting to the page center
let cursor = null;
if (!isTouch) {
  window.addEventListener('mousemove', (e) => {
    cursor = { x: e.clientX, y: e.clientY };
  });
}

document.addEventListener('hero:reveal', () => {
  const hero = document.getElementById('hero');
  const heroWrap = document.getElementById('hero-wrap');
  const heroImg = document.getElementById('hero-img');
  const orbitLayer = document.getElementById('orbit-layer');
  const squares = Array.from(document.querySelectorAll('.orbit-square'));

  // must stay in sync with the .orbit-square width/height breakpoint in
  // assets/css/main.css — used to center the square on its computed position
  const SQUARE_SIZE = window.matchMedia('(min-width: 641px)').matches ? 220 : 190;
  const RADIUS = 90;
  const ANGULAR_SPEED = 1.2; // radians per second

  hero.style.display = 'flex';
  void hero.offsetWidth; // force reflow so the pre-transition state (scale 1.35, opacity 0) paints first
  requestAnimationFrame(() => {
    hero.classList.add('visible');
    heroWrap.classList.add('visible');
  });
  orbitLayer.classList.add('visible');

  // each square clips (overflow: hidden) a full-size copy of the alt photo;
  // the copy is positioned with `transform` instead of animating the
  // square's own background-position/size, so the browser only has to
  // composite (GPU) every frame instead of repainting (main thread)
  const fills = squares.map((square) => {
    const fill = document.createElement('div');
    fill.className = 'orbit-square-fill';
    fill.style.backgroundImage = `url(${square.dataset.img})`;
    square.appendChild(fill);
    return fill;
  });

  const heroRect = () => heroImg.getBoundingClientRect();

  if (!cursor) {
    const r = heroRect();
    cursor = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  let angle = 0;

  // only touched when the hero's rendered size actually changes (during the
  // ~1s entrance scale-in, then never again outside of a resize), so the
  // steady-state orbit loop below only ever writes `transform`
  let lastHRectWidth = null;
  let lastHRectHeight = null;

  const tick = (time, deltaTime) => {
    const dt = deltaTime / 1000;
    angle += ANGULAR_SPEED * dt;

    if (isTouch) {
      const r = heroRect();
      cursor = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }

    const hRect = heroRect();

    // width/height only change during the entrance scale-in or on resize;
    // skip the (layout-triggering) size writes on every other frame
    const sizeChanged = hRect.width !== lastHRectWidth || hRect.height !== lastHRectHeight;
    if (sizeChanged) {
      lastHRectWidth = hRect.width;
      lastHRectHeight = hRect.height;
      fills.forEach((fill) => {
        fill.style.width = `${hRect.width}px`;
        fill.style.height = `${hRect.height}px`;
        fill.style.backgroundSize = `${hRect.width}px ${hRect.height}px`;
      });
    }

    squares.forEach((square, i) => {
      const offset = (i * 2 * Math.PI) / 3;
      const centerX = cursor.x + RADIUS * Math.cos(angle + offset);
      const centerY = cursor.y + RADIUS * Math.sin(angle + offset);
      const left = centerX - SQUARE_SIZE / 2;
      const top = centerY - SQUARE_SIZE / 2;
      square.style.transform = `translate3d(${left}px, ${top}px, 0)`;

      // align the fill layer with the hero image so it reads as a window
      // into the alternate photo at that exact spot — transform only, so
      // this never triggers a repaint, just a compositor update
      const dx = hRect.left - left;
      const dy = hRect.top - top;
      fills[i].style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
    });
  };

  // the orbit loop only needs to run while the hero is actually visible;
  // stop/resume the gsap ticker callback once #intro scrolls out/back in
  // instead of burning CPU/battery for the rest of the page's lifetime
  const intro = document.getElementById('intro');
  ScrollTrigger.create({
    trigger: intro,
    start: 'top bottom',
    end: 'bottom top',
    onEnter: () => gsap.ticker.add(tick),
    onEnterBack: () => gsap.ticker.add(tick),
    onLeave: () => gsap.ticker.remove(tick),
    onLeaveBack: () => gsap.ticker.remove(tick),
  });
});
