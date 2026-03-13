// ══════════════════════════════════════════
// MAP RENDERING
// ══════════════════════════════════════════
const mapCanvas = document.getElementById('map-canvas');
const ctx = mapCanvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

const W = 2400, H = 1800;
const TILE = 48;
const COLS = W / TILE; // 50
const ROWS = H / TILE; // 37.5 → 38

// Tile types
const T = {
  GRASS: 0, GRASS_D: 1, GRASS_L: 2,
  PATH: 3, PATH_D: 4,
  WATER: 5, WATER_L: 6,
  SAND: 7,
  STONE: 8, STONE_D: 9,
  WOOD_F: 10,
};

// Color palette per tile
const TILE_COLORS = {
  [T.GRASS]:   ['#3a7d44','#2d6035','#4a9455','#358040'],
  [T.GRASS_D]: ['#2d6035','#265530','#356840','#2a5c32'],
  [T.GRASS_L]: ['#4a9455','#3a8448','#55a060','#429050'],
  [T.PATH]:    ['#c8a96e','#b8956a','#d4b880','#c09060'],
  [T.PATH_D]:  ['#b8956a','#a88060','#c4a070','#b09060'],
  [T.WATER]:   ['#2a6fad','#235d99','#3080c0','#2870b0'],
  [T.WATER_L]: ['#3a8fd0','#3080be','#4598d8','#3888c8'],
  [T.SAND]:    ['#d4b483','#c8a870','#dcbc90','#d0b07c'],
  [T.STONE]:   ['#7a7a7a','#6a6a6a','#848484','#747474'],
  [T.STONE_D]: ['#5a5a5a','#4a4a4a','#646464','#545454'],
  [T.WOOD_F]:  ['#8B5E3C','#7B4E2C','#9B6E4C','#855840'],
};

// Simple seeded RNG for consistent map
function seededRand(seed) {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
}

const rng = seededRand(42);

// Generate tile map
const tileMap = [];
for (let r = 0; r < 38; r++) {
  tileMap[r] = [];
  for (let c = 0; c < 50; c++) {
    // Default grass
    let t = T.GRASS;
    const noise = rng();
    if (noise < 0.04) t = T.GRASS_D;
    else if (noise < 0.08) t = T.GRASS_L;
    tileMap[r][c] = t;
  }
}

// Carve paths (cross shape through map)
// Horizontal path row 16-18
for (let c = 0; c < 50; c++) {
  tileMap[16][c] = T.PATH;
  tileMap[17][c] = T.PATH;
  tileMap[18][c] = T.PATH_D;
}
// Vertical path col 20-22
for (let r = 0; r < 38; r++) {
  tileMap[r][20] = T.PATH;
  tileMap[r][21] = T.PATH;
  tileMap[r][22] = T.PATH_D;
}
// Diagonal-ish path to south
for (let r = 18; r < 38; r++) {
  tileMap[r][24] = T.PATH;
  tileMap[r][25] = T.PATH;
}

// Water body (top-right area)
for (let r = 2; r < 12; r++) {
  for (let c = 35; c < 50; c++) {
    const d = Math.sqrt((r-7)**2 + (c-42)**2);
    if (d < 6) tileMap[r][c] = T.WATER;
    else if (d < 7) tileMap[r][c] = T.SAND;
  }
}

// Stone area (bottom-left)
for (let r = 26; r < 38; r++) {
  for (let c = 0; c < 12; c++) {
    const noise2 = rng();
    tileMap[r][c] = noise2 < 0.5 ? T.STONE : T.STONE_D;
  }
}

// Wooden floor area (around workshop zone ~col27-32, row12-18)
for (let r = 12; r < 20; r++) {
  for (let c = 26; c < 34; c++) {
    tileMap[r][c] = T.WOOD_F;
  }
}

// Dark forest patch
for (let r = 22; r < 32; r++) {
  for (let c = 3; c < 14; c++) {
    if (rng() < 0.6) tileMap[r][c] = T.GRASS_D;
  }
}

