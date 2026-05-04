import { startClippy, clippySpeak, changeAgent, closeClippy } from "./clippy.js";


startClippy("Clippy");

const desktop = document.getElementById("desktop");
const taskbarApps = document.getElementById("taskbarApps");
const startBtn = document.getElementById("startBtn");
const startMenu = document.getElementById("startMenu");
const clockEl = document.getElementById("clock");

let zTop = 20;
const openWindows = new Map();

// ===== Window management =====
function bringToFront(win) {
  zTop += 1;
  win.style.zIndex = String(zTop);
}

async function showWin(id) {
  const win = document.getElementById(id);
  if (!win) return;

  win.classList.remove("hidden");
  bringToFront(win);

  if (!openWindows.has(id)) {
    openWindows.set(id, { minimized: false });
  } else {
    openWindows.get(id).minimized = false;
  }

  renderTaskbar();

  if (id === "projectsWin") clippySpeak("Opening Projects folder!");
  if (id === "contactWin") clippySpeak("Need to contact Lizzy?");
  if (id === "readmeWin") clippySpeak("Reading the README.");

  if (id === "agentsWin") {
    await startClippy();
    clippySpeak("Choose an agent!");
  }
}

function hideWin(id) {
  const win = document.getElementById(id);
  if (!win) return;

  if (id === "agentsWin") {
    closeClippy();
  }

  win.classList.add("hidden");
  openWindows.delete(id);
  renderTaskbar();
  clippySpeak("Window closed.");
}

function minimizeWin(id) {
  const win = document.getElementById(id);
  if (!win) return;

  win.classList.add("hidden");

  if (openWindows.has(id)) {
    openWindows.get(id).minimized = true;
  } else {
    openWindows.set(id, { minimized: true });
  }

  renderTaskbar();
  clippySpeak("Minimized.");
}

async function toggleWinFromTaskbar(id) {
  const win = document.getElementById(id);
  if (!win) return;

  if (win.classList.contains("hidden")) {
    await showWin(id);
  } else {
    minimizeWin(id);
  }
}

function getTitleForWin(id) {
  const win = document.getElementById(id);
  return win?.dataset?.title || id;
}

function renderTaskbar() {
  taskbarApps.innerHTML = "";

  for (const [id] of openWindows.entries()) {
    const btn = document.createElement("button");
    btn.className = "btn task-btn win";
    btn.textContent = getTitleForWin(id);
    btn.addEventListener("click", () => {
      toggleWinFromTaskbar(id);
    });
    taskbarApps.appendChild(btn);
  }
}

// ===== Desktop icons =====
desktop.addEventListener("click", (e) => {
  const icon = e.target.closest(".icon");

  document.querySelectorAll(".icon").forEach((i) => {
    i.classList.remove("selected");
  });

  if (icon) {
    icon.classList.add("selected");
  } else {
    startMenu.classList.add("hidden");
  }
});

desktop.addEventListener("dblclick", async (e) => {
  const icon = e.target.closest(".icon");
  if (!icon) return;

  await showWin(icon.dataset.open);
});

// ===== Buttons data-open =====
document.addEventListener("click", async (e) => {
  const btn = e.target.closest("[data-open]");
  if (btn && !btn.classList.contains("icon")) {
    await showWin(btn.dataset.open);
    startMenu.classList.add("hidden");
  }
});

// ===== Agent buttons =====
document.addEventListener("click", async (e) => {
  const btn = e.target.closest(".agent-btn");
  if (!btn) return;

  const name = btn.dataset.agent;
  await changeAgent(name);
});

// ===== Window controls =====
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".wbtn");
  if (!btn) return;

  const win = btn.closest(".window");
  if (!win) return;

  if (btn.dataset.action === "close") {
    hideWin(win.id);
  }

  if (btn.dataset.action === "min") {
    minimizeWin(win.id);
  }
});

// ===== Focus window =====
document.querySelectorAll(".window").forEach((win) => {
  win.addEventListener("mousedown", () => bringToFront(win));
});

// ===== Drag windows =====
let drag = null;

document.addEventListener("mousedown", (e) => {
  const handle = e.target.closest(".drag-handle");
  if (!handle) return;

  const win = handle.closest(".window");
  if (!win) return;

  bringToFront(win);

  const rect = win.getBoundingClientRect();
  drag = {
    win,
    startX: e.clientX,
    startY: e.clientY,
    left: rect.left,
    top: rect.top,
  };

  e.preventDefault();
});

document.addEventListener("mousemove", (e) => {
  if (!drag) return;

  drag.win.style.left = drag.left + (e.clientX - drag.startX) + "px";
  drag.win.style.top = drag.top + (e.clientY - drag.startY) + "px";
});

document.addEventListener("mouseup", () => {
  drag = null;
});

// ===== Start menu =====
startBtn.addEventListener("click", (e) => {
  startMenu.classList.toggle("hidden");
  e.stopPropagation();
});

document.addEventListener("click", (e) => {
  if (!e.target.closest("#startMenu") && !e.target.closest("#startBtn")) {
    startMenu.classList.add("hidden");
  }
});

// ===== Clock =====
function tick() {
  const now = new Date();
  clockEl.textContent = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

tick();
setInterval(tick, 10000);

// abre a janela principal ao carregar
showWin("aboutWin");