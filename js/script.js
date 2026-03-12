/* =============================================
   EDUARDO BORTOLETO — script.js v3 GODLY
   ============================================= */
(function () {
  'use strict';

  /* ══════════════════════════════════════════
     LOADING SCREEN
  ══════════════════════════════════════════ */
  window.addEventListener('load', () => {
    setTimeout(() => {
      const loader = document.getElementById('loader');
      if (loader) loader.classList.add('hide');
      setTimeout(() => { if (loader) loader.remove(); }, 1000);
    }, 1400);
  });

  /* ══════════════════════════════════════════
     GOLD PARTICLES
  ══════════════════════════════════════════ */
  const canvas = document.getElementById('particles');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let W = canvas.width  = window.innerWidth;
    let H = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    });

    const PARTICLE_COUNT = window.innerWidth < 640 ? 40 : 70;
    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.2 + 0.2,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      op: Math.random() * 0.4 + 0.08,
      gold: Math.random() > 0.35,
    }));

    function drawParticles() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.gold ? `rgba(201,169,110,${p.op})` : `rgba(240,234,216,${p.op * 0.5})`;
        ctx.fill();
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;
      });
      requestAnimationFrame(drawParticles);
    }
    drawParticles();
  }

  /* ══════════════════════════════════════════
     NAV SCROLL
  ══════════════════════════════════════════ */
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });

  /* ══════════════════════════════════════════
     SCROLL REVEAL (IntersectionObserver)
  ══════════════════════════════════════════ */
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal, .reveal-left').forEach(el => revealObs.observe(el));

  /* ══════════════════════════════════════════
     HERO PHOTO PARALLAX — desktop mouse
  ══════════════════════════════════════════ */
  const heroImg = document.getElementById('hero-img');
  if (heroImg && window.matchMedia('(min-width: 1024px)').matches) {
    let ticking = false;
    document.addEventListener('mousemove', (e) => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const dx = (e.clientX / window.innerWidth  - 0.5) * 12;
          const dy = (e.clientY / window.innerHeight - 0.5) * 7;
          heroImg.style.transform = `translate(${dx}px,${dy}px) scale(1.04)`;
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  /* ══════════════════════════════════════════
     3D LOGO — gyroscope (mobile) + mouse (desktop)
  ══════════════════════════════════════════ */
  const stage = document.getElementById('logo-stage');
  if (stage) {
    let tRX = 0, tRY = 0, cRX = 0, cRY = 0;
    let gyroActive = false;

    function animLogo() {
      cRX += (tRX - cRX) * 0.07;
      cRY += (tRY - cRY) * 0.07;
      const rx = Math.max(-22, Math.min(22, cRX));
      const ry = Math.max(-28, Math.min(28, cRY));
      const isMoving = Math.abs(tRX) > 0.5 || Math.abs(tRY) > 0.5;
      stage.style.animationPlayState = isMoving ? 'paused' : 'running';
      if (isMoving) stage.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
      else          stage.style.transform = '';
      requestAnimationFrame(animLogo);
    }
    animLogo();

    const isMobile = window.matchMedia('(max-width: 1023px)').matches;

    if (isMobile && window.DeviceOrientationEvent) {
      const bindGyro = () => {
        gyroActive = true;
        window.addEventListener('deviceorientation', (e) => {
          if (e.beta === null) return;
          tRX = Math.max(-25, Math.min(25, (e.beta - 45))) * 0.5;
          tRY = Math.max(-25, Math.min(25, e.gamma)) * 0.6;
        }, { passive: true });
      };
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        document.addEventListener('touchstart', () => {
          if (!gyroActive) {
            DeviceOrientationEvent.requestPermission()
              .then(s => { if (s === 'granted') bindGyro(); })
              .catch(() => {});
          }
        }, { once: true });
      } else {
        bindGyro();
      }
    } else {
      const escSection = document.getElementById('escritorio');
      if (escSection) {
        escSection.addEventListener('mousemove', (e) => {
          const r = escSection.getBoundingClientRect();
          tRY = ((e.clientX - r.left - r.width  / 2) / (r.width  / 2)) * 20;
          tRX = ((e.clientY - r.top  - r.height / 2) / (r.height / 2)) * -14;
        });
        escSection.addEventListener('mouseleave', () => { tRX = 0; tRY = 0; });
      }
    }
  }

  /* ══════════════════════════════════════════
     COUNTER ANIMATION
  ══════════════════════════════════════════ */
  const statsEl = document.querySelector('.hero-stats');
  if (statsEl) {
    const cntObs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        animCount(document.getElementById('cnt-rating'), 5.0, '', 1);
        animCount(document.getElementById('cnt-focus'),  100, '%', 0);
        cntObs.disconnect();
      }
    }, { threshold: 0.5 });
    cntObs.observe(statsEl);
  }

  function animCount(el, end, suf, dec) {
    if (!el) return;
    const dur = 1800, start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      el.textContent = (dec ? (ease * end).toFixed(dec) : Math.floor(ease * end)) + suf;
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ══════════════════════════════════════════
     RIPPLE EFFECT on cards + buttons
  ══════════════════════════════════════════ */
  function addRipple(el) {
    el.style.position = 'relative';
    el.style.overflow = 'hidden';
    el.addEventListener('click', function (e) {
      const r = this.getBoundingClientRect();
      const size = Math.max(r.width, r.height) * 1.5;
      const x = e.clientX - r.left - size / 2;
      const y = e.clientY - r.top  - size / 2;
      const ripple = document.createElement('span');
      ripple.classList.add('ripple');
      ripple.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px;`;
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);
    });
  }

  document.querySelectorAll('.service, .pillar, .btn-primary, .btn-secondary, .ig-card, .hstat')
    .forEach(addRipple);

  /* ══════════════════════════════════════════
     SMOOTH ANCHOR SCROLL
  ══════════════════════════════════════════ */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ══════════════════════════════════════════
     SECTION DIVIDER DRAW ON SCROLL
  ══════════════════════════════════════════ */
  const dividers = document.querySelectorAll('.section-divider');
  dividers.forEach(d => {
    d.style.background = 'none';
    d.style.height = '1px';
    d.style.position = 'relative';
    // create inner line
    const line = document.createElement('div');
    line.style.cssText = `
      position:absolute; top:0; left:50%; transform:translateX(-50%);
      width:0; height:1px;
      background: linear-gradient(to right, transparent, #8a6d3f 30%, #c9a96e 50%, #8a6d3f 70%, transparent);
      opacity:0.25;
      transition: width 1.2s cubic-bezier(0.22,1,0.36,1);
    `;
    d.appendChild(line);
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) { line.style.width = '100%'; obs.disconnect(); }
    }, { threshold: 0.5 });
    obs.observe(d);
  });

})();
