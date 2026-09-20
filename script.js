// House of Vael — splash, menu, reveal
(function () {
  // pick the video size for the screen BEFORE anything loads: phones get the 720p files, everything else 1080p
  const sd = innerWidth < 700 || (navigator.connection && navigator.connection.saveData);   // narrow = phone → 720p files
  document.querySelectorAll('video source[data-hd]').forEach(src => { src.src = sd ? src.dataset.sd : src.dataset.hd; src.parentNode.load(); });
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const splash = document.getElementById('splash'), sv = document.getElementById('splash-video'), skip = document.getElementById('splash-skip');
  const gate = document.getElementById('gate'), au = document.getElementById('site-audio'), sb = document.querySelector('.nav-sound');
  const hv = document.querySelector('.hero-video');
  const seen = new URLSearchParams(location.search).has('enter') || (() => { try { return sessionStorage.getItem('vael-splash') === '1'; } catch (e) { return false; } })();

  // SITE AUDIO — one ambient bed under the whole page, from the first frame. Off with one click, remembered for the session.
  let off = (() => { try { return sessionStorage.getItem('vael-sound') === 'off'; } catch (e) { return false; } })();
  const fadeTo = (v, ms) => { const from = au.volume, t0 = performance.now(); const step = t => { const k = Math.min(1, (t - t0) / ms); au.volume = from + (v - from) * k; if (k < 1) requestAnimationFrame(step); else if (v === 0) au.pause(); }; requestAnimationFrame(step); };
  const paint = () => sb && sb.setAttribute('aria-pressed', off ? 'true' : 'false');
  const start = () => { if (off || !au.paused) return Promise.resolve(); au.volume = 0; return au.play().then(() => fadeTo(1, 2000)); };
  paint();
  sb && sb.addEventListener('click', () => { off = !off; try { sessionStorage.setItem('vael-sound', off ? 'off' : 'on'); } catch (e) {} paint(); if (off) fadeTo(0, 900); else start().catch(() => {}); });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && !off && au.paused) start().catch(() => {}); });

  // SPLASH
  const lift = () => {
    if (!splash || splash.classList.contains('lift')) return;
    splash.classList.add('lift'); try { sessionStorage.setItem('vael-splash', '1'); } catch (e) {}
    setTimeout(() => splash.remove(), 2400); if (hv) { hv.classList.add('on'); hv.play().catch(() => {}); }
  };
  const runSplash = () => {
    sv.addEventListener('ended', lift); sv.addEventListener('error', lift);
    sv.play().catch(() => {                        // muted play refused (backgrounded) → retry when visible, else straight in
      const again = () => { if (sv.paused) sv.play().catch(() => {}); };
      document.addEventListener('visibilitychange', again); window.addEventListener('pointerdown', again, { once: true });
      setTimeout(() => { if (sv.paused && sv.currentTime === 0) lift(); }, 4000);
    });
    setTimeout(() => splash.classList.add('ready'), 2500); setTimeout(lift, 32000); skip && skip.addEventListener('click', lift);
  };
  const enter = () => { gate && gate.classList.add('lift'); setTimeout(() => gate && gate.remove(), 1400); if (seen || reduce) { splash && splash.remove(); if (hv) hv.classList.add('on'); } else runSplash(); };

  // Browsers only allow sound before a touch when they already trust the site. So: try to start the music at once —
  // if it plays, the page opens by itself with sound; if it is refused, a single tap on the gate is the touch that
  // starts music and film together, so the sound really does begin with the first frame.
  const attempt = off ? Promise.reject() : start();
  attempt.then(enter).catch(() => {
    if (!gate) { enter(); return; }
    gate.classList.add('ready');
    const go = withSound => e => { e.preventDefault(); if (!withSound) { off = true; try { sessionStorage.setItem('vael-sound', 'off'); } catch (x) {} paint(); } else { off = false; paint(); start().catch(() => {}); } enter(); };
    document.getElementById('gate-sound').addEventListener('click', go(true));
    document.getElementById('gate-quiet').addEventListener('click', go(false));
    gate.addEventListener('click', e => { if (e.target === gate || e.target.classList.contains('gate-mark')) go(true)(e); });
  });

  // background-paused loops (power saving) resume when the tab is seen again
  const loops = document.querySelectorAll('.hero-video, .fibre-video');
  const resume = () => loops.forEach(v => { if (v.paused && v.classList.contains('on') !== false && !(v === hv && !v.classList.contains('on'))) v.play().catch(() => {}); });
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
