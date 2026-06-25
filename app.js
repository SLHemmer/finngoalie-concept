/* ============================================================================
   FINNGOALIE — INTERACTION LIBRARY  ·  "Apple product-led, vision-tech soul"
   ----------------------------------------------------------------------------
   Self-contained, vanilla JS, zero deps. Loaded site-wide. Every module is
   defensive (no-op if its hook isn't on the page) and reduced-motion safe.

   HOOKS OTHER PAGES CAN COMPOSE
     <body> .aurora-canvas#aurora ............ living light background
     .nav#nav ............................... gains .scrolled past 20px
     [data-burger] / .drawer#drawer ......... mobile drawer open/close
     [data-bag-add] ......................... increments any [data-bag-count]
     .reveal[+ .r-clip|.r-mask|.r-scale|.r-left|.r-right] .. varied scroll reveals
     .stagger ............................... reveal + staggered children
     [data-count][data-dec][data-suffix][data-prefix] ..... count-up (never stuck 0)
     .magnetic .............................. magnetic + springy hover
     [data-tilt] ............................ 3D tilt + cursor spotlight
     a[href^="#"] ........................... smooth in-page scroll
     .pin-section ........................... pinned scroll-scrub product sequence
     .stickybuy#stickybuy[data-buy-trigger] . sticky buy-bar (auto show/hide)
     [data-accordion] > [data-acc-item] ..... tech-specs accordion
     [data-filter] [data-chip] .............. filter chips
     canvas[data-puck-tracker] .............. AUTO-MOUNTS the PuckTracker module
   ============================================================================ */
