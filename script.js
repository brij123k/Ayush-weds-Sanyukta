/* =========================================================
   Ayush & Sanyukta – Wedding Invite
   ========================================================= */

const CONFIG = {
  // First event (Haldi) – 23 Jan 2027, 3:00 PM IST
  countdownTo: "2027-01-23T15:00:00+05:30",
  // Wardrobe Planner PDF – downloads when the planner is tapped. Leave "" to show a "coming soon" note.
  wardrobePlannerUrl: "assets/planner/SA-Planner.pdf",
  wardrobePlannerFileName: "Sanyukta-Ayush-Style-Guide.pdf",
  // Optional song for the Sangeet ticket / vinyl, e.g. "assets/sangeet/song.mp3"
  sangeetSong: "",
};

/* ---------- Intro video → then the invite ---------- */
(function intro() {
  const wrap = document.getElementById("intro");
  const video = document.getElementById("introVideo");
  const sound = document.getElementById("introSound");
  const PLAY_SECONDS = 3; // play the first 3 seconds, then fade into the invite
  const FADE_MS = 1200;   // keep in sync with the #intro transition in style.css
  let closed = false;

  // Smoothly fade the video away to reveal the invitation page. No tap needed.
  function close() {
    if (closed) return;
    closed = true;
    wrap.classList.add("gone");
    document.body.classList.remove("intro-on");
    setTimeout(() => video.pause(), FADE_MS); // keep it moving while it fades
  }

  video.addEventListener("playing", () => video.classList.add("show"), { once: true });
  video.addEventListener("timeupdate", () => video.currentTime >= PLAY_SECONDS && close());
  video.addEventListener("ended", close);

  // Browsers only autoplay muted video. If autoplay is blocked
  // (e.g. iPhone Low Power Mode), still open the invite after 3 seconds.
  video.play().catch(() => setTimeout(close, PLAY_SECONDS * 1000));

  // Safety net: on a very slow connection, don't keep guests waiting on a loading video.
  setTimeout(close, 8000);

  sound.addEventListener("click", () => {
    video.muted = !video.muted;
    sound.textContent = video.muted ? "🔇" : "🔊";
    sound.setAttribute("aria-label", video.muted ? "Turn sound on" : "Turn sound off");
  });

  video.addEventListener("error", close); // never leave guests stuck on a broken video
})();

/* ---------- Loader ---------- */
(function loader() {
  const el = document.getElementById("loader");
  const bar = el.querySelector(".loader-bar i");
  const imgs = [...document.images];
  let done = 0;
  const finish = () => setTimeout(() => el.classList.add("gone"), 300);
  const tick = () => {
    bar.style.width = Math.round((++done / imgs.length) * 100) + "%";
    if (done >= imgs.length) finish();
  };
  imgs.forEach((img) => (img.complete ? tick() : (img.addEventListener("load", tick), img.addEventListener("error", tick))));
  setTimeout(finish, 6000);
})();

/* ---------- Toast ---------- */
function toast(msg) {
  let t = document.querySelector(".toast");
  if (!t) {
    t = document.createElement("div");
    t.className = "toast";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.remove("show"), 2600);
}

/* ---------- Fade sections in on scroll ---------- */
(function reveal() {
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.isIntersecting && (e.target.classList.add("in"), io.unobserve(e.target))),
    { threshold: 0.05 }
  );
  document.querySelectorAll(".fade").forEach((el) => io.observe(el));
})();

/* ---------- Confetti burst ---------- */
function burst(anchor) {
  const r = anchor.getBoundingClientRect();
  const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  for (let i = 0; i < 28; i++) {
    const s = document.createElement("span");
    const a = Math.random() * Math.PI * 2, d = 60 + Math.random() * 120;
    Object.assign(s.style, {
      position: "fixed", left: cx + "px", top: cy + "px", width: "7px", height: "7px",
      borderRadius: Math.random() > 0.5 ? "50%" : "1px",
      background: ["#d4a43a", "#f4c9d0", "#e9b949", "#c46a7c"][i % 4],
      zIndex: 60, pointerEvents: "none",
      transition: "transform 1s cubic-bezier(.2,.8,.3,1), opacity 1s ease",
    });
    document.body.appendChild(s);
    requestAnimationFrame(() => {
      s.style.transform = `translate(${Math.cos(a) * d}px, ${Math.sin(a) * d + 40}px) rotate(${Math.random() * 360}deg)`;
      s.style.opacity = "0";
    });
    setTimeout(() => s.remove(), 1100);
  }
}

