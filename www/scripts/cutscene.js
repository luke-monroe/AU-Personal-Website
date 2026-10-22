let matrixIntervalId = null;
let isSkipped = false;

document.addEventListener('DOMContentLoaded', () => {
  const navEntry = performance.getEntriesByType?.('navigation')?.[0];
  const isReload = navEntry ? navEntry.type === 'reload' : (performance.navigation && performance.navigation.type === 1);
  if (isReload) {
    sessionStorage.removeItem('cutscene_shown');
  }

  // Check if we should skip via URL (e.g., iframe source ?no-cutscene=true)
  // or if it has already played during this browser session
  if (window.location.search.includes('no-cutscene') || sessionStorage.getItem('cutscene_shown')) {
    const overlay = document.getElementById('cutscene-overlay');
    if (overlay) overlay.remove();
    return;
  }
  sessionStorage.setItem('cutscene_shown', 'true');
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
  
  const sendPacketAnim = (text, direction = 'req', duration = 1.0) => {
    packetText.innerText = text;
    packet.style.animation = "none";
    void packet.offsetWidth;
    packet.style.animation = `${direction === 'req' ? 'reqPacket' : 'sendPacket'} ${duration}s ease-in-out forwards`;
  };

  // -- Step 1: TCP 3-Way Handshake --
  await wait(400);
  if (isSkipped) return;
  sendPacketAnim("TCP [SYN] Port 443", 'req', 1.1);
  await wait(800);

  if (isSkipped) return;
  sendPacketAnim("TCP [SYN, ACK]", 'send', 1.1);
  await wait(800);

  if (isSkipped) return;
  sendPacketAnim("TCP [ACK]", 'req', 1.0);
  await wait(800);

  // -- Step 2: TLS 1.3 Handshake --
  if (isSkipped) return;
  sendPacketAnim("TLS 1.3 Client Hello", 'req', 1.1);
  await wait(800);

  if (isSkipped) return;
  sendPacketAnim("TLS Server Hello + Cert", 'send', 1.1);
  await wait(800);

  if (isSkipped) return;
  sendPacketAnim("TLS Handshake Complete", 'send', 1.0);
  await wait(800);

  // -- Step 3: HTTP Document (HTML) --
  if (isSkipped) return;
  sendPacketAnim("GET /index.html", 'req', 1.2);
  await wait(1350);

  if (isSkipped) return;
  sendPacketAnim("200 OK (text/html)", 'send', 1.2);
  await wait(1100);

  if (isSkipped) return;
  unstyled.style.opacity = '1'; // Reveal raw HTML
  await wait(1300);

  // -- Step 4: HTTP Stylesheet (CSS) --
  if (isSkipped) return;
  sendPacketAnim("GET /styles/guide.css", 'req', 1.2);
  await wait(1350);

  if (isSkipped) return;
  sendPacketAnim("200 OK (text/css)", 'send', 1.2);
  await wait(1100);

  if (isSkipped) return;
  styled.style.opacity = '1'; // Reveal 1:1 styled preview
  unstyled.classList.add('preview-fade-out'); // Crossfade out raw HTML
  await wait(1300);

  // -- Step 5: HTTP Asset (Image) --
  if (isSkipped) return;
  sendPacketAnim("GET /assets/luke.webp", 'req', 1.2);
  await wait(1350);

  if (isSkipped) return;
  sendPacketAnim("200 OK (image/webp)", 'send', 1.2);
  await wait(1200);
  await wait(800);

  // -- Step 5: Expand smoothly from the PC viewport to the full page --
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

  const letters = ['0', '1'];
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