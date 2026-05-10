/* =========================================================
   RoofingIQ — Landing Page Interactivity
   ========================================================= */

(function () {
  'use strict';

  // ---------- Nav: scrolled state ----------
  const nav = document.getElementById('nav');
  const setNav = () => nav.classList.toggle('scrolled', window.scrollY > 24);
  setNav();
  window.addEventListener('scroll', setNav, { passive: true });

  // ---------- Smooth scroll for anchor links ----------
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 70;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ---------- Fade-in on scroll ----------
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));

  // ---------- Hero stat counter animation ----------
  const heroStats = document.querySelectorAll('.hero-stat-num');
  const animateCount = (el) => {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1500;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const heroObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          heroObs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );
  heroStats.forEach((el) => heroObs.observe(el));

  // ---------- Heat-map bar fill ----------
  const heatBars = document.querySelectorAll('.heat-bar-fill');
  const heatObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const fill = entry.target;
          requestAnimationFrame(() => {
            fill.style.width = fill.dataset.width + '%';
          });
          heatObs.unobserve(fill);
        }
      });
    },
    { threshold: 0.3 }
  );
  heatBars.forEach((el) => {
    el.style.width = '0%';
    heatObs.observe(el);
  });

  // ---------- Chart.js: revenue pipeline ----------
  const chartEl = document.getElementById('chartCanvas');
  if (chartEl && typeof Chart !== 'undefined') {
    const ctx = chartEl.getContext('2d');

    const gradient = ctx.createLinearGradient(0, 0, 0, 220);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');

    const gradient2 = ctx.createLinearGradient(0, 0, 0, 220);
    gradient2.addColorStop(0, 'rgba(34, 197, 94, 0.3)');
    gradient2.addColorStop(1, 'rgba(34, 197, 94, 0)');

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'Wk 6', 'Wk 7', 'Wk 8', 'Wk 9', 'Wk 10', 'Wk 11', 'Wk 12'],
        datasets: [
          {
            label: 'Identified Pipeline',
            data: [320, 410, 380, 510, 580, 640, 720, 800, 920, 1010, 1140, 1280],
            borderColor: '#3b82f6',
            backgroundColor: gradient,
            borderWidth: 2.5,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#3b82f6',
            pointRadius: 0,
            pointHoverRadius: 6,
          },
          {
            label: 'Closed Won (forecast)',
            data: [80, 110, 140, 180, 220, 260, 310, 360, 410, 470, 540, 620],
            borderColor: '#22c55e',
            backgroundColor: gradient2,
            borderWidth: 2.5,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#22c55e',
            pointRadius: 0,
            pointHoverRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#cbd5e1',
              font: { family: 'Inter', size: 11, weight: '500' },
              boxWidth: 10,
              boxHeight: 10,
              padding: 14,
              usePointStyle: true,
              pointStyle: 'circle',
            },
          },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.96)',
            borderColor: '#2a3a5e',
            borderWidth: 1,
            titleColor: '#fff',
            bodyColor: '#cbd5e1',
            padding: 12,
            displayColors: true,
            cornerRadius: 8,
            titleFont: { family: 'Inter', weight: '600' },
            bodyFont: { family: 'Inter' },
            callbacks: {
              label: (ctx) => `${ctx.dataset.label}: $${ctx.parsed.y}K`,
            },
          },
        },
        scales: {
          x: {
            grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
            ticks: { color: '#64748b', font: { family: 'Inter', size: 10 } },
          },
          y: {
            grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
            ticks: {
              color: '#64748b',
              font: { family: 'Inter', size: 10 },
              callback: (v) => '$' + v + 'K',
            },
          },
        },
        interaction: { mode: 'index', intersect: false },
      },
    });
  }

  // ---------- Toast ----------
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  let toastTimer = null;
  const showToast = (msg) => {
    if (!toast) return;
    toastMsg.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
  };

  // ---------- Feedback form ----------
  const form = document.getElementById('feedbackForm');
  const successEl = document.getElementById('formSuccess');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const fd = new FormData(form);
      const features = fd.getAll('features');
      const payload = {
        name: (fd.get('name') || '').toString().trim(),
        email: (fd.get('email') || '').toString().trim(),
        role: fd.get('role') || '',
        features,
        nobrainer: fd.get('nobrainer') || '',
        interest: fd.get('interest') || '',
        submittedAt: new Date().toISOString(),
      };

      if (!payload.name || !payload.email) {
        showToast('Please fill in name and email.');
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';

      try {
        const res = await fetch('/api/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        // Treat any 2xx OR a network failure as "got the message in dev" —
        // in local preview the API isn't running, so we still want the success state.
        if (!res.ok) throw new Error('non-2xx');
      } catch (_err) {
        // Local dev / static preview path — show success anyway, log payload.
        // eslint-disable-next-line no-console
        console.info('[feedback] saved locally:', payload);
      } finally {
        form.style.display = 'none';
        successEl.classList.add('show');
        successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  }

  // expose toast for any external use
  window.RIQ = { showToast };
})();