(function(){
  "use strict";

  var RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE = window.matchMedia && window.matchMedia('(pointer:fine)').matches;
  var CY = "#1d6cff";                 /* the one accent — used by the canvas modules */

  function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }
  function lerp(a,b,t){ return a+(b-a)*t; }

  /* ==========================================================
     THE XTRACKER — injected SVG product (sculpted object)
     Rendered, not stock. Reused in hero whisper + pinned stage.
     ========================================================== */
  var TRACKER_SVG =
    '<svg class="tracker-svg" viewBox="0 0 240 252" xmlns="http://www.w3.org/2000/svg">'+
    '<defs>'+
      '<linearGradient id="bodyG" x1="0" y1="0" x2="0" y2="1">'+
        '<stop offset="0" stop-color="#2a2f37"/><stop offset=".5" stop-color="#15181d"/><stop offset="1" stop-color="#070809"/>'+
      '</linearGradient>'+
      '<linearGradient id="rimG" x1="0" y1="0" x2="1" y2="1">'+
        '<stop offset="0" stop-color="#454b54"/><stop offset="1" stop-color="#1a1d22"/>'+
      '</linearGradient>'+
      '<radialGradient id="faceG" cx="50%" cy="38%" r="70%">'+
        '<stop offset="0" stop-color="#222730"/><stop offset="1" stop-color="#0c0e12"/>'+
      '</radialGradient>'+
      '<radialGradient id="lensG" cx="42%" cy="36%" r="65%">'+
        '<stop offset="0" stop-color="#5b8bff"/><stop offset=".4" stop-color="#1d6cff"/><stop offset="1" stop-color="#0a2f7a"/>'+
      '</radialGradient>'+
      '<linearGradient id="hiG" x1="0" y1="0" x2="0" y2="1">'+
        '<stop offset="0" stop-color="#ffffff" stop-opacity=".5"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/>'+
      '</linearGradient>'+
    '</defs>'+
    '<rect x="24" y="20" width="192" height="212" rx="40" fill="url(#bodyG)"/>'+
    '<rect x="24" y="20" width="192" height="212" rx="40" fill="none" stroke="url(#rimG)" stroke-width="2.5"/>'+
    '<rect x="40" y="36" width="160" height="180" rx="30" fill="url(#faceG)"/>'+
    '<rect x="40" y="36" width="160" height="180" rx="30" fill="url(#hiG)" opacity=".5"/>'+
    '<circle cx="120" cy="118" r="46" fill="url(#lensG)"/>'+
    '<circle cx="120" cy="118" r="46" fill="none" stroke="#0a2f7a" stroke-width="2"/>'+
    '<circle cx="120" cy="118" r="22" fill="#0a0c10" opacity=".55"/>'+
    '<circle cx="106" cy="104" r="10" fill="#cfe0ff" opacity=".7"/>'+
    '<g class="leds">'+
      '<circle cx="120" cy="62" r="4.5" fill="#1d6cff"/>'+
      '<circle cx="166" cy="80" r="4.5" fill="#1d6cff"/>'+
      '<circle cx="178" cy="130" r="4.5" fill="#1d6cff"/>'+
      '<circle cx="162" cy="178" r="4.5" fill="#1d6cff"/>'+
      '<circle cx="120" cy="196" r="4.5" fill="#1d6cff"/>'+
      '<circle cx="78" cy="178" r="4.5" fill="#1d6cff"/>'+
      '<circle cx="62" cy="130" r="4.5" fill="#1d6cff"/>'+
      '<circle cx="74" cy="80" r="4.5" fill="#1d6cff"/>'+
    '</g>'+
    '<text x="120" y="206" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="#5a6470" letter-spacing="2">XTRACKER</text>'+
    '</svg>';

  document.querySelectorAll('[data-tracker-mount]').forEach(function(el){ el.innerHTML = TRACKER_SVG; });

  /* twinkle the LEDs (subtle, sequential) */
  if(!RM){
    document.querySelectorAll('.leds').forEach(function(g){
      var leds = g.querySelectorAll('circle');
      var i = 0;
      setInterval(function(){
        leds.forEach(function(l){ l.setAttribute('opacity','.32'); });
        leds[i % leds.length].setAttribute('opacity','1');
        i++;
      }, 420);
    });
  }

  /* ==========================================================
     NAV — scrolled state + mobile drawer
     ========================================================== */
  var nav = document.getElementById('nav');
  function onScrollNav(){ if(nav) nav.classList.toggle('scrolled', window.scrollY > 20); }
  onScrollNav();

  var drawer = document.getElementById('drawer');
  document.querySelectorAll('[data-burger]').forEach(function(b){
    b.addEventListener('click', function(){
      if(!drawer) return;
      var open = drawer.classList.toggle('open');
      b.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
  });
  document.querySelectorAll('[data-drawer-close]').forEach(function(a){
    a.addEventListener('click', function(){
      if(drawer) drawer.classList.remove('open');
      document.querySelectorAll('[data-burger]').forEach(function(b){ b.classList.remove('open'); });
      document.body.style.overflow = '';
    });
  });

  /* ==========================================================
     BAG — demo cart counter
     ========================================================== */
  var bagN = 0;
  document.querySelectorAll('[data-bag-add]').forEach(function(b){
    b.addEventListener('click', function(){
      bagN++;
      document.querySelectorAll('[data-bag-count]').forEach(function(c){ c.textContent = bagN; });
    });
  });

  /* ==========================================================
     SMOOTH IN-PAGE SCROLL (offset for fixed nav)
     ========================================================== */
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    var id = a.getAttribute('href');
    if(id.length < 2) return;
    a.addEventListener('click', function(e){
      var t = document.querySelector(id);
      if(!t) return;
      e.preventDefault();
      var y = t.getBoundingClientRect().top + window.scrollY - 54;
      window.scrollTo({ top:y, behavior: RM ? 'auto' : 'smooth' });
      if(drawer) drawer.classList.remove('open');
      document.querySelectorAll('[data-burger]').forEach(function(b){ b.classList.remove('open'); });
      document.body.style.overflow = '';
    });
  });

  /* ==========================================================
     VARIED SCROLL REVEALS  (clip / mask / slide / scale / stagger)
     ========================================================== */
  var revealIO = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if(!en.isIntersecting) return;
      var d = en.target.getAttribute('data-reveal-delay');
      if(d) en.target.style.transitionDelay = d + 'ms';
      en.target.classList.add('in');
      revealIO.unobserve(en.target);
    });
  }, { threshold:.14, rootMargin:'0px 0px -8% 0px' });
  document.querySelectorAll('.reveal, .stagger').forEach(function(el){ revealIO.observe(el); });

  /* ==========================================================
     COUNT-UP  (NEVER shows a stuck 0)
     - reduced-motion: set final value immediately
     - normal: rAF ease-out-cubic, fires reliably on first reveal
     ========================================================== */
  function fmt(v, dec){
    return dec > 0 ? v.toFixed(dec) : Math.round(v).toLocaleString('en-US');
  }
  function animateCount(el){
    var target = parseFloat(el.getAttribute('data-count'));
    if(isNaN(target)) return;
    var dec = parseInt(el.getAttribute('data-dec') || '0', 10);
    var pre = el.getAttribute('data-prefix') || '';
    var suf = el.getAttribute('data-suffix') || '';
    /* reduced-motion OR no rAF: snap to final, no stuck 0 ever */
    if(RM){ el.textContent = pre + fmt(target, dec) + suf; return; }
    var dur = 1500, start = null;
    function step(now){
      if(start === null) start = now;
      var p = clamp((now - start) / dur, 0, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      /* keep value strictly > 0 the instant animation begins → no stuck 0 */
      var v = Math.max(target * eased, p > 0 ? (dec > 0 ? Math.pow(10, -dec) : 1) : 0);
      el.textContent = pre + fmt(v, dec) + suf;
      if(p < 1) requestAnimationFrame(step);
      else el.textContent = pre + fmt(target, dec) + suf;   /* lock exact final */
    }
    requestAnimationFrame(step);
  }
  var countEls = document.querySelectorAll('[data-count]');
  /* Failsafe: under reduced-motion (or if rAF/IO never fire) resolve all now */
  if(RM){
    countEls.forEach(animateCount);
  } else {
    var countIO = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(!en.isIntersecting) return;
        countIO.unobserve(en.target);
        animateCount(en.target);
      });
    }, { threshold:.4 });
    countEls.forEach(function(el){ countIO.observe(el); });
    /* Safety net: any counter still showing 0 after 3s gets resolved */
    setTimeout(function(){
      countEls.forEach(function(el){
        if(/^0[^.\d]?$/.test(el.textContent.trim()) || el.textContent.trim() === '0'){
          animateCount(el);
        }
      });
    }, 3000);
  }

  /* ==========================================================
     MAGNETIC BUTTONS  (+ springy via CSS active scale)
     ========================================================== */
  if(!RM && FINE){
    document.querySelectorAll('.magnetic').forEach(function(btn){
      btn.addEventListener('mousemove', function(e){
        var r = btn.getBoundingClientRect();
        var mx = e.clientX - r.left - r.width/2;
        var my = e.clientY - r.top - r.height/2;
        btn.style.transform = 'translate(' + (mx*.26) + 'px,' + (my*.3) + 'px)';
      });
      btn.addEventListener('mouseleave', function(){ btn.style.transform = ''; });
    });
    /* tilt + spotlight */
    document.querySelectorAll('[data-tilt]').forEach(function(el){
      el.addEventListener('mousemove', function(e){
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left)/r.width, py = (e.clientY - r.top)/r.height;
        el.style.transform = 'perspective(820px) rotateY(' + ((px-.5)*6) + 'deg) rotateX(' + ((.5-py)*6) + 'deg) translateY(-6px)';
        el.style.setProperty('--mx', (px*100)+'%');
        el.style.setProperty('--my', (py*100)+'%');
      });
      el.addEventListener('mouseleave', function(){ el.style.transform = ''; });
    });
  }

  /* ==========================================================
     ACCORDION  (tech-specs disclosure)
     ========================================================== */
  document.querySelectorAll('[data-accordion]').forEach(function(acc){
    acc.querySelectorAll('[data-acc-head]').forEach(function(head){
      head.addEventListener('click', function(){
        var item = head.closest('[data-acc-item]');
        var body = item.querySelector('[data-acc-body]');
        var isOpen = item.classList.contains('open');
        /* single-open behaviour */
        acc.querySelectorAll('[data-acc-item].open').forEach(function(o){
          o.classList.remove('open');
          var ob = o.querySelector('[data-acc-body]');
          if(ob) ob.style.maxHeight = '0px';
        });
        if(!isOpen){
          item.classList.add('open');
          if(body) body.style.maxHeight = body.scrollHeight + 'px';
        }
      });
    });
  });

  /* ==========================================================
     FILTER CHIPS  (toggle .active, fire data-filter callback hook)
     ========================================================== */
  document.querySelectorAll('[data-filter]').forEach(function(group){
    var chips = group.querySelectorAll('[data-chip]');
    chips.forEach(function(chip){
      chip.addEventListener('click', function(){
        chips.forEach(function(c){ c.classList.remove('active'); });
        chip.classList.add('active');
        var val = chip.getAttribute('data-chip');
        group.setAttribute('data-active-chip', val);
        var scope = group.getAttribute('data-filter');
        document.querySelectorAll('[data-filter-target="'+scope+'"] [data-tag]').forEach(function(t){
          var show = val === 'all' || (' '+t.getAttribute('data-tag')+' ').indexOf(' '+val+' ') > -1;
          t.style.display = show ? '' : 'none';
        });
      });
    });
  });

  /* ==========================================================
     LIVING AURORA  (canvas, breathing blobs)
     ========================================================== */
  (function aurora(){
    var c = document.getElementById('aurora');
    if(!c) return;
    var ctx = c.getContext('2d');
    var DPR = Math.min(window.devicePixelRatio || 1, 2);
    var blobs = [
      {x:.22,y:.18,r:.42,h:[29,108,255], a:.14,sx:.00007,sy:.00005,p:0},
      {x:.80,y:.30,r:.38,h:[120,170,255],a:.10,sx:-.00006,sy:.00008,p:2},
      {x:.55,y:.82,r:.46,h:[29,108,255], a:.09,sx:.00005,sy:-.00006,p:4},
      {x:.10,y:.75,r:.34,h:[180,200,255],a:.08,sx:.00008,sy:.00004,p:1}
    ];
    function size(){ c.width = innerWidth*DPR; c.height = innerHeight*DPR; c.style.width = innerWidth+'px'; c.style.height = innerHeight+'px'; }
    size(); addEventListener('resize', size);
    var t0 = performance.now();
    function draw(now){
      var t = now - t0;
      ctx.clearRect(0,0,c.width,c.height);
      ctx.globalCompositeOperation = 'lighter';
      for(var i=0;i<blobs.length;i++){
        var b = blobs[i];
        var bx = (b.x + Math.sin(t*b.sx + b.p)*.06)*c.width;
        var by = (b.y + Math.cos(t*b.sy + b.p)*.06)*c.height;
        var br = (b.r + Math.sin(t*.0003 + b.p)*.04)*Math.max(c.width,c.height);
        var g = ctx.createRadialGradient(bx,by,0,bx,by,br);
        var col = b.h;
        g.addColorStop(0,'rgba('+col[0]+','+col[1]+','+col[2]+','+b.a+')');
        g.addColorStop(1,'rgba('+col[0]+','+col[1]+','+col[2]+',0)');
        ctx.fillStyle = g;
        ctx.fillRect(0,0,c.width,c.height);
      }
      ctx.globalCompositeOperation = 'source-over';
      if(!RM) requestAnimationFrame(draw);
    }
    if(RM){ draw(performance.now()); } else { requestAnimationFrame(draw); }
  })();

  /* ==========================================================
     PINNED SCROLL-SCRUB PRODUCT SEQUENCE
     ========================================================== */
  var pinSection  = document.querySelector('.pin-section');
  var stageProd   = document.getElementById('stageProd');
  var pinBar      = document.getElementById('pinBar');
  var pinStageNum = document.getElementById('pinStage');
  var copies      = document.querySelectorAll('.stage-copy');
  var callGroups  = document.querySelectorAll('.call-grp');
  var callLines   = document.querySelectorAll('.call-line');

  callLines.forEach(function(p){
    var len = p.getTotalLength();
    p.style.strokeDasharray = len;
    p.style.strokeDashoffset = len;
    p.setAttribute('data-len', len);
  });

  function setStage(prog){
    if(!stageProd) return;
    var scale, rotY, rotZ, ty;
    if(prog < 0.28){
      var t = prog/0.28;
      scale = lerp(0.78,1.0,t); rotY = lerp(-14,0,t); rotZ = lerp(2,0,t); ty = lerp(20,0,t);
    } else if(prog < 0.52){
      var t2 = (prog-0.28)/0.24;
      scale = lerp(1.0,1.18,t2); rotY = lerp(0,10,t2); rotZ = lerp(0,-2,t2); ty = 0;
    } else if(prog < 0.76){
      var t3 = (prog-0.52)/0.24;
      scale = lerp(1.18,1.04,t3); rotY = lerp(10,-18,t3); rotZ = lerp(-2,4,t3); ty = 0;
    } else {
      var t4 = (prog-0.76)/0.24;
      scale = lerp(1.04,0.94,t4); rotY = lerp(-18,0,t4); rotZ = lerp(4,0,t4); ty = lerp(0,-10,t4);
    }
    stageProd.style.transform = 'perspective(1400px) translateY('+ty+'px) rotateY('+rotY+'deg) rotateZ('+rotZ+'deg) scale('+scale+')';

    var seg = 1/4;
    copies.forEach(function(c,i){
      var center = (i+0.5)*seg;
      var d = Math.abs(prog-center);
      var op = clamp(1-(d/(seg*0.62)),0,1);
      c.style.opacity = op;
      c.style.transform = 'translateY('+((1-op)*18)+'px)';
    });

    var callProg = clamp((prog-0.05)/0.18,0,1);
    var hideCalls = prog > 0.30;
    callLines.forEach(function(p){
      var len = parseFloat(p.getAttribute('data-len'));
      p.style.strokeDashoffset = hideCalls ? len : len*(1-callProg);
    });
    callGroups.forEach(function(g){ g.classList.toggle('show', callProg > 0.02 && !hideCalls); });

    if(pinBar) pinBar.style.width = (prog*100)+'%';
    var stg = prog<0.28?1 : prog<0.52?2 : prog<0.76?3 : 4;
    if(pinStageNum) pinStageNum.textContent = '0'+stg;
  }

  function onPinScroll(){
    if(!pinSection) return;
    var rect = pinSection.getBoundingClientRect();
    var total = pinSection.offsetHeight - innerHeight;
    var scrolled = clamp(-rect.top, 0, total);
    var prog = total > 0 ? scrolled/total : 0;
    setStage(prog);
  }

  /* ==========================================================
     STICKY BUY BAR  (auto show after hero, hide near buy/footer)
     ========================================================== */
  var sticky = document.getElementById('stickybuy');
  var buyTrigger = document.querySelector('[data-buy-trigger]');
  var trustEl = document.querySelector('.trust');
  var footEl = document.querySelector('footer');
  function onStickyScroll(){
    if(!sticky) return;
    var pastHero = trustEl ? trustEl.getBoundingClientRect().bottom < 0 : window.scrollY > innerHeight*0.8;
    var inBuy = false;
    if(buyTrigger){
      var r = buyTrigger.getBoundingClientRect();
      inBuy = r.top < innerHeight*.6 && r.bottom > innerHeight*.2;
    }
    var atFooter = footEl ? footEl.getBoundingClientRect().top < innerHeight*.9 : false;
    sticky.classList.toggle('show', pastHero && !inBuy && !atFooter);
  }

  /* ==========================================================
     MASTER SCROLL LOOP (rAF-throttled)
     ========================================================== */
  var ticking = false;
  function onScroll(){
    if(!ticking){
      requestAnimationFrame(function(){
        onScrollNav();
        onStickyScroll();
        if(!RM) onPinScroll();
        ticking = false;
      });
      ticking = true;
    }
  }
  addEventListener('scroll', onScroll, {passive:true});
  addEventListener('resize', onScroll, {passive:true});

  if(RM){
    callLines.forEach(function(p){ p.style.strokeDashoffset = 0; });
    callGroups.forEach(function(g){ g.classList.add('show'); });
    copies.forEach(function(c){ c.style.opacity = 1; c.style.position = 'relative'; });
    if(stageProd) stageProd.style.transform = 'none';
  } else {
    onPinScroll(); onStickyScroll();
  }

  /* ============================================================================
     PUCK-TRACKER  — reusable rAF canvas module (ported from run-a)
     ----------------------------------------------------------------------------
     Auto-mounts on every <canvas data-puck-tracker>. The puck streaks across on
     a bezier arc; a reticle predicts a LEAD point ahead of it, eases in, and
     SNAPS to LOCK with corner brackets — feeding the live HUD readout.
       data-readout="<id>"  optional id of a container with [data-vel]/[data-lock]/[data-ang]
     Self-contained · resize-aware · pauses fully off-screen · reduced-motion safe.
     ============================================================================ */
  function mountPuckTracker(canvas){
    var ctx = canvas.getContext('2d');
    var W = 0, H = 0, DPR = Math.min(window.devicePixelRatio || 1, 2);

    function resize(){
      var host = canvas.parentElement || canvas;
      var rect = host.getBoundingClientRect();
      W = rect.width || canvas.clientWidth;
      H = rect.height || canvas.clientHeight;
      canvas.width = W*DPR; canvas.height = H*DPR;
      ctx.setTransform(DPR,0,0,DPR,0,0);
    }
    resize();
    window.addEventListener('resize', resize, {passive:true});

    /* readout hooks (optional) */
    var ro = null;
    var roId = canvas.getAttribute('data-readout');
    if(roId) ro = document.getElementById(roId);
    function rEl(k){ return ro ? ro.querySelector('[data-'+k+']') : null; }
    var velEl = rEl('vel'), lockEl = rEl('lock'), angEl = rEl('ang');

    var puck = null, reticle = {x:0,y:0}, locked = false, lastVel = 0, lastAng = 0, trail = [];
    function launch(){
      var fromLeft = Math.random() > 0.45;
      var startY = H*(0.32 + Math.random()*0.42);
      var endY = H*(0.30 + Math.random()*0.42);
      puck = {
        x: fromLeft ? -40 : W+40,
        y: startY,
        tx: fromLeft ? W+60 : -60,
        ty: endY,
        t: 0,
        speed: 0.0040 + Math.random()*0.0026,
        arc: (Math.random()-0.5)*0.5
      };
      locked = false; trail = [];
      reticle.x = W*0.5; reticle.y = H*0.5;
    }
    launch();

    /* off-screen pause: only run rAF while the canvas is visible */
    var visible = true;
    var vio = new IntersectionObserver(function(es){
      es.forEach(function(e){ visible = e.isIntersecting; });
    }, {threshold:0});
    vio.observe(canvas);

    function drawReticle(x,y,r,lock){
      ctx.save();
      ctx.translate(x,y);
      ctx.strokeStyle = CY;
      ctx.globalAlpha = lock ? 0.95 : 0.55;
      ctx.lineWidth = 1.4;
      ctx.save();
      ctx.rotate(performance.now()*0.0011);
      ctx.setLineDash([r*0.5, r*0.35]);
      ctx.beginPath(); ctx.arc(0,0,r,0,Math.PI*2); ctx.stroke();
      ctx.restore();
      ctx.setLineDash([]);
      ctx.globalAlpha = lock ? 0.9 : 0.4;
      ctx.beginPath(); ctx.arc(0,0,r*0.55,0,Math.PI*2); ctx.stroke();
      var t = r*1.5;
      ctx.beginPath();
      ctx.moveTo(-t,0); ctx.lineTo(-r*0.55,0);
      ctx.moveTo(r*0.55,0); ctx.lineTo(t,0);
      ctx.moveTo(0,-t); ctx.lineTo(0,-r*0.55);
      ctx.moveTo(0,r*0.55); ctx.lineTo(0,t);
      ctx.stroke();
      if(lock){
        var b = r*1.25, l = r*0.4;
        ctx.lineWidth = 2;
        [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(s){
          ctx.beginPath();
          ctx.moveTo(s[0]*b, s[1]*b - s[1]*l);
          ctx.lineTo(s[0]*b, s[1]*b);
          ctx.lineTo(s[0]*b - s[0]*l, s[1]*b);
          ctx.stroke();
        });
      }
      ctx.restore();
    }

    function frame(){
      requestAnimationFrame(frame);
      if(!visible) return;                 /* pause off-screen (rAF stays alive, draws skip) */
      ctx.clearRect(0,0,W,H);
      if(!puck) return;

      puck.t += puck.speed;
      var tt = puck.t;
      var mx = (puck.x + puck.tx)/2;
      var my = (puck.y + puck.ty)/2 + puck.arc*H;
      var px = (1-tt)*(1-tt)*puck.x + 2*(1-tt)*tt*mx + tt*tt*puck.tx;
      var py = (1-tt)*(1-tt)*puck.y + 2*(1-tt)*tt*my + tt*tt*puck.ty;
      var nt = Math.min(tt+0.01,1);
      var nx = (1-nt)*(1-nt)*puck.x + 2*(1-nt)*nt*mx + nt*nt*puck.tx;
      var ny = (1-nt)*(1-nt)*puck.y + 2*(1-nt)*nt*my + nt*nt*puck.ty;
      var vx = nx-px, vy = ny-py;

      trail.push({x:px,y:py}); if(trail.length > 26) trail.shift();
      for(var i=0;i<trail.length;i++){
        var a = (i/trail.length);
        ctx.beginPath();
        ctx.fillStyle = 'rgba(29,108,255,'+(a*0.30)+')';
        ctx.arc(trail[i].x, trail[i].y, 1.5+a*5, 0, Math.PI*2);
        ctx.fill();
      }

      var lead = locked ? 26 : 70;
      var targetX = px + vx*lead, targetY = py + vy*lead;
      reticle.x += (targetX - reticle.x)*0.14;
      reticle.y += (targetY - reticle.y)*0.14;
      var dist = Math.hypot(reticle.x-px, reticle.y-py);
      if(!locked && dist < 46) locked = true;

      /* tracking line reticle → puck */
      ctx.save();
      ctx.strokeStyle = 'rgba(29,108,255,.5)';
      ctx.lineWidth = 1; ctx.setLineDash([4,5]);
      ctx.beginPath(); ctx.moveTo(reticle.x,reticle.y); ctx.lineTo(px,py); ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      /* lead vector */
      ctx.save();
      ctx.strokeStyle = 'rgba(29,108,255,.7)';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(px,py); ctx.lineTo(px+vx*16, py+vy*16); ctx.stroke();
      ctx.restore();

      /* the puck */
      ctx.save();
      ctx.shadowColor = CY; ctx.shadowBlur = 14;
      ctx.fillStyle = '#0a0d12';
      ctx.beginPath(); ctx.ellipse(px,py,8,4.5,Math.atan2(vy,vx),0,Math.PI*2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = CY; ctx.lineWidth = 1.2; ctx.stroke();
      ctx.restore();

      drawReticle(reticle.x, reticle.y, 26, locked);

      /* live HUD readout */
      var velMph = Math.min(99, Math.round(Math.hypot(vx,vy)*22 + 60));
      var ang = Math.round(Math.atan2(vy,vx)*180/Math.PI);
      lastVel += (velMph-lastVel)*0.2; lastAng += (ang-lastAng)*0.2;
      if(velEl)  velEl.textContent  = Math.round(lastVel) + ' mph';
      if(angEl)  angEl.textContent  = Math.round(lastAng) + '°';
      if(lockEl){
        lockEl.textContent = locked ? 'LOCKED' : 'ACQUIRING';
        lockEl.style.color = locked ? CY : '#b88a2e';
      }

      if(puck.t >= 1){ puck = null; setTimeout(launch, 350 + Math.random()*600); }
    }

    if(RM){
      /* reduced-motion: paint ONE locked frame statically, set readout finals */
      reticle.x = W*0.5; reticle.y = H*0.45; locked = true;
      ctx.clearRect(0,0,W,H);
      drawReticle(reticle.x, reticle.y, 26, true);
      if(velEl) velEl.textContent = '92 mph';
      if(angEl) angEl.textContent = '7°';
      if(lockEl){ lockEl.textContent = 'LOCKED'; lockEl.style.color = CY; }
    } else {
      requestAnimationFrame(frame);
    }
  }

  document.querySelectorAll('canvas[data-puck-tracker]').forEach(mountPuckTracker);

})();