// Draw tiles
function drawTile(r, c) {
  const t = tileMap[r] && tileMap[r][c] !== undefined ? tileMap[r][c] : T.GRASS;
  const colors = TILE_COLORS[t] || TILE_COLORS[T.GRASS];
  const x = c * TILE, y = r * TILE;
  const seed = r * 50 + c;
  const local = seededRand(seed + 1000);

  // Base color
  ctx.fillStyle = colors[0];
  ctx.fillRect(x, y, TILE, TILE);

  // Pixel detail: 4x4 pixel clusters
  for (let px = 0; px < TILE; px += 8) {
    for (let py = 0; py < TILE; py += 8) {
      const v = local();
      if (v < 0.35) {
        ctx.fillStyle = colors[Math.floor(v * 4 * colors.length) % colors.length];
        ctx.fillRect(x + px, y + py, 8, 8);
      }
    }
  }

  // Water shimmer
  if (t === T.WATER || t === T.WATER_L) {
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    for (let i = 0; i < 3; i++) {
      const wx = x + local() * TILE;
      const wy = y + local() * TILE;
      ctx.fillRect(wx, wy, 8, 3);
    }
  }

  // Path edge pixel lines
  if (t === T.PATH || t === T.PATH_D) {
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.fillRect(x, y, TILE, 2);
    ctx.fillRect(x, y + TILE - 2, TILE, 2);
  }
}

// Draw all tiles
for (let r = 0; r < 38; r++) {
  for (let c = 0; c < 50; c++) {
    drawTile(r, c);
  }
}

// Draw decorative trees (static on canvas)
function drawTree(x, y) {
  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(x + 8, y + 28, 24, 8);
  // Trunk
  ctx.fillStyle = '#6B4423';
  ctx.fillRect(x + 16, y + 20, 8, 16);
  // Leaves layers
  ctx.fillStyle = '#1a5e22';
  ctx.fillRect(x + 4, y + 12, 32, 16);
  ctx.fillStyle = '#2a7d33';
  ctx.fillRect(x + 8, y + 4, 24, 14);
  ctx.fillStyle = '#3a9444';
  ctx.fillRect(x + 12, y, 16, 10);
  // Highlight
  ctx.fillStyle = '#4aaa55';
  ctx.fillRect(x + 14, y + 2, 6, 4);
  ctx.fillRect(x + 10, y + 8, 6, 4);
}

// Scatter trees away from paths & zones
const treePositions = [
  [40,60],[100,80],[160,50],[220,120],[300,60],[380,90],[450,50],
  [600,80],[700,60],[760,120],[820,50],[880,90],
  [1050,80],[1100,50],[1160,90],[1220,60],[1450,80],[1530,50],[1600,90],
  [1700,60],[1800,80],[1900,50],[2000,90],[2100,60],[2200,80],[2300,50],
  [60,300],[120,380],[180,440],[240,380],
  [1800,300],[1860,380],[1920,440],[1980,380],
  [60,900],[120,960],[180,1020],[240,960],
  [1800,900],[1860,960],[1920,1020],[1980,960],
  [60,1500],[120,1560],[180,1500],[2200,1500],[2280,1560],
  [400,1300],[480,1380],[560,1300],[640,1380],
  [1600,1300],[1680,1380],[1760,1300],[1840,1380],
];

treePositions.forEach(([x, y]) => drawTree(x, y));

// Grid fog-of-war effect (subtle vignette on canvas)
const grd = ctx.createRadialGradient(W/2, H/2, H*0.3, W/2, H/2, H*0.75);
grd.addColorStop(0, 'rgba(0,0,0,0)');
grd.addColorStop(1, 'rgba(0,0,0,0.55)');
ctx.fillStyle = grd;
ctx.fillRect(0, 0, W, H);

