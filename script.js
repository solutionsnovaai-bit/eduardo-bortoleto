/* =============================================
   EDUARDO BORTOLETO — script.js
   ============================================= */

(function () {
  'use strict';

  /* ── NAV SCROLL ── */
  const nav = document.getElementById('nav');
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ── SCROLL REVEAL ── */
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

  /* ── HERO PHOTO PARALLAX (desktop mouse) ── */
  const heroImg = document.getElementById('hero-img');
  let ticking = false;
  if (heroImg && window.matchMedia('(min-width: 1024px)').matches) {
    document.addEventListener('mousemove', (e) => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const dx = (e.clientX / window.innerWidth - 0.5) * 14;
          const dy = (e.clientY / window.innerHeight - 0.5) * 8;
          heroImg.style.transform = `translate(${dx}px, ${dy}px) scale(1.04)`;
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  /* ── 3D LOGO: GYROSCOPE (mobile) + MOUSE (desktop) ── */
  const stage = document.getElementById('logo-stage');
  if (!stage) return;

  let currentRX = 0, currentRY = 0;
  let targetRX = 0, targetRY = 0;
  let animFrame;

  function lerpAngle(current, target, factor) {
    return current + (target - current) * factor;
  }

  function animateLogo() {
    currentRX = lerpAngle(currentRX, targetRX, 0.08);
    currentRY = lerpAngle(currentRY, targetRY, 0.08);

    // Clamp rotation for elegance
    const rx = Math.max(-20, Math.min(20, currentRX));
    const ry = Math.max(-25, Math.min(25, currentRY));

    stage.style.animationPlayState = (Math.abs(targetRX) > 1 || Math.abs(targetRY) > 1)
      ? 'paused' : 'running';

    if (Math.abs(targetRX) > 0.5 || Math.abs(targetRY) > 0.5) {
      stage.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
    } else {
      stage.style.transform = '';
    }

    animFrame = requestAnimationFrame(animateLogo);
  }
  animateLogo();

  /* Mobile: device orientation (gyroscope) */
  const isMobile = window.matchMedia('(max-width: 1023px)').matches;

  if (isMobile && window.DeviceOrientationEvent) {
    let hasPermission = false;

    const requestGyro = () => {
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
          .then(state => {
            if (state === 'granted') bindGyro();
          }).catch(() => {});
      } else {
        bindGyro();
      }
    };

    const bindGyro = () => {
      hasPermission = true;
      window.addEventListener('deviceorientation', (e) => {
        if (e.beta === null) return;
        // beta: front-back tilt (-180 to 180), gamma: left-right (-90 to 90)
        const beta  = Math.max(-30, Math.min(30, (e.beta - 45)));   // subtract typical hold angle
        const gamma = Math.max(-30, Math.min(30, e.gamma));
        targetRX = beta  * 0.5;
        targetRY = gamma * 0.6;
      }, { passive: true });
    };

    // Try auto-bind (Android), request on touch for iOS
    requestGyro();
    if (!hasPermission) {
      document.addEventListener('touchstart', () => {
        if (!hasPermission) requestGyro();
      }, { once: true });
    }

  } else {
    /* Desktop: mouse over the logo section */
    const escSection = document.getElementById('escritorio');
    if (escSection) {
      escSection.addEventListener('mousemove', (e) => {
        const rect = escSection.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top  + rect.height / 2;
        targetRY = ((e.clientX - cx) / (rect.width  / 2)) * 18;
        targetRX = ((e.clientY - cy) / (rect.height / 2)) * -12;
      });
      escSection.addEventListener('mouseleave', () => {
        targetRX = 0; targetRY = 0;
      });
    }
  }

  /* ── COUNTER ANIMATION ── */
  function animCounter(el, endVal, suffix, decimals) {
    const duration = 1800;
    const start = performance.now();
    const update = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      const val = ease * endVal;
      el.textContent = (decimals ? val.toFixed(1) : Math.floor(val)) + suffix;
      if (t < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }

  const statsSection = document.querySelector('.hero-stats');
  if (statsSection) {
    const statsObs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        const rating = document.getElementById('cnt-rating');
        const focus  = document.getElementById('cnt-focus');
        if (rating) animCounter(rating, 5.0, '', true);
        if (focus)  animCounter(focus,  100, '%', false);
        statsObs.disconnect();
      }
    }, { threshold: 0.5 });
    statsObs.observe(statsSection);
  }

  /* ── SMOOTH ANCHOR ── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

})();