/* ---------- Scratch the glitter heart to reveal the date ---------- */
(function scratchHeart() {
  const wrap = document.getElementById("scratch");
  const canvas = document.getElementById("scratchCanvas");
  const img = wrap.querySelector(".scratch-img");
  const ctx = canvas.getContext("2d");
  const GRID = 18;
  const hit = new Set();
  let drawing = false, finished = false, last = null, paintedWidth = 0;

  function paint() {
    const r = wrap.getBoundingClientRect();
    // Mobile browsers fire "resize" when the address bar shows/hides during scroll.
    // Only repaint when the width really changed, or the guest's scratching is wiped.
    if (r.width === paintedWidth) return;
    paintedWidth = r.width;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = r.width * dpr;
    canvas.height = r.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(img, 0, 0, r.width, r.height);
    hit.clear();
  }
  img.complete ? paint() : img.addEventListener("load", paint);
  window.addEventListener("resize", () => !finished && paint());

  const pos = (e) => {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top, w: r.width, h: r.height };
  };

  function scratch(p) {
    const rad = p.w * 0.09;
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineCap = "round";
    ctx.lineWidth = rad * 2;
    ctx.beginPath();
    ctx.moveTo(last ? last.x : p.x, last ? last.y : p.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last = p;
    for (let dx = -rad; dx <= rad; dx += rad / 2)
      for (let dy = -rad; dy <= rad; dy += rad / 2) {
        const gx = Math.floor(((p.x + dx) / p.w) * GRID), gy = Math.floor(((p.y + dy) / p.h) * GRID);
        if (gx >= 0 && gy >= 0 && gx < GRID && gy < GRID) hit.add(gx + "," + gy);
      }
    if (hit.size / (GRID * GRID) > 0.4) finish();
  }

  function finish() {
    if (finished) return;
    finished = true;
    wrap.classList.add("done");
    burst(wrap);
  }

  canvas.addEventListener("pointerdown", (e) => {
    drawing = true; last = null;
    canvas.setPointerCapture(e.pointerId);
    scratch(pos(e));
  });
  canvas.addEventListener("pointermove", (e) => drawing && scratch(pos(e)));
  ["pointerup", "pointercancel", "pointerleave"].forEach((ev) =>
    canvas.addEventListener(ev, () => { drawing = false; last = null; })
  );
  canvas.addEventListener("dblclick", finish);
})();

/* ---------- Haldi: tap polaroid → haldi faces ---------- */
(function haldi() {
  const btn = document.getElementById("haldiPhoto");
  btn.addEventListener("click", () => {
    if (btn.classList.toggle("on")) burst(btn);
  });
})();

/* ---------- Sangeet: flip ticket + spin vinyl ---------- */
(function sangeet() {
  const ticket = document.getElementById("ticket");
  const vinyl = document.getElementById("vinyl");
  const audio = CONFIG.sangeetSong ? new Audio(CONFIG.sangeetSong) : null;
  if (audio) audio.loop = true;
  const play = (on) => {
    vinyl.classList.toggle("playing", on);
    if (audio) on ? audio.play().catch(() => {}) : audio.pause();
  };

  ticket.addEventListener("click", () => {
    const flipped = ticket.classList.toggle("flipped");
    play(flipped);
    if (flipped) burst(ticket);
  });
  vinyl.addEventListener("click", () => play(!vinyl.classList.contains("playing")));
})();

/* ---------- Wardrobe planner ---------- */
document.querySelectorAll(".planner-link").forEach((a) => {
  if (CONFIG.wardrobePlannerUrl) {
    a.href = CONFIG.wardrobePlannerUrl;
    a.setAttribute("download", CONFIG.wardrobePlannerFileName);
    a.addEventListener("click", () => toast("Downloading the style guide ✨"));
  } else {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      toast("Wardrobe planner coming soon ✨");
    });
  }
});

/* ---------- Countdown ---------- */
(function countdown() {
  const target = new Date(CONFIG.countdownTo).getTime();
  const els = {};
  document.querySelectorAll("#countdown b").forEach((b) => (els[b.dataset.k] = b));
  const pad = (n) => String(n).padStart(2, "0");
  function update() {
    let diff = Math.max(0, target - Date.now());
    const d = Math.floor(diff / 864e5); diff -= d * 864e5;
    const h = Math.floor(diff / 36e5);  diff -= h * 36e5;
    const m = Math.floor(diff / 6e4);   diff -= m * 6e4;
    const s = Math.floor(diff / 1e3);
    els.d.textContent = pad(d);
    els.h.textContent = pad(h);
    els.m.textContent = pad(m);
    els.s.textContent = pad(s);
  }
  update();
  setInterval(update, 1000);
})();
