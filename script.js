/* ══════════════════════════════════════
   KOSHALYAM — SHARED SCRIPT
   Cursor · Nav · Scroll reveal · Counters
   Hero canvas · Chat · Utilities
══════════════════════════════════════ */

/* ── CONTACT FORM ── */
window.handleForm = async function (e) {
  e.preventDefault();
  const form = document.getElementById('main-form');
  const btn  = document.getElementById('f-btn');
  const err  = document.getElementById('f-error');

  btn.textContent = 'Sending…';
  btn.disabled = true;
  err.style.display = 'none';

  try {
    const res  = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: new FormData(form)
    });
    const json = await res.json();

    if (json.success) {
      form.style.display = 'none';
      document.getElementById('form-success').style.display = 'block';
    } else {
      throw new Error(json.message || 'Submission failed');
    }
  } catch (_) {
    err.style.display = 'block';
    btn.textContent = 'Send Message →';
    btn.disabled = false;
  }
};

document.addEventListener('DOMContentLoaded', function () {


  /* ── NAV SCROLL ── */
  const nav = document.getElementById('nav');
  if (nav) {
    window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 10), { passive: true });
  }

  /* ── MOBILE MENU ── */
  const ham = document.getElementById('ham');
  const mob = document.getElementById('mob-m');
  if (ham && mob) {
    ham.addEventListener('click', () => mob.classList.toggle('open'));
    mob.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mob.classList.remove('open')));
  }

  /* ── SCROLL REVEAL ── */
  const rvObs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); rvObs.unobserve(e.target); } });
  }, { threshold: .06, rootMargin: '0px 0px -24px 0px' });
  document.querySelectorAll('.r').forEach(el => rvObs.observe(el));

  /* ── COUNTER ── */
  const cntObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseInt(el.dataset.target);
      const sfx = el.dataset.suffix || '';
      const dur = 2200, start = Date.now();
      const tick = () => {
        const p = Math.min((Date.now() - start) / dur, 1);
        const ease = 1 - Math.pow(1 - p, 4);
        el.textContent = Math.floor(ease * target).toLocaleString('en-IN') + sfx;
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = target.toLocaleString('en-IN') + sfx;
      };
      requestAnimationFrame(tick);
      cntObs.unobserve(el);
    });
  }, { threshold: .4 });
  document.querySelectorAll('[data-target]').forEach(el => cntObs.observe(el));

  /* ── BAR ANIMATIONS ── */
  const barObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.querySelectorAll('[data-width]').forEach(b => { b.style.width = b.dataset.width + '%'; });
      barObs.unobserve(e.target);
    });
  }, { threshold: .3 });
  document.querySelectorAll('.bars-container').forEach(el => barObs.observe(el));

  /* ── HERO NEURAL CANVAS ── */
  const canvas = document.getElementById('hero-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let W, H, pts = [], mox = -999, moy = -999;
    document.addEventListener('mousemove', e => { mox = e.clientX; moy = e.clientY; }, { passive: true });
    function initPts () {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
      const n = Math.min(Math.floor(W * H / 18000), 80);
      pts = Array.from({ length: n }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - .5) * .18, vy: (Math.random() - .5) * .18,
        r: Math.random() * .9 + .2, pulse: Math.random() * Math.PI * 2,
        op: Math.random() * .3 + .04
      }));
    }
    window.addEventListener('resize', initPts);
    initPts();
    function drawNet () {
      ctx.clearRect(0, 0, W, H);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.pulse += .015;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        const dx = p.x - mox, dy = p.y - moy, d = Math.sqrt(dx * dx + dy * dy);
        if (d < 90) { const f = (90 - d) / 90; p.vx += (dx / d) * f * .01; p.vy += (dy / d) * f * .01; }
        p.vx *= .998; p.vy *= .998;
        const a = p.op * (0.55 + Math.sin(p.pulse) * .45);
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (1 + Math.sin(p.pulse) * .15), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.fill();
      });
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const a = pts[i], b = pts[j];
          const dx = a.x - b.x, dy = a.y - b.y, d = Math.sqrt(dx * dx + dy * dy);
          if (d < 120) {
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(255,255,255,${(1 - d / 120) * .045})`;
            ctx.lineWidth = .4; ctx.stroke();
          }
        }
      }
      requestAnimationFrame(drawNet);
    }
    drawNet();
  }

  /* ── CHAT WIDGET ── */
  const fab = document.getElementById('chat-fab');
  const panel = document.getElementById('chat-panel');
  const closeBtn = document.getElementById('chat-close');
  const inp = document.getElementById('chat-inp');
  if (fab && panel) {
    fab.addEventListener('click', () => { panel.classList.add('open'); fab.style.display = 'none'; });
    closeBtn && closeBtn.addEventListener('click', () => { panel.classList.remove('open'); fab.style.display = 'flex'; });
    const history = [{ r: 'ai', t: 'Welcome. I\'m Koshalyam\'s AI assistant. I can help you identify the right AI capability program for your organization. What brings you here?' }];

    function renderChat (typing) {
      const c = document.getElementById('chat-msgs');
      c.innerHTML = history.map(m =>
        `<div class="chat-msg${m.r === 'user' ? ' u' : ''}" style="${m.r === 'user' ? 'align-self:flex-end' : ''}">
          <div class="chat-bub ${m.r === 'ai' ? 'ai' : 'u'}">${m.t}</div>
        </div>`).join('');
      if (typing) c.innerHTML += '<div class="chat-msg"><div class="chat-dots"><div class="chat-dot"></div><div class="chat-dot"></div><div class="chat-dot"></div></div></div>';
      c.scrollTop = c.scrollHeight;
    }

    function reply (msg) {
      const m = msg.toLowerCase();
      let r;
      if (m.includes('government') || m.includes('ias') || m.includes('officer') || m.includes('department'))
        r = 'For government organizations, we recommend starting with <strong>AI Fluency for Government Officers</strong> — a 2-day intensive for IAS, IPS, and department heads. We\'ve delivered this across Madhya Pradesh. <a href="programs.html" style="color:var(--grey-2)">See all programs →</a>';
      else if (m.includes('corporate') || m.includes('company') || m.includes('enterprise') || m.includes('team'))
        r = 'For corporate organizations, <strong>AI Productivity Training</strong> delivers the fastest ROI — role-specific, 1-3 days, results within days. <a href="programs.html" style="color:var(--grey-2)">View programs →</a>';
      else if (m.includes('teacher') || m.includes('school') || m.includes('university') || m.includes('faculty'))
        r = 'For educational institutions, we offer <strong>AI for Teachers</strong>, faculty workshops, and student AI bootcamps. <a href="programs.html" style="color:var(--grey-2)">View programs →</a>';
      else if (m.includes('techseekho'))
        r = '<strong>TechSeekho</strong> is Koshalyam\'s flagship school initiative bringing coding, AI, robotics, and drone technology to school students. <a href="https://techseekho.com" target="_blank" style="color:var(--grey-2)">Visit techseekho.com →</a>';
      else if (m.includes('career') || m.includes('job') || m.includes('hir'))
        r = 'We are growing across training, business development, and operations. <a href="careers.html" style="color:var(--grey-2)">See open positions →</a>';
      else if (m.includes('price') || m.includes('cost') || m.includes('fee'))
        r = 'Pricing depends on program, organization size, and customization. <a href="contact.html" style="color:var(--grey-2)">Schedule a consultation for a tailored proposal →</a>';
      else if (m.includes('index') || m.includes('capability index') || m.includes('assess'))
        r = 'The <strong>AI Capability Index™</strong> measures organizational AI readiness across Literacy, Productivity, Transformation, and Leadership. <a href="ai-index.html" style="color:var(--grey-2)">Take the assessment →</a>';
      else
        r = 'To give you the best recommendation, could you share more about your organization and AI goals? Or <a href="contact.html" style="color:var(--grey-2)">schedule a consultation →</a>';
      history.push({ r: 'ai', t: r });
      renderChat(false);
    }

    function sendMsg (msg) {
      msg = msg.trim(); if (!msg) return;
      const sr = document.querySelector('.chat-sugg-row');
      if (sr) sr.remove();
      history.push({ r: 'user', t: msg });
      renderChat(true);
      setTimeout(() => reply(msg), 600);
    }

    window.chatSuggSend = function (btn) { sendMsg(btn.textContent); };
    window.chatInputSend = function () { sendMsg(inp.value); inp.value = ''; };
    if (inp) inp.addEventListener('keydown', e => { if (e.key === 'Enter') window.chatInputSend(); });
  }

  /* ── TAB SWITCHER ── */
  window.switchTab = function (cat, btn) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.tab-panel').forEach(p => {
      p.style.display = (cat === 'all' || p.dataset.cat === cat) ? 'block' : 'none';
    });
  };

  /* ── CLIENT TABS (homepage) ── */
  window.showClientTab = function (i, btn) {
    document.querySelectorAll('.c-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.c-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    const panels = document.querySelectorAll('.c-panel');
    if (panels[i]) panels[i].classList.add('active');
  };

  /* ── VACANCY FILTER ── */
  window.filterVacancies = function (cat, btn) {
    document.querySelectorAll('.vf-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.vac-row').forEach(v => {
      v.style.display = (cat === 'all' || v.dataset.cat === cat) ? '' : 'none';
    });
  };

  /* ── APPLY FOR ROLE (pre-fills dropdown) ── */
  window.applyForRole = function (title) {
    const sel = document.getElementById('role-select');
    if (sel) {
      for (let i = 0; i < sel.options.length; i++) {
        if (sel.options[i].text === title) { sel.selectedIndex = i; break; }
      }
    }
    const target = document.getElementById('apply-form');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => target.focus(), 700);
    }
  };

  /* ── FILE UPLOAD DISPLAY ── */
  window.handleFileUpload = function (input, displayId) {
    const f = input.files[0];
    if (!f) return;
    const sizeKB = Math.round(f.size / 1024);
    document.getElementById(displayId).textContent = '✓ ' + f.name + ' (' + sizeKB + ' KB)';
  };

  /* ── FORM SUBMIT ── */
  window.submitKoshalyamForm = function (e, formId, btnId, successId) {
    e.preventDefault();
    const btn = document.getElementById(btnId);
    btn.textContent = 'Sending…'; btn.disabled = true;
    setTimeout(() => {
      document.getElementById(formId).style.display = 'none';
      document.getElementById(successId).style.display = 'block';
    }, 900);
  };

  /* ── AI READINESS ASSESSMENT ── */
  const assessQs = [
    { q: 'What type of organization are you?', opts: [
      { l: 'Government / Public Sector', s: 2 },
      { l: 'Large Corporate (1000+)', s: 3 },
      { l: 'SME / Mid-size Corporate', s: 2 },
      { l: 'University / Educational Institution', s: 2 },
      { l: 'PSU / Public Institution', s: 2 }
    ]},
    { q: 'How many employees in your organization?', opts: [
      { l: 'Less than 50', s: 1 },
      { l: '50 to 200', s: 2 },
      { l: '200 to 1000', s: 3 },
      { l: '1000 to 5000', s: 4 },
      { l: 'More than 5000', s: 5 }
    ]},
    { q: 'Current AI tool usage level?', opts: [
      { l: 'No AI tools used yet', s: 0 },
      { l: 'A few individuals use AI informally', s: 1 },
      { l: 'Some departments have piloted AI', s: 2 },
      { l: 'AI deployed but inconsistently used', s: 3 },
      { l: 'AI integrated in key processes', s: 4 }
    ]},
    { q: 'Leadership awareness of AI\'s impact?', opts: [
      { l: 'Minimal — not on the agenda', s: 0 },
      { l: 'General awareness, no plans', s: 1 },
      { l: 'Leadership is aware and supportive', s: 2 },
      { l: 'Leadership has begun AI exploration', s: 3 },
      { l: 'AI is a stated strategic priority', s: 4 }
    ]},
    { q: 'Primary AI goal for next 12 months?', opts: [
      { l: 'Build basic AI awareness', s: 1 },
      { l: 'Train teams in AI productivity tools', s: 2 },
      { l: 'Develop organizational AI strategy', s: 3 },
      { l: 'Integrate AI into key workflows', s: 4 },
      { l: 'Become an AI-led organization', s: 5 }
    ]}
  ];

  let aStep = 0, aScore = 0, aHist = [];

  function aRender () {
    const q = assessQs[aStep];
    const fill = document.getElementById('apf');
    const lbl = document.getElementById('aq-count');
    const back = document.getElementById('ab-back');
    const text = document.getElementById('aq-text');
    const opts = document.getElementById('aq-opts');
    if (!fill) return;
    fill.style.width = (aStep / assessQs.length * 100) + '%';
    lbl.textContent = `Question ${aStep + 1} of ${assessQs.length}`;
    back.style.display = aStep > 0 ? 'block' : 'none';
    text.textContent = q.q;
    opts.innerHTML = q.opts.map(o =>
      `<button class="assess-opt" onclick="window.aSelect(${o.s})"><span>${o.l}</span><span class="assess-opt-arr">→</span></button>`
    ).join('');
  }

  window.aSelect = function (s) {
    aHist.push(s); aScore += s;
    if (aStep < assessQs.length - 1) { aStep++; aRender(); }
    else aShowResult();
  };

  window.aBack = function () {
    if (aStep > 0) { aScore -= aHist.pop(); aStep--; aRender(); }
  };

  window.aReset = function () {
    aStep = 0; aScore = 0; aHist = [];
    document.getElementById('assess-qs-section').style.display = 'block';
    document.getElementById('assess-result-section').style.display = 'none';
    aRender();
  };

  function aShowResult () {
    const max = assessQs.reduce((s, q) => s + Math.max(...q.opts.map(o => o.s)), 0);
    const pct = Math.round(aScore / max * 100);
    document.getElementById('assess-qs-section').style.display = 'none';
    document.getElementById('assess-result-section').style.display = 'block';
    let n = 0;
    const t = setInterval(() => {
      n = Math.min(n + 2, pct);
      document.getElementById('as-num').textContent = n;
      if (n >= pct) clearInterval(t);
    }, 20);
    setTimeout(() => { document.getElementById('as-bar').style.width = pct + '%'; }, 50);

    let tier, desc, recs;
    if (pct <= 30) {
      tier = 'Emerging — Stage 1';
      desc = 'Your organization is at the beginning of the AI journey. Building foundational AI literacy across leadership is the immediate priority.';
      recs = [{ t: 'AI Literacy Workshop for Leadership', top: true }, { t: 'AI Awareness Program for All Staff' }, { t: 'AI Opportunity Identification Session' }];
    } else if (pct <= 55) {
      tier = 'Developing — Stage 2';
      desc = 'AI awareness exists but capability has not been built. Structured AI productivity training generates measurable returns immediately.';
      recs = [{ t: 'AI Productivity Training for Key Teams', top: true }, { t: 'AI Strategy Workshop for Leadership' }, { t: 'Role-Specific AI Tool Training Program' }];
    } else if (pct <= 75) {
      tier = 'Advancing — Stage 3';
      desc = 'Meaningful AI progress has been made. Focus on deepening capability and embedding AI systematically into workflows.';
      recs = [{ t: 'AI Transformation Consulting', top: true }, { t: 'AI Governance Framework Development' }, { t: 'Advanced AI Productivity Training' }];
    } else {
      tier = 'Leading — Stage 4';
      desc = 'Your organization is at the leading edge. Priority is sustaining the advantage and developing internal AI leadership.';
      recs = [{ t: 'AI Leadership Development Program', top: true }, { t: 'AI Transformation Strategy — 6 month' }, { t: 'AI Culture & Organizational Design' }];
    }
    document.getElementById('as-tier').textContent = tier;
    document.getElementById('as-desc').textContent = desc;
    document.getElementById('as-recs').innerHTML = recs.map(r =>
      `<div class="assess-rec${r.top ? ' top' : ''}">${r.top ? '<strong>Priority: </strong>' : ''}${r.t}</div>`
    ).join('');
  }

  if (document.getElementById('aq-text')) aRender();

  /* ── AI CAPABILITY INDEX CALCULATOR ── */
  window.updateIndexCalc = function () {
    const vals = [1, 2, 3, 4].map(i => parseInt(document.getElementById('is-' + i).value));
    vals.forEach((v, i) => {
      const vEl = document.getElementById('iv-' + (i + 1));
      const bEl = document.getElementById('ib-' + (i + 1));
      if (vEl) vEl.textContent = v;
      if (bEl) bEl.style.height = v + '%';
    });
    const avg = Math.round(vals.reduce((s, v) => s + v, 0) / 4);
    const tot = document.getElementById('index-total');
    const tierEl = document.getElementById('index-tier-name');
    const rt = document.getElementById('index-result-tier');
    const rd = document.getElementById('index-result-desc');
    const rr = document.getElementById('index-result-rec');
    if (tot) tot.textContent = avg;
    let tier, desc, rec;
    if (avg < 25) { tier = 'Emerging'; desc = 'Foundational AI literacy is the priority.'; rec = 'AI Literacy Workshop → AI Productivity Training'; }
    else if (avg < 50) { tier = 'Developing'; desc = 'Workforce productivity training delivers immediate ROI.'; rec = 'AI Productivity Training → Transformation Consulting'; }
    else if (avg < 75) { tier = 'Advancing'; desc = 'Focus on governance and systematic integration.'; rec = 'Transformation Consulting → Leadership Program'; }
    else { tier = 'Leading'; desc = 'Build sustainable AI capability infrastructure.'; rec = 'AI Leadership Program → Strategic Partnership'; }
    if (tierEl) tierEl.textContent = tier;
    if (rt) rt.textContent = tier + ' — AI Capability Stage';
    if (rd) rd.textContent = desc;
    if (rr) rr.textContent = 'Recommended: ' + rec;
  };
  if (document.getElementById('index-total')) window.updateIndexCalc();

});
