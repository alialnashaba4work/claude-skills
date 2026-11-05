(function () {
  "use strict";
  const Y = window.YT || { videos: [] };
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const SH = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h3c4 0 6 10 10 10h3M4 17h3c1.6 0 2.8-1.6 3.8-3.4M14 9.4C15 8 16 7 17 7h3M18 4l3 3-3 3M18 14l3 3-3 3"/></svg>';
  const PL = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6.5v11l9-5.5z" fill="currentColor" stroke="none"/></svg>';
  let order = [], i = 0, timer = null;

  function build() {
    const box = document.createElement("aside");
    box.className = "yt";
    box.setAttribute("aria-label", "مقاطع من قناة يوتيوب");
    box.innerHTML = `<div class="yt-head"><h2>من قناة يوتيوب</h2>${Y.videos.length > 1 ? `<button class="yt-shuffle" type="button">${SH}<span>مقطع آخر</span></button>` : ""}</div>
      <a class="yt-stage" href="${esc(Y.channel)}" target="_blank" rel="noopener"></a>
      <div class="yt-dots" aria-hidden="true"></div>`;
    const stage = box.querySelector(".yt-stage");
    if (!Y.videos.length) {
      stage.outerHTML = `<div class="yt-stage"><div class="yt-empty"><p>تظهر هنا مقاطع القناة بشكل عشوائي.<br><a href="${esc(Y.channel)}" target="_blank" rel="noopener">افتح القناة على يوتيوب</a></p></div></div>`;
      return box;
    }
    order = shuffle(Y.videos); i = 0;
    stage.innerHTML = order.map((v, k) => `<div class="yt-slide${k === 0 ? " on" : ""}">${v.thumb ? `<img src="${esc(v.thumb)}" alt="" loading="lazy">` : ""}<p class="yt-title">${esc(v.title)}</p></div>`).join("") + `<span class="yt-play">${PL}</span>`;
    if (order.length > 1) box.querySelector(".yt-dots").innerHTML = order.slice(0, 8).map((_, k) => `<span class="${k === 0 ? "on" : ""}"></span>`).join("");
    const go = (n) => {
      i = (n + order.length) % order.length;
      stage.querySelectorAll(".yt-slide").forEach((s, k) => s.classList.toggle("on", k === i));
      box.querySelectorAll(".yt-dots span").forEach((d, k) => d.classList.toggle("on", k === i % 8));
      stage.href = "https://www.youtube.com/watch?v=" + encodeURIComponent(order[i].id);
      stage.setAttribute("aria-label", "شاهد على يوتيوب: " + order[i].title);
    };
    go(0);
    const btn = box.querySelector(".yt-shuffle");
    if (btn) btn.addEventListener("click", () => { go(i + 1 + Math.floor(Math.random() * Math.max(1, order.length - 1))); restart(); });
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
