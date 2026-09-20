// House of Vael — splash, menu, reveal
(function () {
  // pick the video size for the screen BEFORE anything loads: phones get the 720p files, everything else 1080p
  const sd = Math.min(screen.width, screen.height) * (devicePixelRatio || 1) < 1100 || (navigator.connection && navigator.connection.saveData);
  document.querySelectorAll('video source[data-hd]').forEach(src => { src.src = sd ? src.dataset.sd : src.dataset.hd; src.parentNode.load(); });
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const splash = document.getElementById('splash');
  const sv = document.getElementById('splash-video');
  const skip = document.getElementById('splash-skip');
  const seen = new URLSearchParams(location.search).has('enter') || (() => { try { return sessionStorage.getItem('vael-splash') === '1'; } catch (e) { return false; } })();
  const lift = () => {
    if (!splash || splash.classList.contains('lift')) return;
    splash.classList.add('lift'); try { sessionStorage.setItem('vael-splash', '1'); } catch (e) {}
    setTimeout(() => splash.remove(), 1600);
    const hv = document.querySelector('.hero-video'); if (hv) hv.play().catch(() => {});
  };
  if (seen || reduce) { splash && splash.remove(); }
  else if (sv) {
    sv.addEventListener('ended', lift);
    sv.addEventListener('error', lift);
    const tryPlay = () => sv.play().catch(() => {   // blocked/backgrounded → retry when visible, else straight in
      const again = () => { if (sv.paused) sv.play().catch(() => {}); };
      document.addEventListener('visibilitychange', again); window.addEventListener('pointerdown', again, { once: true });
      setTimeout(() => { if (sv.paused && sv.currentTime === 0) lift(); }, 4000);
    });
    tryPlay();
    setTimeout(() => splash.classList.add('ready'), 2500);
    setTimeout(lift, 16000);                      // safety
    skip && skip.addEventListener('click', lift);
  }

  // background-paused loops (power saving) resume when the tab is seen again
  const loops = document.querySelectorAll('.hero-video, .fibre-video');
  const resume = () => loops.forEach(v => { if (v.paused) v.play().catch(() => {}); });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') resume(); });
  window.addEventListener('pointerdown', resume, { once: true });

  // menu
  const menu = document.getElementById('menu');
  document.querySelector('.nav-menu').addEventListener('click', () => { menu.classList.add('open'); menu.setAttribute('aria-hidden', 'false'); });
  const closeMenu = () => { menu.classList.remove('open'); menu.setAttribute('aria-hidden', 'true'); };
  document.querySelector('.menu-close').addEventListener('click', closeMenu);
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

  // reveal on scroll
  const els = document.querySelectorAll('.house-text, .house-figure, .card, .fibre-copy, .story, .register > *');
  els.forEach(e => e.classList.add('reveal'));
  const io = new IntersectionObserver(entries => entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { threshold: 0.15 });
  els.forEach(e => io.observe(e));
})();