// ══════════════════════════════════════════
// SPRITE DRAWING
// ══════════════════════════════════════════
function drawBuilding(canvas, type) {
  const c = canvas.getContext('2d');
  c.imageSmoothingEnabled = false;
  const w = canvas.width, h = canvas.height;

  if (type === 'tavern') {
    // Tavern / Inn building
    // Shadow
    c.fillStyle = 'rgba(0,0,0,0.3)';
    c.fillRect(8, h-12, w-8, 10);
    // Main walls
    c.fillStyle = '#a0522d';
    c.fillRect(8, 32, w-16, h-44);
    // Wall shading
    c.fillStyle = '#8B4513';
    c.fillRect(w-24, 32, 16, h-44);
    c.fillStyle = '#b8622d';
    c.fillRect(8, 32, 12, h-44);
    // Roof
    c.fillStyle = '#8B1a1a';
    c.beginPath();
    c.moveTo(0, 36); c.lineTo(w/2, 4); c.lineTo(w, 36); c.closePath();
    c.fill();
    c.fillStyle = '#aa2222';
    c.beginPath();
    c.moveTo(0, 36); c.lineTo(w/2, 4); c.lineTo(w/2, 8); c.lineTo(4, 38); c.closePath();
    c.fill();
    // Chimney
    c.fillStyle = '#666';
    c.fillRect(w-28, 4, 10, 24);
    c.fillStyle = '#444';
    c.fillRect(w-30, 2, 14, 6);
    // Door
    c.fillStyle = '#4a2810';
    c.fillRect(w/2-8, h-30, 16, 22);
    c.fillStyle = '#6B3820';
    c.fillRect(w/2-8, h-30, 7, 22);
    // Windows
    c.fillStyle = '#ffe066';
    c.fillRect(16, 44, 16, 14);
    c.fillRect(w-32, 44, 16, 14);
    c.fillStyle = 'rgba(0,0,0,0.3)';
    c.fillRect(16, 44, 8, 14);
    c.fillRect(w-32, 44, 8, 14);
    // Sign
    c.fillStyle = '#8B5E3C';
    c.fillRect(w/2-14, h-52, 28, 14);
    c.fillStyle = '#e8d44d';
    c.fillRect(w/2-12, h-50, 24, 10);
    // Pixel details
    c.fillStyle = '#e8d44d';
    c.fillRect(w/2-4, h-48, 8, 6);
  }

  if (type === 'workshop') {
    // Workshop / forge
    c.fillStyle = 'rgba(0,0,0,0.3)';
    c.fillRect(8, h-12, w-8, 10);
    // Stone base
    c.fillStyle = '#666';
    c.fillRect(4, 40, w-8, h-52);
    // Stone texture
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 4; col++) {
        c.fillStyle = col % 2 === row % 2 ? '#5a5a5a' : '#707070';
        c.fillRect(4 + col*26, 40 + row*16, 24, 14);
        c.fillStyle = 'rgba(0,0,0,0.2)';
        c.fillRect(4 + col*26, 40 + row*16, 24, 1);
        c.fillRect(4 + col*26, 40 + row*16, 1, 14);
      }
    }
    // Roof (flat with battlements)
    c.fillStyle = '#555';
    c.fillRect(0, 24, w, 20);
    for (let i = 0; i < 5; i++) {
      c.fillStyle = '#555';
      c.fillRect(i*22, 8, 14, 20);
    }
    // Forge glow
    c.fillStyle = '#ff6b35';
    c.fillRect(16, h-40, 28, 24);
    c.fillStyle = '#ffaa22';
    c.fillRect(20, h-38, 20, 18);
    c.fillStyle = '#ffdd44';
    c.fillRect(24, h-36, 12, 10);
    // Glow gradient
    const glow = c.createRadialGradient(30, h-28, 0, 30, h-28, 30);
    glow.addColorStop(0, 'rgba(255,180,0,0.4)');
    glow.addColorStop(1, 'rgba(255,100,0,0)');
    c.fillStyle = glow;
    c.fillRect(0, h-60, 60, 60);
    // Door
    c.fillStyle = '#2a2a2a';
    c.fillRect(w/2-10, h-36, 20, 28);
    c.fillStyle = '#1a1a1a';
    c.fillRect(w/2-10, h-36, 10, 28);
    // Anvil silhouette
    c.fillStyle = '#333';
    c.fillRect(w-30, h-36, 20, 8);
    c.fillRect(w-28, h-44, 16, 10);
    c.fillRect(w-26, h-28, 12, 8);
  }

  if (type === 'portal') {
    // Mystical portal / shrine
    c.fillStyle = 'rgba(0,0,0,0.3)';
    c.fillRect(8, h-10, w-8, 8);
    // Base stones
    c.fillStyle = '#4a4a7a';
    c.fillRect(16, h-24, w-32, 20);
    c.fillStyle = '#5a5a9a';
    c.fillRect(16, h-24, (w-32)/2, 20);
    // Left pillar
    c.fillStyle = '#3a3a6a';
    c.fillRect(8, 16, 18, h-36);
    c.fillStyle = '#4a4a8a';
    c.fillRect(8, 16, 9, h-36);
    // Right pillar
    c.fillStyle = '#3a3a6a';
    c.fillRect(w-26, 16, 18, h-36);
    c.fillStyle = '#4a4a8a';
    c.fillRect(w-26, 16, 9, h-36);
    // Top arch
    c.fillStyle = '#3a3a6a';
    c.fillRect(6, 10, w-12, 14);
    c.fillStyle = '#5a5a9a';
    c.fillRect(6, 10, (w-12)/2, 7);
    // Portal glow
    const portalGlow = c.createRadialGradient(w/2, h/2-8, 4, w/2, h/2-8, 28);
    portalGlow.addColorStop(0, 'rgba(100,200,255,0.9)');
    portalGlow.addColorStop(0.5, 'rgba(60,120,255,0.6)');
    portalGlow.addColorStop(1, 'rgba(20,40,180,0)');
    c.fillStyle = portalGlow;
    c.fillRect(20, 20, w-40, h-40);
    // Inner glow
    c.fillStyle = 'rgba(180,240,255,0.5)';
    c.fillRect(w/2-12, h/2-24, 24, 28);
    c.fillStyle = 'rgba(255,255,255,0.7)';
    c.fillRect(w/2-6, h/2-18, 12, 16);
    // Rune marks
    c.fillStyle = '#aaddff';
    c.fillRect(10, 22, 4, 8);
    c.fillRect(12, 24, 8, 4);
    c.fillRect(w-18, 22, 4, 8);
    c.fillRect(w-22, 24, 8, 4);
  }
}

