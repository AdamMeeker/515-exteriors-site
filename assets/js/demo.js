/* =========================================================
   RoofingIQ — Interactive Demo
   ========================================================= */

(function () {
  'use strict';

  // ---------- DOM ----------
  const feedListEl = document.getElementById('feedList');
  const feedCountEl = document.getElementById('feedCount');
  const feedTabsEl = document.getElementById('feedTabs');
  const statTotalEl = document.getElementById('statTotal');
  const statHighEl = document.getElementById('statHigh');
  const statNewEl = document.getElementById('statNew');
  const statValueEl = document.getElementById('statValue');
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');

  // ---------- State ----------
  let permits = [];
  let activeFilter = 'all';
  let activeId = null;
  let map = null;
  const markers = {};
  const pushed = new Set();
  let autoScrollTimer = null;
  let lastInteractionAt = Date.now();

  // ---------- Helpers ----------
  const fmtMoney = (n) => {
    if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(2) + 'M';
    if (n >= 1_000) return '$' + Math.round(n / 1000) + 'K';
    return '$' + n;
  };
  const fmtMoneyExact = (n) => '$' + n.toLocaleString('en-US');

  const scoreClass = (s) => (s >= 8 ? 'score-high' : s >= 5 ? 'score-mid' : 'score-low');

  const typeLabel = (t) =>
    ({
      new_construction: 'New Build',
      reroof: 'Re-Roof',
      commercial: 'Commercial',
      council_approval: 'Council',
      storm_lead: 'Storm Lead',
    }[t] || t);

  const filterMatch = (p, filter) => {
    if (filter === 'all') return true;
    if (filter === 'permits') return p.type === 'reroof' || p.type === 'new_construction';
    if (filter === 'council') return p.type === 'council_approval';
    if (filter === 'storm') return p.type === 'storm_lead';
    if (filter === 'commercial') return p.type === 'commercial';
    return true;
  };

  const showToast = (msg) => {
    if (!toast) return;
    toastMsg.textContent = msg;
    toast.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove('show'), 3000);
  };

  // ---------- Stats bar ----------
  const renderStats = () => {
    statTotalEl.textContent = permits.length;
    statHighEl.textContent = permits.filter((p) => p.opportunity_score >= 8).length;
    statNewEl.textContent = permits.filter((p) => p.days_old <= 7).length;
    const total = permits.reduce((sum, p) => sum + (p.value || 0), 0);
    statValueEl.textContent = fmtMoney(total);
  };

  // ---------- Feed ----------
  const renderFeed = () => {
    const filtered = permits.filter((p) => filterMatch(p, activeFilter));
    feedCountEl.textContent = filtered.length;

    feedListEl.innerHTML = filtered
      .map((p) => {
        const pushedClass = pushed.has(p.id) ? 'pushed' : '';
        const pushedLabel = pushed.has(p.id) ? '✓ In AccuLynx' : 'Push to AccuLynx →';
        return `
        <article class="opp-card ${activeId === p.id ? 'active' : ''}" data-id="${p.id}">
          <div class="opp-top">
            <span class="opp-badge badge-${p.type}">${typeLabel(p.type)}</span>
            <span class="opp-score">
              <span class="score-pip ${scoreClass(p.opportunity_score)}">${p.opportunity_score}</span>
              <span style="color: var(--muted-strong)">/ 10</span>
            </span>
          </div>
          <div class="opp-address">${p.address}</div>
          <div class="opp-city">${p.neighborhood} · ${p.city}, IA</div>
          <div class="opp-meta">
            <span class="opp-value">${fmtMoneyExact(p.value)}</span>
            <span class="opp-days">${p.days_old === 0 ? 'Today' : p.days_old + 'd ago'}</span>
          </div>
          <button class="opp-push ${pushedClass}" data-push="${p.id}">${pushedLabel}</button>
        </article>`;
      })
      .join('');
  };

  // ---------- Map ----------
  const initMap = () => {
    map = L.map('map', {
      zoomControl: true,
      attributionControl: true,
      preferCanvas: false,
    }).setView([41.5868, -93.625], 11);

    L.tileLayer(
      'https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png',
      {
        attribution: '© OpenStreetMap · © CARTO',
        subdomains: 'abcd',
        maxZoom: 19,
      }
    ).addTo(map);
  };

  const buildMarkerIcon = (p) => {
    const html =
      p.type === 'storm_lead'
        ? `<div class="marker-triangle"></div>`
        : `<div class="marker-circle ${p.type}"></div>`;
    const size = p.type === 'storm_lead' ? [24, 22] : [22, 22];
    const anchor = p.type === 'storm_lead' ? [12, 22] : [11, 11];
    return L.divIcon({
      html,
      className: 'riq-marker',
      iconSize: size,
      iconAnchor: anchor,
    });
  };

  const buildPopupHtml = (p) => `
    <div class="popup-content">
      <div class="popup-badge"><span class="opp-badge badge-${p.type}">${typeLabel(p.type)}</span></div>
      <div class="popup-address">${p.address}</div>
      <div class="popup-city">${p.neighborhood} · ${p.city}, IA</div>
      <div class="popup-grid">
        <div>Value <strong>${fmtMoneyExact(p.value)}</strong></div>
        <div>Score <strong style="color: ${
          p.opportunity_score >= 8 ? '#22c55e' : p.opportunity_score >= 5 ? '#f59e0b' : '#ef4444'
        }">${p.opportunity_score}/10</strong></div>
      </div>
      <div class="popup-desc">${p.description}</div>
      <button class="popup-push ${pushed.has(p.id) ? 'pushed' : ''}" data-push="${p.id}">
        ${pushed.has(p.id) ? '✓ Sent to AccuLynx' : 'Push to AccuLynx →'}
      </button>
    </div>`;

  const renderMarkers = () => {
    permits.forEach((p) => {
      const m = L.marker([p.lat, p.lng], { icon: buildMarkerIcon(p) }).addTo(map);
      m.bindPopup(buildPopupHtml(p), { closeButton: true, autoPan: true, maxWidth: 320 });
      m.on('click', () => {
        activeId = p.id;
        lastInteractionAt = Date.now();
        renderFeed();
      });
      m.on('popupopen', () => {
        // wire the push button inside the popup
        const btn = document.querySelector(`.leaflet-popup .popup-push[data-push="${p.id}"]`);
        if (btn) {
          btn.addEventListener('click', () => pushToAcculynx(p.id));
        }
      });
      markers[p.id] = m;
    });
  };

  // ---------- AccuLynx push (visual only) ----------
  const pushToAcculynx = (id) => {
    if (pushed.has(id)) return;
    const p = permits.find((x) => x.id === id);
    if (!p) return;
    pushed.add(id);
    showToast(`Lead pushed to AccuLynx! ${p.address}`);
    renderFeed();
    if (markers[id] && markers[id].isPopupOpen()) {
      markers[id].setPopupContent(buildPopupHtml(p));
      // re-wire the popup button
      setTimeout(() => {
        const btn = document.querySelector(`.leaflet-popup .popup-push[data-push="${id}"]`);
        if (btn) btn.addEventListener('click', () => pushToAcculynx(id));
      }, 0);
    }
  };

  // ---------- Click handlers ----------
  const wireFeed = () => {
    feedListEl.addEventListener('click', (e) => {
      lastInteractionAt = Date.now();
      const pushBtn = e.target.closest('[data-push]');
      if (pushBtn) {
        e.stopPropagation();
        pushToAcculynx(pushBtn.dataset.push);
        return;
      }
      const card = e.target.closest('.opp-card');
      if (!card) return;
      const id = card.dataset.id;
      activeId = id;
      const p = permits.find((x) => x.id === id);
      if (!p) return;
      renderFeed();
      map.flyTo([p.lat, p.lng], 14, { duration: 0.8 });
      setTimeout(() => markers[id] && markers[id].openPopup(), 600);
    });
  };

  const wireTabs = () => {
    feedTabsEl.addEventListener('click', (e) => {
      const tab = e.target.closest('.feed-tab');
      if (!tab) return;
      lastInteractionAt = Date.now();
      [...feedTabsEl.children].forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      activeFilter = tab.dataset.filter;
      renderFeed();
    });
  };

  // ---------- Auto-scroll feed when idle ----------
  const startAutoScroll = () => {
    let direction = 1;
    autoScrollTimer = setInterval(() => {
      const idle = Date.now() - lastInteractionAt;
      if (idle < 8000) return; // user just interacted
      const el = feedListEl;
      const max = el.scrollHeight - el.clientHeight;
      if (max < 30) return;
      el.scrollTop += direction * 0.6;
      if (el.scrollTop >= max - 1) direction = -1;
      if (el.scrollTop <= 0) direction = 1;
    }, 30);
    feedListEl.addEventListener('scroll', () => {
      lastInteractionAt = Date.now();
    });
    feedListEl.addEventListener('mouseenter', () => {
      lastInteractionAt = Date.now();
    });
  };

  // ---------- Boot ----------
  const boot = async () => {
    initMap();
    try {
      const res = await fetch('data/permits.json');
      permits = await res.json();
    } catch (e) {
      console.error('Failed to load permits.json', e);
      feedListEl.innerHTML =
        '<div style="padding:24px;color:var(--muted-strong);text-align:center;font-size:0.9rem;">Could not load demo data.</div>';
      return;
    }
    // Sort by opportunity score (desc), then days_old (asc)
    permits.sort((a, b) => {
      if (b.opportunity_score !== a.opportunity_score)
        return b.opportunity_score - a.opportunity_score;
      return a.days_old - b.days_old;
    });
    renderStats();
    renderFeed();
    renderMarkers();
    wireFeed();
    wireTabs();
    startAutoScroll();
  };

  boot();
})();
