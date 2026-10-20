/* EN2RIOR — interactions & scroll motion */
(() => {
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---------- hero intro ---------- */
  const start = () => requestAnimationFrame(() => {
    document.body.classList.add('is-loaded');
    // hand hero images over to the hover transition once the intro reveal is done
    setTimeout(() => document.body.classList.add('hero-ready'), reduce ? 0 : 2100);
  });
  if (document.fonts && document.fonts.ready) {
    Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1200))]).then(start);
  } else start();

  /* ---------- scroll reveals ---------- */
  const reveals = $$('[data-reveal]');
  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(el => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    reveals.forEach(el => io.observe(el));
  }

  /* ---------- mobile menu ---------- */
  const burger = $('#burger');
  const nav = $('#headNav');
  const setMenu = open => {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    nav.classList.toggle('is-open', open);
  };
  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  $$('a', nav).forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  /* ---------- sticky nav: rest (vertical) ⇄ scrolled (horizontal, centred) ----------
     The grid/flex switch is instant in CSS, so each item is FLIP-animated from
     where it was to where it lands — a slow glide, never a jump.            */
  const headWrap = $('#headWrap');
  const flipEls = [$('.logo', headWrap), ...$$('.head-nav a:not(.head-nav-contact)', headWrap), $('.head-contact', headWrap)];
  const darkZones = $$('.projects');
  const GLIDE = 'cubic-bezier(.45, .05, .25, 1)';
  let scrolled = null;

  const setScrolled = on => {
    if (on === scrolled) return;
    const first = scrolled === null ? null : flipEls.map(el => el.getBoundingClientRect());
    flipEls.forEach(el => el.getAnimations().forEach(a => a.cancel()));
    scrolled = on;
    headWrap.classList.toggle('is-scrolled', on);
    if (!first || reduce || burger.offsetParent !== null) return;   // no glide on first paint / mobile
    flipEls.forEach((el, i) => {
      const last = el.getBoundingClientRect();
      const dx = first[i].left - last.left, dy = first[i].top - last.top;
      if (Math.abs(dx) < .5 && Math.abs(dy) < .5) return;
      el.animate(
        [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'translate(0, 0)' }],
        { duration: 900, easing: GLIDE, delay: i * 35, fill: 'backwards' }
      );
    });
  };

  const updateHead = () => {
    const y = window.scrollY;
    // hysteresis: collapse after 80px, expand only back near the top — no flicker at the threshold
    if (!scrolled && y > 80) setScrolled(true);
    else if (scrolled && y < 24) setScrolled(false);
    else if (scrolled === null) setScrolled(y > 80);
    // colour mode: is the bar's centre line over a dark section?
    const mid = headWrap.offsetHeight / 2;
    const dark = darkZones.some(z => { const r = z.getBoundingClientRect(); return r.top <= mid && r.bottom >= mid; });
    headWrap.classList.toggle('on-dark', dark);
  };
  let headTick = false;
  window.addEventListener('scroll', () => {
    if (!headTick) { headTick = true; requestAnimationFrame(() => { headTick = false; updateHead(); }); }
  }, { passive: true });
  window.addEventListener('resize', updateHead);
  updateHead();

  /* ---------- what we provide: active service ---------- */
  /* Each style swaps the image (cross-fade) and the description (fade out → in). */
  const SERVICES = [
    { img: 'provide-cafe-spindle-chairs.jpg', pos: '50% 100%', alt: 'Cafe with black spindle chairs and wicker pendant lamps',
      text: "Our goal is to create spaces that not only inspire and delight but also enhance your well-being and productivity. Let 2RIOR be your partner in shaping the spaces where life's most cherished memories are made." },
    { img: 'collage-sunlit-living.jpg', pos: '50% 60%', alt: 'Sunlit living room with a cream sofa and soft neutral palette',
      text: 'Minimalist Elegance strips a room back to what truly matters: clean lines, a calm neutral palette and natural light. Every piece earns its place, leaving open, uncluttered spaces that feel quietly luxurious.' },
    { img: 'project-luxe-loft.jpg', pos: '50% 70%', alt: 'Wooden bar stools against a herringbone brick wall',
      text: 'Rustic Charm brings warmth home with honest materials: reclaimed timber, exposed brick and handcrafted details. Earthy tones and lived-in textures create inviting spaces that feel relaxed and full of character.' },
    { img: 'process-grid-wall-armchairs.jpg', pos: '50% 75%', alt: 'Leather armchairs in front of a black metal grid wall with pendant lights',
      text: 'Modern Industrial pairs raw structure with refined comfort. Black metal grids, exposed finishes and statement pendants meet soft leather and greenery for bold, functional spaces with an urban edge.' },
    { img: 'who-lounge-rattan.jpg', pos: '50% 90%', alt: 'Lounge with rattan furniture, plants and tall windows',
      text: 'Bohemian Vibes celebrates a free-spirited, layered look. Rattan, woven textures, lush plants and collected pieces come together in relaxed, sunlit rooms that feel personal, creative and welcoming.' },
    { img: 'project-rustic-charm.jpg', pos: '50% 40%', alt: 'Golden tufted loveseat on a striped rug by a large window',
      text: 'Classic Vintage revives timeless pieces with a fresh eye. Tufted silhouettes, rich golden hues and graphic patterns are balanced with modern comfort, creating spaces full of nostalgia and enduring style.' },
  ];
  SERVICES.forEach(s => { const im = new Image(); im.src = `assets/images/${s.img}`; });   // preload so swaps are instant
  const svc = $('#svcList');
  const svcMedia = $('#svcMedia');
  const svcDesc = $('#svcDesc');
  let svcIdx = 0, svcToken = 0, descTimer = null;

  const showService = i => {
    if (i === svcIdx) return;
    svcIdx = i;
    const token = ++svcToken;
    const s = SERVICES[i];
    $$('li', svc).forEach((li, k) => {
      li.classList.toggle('is-active', k === i);
      $('button', li).setAttribute('aria-pressed', String(k === i));
    });

    // image: new layer on top, fades + settles in, older layers removed afterwards
    const layer = new Image();
    layer.className = 'svc-layer';
    layer.alt = s.alt;
    layer.style.objectPosition = s.pos;
    layer.src = `assets/images/${s.img}`;
    const reveal = () => {
      if (token !== svcToken) return;                      // a newer click won
      svcMedia.appendChild(layer);
      layer.getBoundingClientRect();                        // commit the start state
      requestAnimationFrame(() => layer.classList.add('is-shown'));
      const cleanup = () => $$('.svc-layer', svcMedia).forEach(l => { if (l !== layer && token === svcToken) l.remove(); });
      setTimeout(cleanup, reduce ? 0 : 1200);
    };
    (layer.decode ? layer.decode() : Promise.resolve()).then(reveal, reveal);

    // description: drift out, swap text, rise in
    clearTimeout(descTimer);
    svcDesc.classList.remove('is-pre');
    svcDesc.classList.add('is-out');
    descTimer = setTimeout(() => {
      svcDesc.textContent = s.text;
      svcDesc.classList.remove('is-out');
      svcDesc.classList.add('is-pre');
      svcDesc.getBoundingClientRect();
      requestAnimationFrame(() => svcDesc.classList.remove('is-pre'));
    }, reduce ? 0 : 450);
  };
  svc.addEventListener('click', e => {
    const b = e.target.closest('button[data-svc]');
    if (b) showService(Number(b.dataset.svc));
  });

  /* ---------- projects carousel (infinite, spring-driven, draggable) ----------
     Every card is positioned with translate3d at  x = i·step − offset,  wrapped
     modulo N·step, so the strip loops forever in both directions with no clones.
     Motion is a critically-damped spring: velocity is continuous, so arrow
     presses, repeated presses and drag releases all glide — never jump.        */
  const vp = $('#projViewport');
  const pCards = $$('.proj-card', vp);
  const pImgs = pCards.map(c => $('.proj-img', c));
  const N = pCards.length;
  let cW = 0, gap = 0, stepW = 1, shortH = 0, tallH = 0, focusSlot = 1;
  let cur = 0, target = 0, vel = 0;               // px
  let dragging = false, rafId = null, lastT = 0;
  const OMEGA = 7.2;                               // spring stiffness (≈0.75s settle)

  const measure = () => {
    const idx = stepW > 1 ? target / stepW : 0;
    vp.classList.remove('is-ready');                // read natural sizes from the flex fallback
    pImgs.forEach(im => { im.style.height = ''; });
    cW = pCards[0].getBoundingClientRect().width;
    gap = parseFloat(getComputedStyle(vp).columnGap) || 0;
    stepW = cW + gap;
    const wide = window.innerWidth >= 1024;
    shortH = cW;                                    // 437 @1440
    tallH = wide ? cW * 621 / 437 : cW;             // 621 @1440; equal heights on tablet/mobile
    const visible = Math.round((vp.clientWidth + gap) / stepW);
    focusSlot = visible >= 3 ? 1 : 0;
    const capH = Math.max(...pCards.map(c => { const cap = $('.proj-cap', c); return cap.offsetHeight + parseFloat(getComputedStyle(cap).marginTop); }));
    vp.classList.add('is-ready');
    vp.style.height = `${Math.ceil(tallH + capH)}px`;
    cur = target = Math.round(idx) * stepW; vel = 0;
    render();
  };

  const smooth = t => t * t * (3 - 2 * t);
  const render = () => {
    const span = N * stepW;
    for (let i = 0; i < N; i++) {
      let x = i * stepW - cur;
      x = ((x + stepW) % span + span) % span - stepW;          // wrap into [-step, (N-1)·step)
      pCards[i].style.transform = `translate3d(${x.toFixed(2)}px,0,0)`;
      const d = Math.abs(x - focusSlot * stepW) / stepW;
      const t = smooth(Math.max(0, 1 - d));
      pImgs[i].style.height = `${(shortH + (tallH - shortH) * t).toFixed(2)}px`;
    }
  };

  const springTick = now => {
    let dt = Math.min(0.05, (now - lastT) / 1000); lastT = now;
    if (!dragging) {
      // semi-implicit Euler in small sub-steps for a stable, frame-rate independent spring
      while (dt > 0) {
        const h = Math.min(dt, 1 / 240);
        vel += (OMEGA * OMEGA * (target - cur) - 2 * OMEGA * vel) * h;
        cur += vel * h;
        dt -= h;
      }
      if (Math.abs(target - cur) < 0.05 && Math.abs(vel) < 2) { cur = target; vel = 0; render(); rafId = null; return; }
    }
    render();
    rafId = requestAnimationFrame(springTick);
  };
  const kick = () => {
    if (reduce) { cur = target; vel = 0; render(); return; }
    if (!rafId) { lastT = performance.now(); rafId = requestAnimationFrame(springTick); }
  };
  const go = dir => {
    // queue up to 3 steps ahead; always land on a whole card
    const base = Math.round(target / stepW) + dir;
    const lim = Math.round(cur / stepW);
    target = Math.max(lim - 3, Math.min(lim + 3, base)) * stepW;
    kick();
  };
  $('#projPrev').addEventListener('click', () => go(-1));
  $('#projNext').addEventListener('click', () => go(1));
  vp.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
  });

  // drag / swipe (mouse, pen, touch). touch-action:pan-y keeps vertical scrolling native.
  let startX = 0, startCur = 0, moved = 0, samples = [];
  vp.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    dragging = true; moved = 0;
    startX = e.clientX; startCur = cur; vel = 0;
    samples = [[performance.now(), e.clientX]];
    vp.setPointerCapture(e.pointerId);
    vp.classList.add('is-dragging');
    kick();
  });
  vp.addEventListener('pointermove', e => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    moved = Math.max(moved, Math.abs(dx));
    cur = startCur - dx;
    const now = performance.now();
    samples.push([now, e.clientX]);
    while (samples.length > 2 && now - samples[0][0] > 100) samples.shift();
  });
  const endDrag = () => {
    if (!dragging) return;
    dragging = false;
    vp.classList.remove('is-dragging');
    const a = samples[0], b = samples[samples.length - 1];
    const v = b && a && b[0] - a[0] > 0 ? -(b[1] - a[1]) / ((b[0] - a[0]) / 1000) : 0;   // px/s in offset space
    vel = Math.max(-4000, Math.min(4000, v));
    // project the throw, then snap to the nearest card (at most 2 cards per flick)
    const proj = cur + vel * 0.22;
    const from = Math.round(startCur / stepW);
    const to = Math.max(from - 2, Math.min(from + 2, Math.round(proj / stepW)));
    target = to * stepW;
    kick();
  };
  vp.addEventListener('pointerup', endDrag);
  vp.addEventListener('pointercancel', endDrag);
  vp.addEventListener('lostpointercapture', endDrag);
  vp.addEventListener('click', e => { if (moved > 6) { e.preventDefault(); e.stopPropagation(); } }, true);
  vp.addEventListener('dragstart', e => e.preventDefault());

  // horizontal trackpad / shift+wheel
  let wheelTimer = null;
  vp.addEventListener('wheel', e => {
    const dx = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : (e.shiftKey ? e.deltaY : 0);
    if (!dx) return;
    e.preventDefault();
    dragging = true; cur += dx; vel = 0; kick();
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(() => { dragging = false; target = Math.round(cur / stepW) * stepW; kick(); }, 140);
  }, { passive: false });

  let rsz = null;
  window.addEventListener('resize', () => { clearTimeout(rsz); rsz = setTimeout(measure, 120); });
  measure();
  if (document.fonts) document.fonts.ready.then(measure);

  /* ---------- scroll-linked: gallery fan + light parallax ---------- */
  const gallery = $('#gallery');
  const deckEl = $('#galleryStack');
  const title = $('.gallery-title', gallery);
  const para = $$('[data-parallax]');
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const easeOut = t => 1 - Math.pow(1 - t, 3);

  let ticking = false;
  const onScroll = () => {
    ticking = false;
    const vh = window.innerHeight;

    // Gallery: cards fan from 0° to ±15° (design state) as the section rises to centre.
    const r = gallery.getBoundingClientRect();
    const p = easeOut(clamp((vh - r.top) / (vh * 0.75), 0, 1));
    deckEl.style.setProperty('--p', p.toFixed(4));
    title.style.transform = `scale(${(0.9 + 0.1 * p).toFixed(4)})`;

    // Parallax only on free-floating imagery, desktop only. 0 offset at viewport centre.
    if (window.innerWidth >= 1024) {
      para.forEach(el => {
        const b = el.getBoundingClientRect();
        const mid = b.top + b.height / 2 - vh / 2;
        el.style.translate = `0 ${(-mid * parseFloat(el.dataset.parallax)).toFixed(1)}px`;
      });
    } else para.forEach(el => { el.style.translate = ''; });
  };
  if (!reduce) {
    const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } };
    window.addEventListener('scroll', req, { passive: true });
    window.addEventListener('resize', req);
    onScroll();
  }

  /* ---------- How We Work: pointer-aware fill ---------- */
  $$('.step').forEach(card => {
    const at = e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${((e.clientX - r.left) / r.width * 100).toFixed(1)}%`);
      card.style.setProperty('--my', `${((e.clientY - r.top) / r.height * 100).toFixed(1)}%`);
    };
    card.addEventListener('pointerenter', at);
    card.addEventListener('pointermove', at);
    card.addEventListener('pointerleave', at);   // fill retracts toward the exit point
  });

  /* ---------- Gallery deck: drag top card → it tucks to the back; click → full view ---------- */
  const deckCards = $$('.g-card', deckEl);
  const DN = deckCards.length;
  let order = deckCards.map((_, i) => i);          // order[0] = top card
  const side = new Map([[1, 1], [2, -1]]);         // design: 2nd card +15°, 3rd card −15°
  let deckBusy = false;

  const applySlots = (skip = null) => {
    // whichever side slot 1 uses, slot 2 takes the other — no card ever swings across
    const s1 = order[1], s2 = order[2];
    if (!side.has(s1)) side.set(s1, -(side.get(s2) || -1));
    if (!side.has(s2) || side.get(s2) === side.get(s1)) side.set(s2, -side.get(s1));
    order.forEach((ci, slot) => {
      if (ci === skip) return;
      const c = deckCards[ci], st = c.style;
      c.classList.toggle('is-top', slot === 0);
      c.tabIndex = slot === 0 ? 0 : -1;
      c.setAttribute('role', slot === 0 ? 'button' : 'presentation');
      if (slot === 0) c.setAttribute('aria-label', `Open image ${ci + 1} of ${DN}: ${$('img', c).alt}`); else c.removeAttribute('aria-label');
      st.setProperty('--z', String(DN - slot));
      if (slot === 0) {                                     // 13:153 — main card
        st.setProperty('--rot', '0deg'); st.setProperty('--sc', '1'); st.setProperty('--op', '1');
        st.setProperty('--bw', 'max(3px, calc(6 * var(--u)))'); st.setProperty('--sa', '.4');
        st.setProperty('--go', '0');
      } else if (slot <= 2) {                               // 13:150 / 13:147 — frosted ±15°
        st.setProperty('--rot', `${15 * side.get(ci)}deg`); st.setProperty('--sc', '1'); st.setProperty('--op', '1');
        st.setProperty('--bw', 'max(4px, calc(8 * var(--u)))'); st.setProperty('--sa', '.16');
        st.setProperty('--go', '1'); st.setProperty('--ga', slot === 1 ? '.08' : '.16');
      } else {                                              // waiting, unseen
        st.setProperty('--rot', '0deg'); st.setProperty('--sc', '.9'); st.setProperty('--op', '0');
        st.setProperty('--bw', 'max(4px, calc(8 * var(--u)))'); st.setProperty('--sa', '0');
        st.setProperty('--go', '1'); st.setProperty('--ga', '.16');
        side.delete(ci);
      }
    });
  };
  const deckInstant = fn => {                       // re-order without animating (used behind the lightbox)
    deckEl.classList.add('g-stack-instant'); fn(); deckEl.getBoundingClientRect();
    requestAnimationFrame(() => deckEl.classList.remove('g-stack-instant'));
  };
  applySlots();

  const sendToBack = dir => {
    if (deckBusy) return;
    deckBusy = true;
    const ci = order[0], c = deckCards[ci], st = c.style;
    const gw = deckEl.offsetWidth;
    // 1) carry on outward, clear of the deck
    c.classList.remove('is-drag'); c.classList.add('is-fly');
    st.setProperty('--dx', `${dir * gw * 1.25}px`);
    st.setProperty('--dy', `${(parseFloat(st.getPropertyValue('--dy')) || 0) * 0.5}px`);
    st.setProperty('--drot', `${dir * 16}deg`);
    // the rest of the deck advances at the same moment
    order.push(order.shift());
    applySlots(ci);
    setTimeout(() => {
      // 2) drop behind everything and glide home, fading into the back of the deck
      c.classList.remove('is-fly');
      st.setProperty('--z', '0');
      st.setProperty('--dx', '0px'); st.setProperty('--dy', '0px'); st.setProperty('--drot', '0deg');
      applySlots();
      setTimeout(() => { deckBusy = false; }, 250);
    }, reduce ? 0 : 480);
  };

  let gStart = null;
  deckEl.addEventListener('pointerdown', e => {
    const c = e.target.closest('.g-card.is-top');
    if (!c || e.button !== 0 || deckBusy) return;
    gStart = { x: e.clientX, y: e.clientY, t: performance.now(), c, moved: 0, samples: [[performance.now(), e.clientX]] };
    c.setPointerCapture(e.pointerId);
    c.classList.add('is-drag');
  });
  deckEl.addEventListener('pointermove', e => {
    if (!gStart) return;
    const dx = e.clientX - gStart.x, dy = e.clientY - gStart.y;
    gStart.moved = Math.max(gStart.moved, Math.hypot(dx, dy));
    const st = gStart.c.style;
    st.setProperty('--dx', `${dx}px`);
    st.setProperty('--dy', `${dy * 0.35}px`);
    st.setProperty('--drot', `${Math.max(-14, Math.min(14, dx * 0.05))}deg`);
    const now = performance.now();
    gStart.samples.push([now, e.clientX]);
    while (gStart.samples.length > 2 && now - gStart.samples[0][0] > 100) gStart.samples.shift();
  });
  const gEnd = () => {
    if (!gStart) return;
    const g = gStart; gStart = null;
    const dx = parseFloat(g.c.style.getPropertyValue('--dx')) || 0;
    const a = g.samples[0], b = g.samples[g.samples.length - 1];
    const v = b[0] - a[0] > 0 ? (b[1] - a[1]) / ((b[0] - a[0]) / 1000) : 0;
    if (g.moved < 6) {                                   // a click, not a drag
      g.c.classList.remove('is-drag');
      ['--dx', '--dy', '--drot'].forEach(p => g.c.style.setProperty(p, p === '--drot' ? '0deg' : '0px'));
      openLightbox(order[0]);
      return;
    }
    const limit = Math.max(70, deckEl.offsetWidth * 0.28);
    if (Math.abs(dx) > limit || Math.abs(v) > 650) sendToBack(Math.sign(Math.abs(dx) > 20 ? dx : v) || 1);
    else {                                               // not far enough → glide back
      g.c.classList.remove('is-drag');
      g.c.style.setProperty('--dx', '0px'); g.c.style.setProperty('--dy', '0px'); g.c.style.setProperty('--drot', '0deg');
    }
  };
  deckEl.addEventListener('pointerup', gEnd);
  deckEl.addEventListener('pointercancel', gEnd);
  deckEl.addEventListener('keydown', e => {
    if (!e.target.classList.contains('is-top')) return;
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(order[0]); }
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault(); sendToBack(e.key === 'ArrowRight' ? 1 : -1);
      setTimeout(() => deckCards[order[0]].focus({ preventScroll: true }), 520);
    }
  });

  /* ---------- Gallery lightbox ---------- */
  const lb = $('#lightbox'), lbStage = $('#lbStage'), lbIdxEl = $('#lbIdx');
  $('#lbTotal').textContent = String(DN);
  const GLIDE_E = 'cubic-bezier(.45, .05, .25, 1)';
  let lbIdx = 0, lbFrame = null, lbOpen = false, lbLastFocus = null;

  const fitRect = img => {
    const vw = window.innerWidth, vh = window.innerHeight, small = vw < 640;
    const padX = small ? 16 : 136, padTop = small ? 72 : 80, padBot = small ? 104 : 80;
    const iw = img.naturalWidth || 1920, ih = img.naturalHeight || 2880;
    const s = Math.min((vw - padX * 2) / iw, (vh - padTop - padBot) / ih);
    const w = iw * s, h = ih * s;
    return { left: (vw - w) / 2, top: padTop + (vh - padTop - padBot - h) / 2, width: w, height: h };
  };
  const place = (el, r) => Object.assign(el.style, { left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px` });
  const makeFrame = i => {
    const src = $('img', deckCards[i]);
    const f = document.createElement('div');
    f.className = 'lb-frame';
    const im = new Image();
    im.src = src.currentSrc || src.src; im.alt = src.alt; im.draggable = false;
    f.appendChild(im);
    return { f, im };
  };
  const ready = im => (im.decode ? im.decode().catch(() => {}) : Promise.resolve());

  const syncDeckTo = i => deckInstant(() => {
    while (order[0] !== i) order.push(order.shift());
    side.clear(); side.set(order[1], 1); side.set(order[2], -1);
    deckCards.forEach(c => ['--dx', '--dy', '--drot'].forEach(p => c.style.setProperty(p, p === '--drot' ? '0deg' : '0px')));
    applySlots();
  });

  async function openLightbox(i) {
    if (lbOpen) return;
    lbOpen = true; lbIdx = i; lbLastFocus = document.activeElement;
    lbIdxEl.textContent = String(i + 1);
    const card = deckCards[i];
    const from = card.getBoundingClientRect();
    const { f, im } = makeFrame(i);
    lbStage.innerHTML = ''; lbStage.appendChild(f); lbFrame = f;
    await ready(im);
    const to = fitRect(im);
    place(f, to);
    lb.hidden = false;
    root.classList.add('is-locked');
    card.classList.add('is-hidden-src');
    requestAnimationFrame(() => lb.classList.add('is-open'));
    // grow out of the card: animate the frame box (image stays cover-fitted inside, so the crop morphs smoothly)
    f.animate([
      { left: `${from.left}px`, top: `${from.top}px`, width: `${from.width}px`, height: `${from.height}px` },
      { left: `${to.left}px`, top: `${to.top}px`, width: `${to.width}px`, height: `${to.height}px` },
    ], { duration: reduce ? 0 : 750, easing: GLIDE_E });
    $('.lb-close', lb).focus({ preventScroll: true });
  }

  function closeLightbox() {
    if (!lbOpen || !lb.classList.contains('is-open')) return;
    lb.classList.remove('is-open');
    root.classList.remove('is-locked');
    const card = deckCards[order[0]];
    const f = lbFrame;
    const done = () => {
      card.classList.remove('is-hidden-src');
      lb.hidden = true; lbStage.innerHTML = ''; lbOpen = false;
      if (lbLastFocus) lbLastFocus.focus({ preventScroll: true });
    };
    if (!f || reduce) { done(); return; }
    // shrink back into the (now matching) top card of the deck
    const from = f.getBoundingClientRect(), to = card.getBoundingClientRect();
    const a = f.animate([
      { left: `${from.left}px`, top: `${from.top}px`, width: `${from.width}px`, height: `${from.height}px` },
      { left: `${to.left}px`, top: `${to.top}px`, width: `${to.width}px`, height: `${to.height}px` },
    ], { duration: 650, easing: GLIDE_E, fill: 'forwards' });
    a.onfinish = done;
  }

  async function lbGo(dir) {
    if (!lbOpen) return;
    lbIdx = (lbIdx + dir + DN) % DN;
    lbIdxEl.textContent = String(lbIdx + 1);
    syncDeckTo(lbIdx);                          // deck quietly follows, so closing lands on the right card
    deckCards.forEach((c, k) => c.classList.toggle('is-hidden-src', k === lbIdx));
    const old = lbFrame;
    const { f, im } = makeFrame(lbIdx);
    lbFrame = f;
    await ready(im);
    if (lbFrame !== f) return;                  // superseded by a faster click
    place(f, fitRect(im));
    lbStage.appendChild(f);
    const D = reduce ? 0 : 700, off = 60 * dir;
    f.animate([{ opacity: 0, transform: `translateX(${off}px) scale(.98)` }, { opacity: 1, transform: 'none' }],
      { duration: D, easing: GLIDE_E });
    if (old) {
      const a = old.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: `translateX(${-off}px) scale(.98)` }],
        { duration: D, easing: GLIDE_E, fill: 'forwards' });
      a.onfinish = () => old.remove();
    }
  }

  $('#lbPrev').addEventListener('click', () => lbGo(-1));
  $('#lbNext').addEventListener('click', () => lbGo(1));
  lb.addEventListener('click', e => { if (e.target.closest('[data-lb-close]')) closeLightbox(); });
  document.addEventListener('keydown', e => {
    if (!lbOpen) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') lbGo(1);
    if (e.key === 'ArrowLeft') lbGo(-1);
  });
  document.addEventListener('focusin', e => {
    if (lb.classList.contains('is-open') && !lb.contains(e.target)) $('.lb-close', lb).focus({ preventScroll: true });
  });
  // swipe inside the viewer
  let lbSwipe = null;
  lbStage.addEventListener('pointerdown', e => { lbSwipe = { x: e.clientX, y: e.clientY }; });
  lbStage.addEventListener('pointerup', e => {
    if (!lbSwipe) return;
    const dx = e.clientX - lbSwipe.x, dy = e.clientY - lbSwipe.y; lbSwipe = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) lbGo(dx < 0 ? 1 : -1);
    else if (Math.abs(dx) < 6 && Math.abs(dy) < 6 && !e.target.closest('.lb-frame')) closeLightbox();
  });
  window.addEventListener('resize', () => {
    if (!lbOpen || !lbFrame) return;
    $$('.lb-frame', lbStage).forEach(f => place(f, fitRect($('img', f))));
  });

  /* ---------- CTA: letters darken one after another as you scroll ---------- */
  const ctaWords = [];
  $$('[data-words]').forEach(p => {
    const walk = (node, finalA) => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            const wd = document.createElement('span');
            wd.className = 'wd';
            [...part].forEach(ch => {                       // one span per letter
              const s = document.createElement('span');
              s.className = 'c'; s.textContent = ch;
              ctaWords.push({ el: s, final: finalA });
              wd.appendChild(s);
            });
            frag.appendChild(wd);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n, finalA);   // progression runs straight through "start your dream journey" to full ink
      });
    };
    walk(p, 1);
  });
  const cta = $('.cta');
  const MIN_A = 0.14, SPREAD = 14;                // each letter fades over ~14 letters of scroll — a soft travelling edge
  const paintCta = () => {
    const vh = window.innerHeight, r = cta.getBoundingClientRect();
    const p = reduce ? 1 : clamp((vh * 0.9 - r.top) / (vh * 0.6), 0, 1);
    const n = ctaWords.length, head = p * (n + SPREAD);
    ctaWords.forEach((w, i) => {
      const t = clamp((head - i) / SPREAD, 0, 1);
      const e = t * t * (3 - 2 * t);
      w.el.style.setProperty('--wa', (MIN_A + (w.final - MIN_A) * e).toFixed(3));
    });
  };
  let ctaTick = false;
  window.addEventListener('scroll', () => { if (!ctaTick) { ctaTick = true; requestAnimationFrame(() => { ctaTick = false; paintCta(); }); } }, { passive: true });
  window.addEventListener('resize', paintCta);
  paintCta();

  /* ---------- Watch Video → YouTube lightbox ---------- */
  const modal = $('#videoModal');
  const frame = $('#videoFrame');
  const watchBtn = $('#watchBtn');
  let lastFocus = null;
  const openVideo = id => {
    lastFocus = document.activeElement;
    frame.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1"
      title="EN2RIOR — Watch video" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
    modal.hidden = false;
    root.classList.add('is-locked');
    requestAnimationFrame(() => requestAnimationFrame(() => modal.classList.add('is-open')));
    $('.vmodal-close', modal).focus({ preventScroll: true });
  };
  const closeVideo = () => {
    if (modal.hidden) return;
    modal.classList.remove('is-open');
    root.classList.remove('is-locked');
    setTimeout(() => { frame.innerHTML = ''; modal.hidden = true; }, reduce ? 0 : 500);  // removing the iframe stops playback
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  };
  watchBtn.addEventListener('click', () => openVideo(watchBtn.dataset.video));
  modal.addEventListener('click', e => { if (e.target.closest('[data-close]')) closeVideo(); });
  document.addEventListener('keydown', e => {
    if (modal.hidden) return;
    if (e.key === 'Escape') closeVideo();
  });
  // keep keyboard focus inside the dialog (close button ⇄ player)
  document.addEventListener('focusin', e => {
    if (modal.classList.contains('is-open') && !modal.contains(e.target)) $('.vmodal-close', modal).focus({ preventScroll: true });
  });

  /* ---------- footer clock (GMT +0) ---------- */
  const clock = $('#clock');
  const pad = n => String(n).padStart(2, '0');
  const tick = () => {
    const d = new Date();
    clock.textContent = `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
  };
  tick();
  setInterval(tick, 1000);
})();