drawBuilding(document.getElementById('sprite-about'), 'tavern');
drawBuilding(document.getElementById('sprite-projects'), 'workshop');
drawBuilding(document.getElementById('sprite-links'), 'portal');

// ══════════════════════════════════════════
// PLAYER SPRITE
// ══════════════════════════════════════════
const playerCanvas = document.getElementById('player-canvas');
const pc = playerCanvas.getContext('2d');
pc.imageSmoothingEnabled = false;

let playerFrame = 0;
let playerFacing = 'down'; // up, down, left, right

function drawPlayer(facing, frame) {
  pc.clearRect(0, 0, 24, 32);
  const f = frame % 2;

  // Cloak / body
  pc.fillStyle = '#3355aa';
  pc.fillRect(6, 14, 12, 16);
  // Cloak shading
  pc.fillStyle = '#2244aa';
  pc.fillRect(12, 14, 6, 16);
  // Legs
  pc.fillStyle = '#2a4488';
  if (facing === 'left' || facing === 'right') {
    pc.fillRect(f === 0 ? 8 : 12, 26, 4, 6);
    pc.fillRect(f === 0 ? 12 : 8, 26, 4, 6);
  } else {
    pc.fillRect(7, 26, 4, 6);
    pc.fillRect(13, 26, 4, 6);
  }
  // Boots
  pc.fillStyle = '#4a2810';
  pc.fillRect(6, 29, 5, 3);
  pc.fillRect(13, 29, 5, 3);
  // Skin
  pc.fillStyle = '#f0c890';
  pc.fillRect(8, 8, 8, 8);
  // Hair
  pc.fillStyle = '#2a1a0a';
  pc.fillRect(7, 6, 10, 5);
  pc.fillRect(6, 8, 2, 4);
  pc.fillRect(16, 8, 2, 4);
  // Eyes
  pc.fillStyle = '#1a1a2e';
  if (facing !== 'up') {
    pc.fillRect(9, 11, 2, 2);
    pc.fillRect(13, 11, 2, 2);
  }
  // Sword
  pc.fillStyle = '#aaa';
  pc.fillRect(18, 14, 3, 14);
  pc.fillStyle = '#e8d44d';
  pc.fillRect(17, 16, 5, 3);
  // Hat/Hood
  pc.fillStyle = '#3355aa';
  pc.fillRect(7, 3, 10, 5);
  pc.fillStyle = '#2244aa';
  pc.fillRect(5, 6, 14, 3);
  // Walk bob
  if (f === 1) {
    pc.fillStyle = 'rgba(0,0,0,0.0)'; // no-op; bob via transform
  }
}

drawPlayer('down', 0);

// ══════════════════════════════════════════
// MINIMAP
// ══════════════════════════════════════════
const miniCanvas = document.getElementById('minimap-canvas');
const mc = miniCanvas.getContext('2d');
mc.imageSmoothingEnabled = false;

