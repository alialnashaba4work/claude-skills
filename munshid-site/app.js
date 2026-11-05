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
    const deck = $(".deck");
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
    const deck = $(".deck");
    if (deck && t && deck.dataset.track === hrefOf([...P.path, t.id])) {
      const r = $("#pSeek");
      if (!r.matches(":active")) r.value = audio.duration ? (audio.currentTime / audio.duration) * 1000 : 0;
      r.style.setProperty("--p", (r.value / 10) + "%");
      $("#pCur").textContent = fmt(audio.currentTime);
      $("#pDur").textContent = fmt(audio.duration);
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
    return `<nav class="crumbs" aria-label="مسار التصفح">${links.join('<span aria-hidden="true">/</span>')}</nav>`;
  }

  function renderHome() {
    view.innerHTML = `
      <section class="hero">
        <img class="hero-img" src="img/banner.jpg" alt="${esc(S.name)} أثناء الإنشاد">
        <div class="hero-copy">
          <h1>${esc(S.name)}</h1>
          <p>${esc(S.tagline)}</p>
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

  function renderNode(parts, chain) {
    const node = chain[chain.length - 1];
    const kids = children(node);
    const itemsHere = kids.length && isItem(kids[0]);
    let body;
    if (!kids.length) {
      body = `<p class="empty">لا توجد مقاطع في هذا القسم بعد.</p>`;
    } else if (itemsHere) {
      body = `<ol class="tracks">${kids.map((it, i) => {
        const h = hrefOf([...parts, it.id]);
        return `<li class="track" data-row="${h}">
          <button class="row-play" type="button" data-i="${i}" aria-label="تشغيل ${esc(it.title)}">${IC.play}</button>
          <a class="track-link" href="${h}"><span class="track-title">${esc(it.title)}</span>
          <span class="track-sub">الصوت والنص والتحميل</span></a>
        </li>`;
      }).join("")}</ol>`;
    } else {
      body = `<ul class="groups">${kids.map((g) => {
        const n = countItems(g);
        return `<li><a href="${hrefOf([...parts, g.id])}">
          <span class="g-title">${esc(g.title)}</span>
          <span class="g-count">${n ? arNum(n) + " مقطع" : "قريباً"}</span>
          <span class="g-arrow" aria-hidden="true">${IC.back}</span>
        </a></li>`;
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
          : `<p class="line">${esc(l.trim())}</p>`;
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
          <div class="deck" data-track="${h}" style="--label:${esc(colorOf(chain))};--label-ink:${inkOn(colorOf(chain))}">
            <div class="stage">
              <div class="record">
                <div class="grooves"></div>
                <svg class="label" viewBox="0 0 200 200" aria-hidden="true">
                  <circle cx="100" cy="100" r="100" class="label-bg"/>
                  <path id="arc" d="M 34,104 A 66,66 0 0,1 166,104" fill="none"/>
                  <text class="label-title"><textPath href="#arc" startOffset="50%" text-anchor="middle">${esc(it.title)}</textPath></text>
                  <circle cx="100" cy="100" r="13" class="label-ring"/>
                  <circle cx="100" cy="100" r="5" class="label-hole"/>
                  <text x="100" y="150" text-anchor="middle" class="label-artist">${esc(parent.title)}</text>
                </svg>
              </div>
              <svg class="arm" viewBox="0 0 100 420" aria-hidden="true">
                <defs>
                  <linearGradient id="steel" x1="0" x2="1"><stop offset="0" stop-color="#9aa0aa"/><stop offset=".45" stop-color="#f4f5f7"/><stop offset="1" stop-color="#8b9099"/></linearGradient>
                  <radialGradient id="knob" cx=".4" cy=".35"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#c3c7ce"/><stop offset="1" stop-color="#7d828b"/></radialGradient>
                </defs>
                <circle cx="50" cy="50" r="40" fill="rgba(255,255,255,.35)" stroke="rgba(0,0,0,.08)"/>
                <circle cx="50" cy="50" r="22" fill="url(#knob)"/>
                <rect x="20" y="8" width="12" height="22" rx="3" transform="rotate(-40 26 19)" fill="url(#steel)"/>
                <path d="M50 70 L62 110 Q72 140 72 170 L72 340" stroke="url(#steel)" stroke-width="9" fill="none" stroke-linecap="round"/>
                <rect x="61" y="98" width="13" height="16" rx="3" transform="rotate(-18 67 106)" fill="url(#steel)"/>
                <rect x="63" y="335" width="18" height="50" rx="3" fill="url(#steel)" stroke="rgba(0,0,0,.15)"/>
              </svg>
            </div>
            <div class="deck-meta">
              <h1 class="deck-title">${esc(it.title)}</h1>
              <p class="deck-artist">${esc(chain.slice(0, -1).map((c) => c.title).join(" / "))}</p>
            </div>
            <div class="seek">
              <input type="range" id="pSeek" min="0" max="1000" value="0" aria-label="موضع التشغيل">
              <div class="times"><span id="pCur">٠:٠٠</span><span id="pDur">٠:٠٠</span></div>
            </div>
            <div class="controls">
              <button class="ctl" id="pPrev" type="button" aria-label="السابق" ${idx > 0 ? "" : "disabled"}>${IC.prev}</button>
              <button class="ctl ctl-main" id="pPlay" type="button" aria-label="تشغيل">${IC.play}</button>
              <button class="ctl" id="pNext" type="button" aria-label="التالي" ${idx < siblings.length - 1 ? "" : "disabled"}>${IC.next}</button>
            </div>
          </div>
        </div>

        <div class="pane" id="pane-text" role="tabpanel" aria-labelledby="tab-text" hidden>
          <div class="text-tools">
            <button class="chip" id="copyBtn" type="button">${IC.copy}<span>نسخ النص</span></button>
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
          </div>
        </div>
        </div>
      </section>`;

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
    const mine = () => current() === it;
    $("#pPlay").addEventListener("click", () => (mine() ? toggle() : load(siblings, idx, parentPath)));
    $("#pPrev").addEventListener("click", () => { location.hash = hrefOf([...parentPath, siblings[idx - 1].id]); if (current()) load(siblings, idx - 1, parentPath); });
    $("#pNext").addEventListener("click", () => { location.hash = hrefOf([...parentPath, siblings[idx + 1].id]); if (current()) load(siblings, idx + 1, parentPath); });
    const seek = $("#pSeek");
    seek.addEventListener("input", () => {
      seek.style.setProperty("--p", (seek.value / 10) + "%");
      if (mine() && audio.duration) audio.currentTime = (seek.value / 1000) * audio.duration;
    });

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
})();
