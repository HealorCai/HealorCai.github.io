(() => {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const links = [...document.querySelectorAll('.section-nav a')];
  const sections = links.map(link => document.querySelector(link.hash));
  const progress = document.querySelector('.reading-progress span');
  const backToTop = document.querySelector('.back-to-top');
  let scheduled = false;

  function updateReading() {
    const range = document.documentElement.scrollHeight - window.innerHeight;
    const fraction = range > 0 ? Math.min(1, Math.max(0, window.scrollY / range)) : 0;
    progress.style.transform = `scaleX(${fraction})`;
    backToTop.hidden = window.scrollY < 400;
    let current = sections[0];
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= 150) current = section;
    }
    if (range > 0 && window.scrollY >= range - 2) current = sections.at(-1);
    links.forEach((link, index) => {
      if (sections[index] === current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    scheduled = false;
  }
  function scheduleReading() {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(updateReading);
    }
  }
  window.addEventListener('scroll', scheduleReading, { passive: true });
  window.addEventListener('resize', scheduleReading);
  window.addEventListener('load', scheduleReading);
  if ('ResizeObserver' in window) new ResizeObserver(scheduleReading).observe(document.querySelector('.page'));
  updateReading();

  // Content remains visible without JavaScript; animate each item only once.
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        if (!motion.matches && entry.target.getBoundingClientRect().top > 0) {
          entry.target.animate([
            { opacity: 0.35, translate: '0 12px' },
            { opacity: 1, translate: '0 0' }
          ], { duration: 320, easing: 'steps(6, end)' });
        }
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('.publication, .news-list, .dated-list, #misc').forEach(item => observer.observe(item));
    motion.addEventListener('change', () => {
      if (motion.matches) document.getAnimations().forEach(animation => animation.cancel());
    });
  }

  const copy = document.querySelector('.copy-email');
  const status = document.querySelector('.copy-status');
  const email = document.querySelector('a[href^="mailto:"]').getAttribute('href').slice(7);
  let statusTimeout;
  if (navigator.clipboard?.writeText) {
    copy.hidden = false;
    copy.addEventListener('click', async () => {
      clearTimeout(statusTimeout);
      try {
        await navigator.clipboard.writeText(email);
        status.textContent = 'Email copied!';
      } catch {
        status.textContent = `Copy this address: ${email}`;
      }
      statusTimeout = setTimeout(() => { status.textContent = ''; }, 6000);
    });
  }
})();