function drawMinimap(px, py) {
  mc.clearRect(0, 0, 120, 90);
  // Tile overview
  const scaleX = 120 / W;
  const scaleY = 90 / H;
  for (let r = 0; r < 38; r++) {
    for (let c = 0; c < 50; c++) {
      const t = tileMap[r][c];
      const colorMap = {
        [T.GRASS]: '#2d6035', [T.GRASS_D]: '#265530', [T.GRASS_L]: '#35743e',
        [T.PATH]: '#c8a96e', [T.PATH_D]: '#b8956a',
        [T.WATER]: '#2a5a9a', [T.WATER_L]: '#3070b8',
        [T.SAND]: '#d4b483', [T.STONE]: '#6a6a6a', [T.STONE_D]: '#4a4a4a',
        [T.WOOD_F]: '#7a4a2c',
      };
      mc.fillStyle = colorMap[t] || '#2d6035';
      mc.fillRect(c * TILE * scaleX, r * TILE * scaleY, Math.ceil(TILE * scaleX), Math.ceil(TILE * scaleY));
    }
  }
  // Zone markers
  const zones = [
    {x: 568, y: 376, color: '#e8d44d'},
    {x: 1356, y: 664, color: '#ff6b35'},
    {x: 948, y: 1148, color: '#6699ff'},
  ];
  zones.forEach(z => {
    mc.fillStyle = z.color;
    mc.fillRect(z.x * scaleX - 2, z.y * scaleY - 2, 5, 5);
  });
  // Player dot
  mc.fillStyle = '#fff';
  mc.fillRect(px * scaleX - 2, py * scaleY - 2, 5, 5);
  // Viewport rectangle
  mc.strokeStyle = 'rgba(255,255,255,0.3)';
  mc.lineWidth = 1;
  mc.strokeRect(
    -camX * scaleX, -camY * scaleY,
    window.innerWidth * scaleX / worldScale,
    window.innerHeight * scaleY / worldScale
  );
}

// ══════════════════════════════════════════
// PLAYER STATE & MOVEMENT
// ══════════════════════════════════════════
const playerEl = document.getElementById('player');
const world = document.getElementById('world');

let px = 800, py = 800; // player world position
let camX = 0, camY = 0;
let worldScale = 1.2;
let isMoving = false;
let moveTimer = 0;
let stepTimer = 0;
const SPEED = 3.5;
const INTERACT_DIST = 90;

const keys = {};
window.addEventListener('keydown', e => {
  keys[e.key] = true;
  if (e.key === 'Escape') {
    closePanel();
  }

  if (e.key === 'e' || e.key === 'E' || e.key === 'Enter') {
    if (nearNpc) {
      cycleNpcDialog(nearNpc);
    } else if (nearZone) {
      openPanel(nearZone);
    }
  }

  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault();
});
window.addEventListener('keyup', e => { keys[e.key] = false; });

// ZONE definitions
const zones = [
  {
    id: 'about',
    x: 568, y: 376,
    el: document.getElementById('zone-about'),
    ring: document.querySelector('#zone-about .zone-proximity-ring'),
    icon: '🍺',
    title: 'THE TAVERN',
    subtitle: '— About Me —',
  },
  {
    id: 'projects',
    x: 1356, y: 664,
    el: document.getElementById('zone-projects'),
    ring: document.querySelector('#zone-projects .zone-proximity-ring'),
    icon: '⚒',
    title: 'THE WORKSHOP',
    subtitle: '— Projects & Work —',
  },
  {
    id: 'links',
    x: 948, y: 1148,
    el: document.getElementById('zone-links'),
    ring: document.querySelector('#zone-links .zone-proximity-ring'),
    icon: '🌐',
    title: 'THE PORTAL',
    subtitle: '— Cool Websites —',
  },
];

