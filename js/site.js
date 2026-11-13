(function () {
  "use strict";
  var doc = document, root = doc.documentElement;
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  root.classList.add("js");
  var WA = "2347061442221";
  function wa(t) { return "https://wa.me/" + WA + "?text=" + encodeURIComponent(t); }
  function fmt(n) { return "₦" + Math.round(n).toLocaleString("en-NG"); }

  /* page wipe */
  var wipe = doc.querySelector(".wipe");
  doc.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href]");
    if (!a || !wipe || a.target === "_blank" || e.metaKey || e.ctrlKey || e.shiftKey) return;
    var h = a.getAttribute("href");
    if (!h || /^(https?:|mailto:|tel:|#)/.test(h) || !/\.html($|#)/.test(h)) return;
    e.preventDefault(); wipe.classList.add("in");
    setTimeout(function () { location.href = h; }, reduce ? 0 : 520);
  });
  window.addEventListener("pageshow", function (e) { if (e.persisted && wipe) wipe.classList.remove("in"); });

  /* mobile nav */
  var burger = doc.querySelector(".burger"), nav = doc.getElementById("nav");
  if (burger && nav) burger.addEventListener("click", function () {
    var open = burger.getAttribute("aria-expanded") !== "true";
    burger.setAttribute("aria-expanded", open); nav.classList.toggle("open", open);
    doc.body.style.overflow = open ? "hidden" : "";
  });

  /* reveal */
  var rvs = [].slice.call(doc.querySelectorAll(".rv"));
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }); }, { threshold: 0.1, rootMargin: "0px 0px -6% 0px" });
    rvs.forEach(function (el) { io.observe(el); });
    setTimeout(function () { rvs.forEach(function (el) { el.classList.add("in"); }); }, 4000);
  } else rvs.forEach(function (el) { el.classList.add("in"); });

  /* tilt */
  if (!reduce && window.matchMedia("(hover: hover)").matches) doc.querySelectorAll(".tilt").forEach(function (el) {
    el.addEventListener("pointermove", function (e) {
      var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty("--ry", (x * 8).toFixed(2) + "deg"); el.style.setProperty("--rx", (-y * 8).toFixed(2) + "deg");
    });
    el.addEventListener("pointerleave", function () { el.style.setProperty("--rx", "0deg"); el.style.setProperty("--ry", "0deg"); });
  });

  /* copy buttons */
  doc.querySelectorAll(".copy").forEach(function (b) {
    b.addEventListener("click", function () {
      var t = b.getAttribute("data-copy"), o = b.textContent;
      function done() { b.textContent = "Copied"; setTimeout(function () { b.textContent = o; }, 1600); }
      try { navigator.clipboard.writeText(t).then(done, function () { b.textContent = t; }); } catch (err) { b.textContent = t; }
    });
  });

  /* hero search -> properties page */
  var hs = doc.getElementById("hero-search");
  if (hs) {
    var mode = "rent";
    hs.querySelectorAll(".seg button").forEach(function (b) {
      b.addEventListener("click", function () { mode = b.getAttribute("data-mode"); hs.querySelectorAll(".seg button").forEach(function (o) { o.setAttribute("aria-pressed", o === b); }); });
    });
    hs.addEventListener("submit", function (e) {
      e.preventDefault();
      var q = "#" + mode + "-" + (doc.getElementById("hs-beds").value || "any");
      location.href = "properties.html" + q;
    });
  }

  /* listings: filter + shortlist */
  var list = doc.getElementById("listings");
  if (list) {
    var cards = [].slice.call(list.querySelectorAll(".listing"));
    var fType = "all", fBeds = doc.getElementById("f-beds"), fQ = doc.getElementById("f-q"), cnt = doc.getElementById("count"), emp = doc.getElementById("empty");
    var typeBtns = doc.querySelectorAll(".filters .seg button");
    function apply() {
      var shown = 0, q = (fQ.value || "").toLowerCase().trim(), b = fBeds.value;
      cards.forEach(function (c) {
        var ok = (fType === "all" || c.getAttribute("data-mode") === fType) && (b === "any" || c.getAttribute("data-beds") === b || (b === "4" && +c.getAttribute("data-beds") >= 4)) && (!q || c.textContent.toLowerCase().indexOf(q) > -1);
        c.hidden = !ok; if (ok) shown++;
      });
      cnt.textContent = shown + " of " + cards.length + " samples"; emp.hidden = shown > 0;
    }
    typeBtns.forEach(function (bt) { bt.addEventListener("click", function () { fType = bt.getAttribute("data-mode"); typeBtns.forEach(function (o) { o.setAttribute("aria-pressed", o === bt); }); apply(); }); });
    fBeds.addEventListener("change", apply); fQ.addEventListener("input", apply);
    var h = (location.hash || "").replace("#", "").split("-");
    if (h[0] === "rent" || h[0] === "buy") { fType = h[0]; typeBtns.forEach(function (o) { o.setAttribute("aria-pressed", o.getAttribute("data-mode") === fType); }); if (h[1]) { for (var i = 0; i < fBeds.options.length; i++) if (fBeds.options[i].value === h[1]) fBeds.value = h[1]; } }
    apply();

    var bar = doc.getElementById("shortlist"), bn = doc.getElementById("sl-n"), bl = doc.getElementById("sl-wa"), picks = {};
    function renderBar() {
      var keys = Object.keys(picks); bn.textContent = keys.length; bar.classList.toggle("show", keys.length > 0); doc.body.classList.toggle("has-shortlist", keys.length > 0);
      var msg = "Hello Abuja Best Agent Housing, I'd like to ask about these homes I saw on your website:\n" + keys.map(function (k, n) { return (n + 1) + ". " + picks[k]; }).join("\n");
      bl.href = wa(msg);
    }
    list.addEventListener("click", function (e) {
      var b = e.target.closest(".pick"); if (!b) return;
      var c = b.closest(".listing"), id = c.getAttribute("data-id"), on = b.getAttribute("aria-pressed") !== "true";
      b.setAttribute("aria-pressed", on); b.textContent = on ? "Shortlisted" : "Shortlist";
      if (on) picks[id] = c.getAttribute("data-title"); else delete picks[id]; renderBar();
    });
  }

  /* budget finder */
  var fin = doc.getElementById("finder");
  if (fin) {
    var rng = fin.querySelector("#bud"), out = fin.querySelector("#bud-out"), rows = [].slice.call(fin.querySelectorAll(".bar-row")), tabs = fin.querySelectorAll(".tabs button"), fmode = "rent", wl = fin.querySelector("#bud-wa"), fit = fin.querySelector("#bud-fit");
    var cfg = { rent: { min: 2000000, max: 20000000, step: 500000, val: 7000000, label: "per year" }, buy: { min: 100000000, max: 450000000, step: 5000000, val: 200000000, label: "to buy" } };
    function draw() {
      var v = +rng.value; out.textContent = fmt(v); var names = [];
      rows.forEach(function (r) {
        var on = r.getAttribute("data-mode") === fmode; r.hidden = !on; if (!on) return;
        var p = +r.getAttribute("data-price"), f = p <= v; r.classList.toggle("fit", f); if (f) names.push(r.getAttribute("data-name"));
      });
      fit.textContent = names.length ? "Typical asking prices at or under your budget: " + names.join(", ") + "." : "Your budget is below the typical asking price for every type listed. Ask us what is available lower.";
      wl.href = wa("Hello Abuja Best Agent Housing, my budget is about " + fmt(v) + " " + cfg[fmode].label + " in Abuja. What do you have?");
    }
    function setMode(m) { fmode = m; var c = cfg[m]; rng.min = c.min; rng.max = c.max; rng.step = c.step; rng.value = c.val; tabs.forEach(function (t) { t.setAttribute("aria-pressed", t.getAttribute("data-mode") === m); }); draw(); }
    tabs.forEach(function (t) { t.addEventListener("click", function () { setMode(t.getAttribute("data-mode")); }); });
    rng.addEventListener("input", draw); setMode("rent");
  }

  /* contact form */
  var form = doc.getElementById("enquiry");
  if (form) form.addEventListener("submit", function (e) {
    e.preventDefault();
    var v = function (id) { return (doc.getElementById(id).value || "").trim(); };
    var want = (form.querySelector("input[name=want]:checked") || {}).value || "rent";
    var msg = "Hello Abuja Best Agent Housing, my name is " + (v("f-name") || "(no name)") + ". I want to " + want + " in Abuja. Bedrooms: " + v("f-beds") + ". Budget: " + (v("f-budget") || "not stated") + ". " + (v("f-msg") ? v("f-msg") : "");
    var l = doc.getElementById("f-open"); l.href = wa(msg); l.hidden = false; doc.getElementById("f-note").hidden = false; l.focus();
  });

  /* 3D neighbourhood */
  function scene(canvas) {
    if (!window.THREE) { canvas.remove(); return; }
    var T = THREE, mini = canvas.getAttribute("data-scene") === "mini", renderer;
    try { renderer = new T.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true }); } catch (err) { canvas.remove(); return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    var sc = new T.Scene(); sc.fog = new T.Fog(0x0a1c30, 16, 44);
    var cam = new T.PerspectiveCamera(40, 1, 0.1, 100);
    sc.add(new T.AmbientLight(0xbfd8e8, 0.7));
    var sun = new T.DirectionalLight(0xfff0dc, 1.05); sun.position.set(-8, 14, 6); sc.add(sun);
    var warm = new T.PointLight(0xc9a24b, 1.4, 30); warm.position.set(4, 4, 3); sc.add(warm);
    var world = new T.Group(); sc.add(world);
    var ground = new T.Mesh(new T.PlaneGeometry(60, 60), new T.MeshStandardMaterial({ color: 0x102a47, roughness: 1 })); ground.rotation.x = -Math.PI / 2; world.add(ground);
    var N = mini ? 5 : 7, gap = 3.1, off = (N - 1) * gap / 2;
    var wall = [0xefece5, 0xcfdde6, 0xf2d9c4, 0xb9c9db, 0xe7e2d6], roofC = [0x183a5f, 0x2a5a82, 0x3a4a5a, 0x5b3a2e];
    var rnd = (function (s) { return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; })(11);
    // roads
    var roadMat = new T.MeshBasicMaterial({ color: 0x0a1a2a });
    for (var i = 0; i <= N; i++) {
      var p = -off - gap / 2 + i * gap;
      var r1 = new T.Mesh(new T.PlaneGeometry(0.7, N * gap + 1), roadMat); r1.rotation.x = -Math.PI / 2; r1.position.set(p, 0.01, 0); world.add(r1);
      var r2 = new T.Mesh(new T.PlaneGeometry(N * gap + 1, 0.7), roadMat); r2.rotation.x = -Math.PI / 2; r2.position.set(0, 0.01, p); world.add(r2);
    }
    var hot = null, pickI = Math.floor(N / 2), pickJ = Math.floor(N / 2) - 1, bobs = [];
    for (var x = 0; x < N; x++) for (var z = 0; z < N; z++) {
      var g = new T.Group(), w = 1.3 + rnd() * 0.5, d = 1.3 + rnd() * 0.4, hgt = 0.8 + rnd() * 1.1 * (rnd() > 0.7 ? 1.6 : 1);
      var isHot = (x === pickI && z === pickJ);
      var body = new T.Mesh(new T.BoxGeometry(w, hgt, d), new T.MeshStandardMaterial({ color: isHot ? 0xfbfaf7 : wall[Math.floor(rnd() * wall.length)], roughness: 0.85 }));
      body.position.y = hgt / 2; g.add(body);
      var roof = new T.Mesh(new T.ConeGeometry(Math.max(w, d) * 0.78, 0.65, 4), new T.MeshStandardMaterial({ color: isHot ? 0xc9a24b : roofC[Math.floor(rnd() * roofC.length)], roughness: 0.7, flatShading: true }));
      roof.rotation.y = Math.PI / 4; roof.position.y = hgt + 0.32; roof.scale.set(w >= d ? 1 : 0.8, 1, w >= d ? 0.8 : 1); g.add(roof);
      var win = new T.Mesh(new T.PlaneGeometry(0.22, 0.28), new T.MeshBasicMaterial({ color: 0xffd9a0 })); win.position.set(0, hgt * 0.55, d / 2 + 0.01); g.add(win);
      g.position.set(-off + x * gap + (rnd() - 0.5) * 0.3, 0, -off + z * gap + (rnd() - 0.5) * 0.3); g.rotation.y = Math.floor(rnd() * 4) * 0; world.add(g);
      if (isHot) {
        var pin = new T.Group(); var head = new T.Mesh(new T.SphereGeometry(0.28, 20, 20), new T.MeshBasicMaterial({ color: 0xc9a24b })); head.position.y = 0.5; pin.add(head);
        var tip = new T.Mesh(new T.ConeGeometry(0.22, 0.5, 16), new T.MeshBasicMaterial({ color: 0xc9a24b })); tip.rotation.x = Math.PI; tip.position.y = 0.12; pin.add(tip);
        var dot = new T.Mesh(new T.SphereGeometry(0.1, 12, 12), new T.MeshBasicMaterial({ color: 0xffffff })); dot.position.y = 0.5; dot.position.z = 0.2; pin.add(dot);
        pin.position.set(g.position.x, hgt + 1.6, g.position.z); world.add(pin); bobs.push(pin);
        var ring = new T.Mesh(new T.RingGeometry(0.5, 0.58, 40), new T.MeshBasicMaterial({ color: 0xc9a24b, transparent: true, opacity: 0.8, side: T.DoubleSide })); ring.rotation.x = -Math.PI / 2; ring.position.set(g.position.x, 0.05, g.position.z); world.add(ring); hot = ring;
      }
    }
    var mx = 0, my = 0, tx = 0, ty = 0, vis = true, running = false, t0 = performance.now();
    window.addEventListener("pointermove", function (e) { tx = e.clientX / innerWidth - 0.5; ty = e.clientY / innerHeight - 0.5; }, { passive: true });
    function size() { var r = canvas.parentElement.getBoundingClientRect(); renderer.setSize(r.width, r.height, false); cam.aspect = r.width / r.height; cam.fov = r.width < 700 ? 56 : 40; cam.updateProjectionMatrix(); }
    size(); window.addEventListener("resize", size);
    if ("IntersectionObserver" in window) new IntersectionObserver(function (e) { vis = e[0].isIntersecting; if (vis && !running) loop(); }).observe(canvas.parentElement);
    function frame(now) {
      var t = (now - t0) / 1000; mx += (tx - mx) * 0.05; my += (ty - my) * 0.05;
      var s = Math.min(window.scrollY, 800), ang = reduce ? 0.7 : 0.7 + t * 0.06 + mx * 0.5, rad = mini ? 17 : 19 - s * 0.005;
      cam.position.set(Math.sin(ang) * rad, (mini ? 12 : 11) - my * 2 + s * 0.004, Math.cos(ang) * rad); cam.lookAt(mini ? 0 : 2.2, 0, 0);
      bobs.forEach(function (b) { b.position.y += Math.sin(t * 2.4) * 0.004; b.rotation.y = t * 1.2; });
      if (hot) { var k = (t * 0.7) % 1; hot.scale.setScalar(1 + k * 2.4); hot.material.opacity = 0.8 * (1 - k); }
      warm.position.x = 4 + Math.sin(t * 0.5) * 3; renderer.render(sc, cam);
    }
    function loop() { if (!vis || reduce) { running = false; return; } running = true; frame(performance.now()); requestAnimationFrame(loop); }
    frame(performance.now()); if (!reduce) loop();
  }
  function boot() { doc.querySelectorAll("canvas.scene").forEach(scene); }
  if (doc.readyState === "complete") boot(); else window.addEventListener("load", boot);
})();
