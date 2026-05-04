import { initAgent } from "https://cdn.jsdelivr.net/npm/clippyjs/dist/index.mjs";
import * as agents from "https://cdn.jsdelivr.net/npm/clippyjs/dist/agents/index.mjs";

let agent = null;
let currentName = "Clippy";
let isVisible = false;

function cleanupOldAgentsDOM() {
  document.querySelectorAll(".clippy, .clippy-balloon").forEach((el) => el.remove());
}

function positionAgent(agentInstance) {
  if (!agentInstance) return;
  agentInstance.moveTo(window.innerWidth - 220, window.innerHeight - 220);
}

export async function startClippy(name = "Clippy") {
  currentName = name;


  if (agent && isVisible) {
    positionAgent(agent);
    return agent;
  }


  if (agent && !isVisible) {
    agent.show?.();

    document.querySelectorAll(".clippy, .clippy-balloon").forEach((el) => {
      el.style.display = "";
    });

    positionAgent(agent);
    isVisible = true;
    return agent;
  }

  cleanupOldAgentsDOM();

  const AgentCtor = agents[name];
  if (!AgentCtor) {
    console.warn(`Agente inválido: ${name}`);
    return null;
  }

  agent = await initAgent(AgentCtor);
  window.clippyAgent = agent;

  agent.show?.();
  positionAgent(agent);
  agent.speak?.(`Hello! I'm ${name}!`);

  isVisible = true;
  return agent;
}

export function clippySpeak(text) {
  if (agent && isVisible) {
    agent.speak?.(text);
  }
}

export function closeClippy() {
  if (!agent) return;

  try {
    agent.hide?.();
  } catch {}

  document.querySelectorAll(".clippy, .clippy-balloon").forEach((el) => {
    el.style.display = "none";
  });

  isVisible = false;
}

export function showClippy() {
  if (!agent) {
    return startClippy(currentName);
  }

  try {
    agent.show?.();
  } catch {}

  document.querySelectorAll(".clippy, .clippy-balloon").forEach((el) => {
    el.style.display = "";
  });

  positionAgent(agent);
  isVisible = true;
}

export function toggleClippy() {
  if (!agent || !isVisible) {
    return showClippy();
  }
  closeClippy();
}

export function changeAgent(name) {
  currentName = name;

  if (agent) {
    try {
      agent.stop?.();
    } catch {}

    try {
      agent.hide?.();
    } catch {}

    try {
      agent.dispose?.();
    } catch {}

    agent = null;
    isVisible = false;
  }

  cleanupOldAgentsDOM();
  return startClippy(name);
}

export function getAgentName() {
  return currentName;
}

export function isClippyOpen() {
  return isVisible;
}

window.addEventListener("resize", () => {
  if (agent && isVisible) {
    positionAgent(agent);
  }
});