// Panel content
const panelContent = {
  about: `
    <div class="panel-section">
      <h2>◈ The Adventurer's Tale</h2>
      <p>Greetings, traveler! Pull up a stool and let me tell you my story. I'm a passionate creator who loves building things that live at the crossroads of creativity and technology.</p>
      <p>Like any good RPG hero, I started with base stats and leveled up through countless quests — late nights debugging, moments of breakthrough, and collaborating with a party of brilliant minds along the way.</p>
      <h2 style="margin-top:32px;">◈ Character Stats</h2>
      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-card-label">Creativity</div>
          <div class="stat-card-value">92 / 100</div>
          <div class="stat-bar"><div class="stat-bar-fill" style="width:0%" data-target="92"></div></div>
        </div>
        <div class="stat-card">
          <div class="stat-card-label">Problem Solving</div>
          <div class="stat-card-value">88 / 100</div>
          <div class="stat-bar"><div class="stat-bar-fill" style="width:0%" data-target="88"></div></div>
        </div>
        <div class="stat-card">
          <div class="stat-card-label">Collaboration</div>
          <div class="stat-card-value">95 / 100</div>
          <div class="stat-bar"><div class="stat-bar-fill" style="width:0%" data-target="95"></div></div>
        </div>
        <div class="stat-card">
          <div class="stat-card-label">Caffeine Tolerance</div>
          <div class="stat-card-value">∞ / 100</div>
          <div class="stat-bar"><div class="stat-bar-fill" style="width:0%" data-target="100"></div></div>
        </div>
      </div>
      <p style="margin-top:24px;">Currently on a quest to build things that matter. My inventory includes: strong opinions loosely held, a bias for action, and an obsession with the details that make good work <em>great</em> work.</p>
    </div>
  `,
  projects: `
    <div class="panel-section">
      <h2>◈ Items Forged</h2>
      <p>Every great workshop holds the artifacts of past quests. Here are some of the things I've crafted on my journey:</p>
      <div class="project-card">
        <h3>⚔ PROJECT DRAGON</h3>
        <p>A full-stack web application built to solve a real problem — blazing fast, brutally simple, and battle-tested by thousands of users in the wild.</p>
        <div class="project-tags">
          <span class="tag">React</span>
          <span class="tag">Node.js</span>
          <span class="tag">PostgreSQL</span>
          <span class="tag">AWS</span>
        </div>
      </div>
      <div class="project-card">
        <h3>🛡 THE SHIELD SYSTEM</h3>
        <p>An open-source library that handles the boring-but-critical stuff so developers can focus on what actually matters. 500+ GitHub stars and counting.</p>
        <div class="project-tags">
          <span class="tag">TypeScript</span>
          <span class="tag">Open Source</span>
          <span class="tag">NPM</span>
        </div>
      </div>
      <div class="project-card">
        <h3>🗺 CARTOGRAPHER</h3>
        <p>A data visualization tool that turns gnarly spreadsheets into maps you can actually understand. Built for a client who needed insight, not another dashboard.</p>
        <div class="project-tags">
          <span class="tag">D3.js</span>
          <span class="tag">Python</span>
          <span class="tag">Data Viz</span>
        </div>
      </div>
      <div class="project-card">
        <h3>✨ SPARKCRAFT (This site!)</h3>
        <p>An interactive RPG-style portfolio built entirely in vanilla HTML, CSS, and JS. No frameworks. Just vibes and pixel math.</p>
        <div class="project-tags">
          <span class="tag">HTML Canvas</span>
          <span class="tag">Vanilla JS</span>
          <span class="tag">CSS</span>
          <span class="tag">Game Dev</span>
        </div>
      </div>
    </div>
  `,
  links: `
    <div class="panel-section">
      <h2>◈ Portals to Other Realms</h2>
      <p>The multiverse is vast. Here are some of the most remarkable destinations I've discovered on my travels — places worth exploring if you're the curious type.</p>
      <div class="link-grid">
        <a class="link-card" href="https://neal.fun" target="_blank" rel="noopener">
          <span class="link-card-icon">🎮</span>
          <h3>Neal.fun</h3>
          <p>Wonderfully weird interactive experiences. A masterclass in making the web fun again.</p>
        </a>
        <a class="link-card" href="https://poolsuite.net" target="_blank" rel="noopener">
          <span class="link-card-icon">🌊</span>
          <h3>Poolsuite FM</h3>
          <p>The internet's most aesthetic radio station. Retrofuturistic vibes and endless summer.</p>
        </a>
        <a class="link-card" href="https://www.are.na" target="_blank" rel="noopener">
          <span class="link-card-icon">🔮</span>
          <h3>Are.na</h3>
          <p>A slow, thoughtful internet. Collect and connect ideas without the algorithm breathing down your neck.</p>
        </a>
        <a class="link-card" href="https://ciechanow.ski" target="_blank" rel="noopener">
          <span class="link-card-icon">⚙️</span>
          <h3>Bartosz Ciechanowski</h3>
          <p>The most beautiful technical explainers on the internet. Pure interactive wizardry.</p>
        </a>
        <a class="link-card" href="https://www.ncase.me" target="_blank" rel="noopener">
          <span class="link-card-icon">🦋</span>
          <h3>Nicky Case</h3>
          <p>Playful systems thinking and interactive essays that change how you see the world.</p>
        </a>
        <a class="link-card" href="https://lines.chromeexperiments.com" target="_blank" rel="noopener">
          <span class="link-card-icon">✦</span>
          <h3>Chrome Experiments</h3>
          <p>A gallery of what the web can do when developers decide to make something magnificent.</p>
        </a>
      </div>
    </div>
  `,
};

