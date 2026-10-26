/* Miguel Bermúdez – Abogado — behaviour. Everything here enhances a page that already works without it. */
(() => {
  'use strict';
  window.__site = true;

  // WhatsApp number in international format, digits only (+57 301 507 0487).
  const WA = '573015070487';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');

  // Every WhatsApp link follows the one number above.
  document.querySelectorAll('a[data-wa]').forEach((a) => { a.href = a.href.replace(/wa\.me\/\d+/, 'wa.me/' + WA); });

  /* ---------- Phone dock steps aside while the folder's button or the coupon is on screen ---------- */
  const dock = document.querySelector('.dock');
  const asides = [document.querySelector('.folio__act .btn'), document.querySelector('[data-coupon]')].filter(Boolean);
  if (dock && asides.length && 'IntersectionObserver' in window) {
    const seen = new Set();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) e.isIntersecting ? seen.add(e.target) : seen.delete(e.target);
      dock.classList.toggle('is-away', seen.size > 0);
    }, { threshold: 0 });
    asides.forEach((el) => io.observe(el));
  }

  /* ---------- Reveals: once, when the element enters ---------- */
  const revealTargets = document.querySelectorAll('[data-reveal], .steps');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0 });
    revealTargets.forEach((el) => io.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add('is-in'));
  }

  // The marker draws across each marked registry line as soon as any of it is on screen.
  const marks = document.querySelectorAll('.entry--marked');
  if ('IntersectionObserver' in window) {
    const mo = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-in'); mo.unobserve(e.target); }
    }, { threshold: 0 });
    marks.forEach((el) => mo.observe(el));
  } else marks.forEach((el) => el.classList.add('is-in'));

  /* ---------- Sticky bar after the hero ---------- */
  const bar = document.querySelector('[data-bar]');
  const hero = document.querySelector('.hero');
  if (bar && hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => {
      bar.classList.toggle('is-on', !e.isIntersecting);
    }, { threshold: 0 }).observe(hero);
    const links = [...bar.querySelectorAll('.bar__nav a')];
    const sections = links.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
    const spy = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        links.forEach((a) => a.classList.toggle('is-here', a.getAttribute('href') === '#' + e.target.id));
      }
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => spy.observe(s));
  }

  /* ---------- Casos: cards that fold into spines (desktop, motion allowed) ---------- */
  const casos = document.querySelector('[data-deck]');
  if (casos) {
    const deck = casos.querySelector('[data-deck-list]');
    const cards = [...casos.querySelectorAll('.card')];
    const body = cards.map((c) => c.querySelector('.card__body'));
    const spine = cards.map((c) => c.querySelector('.card__spine'));
    const wide = matchMedia('(min-width: 1100px) and (min-height: 640px)');
    const OPEN = 620, SPINE = 120, GAP = 24;
    let pinned = false, raf = 0;

    const layout = () => {
      raf = 0;
      const r = casos.getBoundingClientRect();
      const run = casos.offsetHeight - innerHeight;
      const p = Math.min(1, Math.max(0, -r.top / Math.max(1, run)));
      const s = p * (cards.length - 1);
      // The open card shrinks on narrower screens so the last one always ends inside the grid.
      const open = Math.max(SPINE * 3, Math.min(OPEN, deck.clientWidth - (cards.length - 1) * SPINE));
      let x = 0;
      cards.forEach((card, i) => {
        const c = Math.min(1, Math.max(0, s - i));          // 0 open, 1 folded into a spine
        const fade = Math.min(1, c / 0.2);                   // the words leave first,
        const label = Math.min(1, Math.max(0, (c - 0.22) / 0.25)); // then the spine label arrives
        const fold = Math.max(0, (c - 0.3) / 0.7);
        const w = open - (open - SPINE) * fold;
        card.style.width = `${open}px`;
        card.style.transform = `translate3d(${x}px,0,0)`;
        card.style.clipPath = `inset(0 ${open - w}px 0 0)`;
        body[i].style.opacity = String(1 - fade);
        spine[i].style.opacity = String(label);
        card.classList.toggle('is-spine', c > 0.98);
        body[i].toggleAttribute('inert', fade > 0.9);
        body[i].style.visibility = fade >= 1 ? 'hidden' : '';
        x += w + GAP * (1 - fold);
      });
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(layout); };

    const setPinned = (on) => {
      if (on === pinned) return;
      pinned = on;
      casos.classList.toggle('is-pinned', on);
      if (on) {
        addEventListener('scroll', onScroll, { passive: true });
        addEventListener('resize', onScroll);
        layout();
      } else {
        removeEventListener('scroll', onScroll);
        removeEventListener('resize', onScroll);
        cards.forEach((c, i) => { c.style.width = ''; c.style.transform = ''; c.style.clipPath = ''; c.classList.remove('is-spine'); body[i].style.opacity = ''; body[i].style.visibility = ''; spine[i].style.opacity = ''; body[i].removeAttribute('inert'); });
      }
    };
    const check = () => setPinned(wide.matches && !reduce.matches);
    wide.addEventListener('change', check);
    reduce.addEventListener('change', check);
    check();

    // A folded spine brings its card back.
    casos.addEventListener('click', (e) => {
      const card = e.target.closest('.card');
      if (!pinned || !card || !card.classList.contains('is-spine')) return;
      const i = cards.indexOf(card);
      const run = casos.offsetHeight - innerHeight;
      const top = casos.getBoundingClientRect().top + scrollY;
      scrollTo({ top: top + (i / (cards.length - 1)) * run, behavior: reduce.matches ? 'auto' : 'smooth' });
    });
  }

  /* ---------- Servicios: index with preview, anchored to the row ---------- */
  const index = document.querySelector('[data-index]');
  if (index) {
    const frame = index.querySelector('.index__frame');
    const picture = frame && frame.querySelector('img');
    const list = index.querySelector('.menu');
    const rows = [...index.querySelectorAll('.row[data-preview]')];
    const fine = matchMedia('(min-width: 900px)');
    let warmed = false, current = null;

    const place = (row) => {
      const y = row.getBoundingClientRect().top - index.getBoundingClientRect().top + row.offsetHeight / 2 - frame.offsetHeight / 2 - 14;
      const max = index.offsetHeight - frame.offsetHeight;
      frame.style.transform = `translateY(${Math.min(max, Math.max(0, y))}px)`;
    };
    const show = (row) => {
      if (!fine.matches || !frame) return;
      if (!warmed) { warmed = true; rows.forEach((a) => { new Image().src = a.dataset.preview; }); }
      rows.forEach((r) => r.classList.toggle('is-active', r === row));
      list.classList.add('index__list-dim');
      if (current !== row) {
        current = row;
        frame.classList.add('is-swapping');
        const src = row.dataset.preview;
        const swap = () => { picture.src = src; frame.classList.remove('is-swapping'); };
        reduce.matches ? swap() : setTimeout(swap, 120);
      }
      place(row);
    };
    const rest = () => { list.classList.remove('index__list-dim'); rows.forEach((r) => r.classList.remove('is-active')); };
    rows.forEach((row) => {
      row.addEventListener('pointerenter', () => show(row));
      row.addEventListener('focus', () => show(row));
    });
    list.addEventListener('pointerleave', rest);
    list.addEventListener('focusout', (e) => { if (!list.contains(e.relatedTarget)) rest(); });
    if (rows[1] && frame) {
      // Rest on the revision service, level with its row.
      const init = () => { if (fine.matches) { picture.src = rows[1].dataset.preview; place(rows[1]); } };
      init();
      addEventListener('load', init);
      addEventListener('resize', init);
    }
  }

  /* ---------- Antes de firmar: tabs ---------- */
  const tablist = document.querySelector('[data-tabs]');
  if (tablist) {
    const tabs = [...tablist.querySelectorAll('[role="tab"]')];
    const select = (tab, focus) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
      });
      if (focus) tab.focus();
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(t));
      t.addEventListener('keydown', (e) => {
        const k = e.key;
        if (k === 'ArrowRight' || k === 'ArrowLeft' || k === 'Home' || k === 'End') {
          e.preventDefault();
          const n = k === 'Home' ? 0 : k === 'End' ? tabs.length - 1 : (i + (k === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
          select(tabs[n], true);
        }
      });
    });
    select(tabs[0]);
  }

  /* ---------- Proceso: drag row with buttons and a plain count ---------- */
  const row = document.querySelector('[data-row]');
  if (row) {
    const prev = document.querySelector('[data-row-prev]');
    const next = document.querySelector('[data-row-next]');
    const count = document.querySelector('[data-row-count]');
    const steps = [...row.querySelectorAll('.step')];
    const step = () => (steps[0]?.offsetWidth || 280) + 32;
    const update = () => {
      const max = row.scrollWidth - row.clientWidth;
      const i = max <= 2 ? 0 : row.scrollLeft >= max - 2 ? steps.length - 1 : Math.round(row.scrollLeft / step());
      if (count) count.textContent = String(i + 1);
      if (prev) prev.disabled = row.scrollLeft <= 2;
      if (next) next.disabled = row.scrollLeft >= max - 2;
    };
    prev && prev.addEventListener('click', () => row.scrollBy({ left: -step(), behavior: reduce.matches ? 'auto' : 'smooth' }));
    next && next.addEventListener('click', () => row.scrollBy({ left: step(), behavior: reduce.matches ? 'auto' : 'smooth' }));
    row.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
    addEventListener('resize', update);
    update();
  }

  /* ---------- Contacto: the coupon writes the anotación and the WhatsApp message ---------- */
  const coupon = document.querySelector('[data-coupon]');
  if (coupon) {
    const que = coupon.querySelector('#f-que');
    const quien = coupon.querySelector('#f-quien');
    const etapa = coupon.querySelector('#f-etapa');
    const nombre = coupon.querySelector('#f-nombre');
    const docs = coupon.querySelector('[data-docs]');
    const list = coupon.querySelector('[data-docs-list]');
    const slip = coupon.querySelector('[data-slip]');
    const slot = (k) => slip.querySelector(`[data-s="${k}"]`);
    const status = document.createElement('p');
    status.className = 'docs__status';
    docs.append(status);

    const DOCS = {
      atraso: ['La promesa de compraventa', 'Los recibos de pago', 'Las comunicaciones sobre la fecha de entrega'],
      fiducia: ['El contrato o certificado de vinculación a la fiducia', 'Los extractos y recibos de consignación', 'Su carta de desistimiento o la respuesta de la fiduciaria'],
      distinto: ['La promesa de compraventa con sus anexos', 'La publicidad o los planos de la sala de ventas', 'El acta de entrega'],
      revision: ['El borrador del contrato o la minuta', 'Un certificado de tradición reciente', 'Los datos de la otra parte'],
      contrato: ['Los datos de las partes', 'Un certificado de tradición reciente', 'Lo que ya acordaron: precio, plazos y forma de pago'],
      predios: ['El certificado de tradición del predio', 'Escrituras, planos o levantamiento topográfico', 'Pruebas de la posesión: recibos, fotos, testigos'],
      arriendo: ['El contrato de arrendamiento', 'Los recibos o el registro de cánones pagados y adeudados', 'Las comunicaciones con el arrendatario'],
      servidumbre: ['El certificado de tradición de los predios', 'Escrituras y planos', 'Fotos del paso, la tubería o la obra en discusión'],
      otro: ['Los contratos que haya firmado', 'Los recibos de pago', 'Las comunicaciones con la otra parte']
    };

    const text = (sel) => (sel.value ? sel.options[sel.selectedIndex].text : '');
    const compose = () => {
      const parts = ['Hola, Miguel.'];
      const n = nombre.value.trim();
      if (n) parts.push(`Soy ${n}.`);
      if (que.value === 'otro') parts.push(`Tengo otra situación${quien.value ? ` con ${text(quien)}` : ''}.`);
      else if (que.value) parts.push(`Mi caso es que ${text(que)}${quien.value ? `, con ${text(quien)}` : ''}.`);
      else parts.push(`Quiero hacer una consulta${quien.value ? ` sobre un caso con ${text(quien)}` : ''}.`);
      if (etapa.value) parts.push(`Hoy ${text(etapa)}.`);
      parts.push('¿Cómo agendo una cita?');
      return parts.join(' ');
    };
    const fillSlot = (k, value, empty) => { const el = slot(k); el.textContent = value || empty; el.classList.toggle('is-empty', !value); };

    const render = () => {
      [que, quien, etapa, nombre].forEach((f) => f.classList.toggle('is-set', !!f.value.trim()));
      const items = que.value ? DOCS[que.value] : [];
      list.replaceChildren(...items.map((t) => { const li = document.createElement('li'); li.textContent = t; return li; }));
      fillSlot('que', text(que) && text(que).charAt(0).toUpperCase() + text(que).slice(1), 'sin marcar');
      fillSlot('quien', text(quien) && text(quien).charAt(0).toUpperCase() + text(quien).slice(1), 'sin marcar');
      fillSlot('etapa', text(etapa) && text(etapa).charAt(0).toUpperCase() + text(etapa).slice(1), 'sin marcar');
      fillSlot('nombre', nombre.value.trim(), 'usted');
      const missing = [[que, 'qué pasó'], [quien, 'con quién'], [etapa, 'en qué va']].filter(([f]) => !f.value).map(([, t]) => t);
      const state = !que.value ? 'empty' : missing.length ? 'marked' : 'ready';
      docs.dataset.state = state;
      slip.dataset.state = state;
      status.textContent = state === 'empty' ? '' : state === 'marked'
        ? `Falta marcar: ${missing.join(', ')}.`
        : 'Listo. Al enviar se abre WhatsApp con su mensaje escrito.';
      coupon.querySelector('[data-text]').value = compose();
    };

    coupon.addEventListener('input', render);
    coupon.addEventListener('change', render);
    coupon.addEventListener('submit', (e) => {
      e.preventDefault();
      const url = `https://wa.me/${WA}?text=${encodeURIComponent(compose())}`;
      const w = window.open(url, '_blank');
      if (w) w.opener = null; else location.href = url;
    });
    render();
  }
})();
