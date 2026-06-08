import * as d3        from 'd3';
import * as topo       from 'topojson-client';
import landData        from '../../data/geo/land-50m.json';
import countriesData   from '../../data/geo/countries-50m.json';

// City data
const CITIES = [
  { key: 'singapore',    name: 'Singapore',      tier: 'easy',    color: '#5ca85c', lon: 103.82,  lat:   1.35, zoomW: 160, problems: 'Rigid governance, Aging population',    flavor: 'Efficient, sterile, and quietly terrifying.' },
  { key: 'sf',           name: 'San Francisco',  tier: 'easy',    color: '#5ca85c', lon: -122.42, lat:  37.77, zoomW: 160, problems: 'Tech inequality, Homelessness',          flavor: 'Brilliant and broken in equal measure.' },
  { key: 'shenzhen',     name: 'Shenzhen',       tier: 'easy',    color: '#5ca85c', lon: 114.06,  lat:  22.54, zoomW: 160, problems: 'Tech boom, Surveillance',               flavor: 'Built in 40 years. Will be rebuilt in 10.' },
  { key: 'brisbane',     name: 'Brisbane',       tier: 'easy',    color: '#5ca85c', lon: 153.03,  lat: -27.47, zoomW: 160, problems: 'Housing, Flooding, Transport',          flavor: "The Olympics are coming. The budget is healthy. Don't blow it." },
  { key: 'jakarta',      name: 'Jakarta',        tier: 'medium',  color: '#d4a843', lon: 106.87,  lat:  -6.21, zoomW: 160, problems: 'Governance, Climate, Traffic',          flavor: 'Chaotic, exhausted, somehow still functioning.' },
  { key: 'lagos',        name: 'Lagos',          tier: 'medium',  color: '#d4a843', lon:   3.38,  lat:   6.52, zoomW: 160, problems: 'Governance, Tech boom, Infrastructure', flavor: 'Loud, ambitious, and not taking your calls.' },
  { key: 'frankfurt',    name: 'Frankfurt',      tier: 'medium',  color: '#d4a843', lon:   8.68,  lat:  50.11, zoomW: 160, problems: 'Migration, EU bureaucracy, Finance',    flavor: 'Efficient on the outside. Quietly overwhelmed.' },
  { key: 'jeddah',       name: 'Jeddah',         tier: 'medium',  color: '#d4a843', lon:  39.19,  lat:  21.49, zoomW: 160, problems: 'Holy city governance, Warzone area',    flavor: 'Sacred, oil-rich, and increasingly nervous.' },
  { key: 'beijing',      name: 'Beijing',        tier: 'medium',  color: '#d4a843', lon: 116.41,  lat:  39.90, zoomW: 160, problems: 'Surveillance, Housing, Geopolitics',    flavor: 'Watching you as much as you watch it.' },
  { key: 'nyc',          name: 'New York City',  tier: 'medium',  color: '#d4a843', lon: -74.01,  lat:  40.71, zoomW: 160, problems: 'Housing, Inequality, Political chaos',  flavor: 'Infinite ambition. Zero patience.' },
  { key: 'toronto',      name: 'Toronto',        tier: 'medium',  color: '#d4a843', lon: -79.38,  lat:  43.65, zoomW: 160, problems: 'Housing crisis, Identity, Immigration', flavor: 'Polite on the outside. Housing crisis within.' },
  { key: 'johannesburg', name: 'Johannesburg',   tier: 'medium',  color: '#d4a843', lon:  28.05,  lat: -26.20, zoomW: 160, problems: 'Power cuts, Inequality, Crime',         flavor: 'The City of Gold is rusting.' },
  { key: 'karachi',      name: 'Karachi',        tier: 'hard',    color: '#e07a30', lon:  67.01,  lat:  24.86, zoomW: 160, problems: 'Infrastructure, Crime, Water shortage', flavor: 'The economic engine of Pakistan is sputtering.' },
  { key: 'cayman',       name: 'George Town',    tier: 'hard',    color: '#e07a30', lon: -81.37,  lat:  19.29, zoomW: 160, problems: 'Housing, Inequality, Climate change',   flavor: 'Offshore accounts overflowing. Locals priced out of paradise.' },
  { key: 'tehran',       name: 'Tehran',         tier: 'war',     color: '#cc2222', lon:  51.39,  lat:  35.69, zoomW: 130, problems: 'Active War, Internal faction war',      flavor: 'Sanctions, strikes, and a city holding its breath.' },
  { key: 'tel_aviv',     name: 'Tel Aviv',       tier: 'war',     color: '#cc2222', lon:  34.78,  lat:  32.09, zoomW: 40,  labelDx:  3, labelDy: -4, labelAnchor: 'start', problems: 'Active War, Missile threat',       flavor: 'Modern, brilliant, under fire. Literally.' },
  { key: 'crimea',       name: 'Crimea',         tier: 'war',     color: '#cc2222', lon:  34.10,  lat:  45.00, zoomW: 130, problems: 'Active warzone, Split allegiance',      flavor: 'Two flags. One peninsula. No easy answers.' },
  { key: 'gaza',         name: 'Gaza',           tier: 'extreme', color: '#cc44cc', lon:  34.47,  lat:  31.51, zoomW: 40,  labelDx: -3, labelDy:  8, labelAnchor: 'end',   problems: 'Destroyed, Active warzone',        flavor: 'Survival mode only. Just endure.' },
  { key: 'caracas',      name: 'Caracas',        tier: 'extreme', color: '#cc44cc', lon: -66.90,  lat:  10.48, zoomW: 130, problems: 'Instability, Economic collapse',        flavor: "Everything is broken. You're in charge. Good luck." },
  { key: 'mogadishu',    name: 'Mogadishu',      tier: 'extreme', color: '#cc44cc', lon:  45.34,  lat:   2.05, zoomW: 130, problems: 'Terrorism, Corruption, Infrastructure', flavor: 'The city is rebuilding from decades of war, but the shadows are long.' },
];

