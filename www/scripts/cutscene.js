let matrixIntervalId = null;
let isSkipped = false;

document.addEventListener('DOMContentLoaded', () => {
  // Check if we should skip via URL (e.g., iframe source ?no-cutscene=true)
  if (window.location.search.includes('no-cutscene')) {
    const overlay = document.getElementById('cutscene-overlay');
    if (overlay) overlay.remove();
    return;
  }
  document.body.style.overflow = 'hidden';
  initMatrixCanvas();
  runCutsceneSequence();
});

const wait = (ms) => new Promise(res => setTimeout(res, ms));

async function runCutsceneSequence() {
  const packet = document.getElementById('packet');
  const packetText = document.getElementById('packet-text');
  const unstyled = document.getElementById('unstyled-preview');
  const styled = document.getElementById('styled-iframe');
  
  // -- Step 1: Network Handshake (0s - 4.5s) --
  await wait(500);
  if (isSkipped) return;
  packetText.innerText = "SYN (DNS Lookup)";
  packet.style.animation = "reqPacket 1.5s ease-in-out forwards";
  await wait(1800);
  
  if (isSkipped) return;
  packetText.innerText = "ACK";
  packet.style.animation = "sendPacket 1.5s ease-in-out forwards";
  await wait(1800);

  // -- Step 2: Request Raw HTML (4.5s - 9.5s) --
  if (isSkipped) return;
  packetText.innerText = "GET /index.html";
  packet.style.animation = "none"; void packet.offsetWidth; // reset anim
  packet.style.animation = "reqPacket 1.5s ease-in-out forwards";
  await wait(1800);

  if (isSkipped) return;
  packetText.innerText = "200 OK (text/html)";
  packet.style.animation = "none"; void packet.offsetWidth;
  packet.style.animation = "sendPacket 1.5s ease-in-out forwards";
  await wait(1500);
  
  if (isSkipped) return;
  unstyled.style.opacity = '1'; // Reveal raw HTML
  await wait(1500);

  // -- Step 3: Request CSS (9.5s - 15.5s) --
  if (isSkipped) return;
  packetText.innerText = "GET /guide.css";
  packet.style.animation = "none"; void packet.offsetWidth;
  packet.style.animation = "reqPacket 1.5s ease-in-out forwards";
  await wait(1800);

  if (isSkipped) return;
  packetText.innerText = "200 OK (text/css)";
  packet.style.animation = "none"; void packet.offsetWidth;
  packet.style.animation = "sendPacket 1.5s ease-in-out forwards";
  await wait(1500);

  if (isSkipped) return;
  styled.style.opacity = '1'; // Fade in iframe
  unstyled.classList.add('preview-fade-out'); // Crossfade out unstyled
  await wait(2500);

  // -- Step 4: Expand smoothly from the PC viewport to the full page --
  if (isSkipped) return;

  const serverRack = document.getElementById('server-rack');
  const dataLink = document.getElementById('data-link');
  const pcBase = document.querySelector('.pc-base');
  const skipBtn = document.getElementById('skip-btn');
  const monitor = document.getElementById('pc-monitor');
  const wrapper = document.getElementById('pc-wrapper');

  if (serverRack) serverRack.style.opacity = '0';
  if (dataLink) dataLink.style.opacity = '0';
  if (pcBase) pcBase.style.opacity = '0';
  if (skipBtn) skipBtn.style.opacity = '0';

  await wait(700);
  if (isSkipped) return;

  if (!monitor || !wrapper) {
    skipIntro();
    return;
  }

  // 1. Capture the exact screen position and dimensions of the PC monitor
  const rect = monitor.getBoundingClientRect();

  // 2. Lock wrapper dimensions so the flex stage layout doesn't shift
  wrapper.style.width = `${rect.width}px`;
  wrapper.style.height = `${rect.height}px`;

  // 3. Pin monitor to fixed position at its exact visual coordinates
  monitor.style.position = 'fixed';
  monitor.style.top = `${rect.top}px`;
  monitor.style.left = `${rect.left}px`;
  monitor.style.width = `${rect.width}px`;
  monitor.style.height = `${rect.height}px`;
  monitor.style.maxWidth = 'none';
  monitor.style.margin = '0';
  monitor.style.transform = 'none';
  monitor.style.zIndex = '1000';

  // Force reflow to commit starting position
  void monitor.offsetWidth;

  // 4. Fade out matrix canvas smoothly as the website expands
  const canvas = document.getElementById('matrix-canvas');
  if (canvas) {
    canvas.style.transition = 'opacity 1.2s ease';
    canvas.style.opacity = '0';
  }

  // 5. Expand from the PC viewport to the full browser window
  const animDuration = 1500;
  const timingFn = 'cubic-bezier(0.16, 1, 0.3, 1)';
  monitor.style.transition = [
    `top ${animDuration}ms ${timingFn}`,
    `left ${animDuration}ms ${timingFn}`,
    `width ${animDuration}ms ${timingFn}`,
    `height ${animDuration}ms ${timingFn}`,
    `border-width ${animDuration * 0.8}ms ${timingFn}`,
    `border-color ${animDuration * 0.8}ms ease`,
    `border-radius ${animDuration * 0.8}ms ease`,
    `box-shadow ${animDuration * 0.8}ms ease`
  ].join(', ');

  requestAnimationFrame(() => {
    monitor.style.top = '0px';
    monitor.style.left = '0px';
    monitor.style.width = '100vw';
    monitor.style.height = '100vh';
    monitor.style.borderWidth = '0px';
    monitor.style.borderColor = 'transparent';
    monitor.style.borderRadius = '0px';
    monitor.style.boxShadow = 'none';
  });

  await wait(animDuration);

  // -- Step 5: Clean, seamless handoff to the live page --
  if (!isSkipped) {
    const overlay = document.getElementById('cutscene-overlay');
    if (overlay) {
      overlay.style.transition = 'opacity 0.3s ease';
      overlay.style.opacity = '0';
      setTimeout(() => {
        if (matrixIntervalId) clearInterval(matrixIntervalId);
        overlay.remove();
        document.body.style.overflow = 'auto';
      }, 300);
    }
  }
}

function skipIntro() {
  if (isSkipped) return;
  isSkipped = true;
  if (matrixIntervalId) clearInterval(matrixIntervalId);
  const overlay = document.getElementById('cutscene-overlay');
  if (!overlay) {
    document.body.style.overflow = 'auto';
    return;
  }
  overlay.style.transition = 'opacity 0.4s ease';
  overlay.style.opacity = '0';
  setTimeout(() => {
    overlay.remove();
    document.body.style.overflow = 'auto';
  }, 400);
}

// Allow skipping via Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && document.getElementById('cutscene-overlay')) {
    skipIntro();
  }
});

// Matrix Background Logic
function initMatrixCanvas() {
  const canvas = document.getElementById('matrix-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  window.addEventListener('resize', resize);
  resize();

  const letters = '01ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const fontSize = 14;
  let columns = Math.floor(canvas.width / fontSize);
  let drops = Array.from({ length: columns }).fill(1);

  window.addEventListener('resize', () => {
    columns = Math.floor(canvas.width / fontSize);
    drops = Array.from({ length: columns }).fill(1);
  });

  function draw() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0f0';
    ctx.font = fontSize + 'px monospace';

    for (let i = 0; i < drops.length; i++) {
      const text = letters[Math.floor(Math.random() * letters.length)];
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);
      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }
  matrixIntervalId = setInterval(draw, 50);
}