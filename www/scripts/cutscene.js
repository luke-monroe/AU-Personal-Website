document.addEventListener('DOMContentLoaded', () => {
  // Check if we should skip via URL (e.g., iframe source ?no-cutscene=true)
  if (window.location.search.includes('no-cutscene')) {
    document.getElementById('cutscene-overlay').remove();
    return;
  }
  initMatrixCanvas();
  runCutsceneSequence();
});

const wait = (ms) => new Promise(res => setTimeout(res, ms));
let isSkipped = false;

async function runCutsceneSequence() {
  const packet = document.getElementById('packet');
  const packetText = document.getElementById('packet-text');
  const unstyled = document.getElementById('unstyled-preview');
  const styled = document.getElementById('styled-iframe');
  
  // -- Step 1: Network Handshake (0s - 4.5s) --
  await wait(500);
  if(isSkipped) return;
  packetText.innerText = "SYN (DNS Lookup)";
  packet.style.animation = "reqPacket 1.5s ease-in-out forwards";
  await wait(1800);
  
  if(isSkipped) return;
  packetText.innerText = "ACK";
  packet.style.animation = "sendPacket 1.5s ease-in-out forwards";
  await wait(1800);

  // -- Step 2: Request Raw HTML (4.5s - 9.5s) --
  if(isSkipped) return;
  packetText.innerText = "GET /index.html";
  packet.style.animation = "none"; void packet.offsetWidth; // reset anim
  packet.style.animation = "reqPacket 1.5s ease-in-out forwards";
  await wait(1800);

  if(isSkipped) return;
  packetText.innerText = "200 OK (text/html)";
  packet.style.animation = "none"; void packet.offsetWidth;
  packet.style.animation = "sendPacket 1.5s ease-in-out forwards";
  await wait(1500);
  
  if(isSkipped) return;
  unstyled.style.opacity = '1'; // Reveal raw HTML
  await wait(1500);

  // -- Step 3: Request CSS (9.5s - 15.5s) --
  if(isSkipped) return;
  packetText.innerText = "GET /guide.css";
  packet.style.animation = "none"; void packet.offsetWidth;
  packet.style.animation = "reqPacket 1.5s ease-in-out forwards";
  await wait(1800);

  if(isSkipped) return;
  packetText.innerText = "200 OK (text/css)";
  packet.style.animation = "none"; void packet.offsetWidth;
  packet.style.animation = "sendPacket 1.5s ease-in-out forwards";
  await wait(1500);

  if(isSkipped) return;
  styled.style.opacity = '1'; // Fade in iframe
  unstyled.classList.add('preview-fade-out'); // Crossfade out unstyled
  await wait(2500);

  // -- Step 4: Zoom into screen (15.5s - 19.5s) --
  if(isSkipped) return;
  document.getElementById('server-rack').style.opacity = '0';
  document.getElementById('data-link').style.opacity = '0';
  document.querySelector('.pc-base').style.opacity = '0';
  await wait(800);
  
  if(isSkipped) return;
  document.getElementById('pc-monitor').classList.add('zoom-in');
  
  // Wait for the CSS transition to finish
  await wait(2000); 

  // -- Step 5: Clean transition --
  if(!isSkipped) skipIntro();
}

function skipIntro() {
  isSkipped = true;
  const overlay = document.getElementById('cutscene-overlay');
  overlay.style.opacity = '0';
  overlay.style.transition = 'opacity 0.5s ease';
  setTimeout(() => {
    overlay.remove();
    document.body.style.overflow = 'auto'; // Re-enable scrolling on main page
  }, 500);
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
  const ctx = canvas.getContext('2d');
  
  const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
  window.addEventListener('resize', resize);
  resize();

  const letters = '01ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const fontSize = 14;
  const columns = canvas.width / fontSize;
  const drops = Array.from({length: columns}).fill(1);

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
  setInterval(draw, 50);
}