const TIER_LABEL = { easy: 'EASY', medium: 'MEDIUM', hard: 'HARD', extreme: 'EXTREME', war: 'WAR ZONE' };
const TIER_COLOR = { easy: '#5ca85c', medium: '#d4a843', hard: '#e07a30', extreme: '#cc44cc', war: '#cc2222' };
const TIER_META  = {
  easy:    { bars: 2, mandate: 'Stabilize existing systems. Maintain growth. Build a legacy the city deserves.' },
  medium:  { bars: 3, mandate: 'Balance competing pressures. Hard choices ahead, but the city can still be saved.' },
  hard:    { bars: 4, mandate: 'Failing systems require bold action. One wrong move accelerates the collapse.' },
  extreme: { bars: 5, mandate: 'Survival is the primary objective. Everything else is a luxury you cannot afford.' },
  war:     { bars: 5, mandate: 'Navigate active conflict. Keep civilians alive. Do not trust anyone.' },
};

export class CitySelectScreen {
  static render(state) {
    const termList = ['easy','medium','hard','extreme','war'].map(tier => {
      const cities = CITIES.filter(c => c.tier === tier);
      if (!cities.length) return '';
      return '<div class="cs-term-tier-label" style="color:' + TIER_COLOR[tier] + '">' + TIER_LABEL[tier] + '</div>' +
        cities.map(c => '<div class="cs-term-city" data-key="' + c.key + '" data-color="' + c.color + '">' +
          '<span class="cs-tc-dot" style="background:' + c.color + '"></span>' +
          '<span class="cs-tc-name">' + c.name + '</span>' +
        '</div>').join('');
    }).join('');

    const legend = Object.entries(TIER_COLOR).map(([t,c]) =>
      '<div class="cs-leg"><div class="cs-leg-dot" style="background:' + c + '"></div>' + TIER_LABEL[t] + '</div>'
    ).join('');

    const govVal = (state.governorName && state.governorName !== 'Governor') ? state.governorName : '';

    return `
      <div class="screen cs-screen">
        <div class="cs-topbar">
          <div class="cs-tb-left">
            <div class="cs-back" id="cs-back">&#x2190; BACK</div>
            <div class="cs-title">CHOOSE YOUR CITY</div>
          </div>
          <div class="cs-legend">${legend}</div>
        </div>
        <div class="cs-body">
          <div class="cs-map-panel" id="cs-map-panel" style="background-color: #0d1a24; position: relative; overflow: hidden;">
            <svg id="cs-worldmap" viewBox="247.5 116.4 480.2 250.1"
              xmlns="http://www.w3.org/2000/svg"
              style="width:100%;height:100%;display:block;cursor:grab;touch-action:none">
              <!-- Giant rectangle to ensure ocean color NEVER ends during aspect ratio changes -->
              <rect x="-5000" y="-5000" width="10000" height="10000" fill="#0d1a24"/>
              <g class="countries-group"></g>
              <g class="pins-group"></g>
            </svg>
            <div class="cs-map-loading" id="cs-map-loading">LOADING MAP DATA...</div>
            <div class="cs-map-hint" id="cs-map-hint">scroll to zoom &middot; drag to pan &middot; double-click to reset</div>
          </div>
          <div class="cs-terminal-panel">
            <div class="cs-term-header">
              <div class="cs-term-title">CITY_SELECT &gt; POSTING_BOARD</div>
              <input class="cs-term-search" id="cs-term-search" placeholder="search cities..." />
            </div>
            <div class="cs-term-list" id="cs-term-list">${termList}</div>
            <div class="cs-term-detail" id="cs-term-detail">
              <div class="cs-td-empty" id="cs-td-empty">
                <div class="cs-td-empty-icon">_</div>
                <div class="cs-td-empty-text">hover or click a city<br>to view posting details</div>
              </div>
              <div class="cs-td-content" id="cs-td-content" style="display:none">
                <div class="cs-td-tier" id="cs-td-tier"></div>
                <div class="cs-td-name" id="cs-td-name"></div>
                <div class="cs-td-problems" id="cs-td-problems"></div>
                <div class="cs-td-flavor" id="cs-td-flavor"></div>
                <div class="cs-td-divider"></div>
                <div class="cs-td-brief-label">FIELD BRIEF</div>
                <div class="cs-td-diff-row">
                  <span class="cs-td-diff-text">DIFFICULTY</span>
                  <div class="cs-td-diff-bars" id="cs-td-diff-bars"></div>
                </div>
                <div class="cs-td-mandate" id="cs-td-mandate"></div>
                <div class="cs-td-turns-row">
                  <span class="cs-td-turns-label">MANDATE</span>
                  <span class="cs-td-turns-val">12 TURNS</span>
                </div>
              </div>
            </div>
            <div class="cs-term-footer">
              <div class="cs-gov-row">
                <label class="cs-gov-label">GOV. NAME</label>
                <input class="cs-gov-input" id="gov-name-input" placeholder="Enter name..." maxlength="20" value="${govVal}">
              </div>
              <button class="cs-accept-btn" id="cs-accept-btn" disabled>ACCEPT POSTING</button>
            </div>
          </div>
        </div>
      </div>`;
  }

