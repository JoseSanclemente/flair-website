document.addEventListener('DOMContentLoaded', () => {
  const el = document.getElementById('tagline');
  const text = el.dataset.text;
  let i = 0;

  const type = () => {
    if (i < text.length) {
      el.textContent += text[i];
      i++;
      setTimeout(type, 60);
    } else {
      setTimeout(playOutro, 1500);
    }
  };

  const playOutro = () => {
    document.getElementById('tagline-wrap').classList.add('fade-out');
    moveLogoToTop();
  };

  const moveLogoToTop = () => {
    const nav = document.getElementById('logo-nav');
    const img = nav.querySelector('img');
    const first = img.getBoundingClientRect();

    // hold nav's spot in the flex flow so removing it doesn't reflow the tagline
    const navRect = nav.getBoundingClientRect();
    const spacer = document.createElement('div');
    spacer.style.height = `${navRect.height}px`;
    nav.after(spacer);

    nav.classList.add('nav-fixed');
    const last = img.getBoundingClientRect();

    const deltaX = first.left - last.left;
    const deltaY = first.top - last.top;

    nav.style.transition = 'none';
    nav.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

    void nav.offsetWidth; // force reflow so the instant transform paints before the transition kicks in

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        nav.style.transition = 'transform 1.1s ease';
        nav.style.transform = 'translate(0, 0)';
        // timer, not transitionend: if first/last positions happen to match
        // (delta is 0,0) the transform never actually changes, so
        // transitionend would never fire and the hero would never reveal
        setTimeout(() => {
          document.dispatchEvent(new CustomEvent('hero:reveal'));
        }, 1100);
      });
    });
  };

  setTimeout(type, 700);
});
