document.addEventListener('DOMContentLoaded', () => {
  const section = document.getElementById('discover-yourself');
  if (!section) return;
  const v2 = section.querySelector('.discover-yourself-v2');
  const v3 = section.querySelector('.discover-yourself-v3');
  const divider = section.querySelector('.discover-yourself-divider');

  const update = (progress) => {
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

  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: () => `+=${section.offsetHeight - window.innerHeight}`,
    scrub: true,
    invalidateOnRefresh: true,
    onUpdate: (self) => update(self.progress),
  });
  update(0);
});
