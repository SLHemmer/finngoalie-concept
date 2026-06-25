/* Finngoalie — interaction library v2 ("Apple of the Crease")
   Hooks: data-reveal · [data-pin]/[data-pin-stage]/.beat · data-count ·
   [data-buybar]/[data-buybar-trigger] · [data-specs] · .hscroll · nav.scrolled ·
   [data-open-nav]/[data-close-nav] · [data-add] · [data-filter-group] · [data-parallax]
   Respects prefers-reduced-motion. */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- reveal on enter ---- */
  var revs = document.querySelectorAll("[data-reveal]");
  if (revs.length) {
    var ro = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          var d = e.target.getAttribute("data-reveal-delay");
          if (d) e.target.style.transitionDelay = d + "ms";
          e.target.classList.add("in");
          ro.unobserve(e.target);
        }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });
    revs.forEach(function (el) { ro.observe(el); });
  }

  /* ---- count-up ---- */
  function countUp(el) {
    var raw = el.getAttribute("data-count");
    var target = parseFloat(raw);
    var suffix = el.getAttribute("data-count-suffix") || "";
    var decimals = (raw.split(".")[1] || "").length;
    if (reduce || isNaN(target)) { el.textContent = raw + suffix; return; }
    var start = performance.now(), dur = 1400;
    function tick(now) {
      var p = Math.min((now - start) / dur, 1);
      var e = 1 - Math.pow(1 - p, 3);
      var v = (target * e).toFixed(decimals);
      el.textContent = Number(v).toLocaleString("en-US") + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  var counters = document.querySelectorAll("[data-count]");
  if (counters.length) {
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { countUp(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { co.observe(el); });
  }

  /* ---- pinned scroll sequences ---- */
  function initPins() {
    document.querySelectorAll("[data-pin]").forEach(function (pin) {
      var stage = pin.querySelector("[data-pin-stage]");
      if (!stage) return;
      function onScroll() {
        var r = pin.getBoundingClientRect();
        var total = pin.offsetHeight - window.innerHeight;
        var p = total > 0 ? Math.min(Math.max(-r.top / total, 0), 1) : 0;
        pin.style.setProperty("--p", p.toFixed(4));
        stage.classList.remove("beat-0", "beat-1", "beat-2");
        stage.classList.add("beat-" + (p < 0.34 ? 0 : p < 0.68 ? 1 : 2));
      }
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      onScroll();
    });
  }
  if (!reduce) initPins();
  else document.querySelectorAll("[data-pin-stage]").forEach(function (s) { s.classList.add("beat-2"); });

  /* ---- parallax ---- */
  if (!reduce) {
    var px = document.querySelectorAll("[data-parallax]");
    if (px.length) {
      window.addEventListener("scroll", function () {
        px.forEach(function (el) {
          var speed = parseFloat(el.getAttribute("data-parallax")) || 0.15;
          var r = el.getBoundingClientRect();
          var off = (r.top + r.height / 2 - window.innerHeight / 2) * -speed;
          el.style.transform = "translateY(" + off.toFixed(1) + "px)";
        });
      }, { passive: true });
    }
  }

  /* ---- nav scrolled state ---- */
  var nav = document.querySelector(".nav");
  if (nav) {
    var onNav = function () { nav.classList.toggle("scrolled", window.scrollY > 8); };
    window.addEventListener("scroll", onNav, { passive: true }); onNav();
  }

  /* ---- sticky buy bar ---- */
  var bar = document.querySelector("[data-buybar]");
  var trig = document.querySelector("[data-buybar-trigger]");
  if (bar && trig) {
    var footer = document.querySelector(".footer");
    window.addEventListener("scroll", function () {
      var passed = trig.getBoundingClientRect().bottom < 0;
      var nearFoot = footer && footer.getBoundingClientRect().top < window.innerHeight;
      bar.classList.toggle("show", passed && !nearFoot);
    }, { passive: true });
  }

  /* ---- tech specs accordion ---- */
  document.querySelectorAll("[data-specs]").forEach(function (acc) {
    acc.addEventListener("click", function (e) {
      var head = e.target.closest("[data-specs-head]");
      if (!head) return;
      var item = head.closest("[data-specs-item]");
      item.classList.toggle("open");
    });
  });

  /* ---- horizontal scrollers ---- */
  document.querySelectorAll(".hscroll-wrap").forEach(function (w) {
    var track = w.querySelector(".hscroll");
    var prev = w.querySelector("[data-hscroll-prev]");
    var next = w.querySelector("[data-hscroll-next]");
    if (!track) return;
    var step = function () { return Math.min(track.clientWidth * 0.8, 420); };
    if (prev) prev.addEventListener("click", function () { track.scrollBy({ left: -step(), behavior: "smooth" }); });
    if (next) next.addEventListener("click", function () { track.scrollBy({ left: step(), behavior: "smooth" }); });
  });

  /* ---- mobile drawer ---- */
  document.addEventListener("click", function (e) {
    if (e.target.closest("[data-open-nav]")) document.getElementById("drawer").classList.add("open");
    if (e.target.closest("[data-close-nav]")) document.getElementById("drawer").classList.remove("open");
  });

  /* ---- smooth in-page anchors ---- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id.length < 2) return;
      var t = document.querySelector(id);
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }); }
    });
  });

  /* ---- cart demo ---- */
  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-add]");
    if (!btn) return;
    e.preventDefault();
    var c = document.querySelector(".cart-count");
    if (c) c.textContent = parseInt(c.textContent || "0", 10) + 1;
    var t = btn.querySelector("[data-add-label]") || btn;
    var orig = t.textContent;
    t.textContent = "Added ✓";
    setTimeout(function () { t.textContent = orig; }, 1300);
  });

  /* ---- qty steppers ---- */
  document.querySelectorAll(".qty").forEach(function (q) {
    var val = q.querySelector("span");
    q.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      var n = parseInt(val.textContent, 10) + (b.dataset.step === "up" ? 1 : -1);
      val.textContent = Math.max(1, n);
    });
  });

  /* ---- filter chips ---- */
  document.querySelectorAll("[data-filter-group]").forEach(function (group) {
    group.addEventListener("click", function (e) {
      var chip = e.target.closest(".chip"); if (!chip) return;
      group.querySelectorAll(".chip").forEach(function (c) { c.classList.remove("active"); });
      chip.classList.add("active");
      var f = chip.getAttribute("data-filter");
      var list = document.querySelector("[data-filter-target]");
      if (!list) return;
      list.querySelectorAll("[data-cat]").forEach(function (item) {
        var show = f === "all" || (" " + item.getAttribute("data-cat") + " ").indexOf(" " + f + " ") !== -1;
        item.style.display = show ? "" : "none";
      });
    });
  });
})();
