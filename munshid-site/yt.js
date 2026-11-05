(function () {
  "use strict";
  const Y = window.YT || { videos: [] };
  const T = window.t || ((x) => x);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const AR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>';
  const AL = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>';
  const PL = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6.5v11l9-5.5z" fill="currentColor" stroke="none"/></svg>';
  let order = [], i = 0, timer = null;

  function build() {
    const box = document.createElement("aside");
    box.className = "yt";
    box.setAttribute("aria-label", T("مقاطع من قناة يوتيوب"));
    const many = Y.videos.length > 1;
    box.innerHTML = `<div class="yt-head"><h2>${T("من قناة يوتيوب")}</h2></div>
      <div class="yt-frame">
        <a class="yt-stage" href="${esc(Y.channel)}" target="_blank" rel="noopener"></a>
        ${many ? `<button class="yt-arrow yt-prev" type="button" aria-label="${T("المقطع السابق")}">${AR}</button>
        <button class="yt-arrow yt-next" type="button" aria-label="${T("المقطع التالي")}">${AL}</button>` : ""}
      </div>
      <div class="yt-dots" aria-hidden="true"></div>`;
    const stage = box.querySelector(".yt-stage");
    if (!Y.videos.length) {
      stage.outerHTML = `<div class="yt-stage"><div class="yt-empty"><p>${T("تظهر هنا مقاطع القناة بشكل عشوائي.")}<br><a href="${esc(Y.channel)}" target="_blank" rel="noopener">${T("افتح القناة على يوتيوب")}</a></p></div></div>`;
      return box;
    }
    order = shuffle(Y.videos); i = 0;
    stage.innerHTML = order.map((v, k) => `<div class="yt-slide${k === 0 ? " on" : ""}">${v.thumb ? `<img data-src="${esc(v.thumb)}" alt="">` : ""}<p class="yt-title">${esc(v.title)}</p></div>`).join("") + `<span class="yt-play">${PL}</span>`;
    if (order.length > 1) box.querySelector(".yt-dots").innerHTML = order.slice(0, 8).map((_, k) => `<span class="${k === 0 ? "on" : ""}"></span>`).join("");
    const go = (n) => {
      i = (n + order.length) % order.length;
      stage.querySelectorAll(".yt-slide").forEach((s, k) => s.classList.toggle("on", k === i));
      // نحمّل صورة المقطع الحالي واللي بعده بس
      [i, (i + 1) % order.length].forEach((k) => { const im = stage.querySelectorAll(".yt-slide img")[k]; if (im && !im.src) im.src = im.dataset.src; });
      box.querySelectorAll(".yt-dots span").forEach((d, k) => d.classList.toggle("on", k === i % 8));
      stage.href = "https://www.youtube.com/watch?v=" + encodeURIComponent(order[i].id);
      stage.setAttribute("aria-label", T("شاهد على يوتيوب: ") + order[i].title);
    };
    go(0);
    // في الاتجاه العربي: السهم اليمين للسابق واليسار للتالي
    if (many) {
      box.querySelector(".yt-prev").addEventListener("click", () => { go(i - 1); restart(); });
      box.querySelector(".yt-next").addEventListener("click", () => { go(i + 1); restart(); });
    }
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const restart = () => { clearInterval(timer); if (!reduce) timer = setInterval(() => go(i + 1), 6000); };
    box.addEventListener("mouseenter", () => clearInterval(timer));
    box.addEventListener("mouseleave", restart);
    restart();
    return box;
  }

  function place() {
    const list = document.querySelector(".index-list");
    if (!list || document.querySelector(".yt")) return;
    clearInterval(timer);
    list.after(build()); // تحت الأقسام وبنفس عرضها
  }
  new MutationObserver(place).observe(document.getElementById("view"), { childList: true });
  place();
})();
