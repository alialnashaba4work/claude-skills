(function () {
  "use strict";
  const S = window.SITE;
  const $ = (s, r = document) => r.querySelector(s);
  const view = $("#view");
  const audio = $("#audio");
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const arNum = (n) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);

  document.title = S.name;
  $("#brand").innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11l8-7 8 7M6 9.5V20h12V9.5"/></svg>';
  $("#brand").setAttribute("aria-label", "الرئيسية");

  /* لون وسط الأسطوانة: من المقطع نفسه أو أقرب قسم فوقه */
  const colorOf = (chain) => { for (let i = chain.length - 1; i >= 0; i--) if (chain[i].color) return chain[i].color; return "#c6d65b"; };
  const inkOn = (hex) => {
    const n = parseInt(hex.replace("#", ""), 16);
    const l = (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
    return l > 0.6 ? "#1a1d12" : "#ffffff";
  };

  /* ---------- شجرة المحتوى ---------- */
  const children = (node) => node.sections || node.groups || node.items || [];
  const isItem = (n) => !("groups" in n || "items" in n || "sections" in n);
  function countItems(n) {
    if (isItem(n)) return 1;
    return children(n).reduce((a, c) => a + countItems(c), 0);
  }
  // يحوّل المسار مثل latmiyat/1447/l1 إلى سلسلة العقد
  function resolve(parts) {
    const chain = [];
    let node = S;
    for (const p of parts) {
      const next = children(node).find((c) => c.id === p);
      if (!next) return null;
      chain.push(next);
      node = next;
    }
    return chain;
  }
  const hrefOf = (parts) => "#/" + parts.map(encodeURIComponent).join("/");

  /* ---------- أيقونات ---------- */
  const IC = {
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" fill="currentColor" stroke="none"/></svg>',
    pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6.5" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none"/><rect x="13.5" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none"/></svg>',
    // في الاتجاه العربي: السابق يمين ويشير لليمين، التالي يسار ويشير لليسار
    prev: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6v12l8-6zM12 6v12l8-6z" fill="currentColor" stroke="none"/></svg>',
    next: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 6v12l-8-6zM12 6v12l-8-6z" fill="currentColor" stroke="none"/></svg>',
    copy: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/></svg>',
    down: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11m-5-5 5 5 5-5M5 20h14"/></svg>',
    share: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12M7 8l5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/></svg>',
    heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-7.5-4.4-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.8-7.5 10.2-7.5 10.2z" fill="currentColor" stroke="none"/></svg>',
    book: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 6.5C10 5 7 4.5 4 5v13c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5V5c-3-.5-6 0-8 1.5zM12 6.5V19.5"/></svg>',
    back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>'
  };

  /* ---------- المشغل ---------- */
  const P = { queue: [], index: -1, path: [] }; // path: مسار القائمة الأب
  const current = () => P.queue[P.index];

  function load(queue, index, parentPath, autoplay = true) {
    P.queue = queue; P.index = index; P.path = parentPath;
    const t = current();
    if (!t.audio) { toast("لم يُرفع الصوت لهذا المقطع بعد"); return; }
    if (audio.getAttribute("src") !== t.audio) audio.src = t.audio;
    if (autoplay) audio.play().catch(() => {});
    setMediaSession();
    syncUI();
  }
  function toggle() {
    if (!current()) return;
    audio.paused ? audio.play().catch(() => {}) : audio.pause();
  }
  function step(d) {
    const i = P.index + d;
    if (i < 0 || i >= P.queue.length) return;
    load(P.queue, i, P.path);
    if (location.hash.startsWith(hrefOf(P.path) + "/")) location.hash = hrefOf([...P.path, current().id]);
  }

  // التحكم من شاشة القفل وسماعات البلوتوث
  function setMediaSession() {
    if (!("mediaSession" in navigator) || !current()) return;
    const chain = resolve(P.path) || [];
    navigator.mediaSession.metadata = new MediaMetadata({
      title: current().title,
      artist: S.name,
      album: chain.map((c) => c.title).join(" — "),
      // صورة القصيدة نفسها في شاشة القفل (المربعة أفضل)، وإلا صورة الموقع
      artwork: [{ src: new URL(current().cover || wideOf(current()) || S.cover, location.href).href, sizes: "512x512", type: "image/jpeg" }]
    });
    const ms = navigator.mediaSession;
    const set = (a, f) => { try { ms.setActionHandler(a, f); } catch (e) {} };
    set("play", () => audio.play());
    set("pause", () => audio.pause());
    set("previoustrack", P.index > 0 ? () => step(-1) : null);
    set("nexttrack", P.index < P.queue.length - 1 ? () => step(1) : null);
    set("seekbackward", (d) => { audio.currentTime = Math.max(0, audio.currentTime - (d.seekOffset || 10)); });
    set("seekforward", (d) => { audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + (d.seekOffset || 10)); });
    set("seekto", (d) => { audio.currentTime = d.seekTime; });
  }
  function setPosition() {
    if (!("mediaSession" in navigator) || !isFinite(audio.duration)) return;
    try { navigator.mediaSession.setPositionState({ duration: audio.duration, playbackRate: audio.playbackRate, position: audio.currentTime }); } catch (e) {}
  }

  const fmt = (s) => {
    if (!isFinite(s)) return "٠:٠٠";
    s = Math.floor(s);
    return arNum(Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"));
  };

  function syncUI() {
    const t = current();
    const playing = !audio.paused && !audio.ended;
    document.body.classList.toggle("is-playing", playing);
    // المشغل الصغير
    const mini = $("#mini");
    const onTrackPage = t && location.hash === hrefOf([...P.path, t.id]);
    mini.hidden = !t || onTrackPage;
    document.body.classList.toggle("has-mini", !mini.hidden);
    if (t) {
      $("#miniTitle").textContent = t.title;
      const th = t.cover || wideOf(t);
      $("#miniThumb").innerHTML = th ? `<img src="${esc(th)}" alt="">` : waveSvg(t.title);
      $("#mini").style.setProperty("--c", colorOf(resolve([...P.path, t.id]) || []));
      $("#miniSub").textContent = ((resolve(P.path) || []).slice(-1)[0] || {}).title || "";
      $("#miniInfo").href = hrefOf([...P.path, t.id]);
      $("#miniPlay").innerHTML = playing ? IC.pause : IC.play;
      $("#miniPlay").setAttribute("aria-label", playing ? "إيقاف مؤقت" : "تشغيل");
    }
    // أزرار التشغيل في القوائم
    document.querySelectorAll("[data-row]").forEach((r) => {
      const on = t && r.dataset.row === hrefOf([...P.path, t.id]);
      r.classList.toggle("is-current", !!on);
      const b = r.querySelector(".row-play");
      if (b) b.innerHTML = on && playing ? IC.pause : IC.play;
    });
    // صفحة المقطع
    const deck = $(".pcard");
    if (deck) {
      const mine = t && deck.dataset.track === hrefOf([...P.path, t.id]);
      deck.classList.toggle("spin", mine && playing);
      deck.classList.toggle("armed", mine && !audio.paused);
      const pb = $("#pPlay");
      if (pb) {
        pb.innerHTML = mine && playing ? IC.pause : IC.play;
        pb.setAttribute("aria-label", mine && playing ? "إيقاف مؤقت" : "تشغيل");
      }
    }
    syncTime();
  }
  function syncTime() {
    const t = current();
    const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
    $("#miniProg").style.width = pct + "%";
    const deck = $(".pcard");
    if (deck && t && deck.dataset.track === hrefOf([...P.path, t.id]) && $("#pSeek")) {
      const r = $("#pSeek");
      if (!r.matches(":active")) r.value = audio.duration ? (audio.currentTime / audio.duration) * 1000 : 0;
      r.parentElement.style.setProperty("--p", (r.value / 10) + "%");
      $("#pCur").textContent = fmt(audio.currentTime);
      $("#pDur").textContent = "-" + fmt((audio.duration || 0) - audio.currentTime);
    }
  }
  ["play", "pause", "ended", "loadedmetadata"].forEach((e) => audio.addEventListener(e, () => { syncUI(); setPosition(); }));
  audio.addEventListener("timeupdate", syncTime);
  audio.addEventListener("ended", () => { if (P.index < P.queue.length - 1) step(1); });
  audio.addEventListener("error", () => { if (audio.getAttribute("src")) toast("تعذّر تحميل ملف الصوت"); });
  $("#miniPlay").addEventListener("click", toggle);
  // المشغل الصغير: صورة القصيدة وموجة صوت صغيرة تتحرك وقت التشغيل
  (function () {
    const th = document.createElement("span"); th.className = "mini-thumb"; th.id = "miniThumb"; th.setAttribute("aria-hidden", "true");
    $("#miniPlay").after(th);
    const eq = document.createElement("span"); eq.className = "mini-eq"; eq.setAttribute("aria-hidden", "true");
    eq.innerHTML = "<i></i><i></i><i></i><i></i><i></i>";
    $("#miniInfo").after(eq);
    // زر الإغلاق: يوقف الصوت ويخفي المشغل
    const x = document.createElement("button");
    x.className = "mini-close"; x.type = "button"; x.setAttribute("aria-label", "إغلاق المشغل");
    x.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
    eq.after(x);
    x.addEventListener("click", () => {
      audio.pause(); audio.removeAttribute("src"); audio.load();
      P.queue = []; P.index = -1; P.path = [];
      if ("mediaSession" in navigator) { try { navigator.mediaSession.metadata = null; } catch (e) {} }
      syncUI();
    });
  })();

  /* ---------- اختصارات الكيبورد (الكمبيوتر) ---------- */
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (!current() && !(e.code === "Space" && $("#pPlay"))) return;
    const el = document.activeElement;
    const onWave = el && el.id === "pSeek";
    if (el && !onWave && (/^(INPUT|TEXTAREA|SELECT|BUTTON|A)$/.test(el.tagName) || el.isContentEditable || el.getAttribute("role") === "tab")) return;
    if (onWave && e.code !== "Space") return;
    if (document.querySelector(".search:not([hidden]), .reader, .pages-view")) return;
    if (e.code === "Space") { e.preventDefault(); if (!current() || (view.querySelector(".pcard") && $("#pPlay") && !view.querySelector(".pcard").classList.contains("spin") && audio.paused && view.querySelector(".pcard").dataset.track !== hrefOf([...P.path, current().id]))) $("#pPlay").click(); else toggle(); }
    // في الاتجاه العربي: السهم اليسار تقديم، واليمين تأخير
    else if (e.key === "ArrowLeft") { e.preventDefault(); audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 10); toast("تقديم ١٠ ثواني"); }
    else if (e.key === "ArrowRight") { e.preventDefault(); audio.currentTime = Math.max(0, audio.currentTime - 10); toast("تأخير ١٠ ثواني"); }
  });

  /* ---------- البطاقات تميل مع الماوس (الكمبيوتر) ---------- */
  if (matchMedia("(hover: hover) and (pointer: fine)").matches && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    view.addEventListener("mousemove", (e) => {
      const card = e.target.closest(".stack-img");
      if (!card) return;
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      card.style.setProperty("--ry", (x * 10).toFixed(2) + "deg");
      card.style.setProperty("--rx", (-y * 8).toFixed(2) + "deg");
    });
    view.addEventListener("mouseout", (e) => {
      const card = e.target.closest(".stack-img");
      if (card && !card.contains(e.relatedTarget)) { card.style.removeProperty("--ry"); card.style.removeProperty("--rx"); }
    });
  }

  /* ---------- الصفحات ---------- */
  function crumbs(parts, chain) {
    const links = [`<a href="#/">الرئيسية</a>`];
    chain.forEach((c, i) => {
      if (i < chain.length - 1) links.push(`<a href="${hrefOf(parts.slice(0, i + 1))}">${esc(c.title)}</a>`);
    });
    // زر الرجوع: يرجّعك مستوى واحد لفوق
    const back = parts.length > 1 ? hrefOf(parts.slice(0, -1)) : "#/";
    return `<nav class="crumbs" aria-label="مسار التصفح"><a class="back-btn" id="backBtn" href="${back}" aria-label="رجوع">${IC.back}</a>${links.join('<span aria-hidden="true">/</span>')}</nav>`;
  }

  function renderHome() {
    view.innerHTML = `
      <section class="hero">
        <img class="hero-img" src="img/banner.jpg" alt="${esc(S.name)} أثناء الإنشاد">
        <div class="hero-copy">
          <h1>${(S.heroLines || [S.name]).map(esc).join("<br>")}</h1>
          ${S.tagline ? `<p>${esc(S.tagline)}</p>` : ""}
        </div>
      </section>
      <section class="index" aria-label="الأقسام">
        <ul class="index-list">
          ${S.sections.map((s) => {
            const n = countItems(s);
            return `<li><a href="${hrefOf([s.id])}">
              <span class="ix-title">${esc(s.title)}</span>
              <span class="ix-note">${esc(s.note || "")}</span>
              <span class="ix-count">${n ? arNum(n) + " مقطع" : "قريباً"}</span>
            </a></li>`;
          }).join("")}
        </ul>
      </section>`;
  }

  // صور القصائد داخل قسم (لرزمة البطاقات)
  // الصورة العريضة (16:9) للقصيدة: صورة يوتيوب إذا موجودة، وإلا صورتها المربعة
  function wideOf(it) {
    const id = ytId(it.youtube);
    const known = id && ((window.YT && window.YT.videos) || []).find((v) => v.id === id);
    return (known && known.thumb) || it.cover || "";
  }
  function coversOf(node) {
    if (isItem(node)) { const w = wideOf(node); return w ? [w] : []; }
    return children(node).flatMap(coversOf);
  }
  // بطاقة وحدة: صورة القصيدة، أو زخرفة بلون القسم إذا ما لها صورة
  // موجة صوت ذهبية للمقاطع اللي ما لها صورة (نمطها يختلف حسب العنوان)
  function waveSvg(seed, fill = "#d9b45f", flat, thin) {
    let h = 0; for (const ch of String(seed)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    const a = 0.35 + (h % 7) / 10, b = 1.2 + (h % 5) / 3, c = (h % 13) / 2;
    let bars = "";
    if (thin) {
      // شريط التقدم: خطوط طالعة من خط الأساس، وتحتها انعكاس أقصر وأبهت بدون فراغ بينهم
      const n = 64, step = 196 / n, w = 1.3, base = 40;
      let r = h || 7; const rnd = () => ((r = (r * 1103515245 + 12345) >>> 0) / 4294967296);
      for (let i = 0; i < n; i++) {
        // ارتفاعات عشوائية ثابتة لكل قصيدة، مثل موجة صوت حقيقية
        const v = 10 + rnd() * 16 + Math.abs(Math.sin(i * 0.35 + c)) * 10;
        const x = (2 + i * step).toFixed(2);
        bars += `<rect x="${x}" y="${(base - v).toFixed(1)}" width="${w}" height="${v.toFixed(1)}" fill="${fill}"/>`;
        bars += `<rect x="${x}" y="${base}" width="${w}" height="${(v * 0.45).toFixed(1)}" fill="${fill}" opacity=".45"/>`;
      }
      return `<svg viewBox="0 0 200 60" preserveAspectRatio="none" aria-hidden="true">${bars}</svg>`;
    }
    for (let i = 0; i < 48; i++) {
      const v = 6 + Math.abs(Math.sin(i * a + c) * 22 + Math.sin(i * b) * 9);
      bars += `<rect x="${(2 + i * 4.1).toFixed(1)}" y="${(30 - v / 2).toFixed(1)}" width="2.2" height="${v.toFixed(1)}" rx="1.1" fill="${fill}" opacity="${flat ? 1 : (0.5 + 0.5 * Math.abs(Math.sin(i * 0.3 + c))).toFixed(2)}"/>`;
    }
    return `<svg viewBox="0 0 200 60" preserveAspectRatio="none" aria-hidden="true">${bars}</svg>`;
  }
  const waveArt = (title, withTitle) => `${withTitle ? `<span class="fb-t">${esc(title)}</span>` : ""}${waveSvg(title)}`;
  const face = (src, title, withTitle) => src ? `<img src="${esc(src)}" alt="" loading="lazy">` : `<span class="fb">${waveArt(title || "", withTitle)}</span>`;
  // رزمة بطاقات: ثلاث بطاقات فوق بعض تنفرد عند تمرير الماوس
  function stackCard(href, title, meta, covers, single) {
    const c = single ? [covers[0] || ""] : covers.concat(["", "", ""]).slice(0, 3);
    return `<a class="stack${single ? " single" : ""}" href="${href}">
      <span class="stack-img">
        ${single ? "" : `<span class="card c3" aria-hidden="true">${face(c[2], title + "3")}</span><span class="card c2" aria-hidden="true">${face(c[1], title + "2")}</span>`}
        <span class="card c1">${face(c[0], title, true)}</span>
      </span>
      <span class="lbl"><b>${esc(title)}</b>${meta ? `<small>${esc(meta)}</small>` : ""}</span>
    </a>`;
  }

  function renderNode(parts, chain) {
    const node = chain[chain.length - 1];
    const kids = children(node);
    const itemsHere = kids.length && isItem(kids[0]);
    let body;
    if (!kids.length) {
      body = `<p class="empty">لا توجد مقاطع في هذا القسم بعد.</p>`;
    } else if (itemsHere) {
      body = `<ol class="stacks">${kids.map((it, i) => {
        const h = hrefOf([...parts, it.id]);
        const c = colorOf([...chain, it]);
        return `<li class="stack-item" data-row="${h}" style="--c:${esc(c)}">
          ${stackCard(h, it.title, it.duration ? arNum(it.duration) : "", coversOf(it), true)}
          ${it.audio ? `<button class="row-play glass" type="button" data-i="${i}" aria-label="تشغيل ${esc(it.title)}">${IC.play}</button>` : ""}
        </li>`;
      }).join("")}</ol>`;
    } else {
      body = `<ul class="stacks">${kids.map((g) => {
        const n = countItems(g);
        const c = colorOf([...chain, g]);
        return `<li class="stack-item" style="--c:${esc(c)}">
          ${stackCard(hrefOf([...parts, g.id]), g.title, n ? arNum(n) + " مقطع" : "قريباً", coversOf(g), false)}
        </li>`;
      }).join("")}</ul>`;
    }
    view.innerHTML = `
      <section class="page">
        ${crumbs(parts, chain)}
        <h1 class="page-title">${esc(node.title)}</h1>
        ${node.note ? `<p class="page-note">${esc(node.note)}</p>` : ""}
        ${body}
      </section>`;
    if (itemsHere) {
      view.querySelectorAll(".row-play").forEach((b) => b.addEventListener("click", () => {
        const i = +b.dataset.i;
        const t = current();
        if (t && t === kids[i]) toggle();
        else load(kids, i, parts);
      }));
    }
  }

  function renderText(text) {
    return String(text || "").split(/\n\s*\n/).map((stanza) => `<div class="stanza">${
      stanza.split("\n").filter((l) => l.trim()).map((l) => {
        const h = l.split("|");
        return h.length === 2
          ? `<p class="bayt"><span>${esc(h[0].trim())}</span><span>${esc(h[1].trim())}</span></p>`
          : `<p class="line">${esc(l.trim()).replace(/ \.\. /g, "\u00A0.. ")}</p>`;
      }).join("")
    }</div>`).join("");
  }

  function renderTrack(parts, chain) {
    const it = chain[chain.length - 1];
    const parent = chain[chain.length - 2];
    const siblings = children(parent);
    const idx = siblings.indexOf(it);
    const parentPath = parts.slice(0, -1);
    const h = hrefOf(parts);
    const file = (it.audio || "").split("/").pop();
    const color = colorOf(chain);
    const cover = wideOf(it);

    view.innerHTML = `
      <section class="page track-page">
        ${crumbs(parts, chain)}
        <div class="tabs" role="tablist" aria-label="المقطع">
          <button role="tab" id="tab-audio" aria-controls="pane-audio" aria-selected="true">الصوت</button>
          <button role="tab" id="tab-text" aria-controls="pane-text" aria-selected="false">النص</button>
          <button role="tab" id="tab-dl" aria-controls="pane-dl" aria-selected="false">تحميل الصوت</button>
        </div>

        <div class="track-grid">
        <div class="pane" id="pane-audio" role="tabpanel" aria-labelledby="tab-audio">
          <div class="pc-stage" style="--c:${esc(color)}">
            ${cover ? `<div class="pc-blur" style="background-image:url('${esc(cover)}')"></div>` : ""}
            <div class="pc-frame">
              <div class="pcard${cover ? "" : " no-cover"}" data-track="${h}">
                <div class="pc-media">
                  ${cover ? `<img class="pc-img" src="${esc(cover)}" alt="">` : `<div class="pc-fallback" aria-hidden="true">${waveArt(it.title, true)}</div>`}
                </div>
                <div class="pc-top">
                  <div class="pc-pill">
                    <span class="pc-txt"><h1 class="pc-title">${esc(it.title)}</h1><small>${esc(chain.slice(0, -1).slice(-2).map((c) => c.title).join(" · "))}${it.duration && !it.audio ? " · " + esc(arNum(it.duration)) : ""}</small></span>
                  </div>
                  <button class="pc-ic glass" id="pShare" type="button" aria-label="مشاركة">${IC.share}</button>
                  <button class="pc-ic glass" id="pFav" type="button" aria-label="المفضلة" aria-pressed="${isFav(h)}">${IC.heart}</button>
                </div>
                ${it.audio ? `
                <div class="pc-bottom">
                  <div class="pc-times"><span id="pCur">٠:٠٠</span><span id="pDur">٠:٠٠</span></div>
                  <div class="pc-wave" id="pWave">
                    <span class="pw-base">${waveSvg(it.title, "#ffffff", true, true)}</span>
                    <span class="pw-fill">${waveSvg(it.title, "#d9b45f", true, true)}</span>
                    <input class="pc-seek" type="range" id="pSeek" min="0" max="1000" value="0" aria-label="موضع التشغيل">
                  </div>
                  <div class="pc-ctl">
                    <button class="glass" id="pPrev" type="button" aria-label="السابق" ${idx > 0 ? "" : "disabled"}>${IC.prev}</button>
                    <button class="glass pc-main" id="pPlay" type="button" aria-label="تشغيل">${IC.play}</button>
                    <button class="glass" id="pNext" type="button" aria-label="التالي" ${idx < siblings.length - 1 ? "" : "disabled"}>${IC.next}</button>
                  </div>
                </div>` : ""}
              </div>
            </div>
          </div>
          ${ytBtn(it)}
        </div>

        <div class="pane" id="pane-text" role="tabpanel" aria-labelledby="tab-text" hidden>
          <div class="text-tools">
            <div class="tt-actions">
              <button class="chip" id="copyBtn" type="button">${IC.copy}<span>نسخ</span></button>
              ${it.text ? `<button class="chip pdf-btn" type="button">${IC.down}<span>PDF</span></button>
              <button class="chip" id="readBtn" type="button" aria-label="وضع القراءة">${IC.book}<span>قراءة</span></button>` : ""}
            </div>
            <div class="size">
              <button class="chip" id="fsDown" type="button" aria-label="تصغير الخط">أ-</button>
              <button class="chip" id="fsUp" type="button" aria-label="تكبير الخط">أ+</button>
            </div>
          </div>
          <article class="poem" id="poem">
            <h2>${esc(it.title)}</h2>
            ${it.text ? renderText(it.text) : `<p class="empty">لم يُضف النص لهذا المقطع بعد.</p>`}
          </article>
        </div>

        <div class="pane" id="pane-dl" role="tabpanel" aria-labelledby="tab-dl" hidden>
          <div class="dl">
            <p class="dl-name">${esc(it.title)}</p>
            ${it.audio
              ? `<a class="dl-btn" href="${esc(it.audio)}" download="${esc(it.title)}.${esc(file.split(".").pop() || "mp3")}">${IC.down}<span>تحميل الصوت</span></a>
                 <p class="dl-hint">يُحفظ الملف في مجلد التنزيلات على جهازك.</p>`
              : `<p class="empty">لم يُرفع الصوت لهذا المقطع بعد.</p>`}
            ${it.text ? `<button class="dl-btn dl-alt pdf-btn" type="button">${IC.down}<span>تحميل النص PDF</span></button>` : ""}
          </div>
        </div>
        </div>
      </section>`;

    // يوتيوب: على الاستضافة الحقيقية يشتغل المقطع داخل الخانة، وفي صفحة المعاينة يفتح في يوتيوب
    const ytb = view.querySelector(".yt-btn");
    if (ytb && canEmbed()) ytb.addEventListener("click", (e) => {
      e.preventDefault();
      audio.pause();
      const f = document.createElement("iframe");
      f.className = "ytframe";
      f.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(ytb.dataset.yt) + "?autoplay=1&rel=0";
      f.title = "مقطع يوتيوب: " + it.title;
      f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
      f.allowFullscreen = true;
      ytb.replaceWith(f);
      f.scrollIntoView({ block: "nearest", behavior: "smooth" });
    });

    // المشاركة والمفضلة
    $("#pShare").addEventListener("click", async () => {
      const data = { title: it.title, url: location.href };
      if (navigator.share) { try { await navigator.share(data); return; } catch (e) { if (e.name === "AbortError") return; } }
      try { await navigator.clipboard.writeText(location.href); toast("تم نسخ رابط القصيدة"); } catch (e) { toast("انسخ الرابط من شريط العنوان"); }
    });
    $("#pFav").addEventListener("click", (e) => {
      const on = toggleFav(h);
      e.currentTarget.setAttribute("aria-pressed", on);
      toast(on ? "أُضيفت إلى المفضلة" : "أُزيلت من المفضلة");
    });

    // التبويبات
    const tabs = [...view.querySelectorAll('[role="tab"]')];
    const show = (tab) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute("aria-selected", on);
        t.tabIndex = on ? 0 : -1;
        $("#" + t.getAttribute("aria-controls")).hidden = !on;
      });
    };
    tabs.forEach((t, i) => {
      t.addEventListener("click", () => show(t));
      t.addEventListener("keydown", (e) => {
        const d = e.key === "ArrowLeft" ? 1 : e.key === "ArrowRight" ? -1 : 0;
        if (d) { const n = tabs[(i + d + tabs.length) % tabs.length]; show(n); n.focus(); }
      });
    });
    show(tabs[0]);

    // التحكم
    view.querySelectorAll(".pdf-btn").forEach((b) => b.addEventListener("click", () => openPdfDialog(it, colorOf(chain))));

    const mine = () => current() === it;
    if (it.audio) {
    $("#pPlay").addEventListener("click", () => (mine() ? toggle() : load(siblings, idx, parentPath)));
    $("#pPrev").addEventListener("click", () => { location.hash = hrefOf([...parentPath, siblings[idx - 1].id]); if (current()) load(siblings, idx - 1, parentPath); });
    $("#pNext").addEventListener("click", () => { location.hash = hrefOf([...parentPath, siblings[idx + 1].id]); if (current()) load(siblings, idx + 1, parentPath); });
    const seek = $("#pSeek");
    seek.addEventListener("input", () => {
      seek.parentElement.style.setProperty("--p", (seek.value / 10) + "%");
      if (mine() && audio.duration) audio.currentTime = (seek.value / 1000) * audio.duration;
    });
    }

    // وضع القراءة: النص لحاله بملء الشاشة
    const readBtn = $("#readBtn");
    if (readBtn) readBtn.addEventListener("click", () => openReader(it));

    // النص
    $("#copyBtn").addEventListener("click", async () => {
      const txt = it.title + "\n\n" + String(it.text || "").replace(/\s*\|\s*/g, "    ");
      try { await navigator.clipboard.writeText(txt); toast("تم نسخ النص"); }
      catch (e) {
        const r = document.createRange(); r.selectNodeContents($("#poem"));
        const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r);
        toast("النص محدد، انسخه من القائمة");
      }
    });
    let size = parseFloat(localGet("poemSize") || "1.25");
    const applySize = () => { $("#poem").style.setProperty("--poem-size", size + "rem"); localSet("poemSize", size); };
    $("#fsUp").addEventListener("click", () => { size = Math.min(2.2, size + 0.125); applySize(); });
    $("#fsDown").addEventListener("click", () => { size = Math.max(0.875, size - 0.125); applySize(); });
    applySize();
  }


  /* خانة يوتيوب للمقطع */
  function ytId(url) {
    const m = String(url || "").match(/(?:youtu\.be\/|[?&]v=|\/shorts\/|\/embed\/)([\w-]{11})/);
    return m ? m[1] : "";
  }
  // صفحة المعاينة في Claude تمنع تشغيل يوتيوب داخلها
  const canEmbed = () => !/claudeusercontent\.com$|claude\.ai$/.test(location.hostname);
  // زر "شاهد على يوتيوب" تحت المشغل
  function ytBtn(it) {
    const id = ytId(it.youtube);
    if (!id) return "";
    return `<a class="yt-btn" href="https://www.youtube.com/watch?v=${esc(id)}" target="_blank" rel="noopener" data-yt="${esc(id)}">
      <span class="yt-btn-ic" aria-hidden="true">${IC.play}</span><span>شاهد على يوتيوب</span>
    </a>`;
  }

  /* المفضلة: تنحفظ في جهاز الزائر بس */
  function favs() { try { return JSON.parse(localGet("favs") || "[]"); } catch (e) { return []; } }
  function isFav(h) { return favs().includes(h); }
  function toggleFav(h) {
    const f = favs(); const i = f.indexOf(h);
    if (i >= 0) f.splice(i, 1); else f.push(h);
    localSet("favs", JSON.stringify(f));
    return i < 0;
  }

  /*
    تحميل النص كملف PDF بمقاس A4.
    نرسم كل صفحة على canvas بخط عبر (عشان الحروف العربية تتصل صح) ونحطها في ملف PDF.
    اسم المنشد يطلع مرة وحدة بس تحت العنوان في الصفحة الأولى.
  */
  let jsPdfLoading = null;
  function loadJsPdf() {
    if (window.jspdf) return Promise.resolve(window.jspdf);
    if (!jsPdfLoading) jsPdfLoading = new Promise((res, rej) => {
      const sc = document.createElement("script");
      sc.src = "vendor/jspdf.umd.min.js";
      sc.onload = () => res(window.jspdf); sc.onerror = () => { jsPdfLoading = null; rej(new Error("jspdf")); };
      document.head.appendChild(sc);
    });
    return jsPdfLoading;
  }

  // يرسم صفحات A4 للنص. scale يكبّر أو يصغّر خط الأبيات (الهوامش ثابتة)
  function buildPdfPages(it, accent, scale, countOnly) {
    // صفحة A4 بدقة 200 نقطة في البوصة
    const W = 1654, H = 2339, M = 190, INK = "#16192b", SOFT = "#767c95", GOLD = "#b8954a";
    const BODY = Math.round(50 * scale), LINE = Math.round(BODY * 2.15), GAP = 150, COL = 560, STANZA_GAP = Math.round(LINE * 0.75);
    const TOP = M + 10, BOTTOM = H - M - 90;

    // قياس النص
    const mc = document.createElement("canvas").getContext("2d");
    const setF = (c, w, px) => { c.font = `${w} ${px}px "Abar", sans-serif`; };
    const fitPx = (text, w, px, max) => { setF(mc, w, px); while (mc.measureText(text).width > max && px > 26) { px -= 2; setF(mc, w, px); } return px; };

    // نحوّل النص لعناصر: بيت (صدر وعجز)، سطر، أو فاصل بين المقاطع
    const blocks = [];
    String(it.text || "").split(/\n\s*\n/).forEach((st, si, arr) => {
      st.split("\n").map((l) => l.trim()).filter(Boolean).forEach((l) => {
        const h = l.split("|");
        if (h.length === 2) {
          const a = h[0].trim(), b = h[1].trim();
          blocks.push({ kind: "bayt", a, b, px: Math.min(fitPx(a, 400, BODY, COL), fitPx(b, 400, BODY, COL)), h: LINE });
        } else blocks.push({ kind: "line", t: l, px: fitPx(l, 400, BODY, W - 2 * M - 40), h: LINE });
      });
      if (si < arr.length - 1) blocks.push({ kind: "sep", h: STANZA_GAP });
    });

    const HEADER1 = 230, HEADER_N = 120;
    // توزيع العناصر على الصفحات
    const pagesB = [[]]; let used = HEADER1;
    blocks.forEach((b) => {
      const room = BOTTOM - TOP;
      if (used + b.h > room) { if (b.kind === "sep") return; pagesB.push([]); used = HEADER_N; }
      if (b.kind === "sep" && !pagesB[pagesB.length - 1].length) return;
      pagesB[pagesB.length - 1].push(b); used += b.h;
    });

    if (countOnly) return pagesB.length;
    const pages = pagesB.map((list, pi) => {
      const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
      const c = cv.getContext("2d");
      c.fillStyle = "#fff"; c.fillRect(0, 0, W, H);
      c.direction = "rtl"; c.textBaseline = "alphabetic";

      const bodyH = list.reduce((t, b) => t + b.h, 0);
      const headH = pi === 0 ? HEADER1 : HEADER_N;
      // صفحة وحدة: نوسّط المحتوى عمودياً
      let y = pagesB.length === 1 ? Math.max(TOP, TOP + (BOTTOM - TOP - headH - bodyH) / 2) : TOP;

      c.textAlign = "center";
      if (pi === 0) {
        // اسم القصيدة بس، ومسافة قبل الأبيات
        y += 100;
        c.fillStyle = INK; setF(c, 900, fitPx(it.title, 900, 100, W - 2 * M)); c.fillText(it.title, W / 2, y);
        y += HEADER1 - 100;
      } else {
        c.fillStyle = SOFT; setF(c, 700, 32); c.fillText(it.title, W / 2, y + 30);
        y += HEADER_N;
      }

      list.forEach((b) => {
        c.fillStyle = INK;
        if (b.kind === "bayt") {
          setF(c, 400, b.px);
          c.textAlign = "center";
          c.fillText(b.a, W / 2 + GAP / 2 + COL / 2, y + BODY * 1.15);
          c.fillText(b.b, W / 2 - GAP / 2 - COL / 2, y + BODY * 1.15);
        } else if (b.kind === "line") {
          setF(c, 400, b.px); c.textAlign = "center"; c.fillText(b.t, W / 2, y + BODY * 1.15);
        } else {
          diamond(c, W / 2, y + b.h / 2 - 4, 7, GOLD);
        }
        y += b.h;
      });

      // التذييل: "نسألكم الدعاء" في كل صفحة، ورقم الصفحة إذا أكثر من صفحة
      c.fillStyle = GOLD; setF(c, 700, 32); c.textAlign = "center"; c.fillText("نسألكم الدعاء", W / 2, H - 150);
      if (pagesB.length > 1) { c.fillStyle = SOFT; setF(c, 400, 26); c.textAlign = "left"; c.fillText(arNum(pi + 1) + " / " + arNum(pagesB.length), 150, H - 150); }
      return cv;
    });

    function diamond(c, x, yy, r, color) { c.save(); c.fillStyle = color; c.beginPath(); c.moveTo(x, yy - r); c.lineTo(x + r, yy); c.lineTo(x, yy + r); c.lineTo(x - r, yy); c.closePath(); c.fill(); c.restore(); }

    return pages;
  }

  async function savePdf(it, pages) {
    const { jsPDF } = await loadJsPdf();
    const doc = new jsPDF({ unit: "pt", format: "a4", orientation: "portrait", compress: true });
    pages.forEach((cv, i) => {
      if (i) doc.addPage("a4", "portrait");
      doc.addImage(cv.toDataURL("image/jpeg", 0.92), "JPEG", 0, 0, 595.28, 841.89);
    });
    doc.setProperties({ title: it.title });
    const url = URL.createObjectURL(doc.output("blob"));
    const link = document.createElement("a");
    link.href = url; link.download = it.title + ".pdf";
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }

  const pagesWord = (n) => n === 1 ? "صفحة وحدة" : n === 2 ? "صفحتين" : arNum(n) + " صفحات";

  // نافذة تجهيز الـ PDF: معاينة الصفحات، وتغيير حجم الخط قبل التحميل
  async function openPdfDialog(it, accent) {
    try { await Promise.all([document.fonts.load('900 40px "Abar"'), document.fonts.load('700 40px "Abar"'), document.fonts.load('400 40px "Abar"')]); } catch (e) {}
    const preview = !canEmbed();
    let scale = parseFloat(localGet("pdfScale") || "1");
    const o = document.createElement("div");
    o.className = "pages-view"; o.setAttribute("role", "dialog"); o.setAttribute("aria-modal", "true"); o.setAttribute("aria-label", "تجهيز PDF");
    o.innerHTML = `<div class="pv-bar"><button class="reader-btn" type="button" data-act="close">إغلاق</button><b>${esc(it.title)}</b></div>
      <div class="pd-tools">
        <div class="pd-size">
          <button class="reader-btn" type="button" data-act="down" aria-label="تصغير الخط">أ-</button>
          <span class="pd-val" aria-live="polite"></span>
          <button class="reader-btn" type="button" data-act="up" aria-label="تكبير الخط">أ+</button>
        </div>
        <button class="reader-btn" type="button" data-act="fit">صفحة وحدة</button>
        <span class="pd-count"></span>
      </div>
      ${preview
        ? `<p class="pv-note">صفحة المعاينة هذي ما تسمح بتحميل الملفات. على الموقع المنشور ينزل ملف الـ PDF مباشرة. هنا تقدر تحفظ الصفحة كصورة بالضغط المطوّل عليها.</p>`
        : `<button class="dl-btn pd-dl" type="button" data-act="save">${IC.down}<span>تحميل PDF</span></button>`}
      <div class="pd-pages"></div>`;
    document.body.appendChild(o); document.body.classList.add("reading");
    let pages = [];
    const render = () => {
      scale = Math.round(scale * 100) / 100;
      localSet("pdfScale", scale);
      pages = buildPdfPages(it, accent, scale);
      o.querySelector(".pd-val").textContent = "حجم الخط " + arNum(Math.round(scale * 100)) + "٪";
      o.querySelector(".pd-count").textContent = pagesWord(pages.length);
      o.querySelector(".pd-pages").innerHTML = pages.map((cv, i) => `<img src="${cv.toDataURL("image/jpeg", 0.85)}" alt="صفحة ${arNum(i + 1)}">`).join("");
    };
    render();
    const close = () => { o.remove(); document.body.classList.remove("reading"); document.removeEventListener("keydown", k); };
    const k = (e) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", k);
    o.addEventListener("click", async (e) => {
      const b = e.target.closest("[data-act]"); if (!b) return;
      const a = b.dataset.act;
      if (a === "close") close();
      else if (a === "down") { scale = Math.max(0.5, scale - 0.05); render(); }
      else if (a === "up") { scale = Math.min(1.4, scale + 0.05); render(); }
      else if (a === "fit") {
        // أكبر خط يخلي النص في صفحة وحدة
        let s2 = Math.min(scale, 1);
        while (s2 > 0.5 && buildPdfPages(it, accent, s2, true) > 1) s2 -= 0.05;
        if (buildPdfPages(it, accent, s2, true) > 1) toast("النص طويل، ما يدخل في صفحة وحدة حتى بأصغر خط");
        scale = s2; render();
      } else if (a === "save") {
        b.disabled = true; toast("جاري تجهيز ملف PDF…");
        try { await savePdf(it, pages); toast("تم تحميل ملف PDF"); } catch (err) { toast("تعذّر تجهيز ملف PDF، حاول مرة ثانية"); }
        b.disabled = false;
      }
    });
    o.querySelector('[data-act="close"]').focus();
  }

  /* ---------- وضع القراءة ---------- */
  let wakeLock = null;
  function openReader(it) {
    const old = document.querySelector(".reader");
    if (old) old.remove();
    const r = document.createElement("div");
    r.className = "reader";
    r.setAttribute("role", "dialog"); r.setAttribute("aria-modal", "true"); r.setAttribute("aria-label", "وضع القراءة");
    r.dataset.theme = localGet("readerTheme") || "dark";
    r.innerHTML = `
      <div class="reader-bar">
        <button class="reader-btn" data-act="close" type="button">إغلاق</button>
        <div class="reader-tools">
          <button class="reader-btn" data-act="theme" type="button" aria-label="تغيير لون الصفحة"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor" stroke="none"/></svg></button>
          <button class="reader-btn" data-act="down" type="button" aria-label="تصغير الخط">أ-</button>
          <button class="reader-btn" data-act="up" type="button" aria-label="تكبير الخط">أ+</button>
        </div>
      </div>
      <article class="reader-text">
        <h2>${esc(it.title)}</h2>
        ${renderText(it.text)}
      </article>`;
    document.body.appendChild(r);
    document.body.classList.add("reading");
    let size = parseFloat(localGet("readerSize") || "1.7");
    const apply = () => { r.style.setProperty("--reader-size", size + "rem"); localSet("readerSize", size); };
    apply();
    const close = () => {
      r.remove(); document.body.classList.remove("reading");
      document.removeEventListener("keydown", onKey);
      if (wakeLock) { wakeLock.release().catch(() => {}); wakeLock = null; }
      if (document.fullscreenElement === r) document.exitFullscreen().catch(() => {});
      readBtnFocus();
    };
    const onKey = (e) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    r.addEventListener("click", (e) => {
      const b = e.target.closest("[data-act]");
      if (!b) return;
      const a = b.dataset.act;
      if (a === "close") close();
      else if (a === "up") { size = Math.min(3.4, size + 0.15); apply(); }
      else if (a === "down") { size = Math.max(1, size - 0.15); apply(); }
      else if (a === "theme") { r.dataset.theme = r.dataset.theme === "dark" ? "light" : "dark"; localSet("readerTheme", r.dataset.theme); }
    });
    // يخلي الشاشة شغالة وقت القراءة، ويفتح ملء الشاشة إذا الجهاز يدعمه
    if (navigator.wakeLock) navigator.wakeLock.request("screen").then((l) => { wakeLock = l; }).catch(() => {});
    if (r.requestFullscreen) r.requestFullscreen().catch(() => {});
    r.querySelector('[data-act="close"]').focus();
  }
  function readBtnFocus() { const b = $("#readBtn"); if (b) b.focus(); }

  // زر تحميل الصوت في صفحة المعاينة: نوضح إن التحميل يشتغل على الموقع المنشور
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[download]");
    if (a && !canEmbed()) { e.preventDefault(); toast("التحميل يشتغل على الموقع المنشور، صفحة المعاينة تمنعه"); }
  });

  function localGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function localSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  function render404() {
    view.innerHTML = `<section class="page"><h1 class="page-title">الصفحة غير موجودة</h1>
      <p class="page-note">ربما نُقل المقطع أو تغيّر رابطه.</p><p><a class="chip" href="#/">العودة إلى الرئيسية</a></p></section>`;
  }

  function route() {
    const parts = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean).map(decodeURIComponent);
    if (!parts.length) renderHome();
    else {
      const chain = resolve(parts);
      if (!chain) render404();
      else if (isItem(chain[chain.length - 1])) renderTrack(parts, chain);
      else renderNode(parts, chain);
    }
    $("#brand").hidden = !parts.length;
    // جو الصفحة بلون القسم
    const ch = parts.length ? resolve(parts) : null;
    if (ch) document.body.style.setProperty("--page-c", colorOf(ch));
    document.body.classList.toggle("tinted", !!ch);
    // انتقال ناعم بين الصفحات
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches && view.animate)
      view.animate([{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }], { duration: 280, easing: "ease-out" });
    window.scrollTo(0, 0);
    syncUI();
  }
  window.addEventListener("hashchange", route);
  route();

  /* ---------- ملء الشاشة ---------- */
  const fsBtn = $("#fsBtn");
  const de = document.documentElement;
  const canFS = de.requestFullscreen || de.webkitRequestFullscreen;
  if (canFS) {
    fsBtn.hidden = false;
    fsBtn.addEventListener("click", () => {
      const inFS = document.fullscreenElement || document.webkitFullscreenElement;
      if (inFS) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
      else (de.requestFullscreen || de.webkitRequestFullscreen).call(de);
    });
    const upd = () => fsBtn.setAttribute("aria-label", (document.fullscreenElement || document.webkitFullscreenElement) ? "الخروج من ملء الشاشة" : "ملء الشاشة");
    document.addEventListener("fullscreenchange", upd);
    document.addEventListener("webkitfullscreenchange", upd);
  }

  /* ---------- تنبيه ---------- */
  let tt;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg; t.classList.add("show");
    clearTimeout(tt); tt = setTimeout(() => t.classList.remove("show"), 2200);
  }

  /* ---------- البحث ---------- */
  // توحيد الحروف: يتجاهل التشكيل والتطويل ويوحّد أشكال الألف والتاء المربوطة والياء
  const NORM = { "أ": "ا", "إ": "ا", "آ": "ا", "ٱ": "ا", "ة": "ه", "ى": "ي", "ئ": "ي", "ؤ": "و" };
  const SKIP = /[ـً-ٰٟۖ-ۭ]/;
  // يرجّع النص الموحّد مع خريطة لمكان كل حرف في النص الأصلي
  function normMap(str) {
    let out = "", map = [];
    for (let k = 0; k < str.length; k++) {
      const c = str[k];
      if (SKIP.test(c)) continue;
      out += (NORM[c] || c).toLowerCase(); map.push(k);
    }
    return { out, map };
  }
  const norm = (s) => normMap(s).out.replace(/\s+/g, " ").trim();

  const INDEX = [];
  (function walk(node, parts, titles) {
    for (const c of children(node)) {
      const p = [...parts, c.id];
      if (isItem(c)) {
        INDEX.push({ item: c, parts: p, where: titles.join(" / "), title: c.title, text: String(c.text || "").replace(/\s*\|\s*/g, "  ") });
      } else walk(c, p, [...titles, c.title]);
    }
  })(S, [], []);

  function mark(str, q) {
    const { out, map } = normMap(str);
    const at = out.indexOf(q);
    if (at < 0) return null;
    const a = map[at], b = map[at + q.length - 1] + 1;
    return { a, b };
  }
  function snippet(text, q) {
    // السطر اللي فيه الكلمة، مع تمييزها
    const lines = text.split("\n");
    for (const line of lines) {
      const m = mark(line, q);
      if (m) return esc(line.slice(0, m.a)) + "<mark>" + esc(line.slice(m.a, m.b)) + "</mark>" + esc(line.slice(m.b));
    }
    return "";
  }

  const SI = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/></svg>';
  const sBtn = document.createElement("button");
  sBtn.className = "icon-btn"; sBtn.id = "searchBtn"; sBtn.type = "button";
  sBtn.setAttribute("aria-label", "بحث"); sBtn.innerHTML = SI;
  $("#fsBtn").before(sBtn);

  /* ---------- الوضع الفاتح والداكن ---------- */
  const SUN = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/></svg>';
  const MOON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>';
  const tBtn = document.createElement("button");
  tBtn.className = "icon-btn"; tBtn.id = "themeBtn"; tBtn.type = "button";
  const applyTheme = (t) => {
    if (t === "light") document.documentElement.dataset.theme = "light"; else delete document.documentElement.dataset.theme;
    tBtn.innerHTML = t === "light" ? MOON : SUN;
    tBtn.setAttribute("aria-label", t === "light" ? "الوضع الداكن" : "الوضع الفاتح");
    const m = document.querySelector('meta[name="theme-color"]'); if (m) m.content = t === "light" ? "#eef0f6" : "#070c24";
  };
  applyTheme(localGet("theme") === "light" ? "light" : "dark");
  tBtn.addEventListener("click", () => { const t = document.documentElement.dataset.theme === "light" ? "dark" : "light"; localSet("theme", t); applyTheme(t); });
  sBtn.after(tBtn);

  const panel = document.createElement("div");
  panel.className = "search"; panel.hidden = true;
  panel.setAttribute("role", "dialog"); panel.setAttribute("aria-modal", "true"); panel.setAttribute("aria-label", "بحث");
  panel.innerHTML = `
    <div class="search-inner">
      <div class="search-bar">
        <span class="search-ic">${SI}</span>
        <input id="searchInput" type="search" placeholder="اكتب عنوان القصيدة أو كلمة منها" autocomplete="off" enterkeyhint="search" aria-label="كلمة البحث">
        <button class="search-close" id="searchClose" type="button">إغلاق</button>
      </div>
      <p class="search-count" id="searchCount" aria-live="polite"></p>
      <ul class="search-results" id="searchResults"></ul>
    </div>`;
  document.body.appendChild(panel);
  const sIn = $("#searchInput"), sRes = $("#searchResults"), sCount = $("#searchCount");

  function runSearch() {
    const q = norm(sIn.value);
    if (q.length < 2) { sRes.innerHTML = ""; sCount.textContent = q ? "اكتب حرفين أو أكثر" : ""; return; }
    const hits = [];
    for (const e of INDEX) {
      const inTitle = mark(e.title, q), inText = mark(e.text, q), inWhere = mark(e.where, q);
      if (!inTitle && !inText && !inWhere) continue;
      hits.push({ e, rank: inTitle ? 0 : inText ? 1 : 2, inTitle });
    }
    hits.sort((x, y) => x.rank - y.rank);
    sCount.textContent = hits.length ? "عدد النتائج: " + arNum(hits.length) : "ما في نتائج. جرّب كلمة ثانية من القصيدة.";
    sRes.innerHTML = hits.map(({ e, inTitle }) => {
      const t = inTitle ? esc(e.title.slice(0, inTitle.a)) + "<mark>" + esc(e.title.slice(inTitle.a, inTitle.b)) + "</mark>" + esc(e.title.slice(inTitle.b)) : esc(e.title);
      const sn = snippet(e.text, q);
      return `<li><a href="${hrefOf(e.parts)}">
        <span class="sr-title">${t}</span>
        <span class="sr-where">${esc(e.where)}</span>
        ${sn ? `<span class="sr-line">${sn}</span>` : ""}
      </a></li>`;
    }).join("");
  }
  let lastFocus = null;
  function openSearch() {
    lastFocus = document.activeElement;
    panel.hidden = false; document.body.classList.add("searching");
    sIn.focus(); sIn.select(); runSearch();
  }
  function closeSearch() {
    panel.hidden = true; document.body.classList.remove("searching");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  sBtn.addEventListener("click", openSearch);
  $("#searchClose").addEventListener("click", closeSearch);
  sIn.addEventListener("input", runSearch);
  sRes.addEventListener("click", (ev) => { if (ev.target.closest("a")) { panel.hidden = true; document.body.classList.remove("searching"); } });
  panel.addEventListener("click", (ev) => { if (ev.target === panel) closeSearch(); });
  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape" && !panel.hidden) closeSearch();
    else if (ev.key === "/" && panel.hidden && !/input|textarea/i.test(document.activeElement.tagName)) { ev.preventDefault(); openSearch(); }
  });
})();