// ══════════════════════════════════════════
// CAMERA
// ══════════════════════════════════════════
function updateCamera() {
  const vw = window.innerWidth / worldScale;
  const vh = window.innerHeight / worldScale;
  let targetX = -(px - vw / 2);
  let targetY = -(py - vh / 2);
  targetX = Math.min(0, Math.max(-(W - vw), targetX));
  targetY = Math.min(0, Math.max(-(H - vh), targetY));
  camX += (targetX - camX) * 0.1;
  camY += (targetY - camY) * 0.1;
  world.style.transform = `scale(${worldScale}) translate(${camX}px, ${camY}px)`;
}

// ══════════════════════════════════════════
// FOOTSTEPS
// ══════════════════════════════════════════
function spawnFootstep() {
  const el = document.createElement('div');
  el.className = 'footstep';
  el.style.left = (px - 2) + 'px';
  el.style.top = (py + 24) + 'px';
  world.appendChild(el);
  setTimeout(() => el.remove(), 800);
}

// ══════════════════════════════════════════
// INTERACTION
// ══════════════════════════════════════════
let nearZone = null;
let nearNpc = null;
const promptEl = document.getElementById('interact-prompt');

const npcs = [
  {
    id: 'luke',
    name: 'Luke',
    x: 1200,
    y: 900,
    dialogs: [
      'Greetings traveler',
      'Press E to hear more',
      'Stay curious and keep exploring!',
      'New adventures await beyond the horizon.'
    ],
    dialogIndex: 0,
    element: null,
    bubble: null,
  }
];

const NPC_INTERACT_DIST = 100;

function createNpcElements() {
  npcs.forEach(npc => {
    const npcEl = document.createElement('div');
    npcEl.className = 'npc';
    npcEl.style.left = (npc.x - 14) + 'px';
    npcEl.style.top = (npc.y - 34) + 'px';

    const sprite = document.createElement('div');
    sprite.className = 'npc-sprite';
    sprite.title = npc.name;
    sprite.innerHTML = '<div class="hair"></div><div class="eye-left"></div><div class="eye-right"></div><div class="sword"></div>';

    const bubble = document.createElement('div');
    bubble.className = 'npc-bubble';
    bubble.textContent = npc.dialogs[npc.dialogIndex];

    npcEl.appendChild(bubble);
    npcEl.appendChild(sprite);
    world.appendChild(npcEl);

    npc.element = npcEl;
    npc.bubble = bubble;

    // Show initial bubble at start
    requestAnimationFrame(() => setNpcBubble(npc, npc.dialogs[npc.dialogIndex], true));
  });
}

function setNpcBubble(npc, text, show = true) {
  npc.bubble.textContent = text;
  if (show) {
    npc.bubble.classList.add('visible');
  } else {
    npc.bubble.classList.remove('visible');
  }
}

function cycleNpcDialog(npc) {
  npc.dialogIndex = (npc.dialogIndex + 1) % npc.dialogs.length;
  setNpcBubble(npc, npc.dialogs[npc.dialogIndex], true);
}

function checkProximity() {
  let closest = null;
  let closestDist = Infinity;
  zones.forEach(z => {
    const dist = Math.hypot(px - z.x, py - z.y);
    if (dist < INTERACT_DIST && dist < closestDist) {
      closestDist = dist;
      closest = z;
    }
    z.ring.classList.toggle('nearby', dist < INTERACT_DIST * 1.5);
  });

  // NPC proximity checks
  nearNpc = null;
  npcs.forEach(npc => {
    const dist = Math.hypot(px - npc.x, py - npc.y);
    const isNear = dist < NPC_INTERACT_DIST;
    if (isNear && dist < closestDist) {
      closest = null; // prioritize NPC when near both
      nearNpc = npc;
    }
    setNpcBubble(npc, npc.dialogs[npc.dialogIndex], isNear);
  });

  if (nearNpc) {
    promptEl.style.display = 'block';
  } else if (closest) {
    promptEl.style.display = 'block';
  } else {
    promptEl.style.display = 'none';
  }

  nearZone = closest;
}