  static bind(container, handlers) {
    container.querySelector('#cs-back')?.addEventListener('click', () => handlers.goToMenu());

    // Scale of the D3 Map
    const SVG_W = 960, SVG_H = 500; 

    // The ACTUAL drawn bounds of the D3 map (removes the 60px of empty ocean padding)
    const BOUNDS_X = 61;
    const BOUNDS_Y = 32;
    const BOUNDS_W = 838;
    const BOUNDS_H = 436;
    
    // The perfect framing viewbox where the map starts
    const VB_INIT = { x: 247.5, y: 116.4, w: 480.2, h: 250.1 };
    
    const MIN_W = 30;
    const MAX_W = VB_INIT.w; // Locked max zoom out
    const ASPECT_RATIO = VB_INIT.h / VB_INIT.w; // Ensures aspect ratio never warps
    
    let vb = { ...VB_INIT };
    let animFrame = null;

    const svg      = container.querySelector('#cs-worldmap');
    const mapPanel = container.querySelector('#cs-map-panel');
    const hintEl   = container.querySelector('#cs-map-hint');

    function applyVB() {
      svg.setAttribute('viewBox', vb.x + ' ' + vb.y + ' ' + vb.w + ' ' + vb.h);
    }

    function clampVB() {
      // 1. Lock zoom depth perfectly
      if (vb.w > MAX_W) vb.w = MAX_W;
      if (vb.w < MIN_W) vb.w = MIN_W;
      vb.h = vb.w * ASPECT_RATIO;
      
      // 2. Lock panning to the ACTUAL map layout borders
      const minX = BOUNDS_X;
      const minY = BOUNDS_Y;
      const maxX = (BOUNDS_X + BOUNDS_W) - vb.w;
      const maxY = (BOUNDS_Y + BOUNDS_H) - vb.h;
      
      vb.x = Math.max(minX, Math.min(vb.x, maxX));
      vb.y = Math.max(minY, Math.min(vb.y, maxY));
    }

    function animateToVB(target, duration) {
      duration = duration || 500;
      if (animFrame) cancelAnimationFrame(animFrame);
      const start = { ...vb };
      const t0 = performance.now();
      (function step(now) {
        const t = Math.min((now - t0) / duration, 1);
        const e = t < 0.5 ? 2*t*t : -1+(4-2*t)*t;
        vb = {
          x: start.x + (target.x - start.x) * e,
          y: start.y + (target.y - start.y) * e,
          w: start.w + (target.w - start.w) * e,
          h: start.h + (target.h - start.h) * e,
        };
        applyVB();
        if (t < 1) animFrame = requestAnimationFrame(step);
      })(t0);
    }

    mapPanel.addEventListener('wheel', (e) => {
      e.preventDefault();
      const rect = svg.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      
      const svgX = vb.x + (mx / rect.width) * vb.w;
      const svgY = vb.y + (my / rect.height) * vb.h;
      
      const factor = e.deltaY > 0 ? 1.15 : 0.87;
      let nw = vb.w * factor;
      
      // Enforce limits before modifying X and Y
      nw = Math.max(MIN_W, Math.min(MAX_W, nw));
      const nh = nw * ASPECT_RATIO;
      
      vb = { x: svgX - (mx/rect.width)*nw, y: svgY - (my/rect.height)*nh, w: nw, h: nh };
      clampVB(); 
      applyVB();
    }, { passive: false });

    let drag = null;
    svg.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      drag = { sx: e.clientX, sy: e.clientY, vb: { ...vb } };
      svg.style.cursor = 'grabbing';
      e.preventDefault();
    });
    window.addEventListener('mousemove', (e) => {
      if (!drag) return;
      const rect = svg.getBoundingClientRect();
      vb = { ...drag.vb,
        x: drag.vb.x - ((e.clientX - drag.sx) / rect.width) * drag.vb.w,
        y: drag.vb.y - ((e.clientY - drag.sy) / rect.height) * drag.vb.h,
      };
      clampVB(); 
      applyVB();
    });
    window.addEventListener('mouseup', () => { if (drag) { drag = null; svg.style.cursor = 'grab'; } });

    let touch = null, pinchData = null, touchStart = null;
    svg.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (e.touches.length === 1) {
        touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        touch = { sx: e.touches[0].clientX, sy: e.touches[0].clientY, vb: { ...vb } };
        pinchData = null;
      } else if (e.touches.length === 2) {
        const t0 = e.touches[0], t1 = e.touches[1];
        pinchData = {
          dist: Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY),
          vb: { ...vb },
          cx: (t0.clientX + t1.clientX) / 2,
          cy: (t0.clientY + t1.clientY) / 2,
        };
        touch = null; touchStart = null;
      }
    }, { passive: false });

    svg.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const rect = svg.getBoundingClientRect();
      if (e.touches.length === 1 && touch) {
        vb = { ...touch.vb,
          x: touch.vb.x - ((e.touches[0].clientX - touch.sx) / rect.width) * touch.vb.w,
          y: touch.vb.y - ((e.touches[0].clientY - touch.sy) / rect.height) * touch.vb.h,
        };
        clampVB(); 
        applyVB();
      } else if (e.touches.length === 2 && pinchData) {
        const t0 = e.touches[0], t1 = e.touches[1];
        const dist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
        
        let nw = pinchData.vb.w * (pinchData.dist / dist);
        nw = Math.max(MIN_W, Math.min(MAX_W, nw));
        const nh = nw * ASPECT_RATIO;
        
        const mx = pinchData.cx - rect.left, my = pinchData.cy - rect.top;
        const svgX = pinchData.vb.x + (mx / rect.width) * pinchData.vb.w;
        const svgY = pinchData.vb.y + (my / rect.height) * pinchData.vb.h;
        
        vb = { x: svgX - (mx/rect.width)*nw, y: svgY - (my/rect.height)*nh, w: nw, h: nh };
        clampVB(); 
        applyVB();
      }
    }, { passive: false });

    svg.addEventListener('touchend', (e) => {
      if (touchStart && e.changedTouches.length === 1) {
        const t = e.changedTouches[0];
        if (Math.hypot(t.clientX - touchStart.x, t.clientY - touchStart.y) < 8) {
          const el = document.elementFromPoint(t.clientX, t.clientY);
          if (el && el.closest) {
            const pin = el.closest('.city-pin');
            if (pin) pin.dispatchEvent(new MouseEvent('click', { bubbles: true }));
          }
        }
      }
      touch = null; pinchData = null; touchStart = null;
    });

    let selectedKey = null;
    const CITIES_MAP = {};
    CITIES.forEach(function(c) { CITIES_MAP[c.key] = Object.assign({}, c); });

    const tdEmpty    = container.querySelector('#cs-td-empty');
    const tdContent  = container.querySelector('#cs-td-content');
    const tdTier     = container.querySelector('#cs-td-tier');
    const tdName     = container.querySelector('#cs-td-name');
    const tdProblems = container.querySelector('#cs-td-problems');
    const tdFlavor   = container.querySelector('#cs-td-flavor');
    const tdDiffBars = container.querySelector('#cs-td-diff-bars');
    const tdMandate  = container.querySelector('#cs-td-mandate');
    const acceptBtn  = container.querySelector('#cs-accept-btn');

    function showDetail(c) {
      tdEmpty.style.display = 'none';
      tdContent.style.display = 'block';
      tdTier.textContent = TIER_LABEL[c.tier] || c.tier.toUpperCase();
      tdTier.style.color = c.color;
      tdName.textContent = c.name;
      tdProblems.innerHTML = c.problems.split(',').map(function(p) {
        return '<span class="cs-td-tag" style="border-color:' + c.color + ';color:' + c.color + '">' + p.trim() + '</span>';
      }).join('');
      tdFlavor.textContent = c.flavor;
      const meta = TIER_META[c.tier] || TIER_META.medium;
      tdDiffBars.innerHTML = Array.from({length:5}, function(_,i) {
        return '<span class="cs-td-bar' + (i < meta.bars ? ' active' : '') + '"' + (i < meta.bars ? ' style="background:' + c.color + '"' : '') + '/>';
      }).join('');
      tdMandate.textContent = meta.mandate;
    }

    function clearDetail() {
      tdEmpty.style.display = 'flex';
      tdContent.style.display = 'none';
    }

    function selectCity(key) {
      selectedKey = key;
      const c = CITIES_MAP[key];
      showDetail(c);
      acceptBtn.disabled = false;
      acceptBtn.style.borderColor = c.color;
      acceptBtn.style.color = c.color;
      container.querySelectorAll('.cs-term-city').forEach(function(el) {
        el.classList.toggle('selected', el.dataset.key === key);
      });
      container.querySelectorAll('.city-pin').forEach(function(pin) {
        const isSelected = pin.dataset.key === key;
        const isWar = pin.dataset.tier === 'war' || pin.dataset.tier === 'extreme';
        const baseR = isWar ? 1.0 : 0.7;
        const dot = pin.querySelector('.pin-dot');
        const lbl = pin.querySelector('.pin-label');
        if (dot) dot.setAttribute('r', isSelected ? String(baseR * 2.2) : String(baseR));
        if (lbl) {
          lbl.setAttribute('opacity', isSelected ? '1' : '0.6');
          lbl.setAttribute('font-weight', isSelected ? 'bold' : 'normal');
        }
      });
    }

    function zoomToCity(key) {
      const c = CITIES_MAP[key];
      if (!c || c.projX == null) return;
      const zw = c.zoomW || 160;
      const zh = zw * ASPECT_RATIO; 
      
      let targetX = c.projX - zw/2;
      let targetY = c.projY - zh/2;
      
      // Auto-zooming uses the same exact physical bounds
      const maxX = (BOUNDS_X + BOUNDS_W) - zw;
      const maxY = (BOUNDS_Y + BOUNDS_H) - zh;
      
      targetX = Math.max(BOUNDS_X, Math.min(targetX, maxX));
      targetY = Math.max(BOUNDS_Y, Math.min(targetY, maxY));
      
      animateToVB({ x: targetX, y: targetY, w: zw, h: zh });
    }

    container.querySelectorAll('.cs-term-city').forEach(function(el) {
      const key = el.dataset.key;
      el.addEventListener('click', function() { selectCity(key); zoomToCity(key); });
      el.addEventListener('mouseenter', function() { if (!selectedKey) showDetail(CITIES_MAP[key]); });
      el.addEventListener('mouseleave', function() {
        if (!selectedKey) clearDetail(); else showDetail(CITIES_MAP[selectedKey]);
      });
    });

    container.querySelector('#cs-term-search').addEventListener('input', function(e) {
      const q = e.target.value.toLowerCase();
      container.querySelectorAll('.cs-term-city').forEach(function(el) {
        const nm = el.querySelector('.cs-tc-name');
        el.style.display = (nm && nm.textContent.toLowerCase().indexOf(q) >= 0) ? '' : 'none';
      });
      container.querySelectorAll('.cs-term-tier-label').forEach(function(lbl) {
        let nx = lbl.nextElementSibling, any = false;
        while (nx && nx.classList.contains('cs-term-city')) {
          if (nx.style.display !== 'none') any = true;
          nx = nx.nextElementSibling;
        }
        lbl.style.display = any ? '' : 'none';
      });
    });

    svg.addEventListener('dblclick', function() { animateToVB(VB_INIT); });

    acceptBtn.addEventListener('click', function() {
      if (!selectedKey) return;
      const nameEl = container.querySelector('#gov-name-input');
      handlers.startGame(selectedKey, (nameEl && nameEl.value.trim()) || 'Governor');
    });

    // Build map from bundled Natural Earth 50m data
    const loadingEl = container.querySelector('#cs-map-loading');
    const ns = 'http://www.w3.org/2000/svg';

    try {
      const projection = d3.geoNaturalEarth1().scale(153).translate([SVG_W/2, SVG_H/2]);
      const pathGen    = d3.geoPath().projection(projection);
      const countriesG = container.querySelector('.countries-group');

      // Graticule
      const gEl = document.createElementNS(ns, 'path');
      gEl.setAttribute('d', pathGen(d3.geoGraticule()()));
      gEl.setAttribute('fill', 'none');
      gEl.setAttribute('stroke', '#0e1f2a');
      gEl.setAttribute('stroke-width', '0.4');
      countriesG.appendChild(gEl);

      // Land fill (Natural Earth 50m)
      const landEl = document.createElementNS(ns, 'path');
      landEl.setAttribute('d', pathGen(topo.feature(landData, landData.objects.land)));
      landEl.setAttribute('fill', '#1a2d1f');
      landEl.setAttribute('stroke', 'none');
      countriesG.appendChild(landEl);

      // Country borders
      topo.feature(countriesData, countriesData.objects.countries).features.forEach(function(f) {
        const p = document.createElementNS(ns, 'path');
        p.setAttribute('d', pathGen(f));
        p.setAttribute('fill', 'none');
        p.setAttribute('stroke', '#2e4435');
        p.setAttribute('stroke-width', '0.3');
        countriesG.appendChild(p);
      });

      // City pins
      const pinsG = container.querySelector('.pins-group');
      CITIES.forEach(function(c) {
        const proj = projection([c.lon, c.lat]);
        const px = proj[0], py = proj[1];
        CITIES_MAP[c.key].projX = px;
        CITIES_MAP[c.key].projY = py;

        const isWar = c.tier === 'war' || c.tier === 'extreme';
        const r   = isWar ? 1.0 : 0.7;
        const dur = (2.5 + Math.random() * 1.2).toFixed(1) + 's';
        const anim = isWar
          ? 'animation:pulse-war ' + dur + ' ease-in-out infinite'
          : 'animation:pulse-slow ' + dur + ' ease-in-out infinite';

        const lx     = px + (c.labelDx != null ? c.labelDx : 2.5);
        const ly     = py + (c.labelDy != null ? c.labelDy : -2.5);
        const anchor = c.labelAnchor || 'start';
        const sw     = isWar ? '1.0' : '0.7';

        const g = document.createElementNS(ns, 'g');
        g.classList.add('city-pin');
        g.style.cursor = 'pointer';
        g.dataset.key  = c.key;
        g.dataset.tier = c.tier;
        g.dataset.color = c.color;

        const hitCircle = document.createElementNS(ns, 'circle');
        hitCircle.setAttribute('cx', String(px));
        hitCircle.setAttribute('cy', String(py));
        hitCircle.setAttribute('r', '7');
        hitCircle.setAttribute('fill', 'transparent');
        g.appendChild(hitCircle);

        const dot = document.createElementNS(ns, 'circle');
        dot.classList.add('pin-dot');
        dot.setAttribute('cx', String(px));
        dot.setAttribute('cy', String(py));
        dot.setAttribute('r', String(r));
        dot.setAttribute('fill', c.color);
        dot.setAttribute('opacity', '0.95');
        g.appendChild(dot);

        const ring1 = document.createElementNS(ns, 'circle');
        ring1.setAttribute('cx', String(px));
        ring1.setAttribute('cy', String(py));
        ring1.setAttribute('r', String(r));
        ring1.setAttribute('fill', 'none');
        ring1.setAttribute('stroke', c.color);
        ring1.setAttribute('stroke-width', sw);
        ring1.setAttribute('opacity', '0.45');
        ring1.style.cssText = anim;
        g.appendChild(ring1);

        if (isWar) {
          const ring2 = document.createElementNS(ns, 'circle');
          ring2.setAttribute('cx', String(px));
          ring2.setAttribute('cy', String(py));
          ring2.setAttribute('r', String(r));
          ring2.setAttribute('fill', 'none');
          ring2.setAttribute('stroke', c.color);
          ring2.setAttribute('stroke-width', '0.4');
          ring2.setAttribute('opacity', '0.2');
          ring2.style.cssText = anim + ';animation-delay:0.5s';
          g.appendChild(ring2);
        }

        const lbl = document.createElementNS(ns, 'text');
        lbl.classList.add('pin-label');
        lbl.setAttribute('x', String(lx));
        lbl.setAttribute('y', String(ly));
        lbl.setAttribute('fill', c.color);
        lbl.setAttribute('font-size', '2.5');
        lbl.setAttribute('font-family', 'monospace');
        lbl.setAttribute('letter-spacing', '0.3');
        lbl.setAttribute('text-anchor', anchor);
        lbl.setAttribute('opacity', '0.6');
        lbl.textContent = c.name.toUpperCase();
        g.appendChild(lbl);

        pinsG.appendChild(g);

        g.addEventListener('mouseenter', function() { if (!selectedKey) showDetail(c); });
        g.addEventListener('mouseleave', function() {
          if (!selectedKey) clearDetail(); else showDetail(CITIES_MAP[selectedKey]);
        });
        g.addEventListener('click', function(e) {
          e.stopPropagation();
          selectCity(c.key);
          zoomToCity(c.key);
        });
      });

      if (loadingEl) loadingEl.style.display = 'none';
      if (hintEl) {
        hintEl.style.opacity = '1';
        setTimeout(function() { hintEl.style.opacity = '0'; }, 3000);
      }
    } catch(err) {
      console.error('[CitySelect] map error:', err);
      if (loadingEl) {
        loadingEl.style.display = 'block';
        loadingEl.textContent = 'MAP ERROR -- check console';
      }
    }
  }
}
