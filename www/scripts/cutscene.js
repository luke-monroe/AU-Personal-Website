(function () {
  const overlay = document.getElementById('cutscene-overlay');

  if (!overlay) {
    return;
  }

  if (sessionStorage.getItem('cutscenePlayed') === 'true' || window.location.search.includes('no-cutscene')) {
    overlay.remove();
    return;
  }

  const canvas = document.getElementById('matrix-canvas');
  const context = canvas.getContext('2d');
  const logs = document.getElementById('network-logs');
  const monitor = document.getElementById('pc-monitor');
  const unstyledPreview = document.getElementById('unstyled-preview');
  const styledIframe = document.getElementById('styled-iframe');
  const characters = 'アカサタナハマヤラワ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const logMessages = [
    'DNS Query... 192.0.2.14',
    'Establishing TCP Connection...',
    'TLS Handshake... complete',
    'Requesting /index.html...',
    'Receiving HTML Packet... 100%',
    'Rendering Document Object Model...'
  ];
  let columns;
  let drops;
  let animationFrame;

  function resizeCanvas() {
    const density = 18;
    const scale = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * scale;
    canvas.height = window.innerHeight * scale;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    context.setTransform(scale, 0, 0, scale, 0, 0);
    columns = Math.ceil(window.innerWidth / density);
    drops = Array.from({ length: columns }, () => Math.random() * -40);
  }

  function drawMatrix() {
    context.fillStyle = 'rgba(0, 0, 0, 0.08)';
    context.fillRect(0, 0, window.innerWidth, window.innerHeight);
    context.fillStyle = '#0f0';
    context.font = '15px monospace';

    drops.forEach((drop, index) => {
      const character = characters[Math.floor(Math.random() * characters.length)];
      const x = index * 18;
      const y = drop * 18;
      context.fillText(character, x, y);

      if (y > window.innerHeight && Math.random() > 0.975) {
        drops[index] = 0;
      } else {
        drops[index] += 1;
      }
    });

    animationFrame = window.requestAnimationFrame(drawMatrix);
  }

  function loadStyledPreview() {
    const url = new URL(window.location.href);
    url.searchParams.set('no-cutscene', 'true');
    styledIframe.src = `${url.pathname}${url.search}${url.hash}`;
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  loadStyledPreview();
  drawMatrix();

  logMessages.forEach((message, index) => {
    window.setTimeout(() => {
      const entry = document.createElement('p');
      entry.textContent = `> ${message}`;
      logs.appendChild(entry);
    }, (index + 1) * 500);
  });

  window.setTimeout(() => {
    logs.style.display = 'none';
    monitor.style.display = 'block';
  }, 3500);

  window.setTimeout(() => {
    unstyledPreview.classList.add('preview-fade-out');
  }, 5000);

  window.setTimeout(() => {
    monitor.classList.add('zoom-in');
  }, 6500);

  window.setTimeout(() => {
    window.cancelAnimationFrame(animationFrame);
    window.removeEventListener('resize', resizeCanvas);
    sessionStorage.setItem('cutscenePlayed', 'true');
    overlay.remove();
  }, 8500);
})();