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
  window.addEventListener('scroll', clipToIntro, { passive: true });
  window.addEventListener('resize', clipToIntro);
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

  const SQUARE_SIZE = 190;
  const RADIUS = 90;
  const ANGULAR_SPEED = 1.2; // radians per second

  hero.style.display = 'flex';
  void hero.offsetWidth; // force reflow so the pre-transition state (scale 1.35, opacity 0) paints first
  requestAnimationFrame(() => {
    hero.classList.add('visible');
    heroWrap.classList.add('visible');
  });
  orbitLayer.classList.add('visible');

  squares.forEach((square) => {
    square.style.backgroundImage = `url(${square.dataset.img})`;
  });

  const heroRect = () => heroImg.getBoundingClientRect();

  if (!cursor) {
    const r = heroRect();
    cursor = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  let angle = 0;
  let lastTime = performance.now();

  const tick = (now) => {
    const dt = (now - lastTime) / 1000;
    lastTime = now;
    angle += ANGULAR_SPEED * dt;

    if (isTouch) {
      const r = heroRect();
      cursor = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }

    const hRect = heroRect();

    squares.forEach((square, i) => {
      const offset = (i * 2 * Math.PI) / 3;
      const centerX = cursor.x + RADIUS * Math.cos(angle + offset);
      const centerY = cursor.y + RADIUS * Math.sin(angle + offset);
      const left = centerX - SQUARE_SIZE / 2;
      const top = centerY - SQUARE_SIZE / 2;
      square.style.transform = `translate3d(${left}px, ${top}px, 0)`;

      // align the square's background with the hero image so it reads as a
      // window into the alternate photo at that exact spot
      square.style.backgroundSize = `${hRect.width}px ${hRect.height}px`;
      square.style.backgroundPosition = `${-(left - hRect.left)}px ${-(top - hRect.top)}px`;
    });

    requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
});
