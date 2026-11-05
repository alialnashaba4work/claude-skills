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
  const isItem = (n) => "audio" in n || "text" in n;
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
      artwork: [{ src: new URL(S.cover, location.href).href, sizes: "512x512", type: "image/jpeg" }]
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
      pb.innerHTML = mine && playing ? IC.pause : IC.play;
      pb.setAttribute("aria-label", mine && playing ? "إيقاف مؤقت" : "تشغيل");
    }
    syncTime();
  }
  function syncTime() {
    const t = current();
    const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
    $("#miniProg").style.width = pct + "%";
    const deck = $(".pcard");
    if (deck && t && deck.dataset.track === hrefOf([...P.path, t.id])) {
      const r = $("#pSeek");
      if (!r.matches(":active")) r.value = audio.duration ? (audio.currentTime / audio.duration) * 1000 : 0;
      r.style.setProperty("--p", (r.value / 10) + "%");
      $("#pCur").textContent = fmt(audio.currentTime);
      $("#pDur").textContent = "-" + fmt((audio.duration || 0) - audio.currentTime);
    }
  }
  ["play", "pause", "ended", "loadedmetadata"].forEach((e) => audio.addEventListener(e, () => { syncUI(); setPosition(); }));
  audio.addEventListener("timeupdate", syncTime);
  audio.addEventListener("ended", () => { if (P.index < P.queue.length - 1) step(1); });
  audio.addEventListener("error", () => { if (audio.getAttribute("src")) toast("تعذّر تحميل ملف الصوت"); });
  $("#miniPlay").addEventListener("click", toggle);

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

  // غلاف أسطوانة: الأسطوانة داخل المحفظة، وتطلع شوي عند تمرير الماوس
  function sleeve(href, title, meta) {
    return `<a class="sleeve-card" href="${href}">
      <span class="disc" aria-hidden="true"><span class="disc-label"></span></span>
      <span class="sleeve-face">
        <span class="sf-title">${esc(title)}</span>
        ${meta ? `<span class="sf-meta">${esc(meta)}</span>` : ""}
      </span>
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
      body = `<ol class="crate">${kids.map((it, i) => {
        const h = hrefOf([...parts, it.id]);
        const c = colorOf([...chain, it]);
        return `<li class="crate-item" data-row="${h}" style="--c:${esc(c)}">
          ${sleeve(h, it.title, "")}
          <button class="row-play" type="button" data-i="${i}" aria-label="تشغيل ${esc(it.title)}">${IC.play}</button>
        </li>`;
      }).join("")}</ol>`;
    } else {
      body = `<ul class="crate">${kids.map((g) => {
        const n = countItems(g);
        const c = colorOf([...chain, g]);
        return `<li class="crate-item" style="--c:${esc(c)}">
          ${sleeve(hrefOf([...parts, g.id]), g.title, n ? arNum(n) + " مقطع" : "قريباً")}
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
    const cover = it.cover || "";

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
                ${cover ? `<img class="pc-img" src="${esc(cover)}" alt="">` : `<div class="pc-fallback" aria-hidden="true">${rosette()}</div>`}
                <div class="pc-top">
                  <div class="pc-pill glass">
                    ${cover ? `<img src="${esc(cover)}" alt="">` : `<span class="pc-dot" aria-hidden="true">${rosette()}</span>`}
                    <span class="pc-txt"><h1 class="pc-title">${esc(it.title)}</h1><small>${esc(chain.slice(0, -1).slice(-2).map((c) => c.title).join(" · "))}</small></span>
                  </div>
                  <button class="pc-ic glass" id="pShare" type="button" aria-label="مشاركة">${IC.share}</button>
                  <button class="pc-ic glass" id="pFav" type="button" aria-label="المفضلة" aria-pressed="${isFav(h)}">${IC.heart}</button>
                </div>
                <div class="pc-bottom">
                  <div class="pc-times"><span id="pCur">٠:٠٠</span><span id="pDur">٠:٠٠</span></div>
                  <input class="pc-seek" type="range" id="pSeek" min="0" max="1000" value="0" aria-label="موضع التشغيل">
                  <div class="pc-ctl">
                    <button class="glass" id="pPrev" type="button" aria-label="السابق" ${idx > 0 ? "" : "disabled"}>${IC.prev}</button>
                    <button class="glass pc-main" id="pPlay" type="button" aria-label="تشغيل">${IC.play}</button>
                    <button class="glass" id="pNext" type="button" aria-label="التالي" ${idx < siblings.length - 1 ? "" : "disabled"}>${IC.next}</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
    view.querySelectorAll(".pdf-btn").forEach((b) => b.addEventListener("click", async () => {
      if (b.disabled) return;
      b.disabled = true; toast("جاري تجهيز ملف PDF…");
      try { await poemPdf(it, colorOf(chain)); toast("تم تحميل ملف PDF"); }
      catch (e) { toast("تعذّر تجهيز ملف PDF، حاول مرة ثانية"); }
      b.disabled = false;
    }));

    const mine = () => current() === it;
    $("#pPlay").addEventListener("click", () => (mine() ? toggle() : load(siblings, idx, parentPath)));
    $("#pPrev").addEventListener("click", () => { location.hash = hrefOf([...parentPath, siblings[idx - 1].id]); if (current()) load(siblings, idx - 1, parentPath); });
    $("#pNext").addEventListener("click", () => { location.hash = hrefOf([...parentPath, siblings[idx + 1].id]); if (current()) load(siblings, idx + 1, parentPath); });
    const seek = $("#pSeek");
    seek.addEventListener("input", () => {
      seek.style.setProperty("--p", (seek.value / 10) + "%");
      if (mine() && audio.duration) audio.currentTime = (seek.value / 1000) * audio.duration;
    });

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

  /* زخرفة الشمسة: تستخدم خلفية للقصائد اللي ما لها صورة */
  function rosette() {
    const P = (n, r, off = 0) => Array.from({ length: n }, (_, i) => { const a = off + (i * 2 * Math.PI) / n - Math.PI / 2; return [120 + r * Math.cos(a), 120 + r * Math.sin(a)]; });
    const star = (n, k, r, off = 0) => { const p = P(n, r, off); let d = "", i = 0; for (let q = 0; q <= n; q++) { const v = p[i % n]; d += (q ? "L" : "M") + v[0].toFixed(1) + "," + v[1].toFixed(1); i += k; } return d + "Z"; };
    const G = "#d9b45f";
    return `<svg viewBox="0 0 240 240"><g fill="none" stroke-linejoin="round">
      <circle cx="120" cy="120" r="88" stroke="${G}" stroke-width="1.2" opacity=".7"/>
      <path d="${star(16, 6, 86)}" stroke="${G}" opacity=".55"/>
      <path d="${star(8, 3, 70)}" fill="color-mix(in srgb, var(--c) 45%, transparent)" stroke="${G}" stroke-width="1.4"/>
      <path d="${star(8, 3, 70, Math.PI / 8)}" stroke="${G}" opacity=".6"/>
      <path d="${star(8, 2, 46)}" fill="color-mix(in srgb, var(--c) 70%, #000)" stroke="${G}" stroke-width="1.4"/>
      <circle cx="120" cy="120" r="26" stroke="${G}" stroke-width="1.2"/>
      <path d="${star(8, 3, 22)}" fill="${G}" opacity=".85"/>
      ${P(16, 78).map(([x, y]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.2" fill="${G}"/>`).join("")}
    </g></svg>`;
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

  async function poemPdf(it, accent) {
    const [{ jsPDF }] = await Promise.all([
      loadJsPdf(),
      document.fonts.load('900 40px "Abar"'), document.fonts.load('600 40px "Abar"'), document.fonts.load('400 40px "Abar"')
    ]);
    const W = 1654, H = 2339, M = 160, INK = "#14182b", SOFT = "#6b7290";
    const BODY = 46, GAP = 90, bottom = H - M - 40;
    const pages = [];
    let ctx, y;
    const newPage = () => {
      const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
      ctx = cv.getContext("2d"); ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, W, H);
      ctx.direction = "rtl"; ctx.textBaseline = "alphabetic";
      pages.push(cv); y = M;
    };
    const font = (w, px) => { ctx.font = `${w} ${px}px "Abar", sans-serif`; };
    // يصغّر الخط إذا الكلام أطول من المساحة
    const fit = (text, w, px, max) => { font(w, px); while (ctx.measureText(text).width > max && px > 24) { px -= 2; font(w, px); } return px; };

    newPage();
    // رأس الصفحة الأولى: خط بلون القسم، العنوان، واسم المنشد مرة وحدة
    ctx.fillStyle = accent; ctx.fillRect(W / 2 - 70, y, 140, 8); y += 120;
    ctx.fillStyle = INK; ctx.textAlign = "center";
    fit(it.title, 900, 92, W - 2 * M); ctx.fillText(it.title, W / 2, y); y += 70;
    ctx.fillStyle = SOFT; font(400, 36); ctx.fillText(S.name, W / 2, y); y += 110;

    const lineH = BODY * 2;
    const ensure = (h) => { if (y + h > bottom) newPage(); };
    const stanzas = String(it.text || "").split(/\n\s*\n/);
    stanzas.forEach((st, si) => {
      const lines = st.split("\n").map((l) => l.trim()).filter(Boolean);
      lines.forEach((l) => {
        ensure(lineH);
        const h = l.split("|");
        ctx.fillStyle = INK;
        if (h.length === 2) {
          const half = (W - 2 * M - GAP) / 2;
          const a = h[0].trim(), b = h[1].trim();
          const px = Math.min(fit(a, 400, BODY, half), fit(b, 400, BODY, half));
          font(400, px);
          ctx.textAlign = "right"; ctx.fillText(a, W - M, y + BODY);
          ctx.textAlign = "left"; ctx.fillText(b, M, y + BODY);
        } else {
          fit(l, 400, BODY, W - 2 * M);
          ctx.textAlign = "center"; ctx.fillText(l, W / 2, y + BODY);
        }
        y += lineH;
      });
      if (si < stanzas.length - 1) y += BODY * 0.9;
    });

    // رقم الصفحة فقط في التذييل
    pages.forEach((cv, i) => {
      const c = cv.getContext("2d");
      c.direction = "rtl"; c.textAlign = "center"; c.fillStyle = SOFT;
      c.font = `400 28px "Abar", sans-serif`;
      if (pages.length > 1) c.fillText(arNum(i + 1) + " / " + arNum(pages.length), W / 2, H - M / 2);
    });

    const doc = new jsPDF({ unit: "pt", format: "a4", orientation: "portrait", compress: true });
    pages.forEach((cv, i) => {
      if (i) doc.addPage("a4", "portrait");
      doc.addImage(cv.toDataURL("image/jpeg", 0.9), "JPEG", 0, 0, 595.28, 841.89);
    });
    doc.setProperties({ title: it.title });
    const url = URL.createObjectURL(doc.output("blob"));
    const link = document.createElement("a");
    link.href = url; link.download = it.title + ".pdf";
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
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