// ══════════════════════════════════════════
// PANEL
// ══════════════════════════════════════════
function openPanel(zone) {
  const panel = document.getElementById('zone-panel');
  document.getElementById('panel-zone-icon').textContent = zone.icon;
  document.getElementById('panel-title').textContent = zone.title;
  document.getElementById('panel-subtitle').textContent = zone.subtitle;
  document.getElementById('panel-body').innerHTML = panelContent[zone.id] || '<p>Coming soon...</p>';
  panel.classList.add('open');
  promptEl.style.display = 'none';

  // Animate stat bars
  setTimeout(() => {
    panel.querySelectorAll('.stat-bar-fill').forEach(bar => {
      bar.style.width = bar.dataset.target + '%';
    });
  }, 300);
}

function closePanel() {
  const panel = document.getElementById('zone-panel');
  panel.style.animation = 'none';
  panel.style.clipPath = 'inset(0 0 0% 0)';
  panel.style.opacity = '1';
  requestAnimationFrame(() => {
    panel.style.transition = 'clip-path 0.3s ease-in, opacity 0.3s ease-in';
    panel.style.clipPath = 'inset(0 0 100% 0)';
    panel.style.opacity = '0';
    setTimeout(() => {
      panel.classList.remove('open');
      panel.style.transition = '';
      panel.style.clipPath = '';
      panel.style.opacity = '';
      panel.style.animation = '';
    }, 320);
  });
}

// ══════════════════════════════════════════
// MAIN LOOP
// ══════════════════════════════════════════
let animFrame = 0;

function gameLoop() {
  const panel = document.getElementById('zone-panel');
  if (!panel.classList.contains('open')) {
    let dx = 0, dy = 0;
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) { dx -= SPEED; playerFacing = 'left'; }
    if (keys['ArrowRight'] || keys['d'] || keys['D']) { dx += SPEED; playerFacing = 'right'; }
    if (keys['ArrowUp'] || keys['w'] || keys['W']) { dy -= SPEED; playerFacing = 'up'; }
    if (keys['ArrowDown'] || keys['s'] || keys['S']) { dy += SPEED; playerFacing = 'down'; }

    isMoving = dx !== 0 || dy !== 0;

    if (isMoving) {
      // Normalize diagonal
      if (dx !== 0 && dy !== 0) { dx *= 0.707; dy *= 0.707; }
      px = Math.max(16, Math.min(W - 16, px + dx));
      py = Math.max(16, Math.min(H - 32, py + dy));

      // Walk animation
      moveTimer++;
      if (moveTimer % 16 === 0) {
        playerFrame = (playerFrame + 1) % 2;
        drawPlayer(playerFacing, playerFrame);
      }

      // Footstep particles
      stepTimer++;
      if (stepTimer % 28 === 0) spawnFootstep();

      // Bob the player element
      playerCanvas.style.transform = `translateY(${playerFrame === 1 ? '-2px' : '0'})`;
    } else {
      drawPlayer(playerFacing, 0);
      playerCanvas.style.transform = 'translateY(0)';
    }

    playerEl.style.left = (px - 12) + 'px';
    playerEl.style.top = (py - 28) + 'px';

    checkProximity();
    updateCamera();
    drawMinimap(px, py);
  }

  animFrame++;
  requestAnimationFrame(gameLoop);
}

// ══════════════════════════════════════════
// CURSOR
// ══════════════════════════════════════════
const cursorEl = document.getElementById('cursor');
window.addEventListener('mousemove', e => {
  cursorEl.style.left = e.clientX + 'px';
  cursorEl.style.top = e.clientY + 'px';
});

// ══════════════════════════════════════════
// RESIZE
// ══════════════════════════════════════════
function handleResize() {
  const minDim = Math.min(window.innerWidth, window.innerHeight);
  worldScale = minDim < 600 ? 0.8 : minDim < 900 ? 1.0 : 1.2;
}
window.addEventListener('resize', handleResize);
handleResize();

// ══════════════════════════════════════════
// START
// ══════════════════════════════════════════
createNpcElements();
updateCamera();
drawMinimap(px, py);
gameLoop();