// ══════════════════════════════════════════════════════════════
// ██████╗ ██████╗  ██████╗     ██████╗  █████╗ ███╗   ███╗███████╗
// ██╔══██╗██╔══██╗██╔════╝    ██╔════╝ ██╔══██╗████╗ ████║██╔════╝
// ██████╔╝██████╔╝██║  ███╗   ██║  ███╗███████║██╔████╔██║█████╗
// ██╔══██╗██╔═══╝ ██║   ██║   ██║   ██║██╔══██║██║╚██╔╝██║██╔══╝
// ██║  ██║██║     ╚██████╔╝   ╚██████╔╝██║  ██║██║ ╚═╝ ██║███████╗
// ╚═╝  ╚═╝╚═╝      ╚═════╝     ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝
//
// SPRITE & CONFIG SYSTEM — edit the sections below to customise everything
// ══════════════════════════════════════════════════════════════

// ─────────────────────────────────────────
// § GAME CONFIG  ← tweak gameplay feel here
// ─────────────────────────────────────────
const CONFIG = {
  worldWidth:  2400,
  worldHeight: 1800,
  tileSize:    48,

  playerSpeed:     3.5,   // pixels per frame
  interactDist:    90,    // zone trigger radius
  npcInteractDist: 100,   // npc trigger radius
  cameraLerp:      0.1,   // 0=instant, 1=instant-snap; lower = smoother lag
  walkFrameRate:   16,    // frames between walk-animation toggle
  footstepRate:    28,    // frames between footstep particles
};

// ─────────────────────────────────────────
// § TILE PALETTE  ← add/edit tile types here
//   Each entry: { base, variants[], label }
//   variants are picked randomly per-pixel
// ─────────────────────────────────────────
const TILES = {
  GRASS:   { base: '#3a7d44', variants: ['#2d6035','#4a9455','#358040'], label: 'grass' },
  GRASS_D: { base: '#2d6035', variants: ['#265530','#356840','#2a5c32'], label: 'grass-dark' },
  GRASS_L: { base: '#4a9455', variants: ['#3a8448','#55a060','#429050'], label: 'grass-light' },
  PATH:    { base: '#c8a96e', variants: ['#b8956a','#d4b880','#c09060'], label: 'path' },
  PATH_D:  { base: '#b8956a', variants: ['#a88060','#c4a070','#b09060'], label: 'path-dark' },
  WATER:   { base: '#2a6fad', variants: ['#235d99','#3080c0','#2870b0'], label: 'water' },
  WATER_L: { base: '#3a8fd0', variants: ['#3080be','#4598d8','#3888c8'], label: 'water-light' },
  SAND:    { base: '#d4b483', variants: ['#c8a870','#dcbc90','#d0b07c'], label: 'sand' },
  STONE:   { base: '#7a7a7a', variants: ['#6a6a6a','#848484','#747474'], label: 'stone' },
  STONE_D: { base: '#5a5a5a', variants: ['#4a4a4a','#646464','#545454'], label: 'stone-dark' },
  WOOD_F:  { base: '#8B5E3C', variants: ['#7B4E2C','#9B6E4C','#855840'], label: 'wood-floor' },
};

// Minimap colours for each tile key
const MINIMAP_COLORS = {
  GRASS: '#2d6035', GRASS_D: '#265530', GRASS_L: '#35743e',
  PATH: '#c8a96e',  PATH_D: '#b8956a',
  WATER: '#2a5a9a', WATER_L: '#3070b8',
  SAND: '#d4b483',  STONE: '#6a6a6a', STONE_D: '#4a4a4a',
  WOOD_F: '#7a4a2c',
};

// ─────────────────────────────────────────
// § MAP LAYOUT  ← edit the world here
//
//   tileMap is auto-generated from ZONES below.
//   DECORATIONS lists shapes painted onto the map.
//   TREE_POSITIONS is a simple [x, y] array.
//
//   Map is 50 cols × 38 rows (each cell = 48px).
// ─────────────────────────────────────────
const MAP_FEATURES = {
  // Paths: each entry carves a row or col stripe
  paths: [
    { type: 'h', rows: [16, 17], tile: 'PATH' },      // horizontal path
    { type: 'h', rows: [18],     tile: 'PATH_D' },
    { type: 'v', cols: [20, 21], tile: 'PATH' },      // vertical path
    { type: 'v', cols: [22],     tile: 'PATH_D' },
    { type: 'v', cols: [24, 25], rowStart: 18, tile: 'PATH' }, // south diagonal
  ],

  // Rectangular fill zones
  rects: [
    // Stone bottom-left
    { r1: 26, r2: 38, c1: 0,  c2: 12, tile: 'STONE', noise: 0.5, noiseTile: 'STONE_D' },
    // Wooden floor around workshop
    { r1: 12, r2: 20, c1: 26, c2: 34, tile: 'WOOD_F' },
    // Dark forest patch
    { r1: 22, r2: 32, c1: 3,  c2: 14, tile: 'GRASS_D', noise: 0.4 },
  ],

  // Circular water body (and sand ring)
  circles: [
    { cx: 42, cy: 7, r: 6, tile: 'WATER', ringR: 7, ringTile: 'SAND' },
  ],
};

// Trees — [worldX, worldY] pairs
const TREE_POSITIONS = [
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

// ─────────────────────────────────────────
// § SPRITES  ← draw functions for each building
//
//   Each sprite is a function(ctx, w, h) that
//   draws into a canvas of size w×h.
//   Colors are defined at the top of each fn
//   so you can change them without hunting
//   through pixel math.
// ─────────────────────────────────────────
const SPRITES = {

  tavern(ctx, w, h) {
    const C = {
      shadow:      'rgba(0,0,0,0.3)',
      wallMain:    '#a0522d',
      wallShade:   '#8B4513',
      wallLight:   '#b8622d',
      roofDark:    '#8B1a1a',
      roofLight:   '#aa2222',
      chimney:     '#666',
      chimneyDark: '#444',
      door:        '#4a2810',
      doorLight:   '#6B3820',
      window:      '#ffe066',
      windowShade: 'rgba(0,0,0,0.3)',
      sign:        '#8B5E3C',
      signFace:    '#e8d44d',
      signText:    '#e8d44d',
    };
    // Shadow
    ctx.fillStyle = C.shadow;
    ctx.fillRect(8, h - 12, w - 8, 10);
    // Walls
    ctx.fillStyle = C.wallMain;  ctx.fillRect(8, 32, w - 16, h - 44);
    ctx.fillStyle = C.wallShade; ctx.fillRect(w - 24, 32, 16, h - 44);
    ctx.fillStyle = C.wallLight; ctx.fillRect(8, 32, 12, h - 44);
    // Roof
    ctx.fillStyle = C.roofDark;
    ctx.beginPath(); ctx.moveTo(0, 36); ctx.lineTo(w / 2, 4); ctx.lineTo(w, 36); ctx.closePath(); ctx.fill();
    ctx.fillStyle = C.roofLight;
    ctx.beginPath(); ctx.moveTo(0, 36); ctx.lineTo(w / 2, 4); ctx.lineTo(w / 2, 8); ctx.lineTo(4, 38); ctx.closePath(); ctx.fill();
    // Chimney
    ctx.fillStyle = C.chimney;     ctx.fillRect(w - 28, 4, 10, 24);
    ctx.fillStyle = C.chimneyDark; ctx.fillRect(w - 30, 2, 14, 6);
    // Door
    ctx.fillStyle = C.door;      ctx.fillRect(w / 2 - 8, h - 30, 16, 22);
    ctx.fillStyle = C.doorLight; ctx.fillRect(w / 2 - 8, h - 30, 7,  22);
    // Windows
    ctx.fillStyle = C.window;      ctx.fillRect(16, 44, 16, 14); ctx.fillRect(w - 32, 44, 16, 14);
    ctx.fillStyle = C.windowShade; ctx.fillRect(16, 44, 8,  14); ctx.fillRect(w - 32, 44, 8,  14);
    // Sign
    ctx.fillStyle = C.sign;     ctx.fillRect(w / 2 - 14, h - 52, 28, 14);
    ctx.fillStyle = C.signFace; ctx.fillRect(w / 2 - 12, h - 50, 24, 10);
    ctx.fillStyle = C.signText; ctx.fillRect(w / 2 - 4,  h - 48, 8,  6);
  },

  workshop(ctx, w, h) {
    const C = {
      shadow:    'rgba(0,0,0,0.3)',
      stone:     '#666',
      stoneA:    '#5a5a5a',
      stoneB:    '#707070',
      stoneLine: 'rgba(0,0,0,0.2)',
      roof:      '#555',
      forgeOuter:'#ff6b35',
      forgeMid:  '#ffaa22',
      forgeCore: '#ffdd44',
      door:      '#2a2a2a',
      doorShade: '#1a1a1a',
      anvil:     '#333',
    };
    ctx.fillStyle = C.shadow; ctx.fillRect(8, h - 12, w - 8, 10);
    // Stone walls with texture
    ctx.fillStyle = C.stone; ctx.fillRect(4, 40, w - 8, h - 52);
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 4; col++) {
        ctx.fillStyle = (col % 2 === row % 2) ? C.stoneA : C.stoneB;
        ctx.fillRect(4 + col * 26, 40 + row * 16, 24, 14);
        ctx.fillStyle = C.stoneLine;
        ctx.fillRect(4 + col * 26, 40 + row * 16, 24, 1);
        ctx.fillRect(4 + col * 26, 40 + row * 16, 1,  14);
      }
    }
    // Flat roof + battlements
    ctx.fillStyle = C.roof; ctx.fillRect(0, 24, w, 20);
    for (let i = 0; i < 5; i++) { ctx.fillRect(i * 22, 8, 14, 20); }
    // Forge glow
    ctx.fillStyle = C.forgeOuter; ctx.fillRect(16, h - 40, 28, 24);
    ctx.fillStyle = C.forgeMid;   ctx.fillRect(20, h - 38, 20, 18);
    ctx.fillStyle = C.forgeCore;  ctx.fillRect(24, h - 36, 12, 10);
    const glow = ctx.createRadialGradient(30, h - 28, 0, 30, h - 28, 30);
    glow.addColorStop(0, 'rgba(255,180,0,0.4)');
    glow.addColorStop(1, 'rgba(255,100,0,0)');
    ctx.fillStyle = glow; ctx.fillRect(0, h - 60, 60, 60);
    // Door
    ctx.fillStyle = C.door;      ctx.fillRect(w / 2 - 10, h - 36, 20, 28);
    ctx.fillStyle = C.doorShade; ctx.fillRect(w / 2 - 10, h - 36, 10, 28);
    // Anvil
    ctx.fillStyle = C.anvil;
    ctx.fillRect(w - 30, h - 36, 20, 8);
    ctx.fillRect(w - 28, h - 44, 16, 10);
    ctx.fillRect(w - 26, h - 28, 12, 8);
  },

  portal(ctx, w, h) {
    const C = {
      shadow:    'rgba(0,0,0,0.3)',
      base:      '#4a4a7a',
      baseLight: '#5a5a9a',
      pillarDark:'#3a3a6a',
      pillarMid: '#4a4a8a',
      arch:      '#3a3a6a',
      archLight: '#5a5a9a',
      runeGlow:  '#aaddff',
      innerGlow: 'rgba(180,240,255,0.5)',
      coreGlow:  'rgba(255,255,255,0.7)',
    };
    ctx.fillStyle = C.shadow; ctx.fillRect(8, h - 10, w - 8, 8);
    // Base
    ctx.fillStyle = C.base;      ctx.fillRect(16, h - 24, w - 32, 20);
    ctx.fillStyle = C.baseLight; ctx.fillRect(16, h - 24, (w - 32) / 2, 20);
    // Left pillar
    ctx.fillStyle = C.pillarDark; ctx.fillRect(8, 16, 18, h - 36);
    ctx.fillStyle = C.pillarMid;  ctx.fillRect(8, 16, 9,  h - 36);
    // Right pillar
    ctx.fillStyle = C.pillarDark; ctx.fillRect(w - 26, 16, 18, h - 36);
    ctx.fillStyle = C.pillarMid;  ctx.fillRect(w - 26, 16, 9,  h - 36);
    // Top arch
    ctx.fillStyle = C.arch;      ctx.fillRect(6, 10, w - 12, 14);
    ctx.fillStyle = C.archLight; ctx.fillRect(6, 10, (w - 12) / 2, 7);
    // Portal energy glow
    const portalGlow = ctx.createRadialGradient(w / 2, h / 2 - 8, 4, w / 2, h / 2 - 8, 28);
    portalGlow.addColorStop(0,   'rgba(100,200,255,0.9)');
    portalGlow.addColorStop(0.5, 'rgba(60,120,255,0.6)');
    portalGlow.addColorStop(1,   'rgba(20,40,180,0)');
    ctx.fillStyle = portalGlow; ctx.fillRect(20, 20, w - 40, h - 40);
    // Inner glow layers
    ctx.fillStyle = C.innerGlow; ctx.fillRect(w / 2 - 12, h / 2 - 24, 24, 28);
    ctx.fillStyle = C.coreGlow;  ctx.fillRect(w / 2 - 6,  h / 2 - 18, 12, 16);
    // Rune marks (cross shape ┼)
    ctx.fillStyle = C.runeGlow;
    ctx.fillRect(10, 22, 4, 8);  ctx.fillRect(12, 24, 8, 4);
    ctx.fillRect(w - 18, 22, 4, 8); ctx.fillRect(w - 22, 24, 8, 4);
  },

  // ── PLAYER ──────────────────────────────
  // facing: 'up' | 'down' | 'left' | 'right'
  // frame:  0 or 1 (walk frames)
  player(ctx, facing, frame) {
    const C = {
      cloak:      '#3355aa',
      cloakShade: '#2244aa',
      legs:       '#2a4488',
      boots:      '#4a2810',
      skin:       '#f0c890',
      hair:       '#2a1a0a',
      eyes:       '#1a1a2e',
      sword:      '#aaa',
      guard:      '#e8d44d',
      hood:       '#3355aa',
      hoodShade:  '#2244aa',
    };
    ctx.clearRect(0, 0, 24, 32);
    const f = frame % 2;
    // Body/cloak
    ctx.fillStyle = C.cloak;      ctx.fillRect(6, 14, 12, 16);
    ctx.fillStyle = C.cloakShade; ctx.fillRect(12, 14, 6, 16);
    // Legs
    ctx.fillStyle = C.legs;
    if (facing === 'left' || facing === 'right') {
      ctx.fillRect(f === 0 ? 8 : 12, 26, 4, 6);
      ctx.fillRect(f === 0 ? 12 : 8, 26, 4, 6);
    } else {
      ctx.fillRect(7, 26, 4, 6);
      ctx.fillRect(13, 26, 4, 6);
    }
    // Boots
    ctx.fillStyle = C.boots; ctx.fillRect(6, 29, 5, 3); ctx.fillRect(13, 29, 5, 3);
    // Head
    ctx.fillStyle = C.skin; ctx.fillRect(8, 8, 8, 8);
    // Hair
    ctx.fillStyle = C.hair;
    ctx.fillRect(7, 6, 10, 5); ctx.fillRect(6, 8, 2, 4); ctx.fillRect(16, 8, 2, 4);
    // Eyes (only if not facing away)
    if (facing !== 'up') {
      ctx.fillStyle = C.eyes; ctx.fillRect(9, 11, 2, 2); ctx.fillRect(13, 11, 2, 2);
    }
    // Sword
    ctx.fillStyle = C.sword; ctx.fillRect(18, 14, 3, 14);
    ctx.fillStyle = C.guard; ctx.fillRect(17, 16, 5, 3);
    // Hood
    ctx.fillStyle = C.hood;      ctx.fillRect(7, 3, 10, 5);
    ctx.fillStyle = C.hoodShade; ctx.fillRect(5, 6, 14, 3);
  },

  // ── TREE ────────────────────────────────
  tree(ctx, x, y) {
    const C = {
      shadow:  'rgba(0,0,0,0.25)',
      trunk:   '#6B4423',
      base:    '#1a5e22',
      mid:     '#2a7d33',
      top:     '#3a9444',
      hi:      '#4aaa55',
    };
    ctx.fillStyle = C.shadow;  ctx.fillRect(x + 8,  y + 28, 24, 8);
    ctx.fillStyle = C.trunk;   ctx.fillRect(x + 16, y + 20, 8,  16);
    ctx.fillStyle = C.base;    ctx.fillRect(x + 4,  y + 12, 32, 16);
    ctx.fillStyle = C.mid;     ctx.fillRect(x + 8,  y + 4,  24, 14);
    ctx.fillStyle = C.top;     ctx.fillRect(x + 12, y,      16, 10);
    ctx.fillStyle = C.hi;
    ctx.fillRect(x + 14, y + 2, 6, 4);
    ctx.fillRect(x + 10, y + 8, 6, 4);
  },
};

// ─────────────────────────────────────────
// § ZONES  ← interactive locations in the world
//   x, y = world pixel centre of the zone
// ─────────────────────────────────────────
const ZONE_DEFS = [
  {
    id:       'about',
    x:        568, y: 376,
    sprite:   'tavern',
    spriteW:  96,  spriteH: 112,
    label:    '★ THE TAVERN',
    icon:     '🍺',
    title:    'THE TAVERN',
    subtitle: '— About Me —',
  },
  {
    id:       'projects',
    x:        1356, y: 664,
    sprite:   'workshop',
    spriteW:  112, spriteH: 128,
    label:    '⚒ THE WORKSHOP',
    icon:     '⚒',
    title:    'THE WORKSHOP',
    subtitle: '— Projects & Work —',
  },
  {
    id:       'links',
    x:        948, y: 1148,
    sprite:   'portal',
    spriteW:  96,  spriteH: 96,
    label:    '🌐 THE PORTAL',
    icon:     '🌐',
    title:    'THE PORTAL',
    subtitle: '— Cool Websites —',
  },
];

// ─────────────────────────────────────────
// § NPCs  ← non-player characters
// ─────────────────────────────────────────
const NPC_DEFS = [
  {
    id:      'luke',
    name:    'Luke',
    x:       1200, y: 900,
    dialogs: [
      'Greetings traveler! My name is Luke.',
      'Press E to hear more',
      'Stay curious and keep exploring!',
      'New adventures await beyond the horizon.',
    ],
  },
];

// ─────────────────────────────────────────
// § PANEL CONTENT  ← the info shown when
//   you enter a zone. Pure HTML strings.
// ─────────────────────────────────────────
const PANEL_CONTENT = {
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
          <span class="tag">React</span><span class="tag">Node.js</span><span class="tag">PostgreSQL</span><span class="tag">AWS</span>
        </div>
      </div>
      <div class="project-card">
        <h3>🛡 THE SHIELD SYSTEM</h3>
        <p>An open-source library that handles the boring-but-critical stuff so developers can focus on what actually matters. 500+ GitHub stars and counting.</p>
        <div class="project-tags">
          <span class="tag">TypeScript</span><span class="tag">Open Source</span><span class="tag">NPM</span>
        </div>
      </div>
      <div class="project-card">
        <h3>🗺 CARTOGRAPHER</h3>
        <p>A data visualization tool that turns gnarly spreadsheets into maps you can actually understand. Built for a client who needed insight, not another dashboard.</p>
        <div class="project-tags">
          <span class="tag">D3.js</span><span class="tag">Python</span><span class="tag">Data Viz</span>
        </div>
      </div>
      <div class="project-card">
        <h3>✨ SPARKCRAFT (This site!)</h3>
        <p>An interactive RPG-style portfolio built entirely in vanilla HTML, CSS, and JS. No frameworks. Just vibes and pixel math.</p>
        <div class="project-tags">
          <span class="tag">HTML Canvas</span><span class="tag">Vanilla JS</span><span class="tag">CSS</span><span class="tag">Game Dev</span>
        </div>
      </div>
    </div>
  `,
  links: `
    <div class="panel-section">
      <h2>◈ Portals to Other Realms</h2>
      <p>The multiverse is vast. Here are some of the most remarkable destinations I've discovered on my travels.</p>
      <div class="link-grid">
        <a class="link-card" href="https://neal.fun" target="_blank" rel="noopener">
          <span class="link-card-icon">🎮</span><h3>Neal.fun</h3>
          <p>Wonderfully weird interactive experiences. A masterclass in making the web fun again.</p>
        </a>
        <a class="link-card" href="https://poolsuite.net" target="_blank" rel="noopener">
          <span class="link-card-icon">🌊</span><h3>Poolsuite FM</h3>
          <p>The internet's most aesthetic radio station. Retrofuturistic vibes and endless summer.</p>
        </a>
        <a class="link-card" href="https://www.are.na" target="_blank" rel="noopener">
          <span class="link-card-icon">🔮</span><h3>Are.na</h3>
          <p>A slow, thoughtful internet. Collect and connect ideas without the algorithm.</p>
        </a>
        <a class="link-card" href="https://ciechanow.ski" target="_blank" rel="noopener">
          <span class="link-card-icon">⚙️</span><h3>Bartosz Ciechanowski</h3>
          <p>The most beautiful technical explainers on the internet. Pure interactive wizardry.</p>
        </a>
        <a class="link-card" href="https://www.ncase.me" target="_blank" rel="noopener">
          <span class="link-card-icon">🦋</span><h3>Nicky Case</h3>
          <p>Playful systems thinking and interactive essays that change how you see the world.</p>
        </a>
        <a class="link-card" href="https://lines.chromeexperiments.com" target="_blank" rel="noopener">
          <span class="link-card-icon">✦</span><h3>Chrome Experiments</h3>
          <p>A gallery of what the web can do when developers decide to make something magnificent.</p>
        </a>
      </div>
    </div>
  `,
};

// ══════════════════════════════════════════════════════════════
// ENGINE — you probably don't need to edit below this line
// ══════════════════════════════════════════════════════════════

// ── Seeded RNG ───────────────────────────
function seededRand(seed) {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
}
const rng = seededRand(42);

// ── Tile index map (key → integer index) ─
const TILE_KEYS = Object.keys(TILES);
const T = Object.fromEntries(TILE_KEYS.map((k, i) => [k, i]));

// ── Build tile grid ───────────────────────
const COLS = CONFIG.worldWidth  / CONFIG.tileSize; // 50
const ROWS = CONFIG.worldHeight / CONFIG.tileSize; // 37.5 → 38

const tileMap = Array.from({ length: 38 }, (_, r) =>
  Array.from({ length: 50 }, (_, c) => {
    const noise = rng();
    if (noise < 0.04) return T.GRASS_D;
    if (noise < 0.08) return T.GRASS_L;
    return T.GRASS;
  })
);

// Apply path features
MAP_FEATURES.paths.forEach(({ type, rows, cols, rowStart = 0, tile }) => {
  if (type === 'h') {
    rows.forEach(r => { for (let c = 0; c < 50; c++) tileMap[r][c] = T[tile]; });
  } else {
    cols.forEach(col => {
      for (let r = rowStart; r < 38; r++) tileMap[r][col] = T[tile];
    });
  }
});

// Apply rect features
MAP_FEATURES.rects.forEach(({ r1, r2, c1, c2, tile, noise, noiseTile }) => {
  for (let r = r1; r < r2; r++) {
    for (let c = c1; c < c2; c++) {
      if (noise && rng() > noise) continue;
      tileMap[r][c] = T[noiseTile && rng() < 0.5 ? noiseTile : tile];
    }
  }
});

// Apply circle features
MAP_FEATURES.circles.forEach(({ cx, cy, r, tile, ringR, ringTile }) => {
  for (let row = 0; row < 38; row++) {
    for (let col = 0; col < 50; col++) {
      const d = Math.sqrt((row - cy) ** 2 + (col - cx) ** 2);
      if (d < r)     tileMap[row][col] = T[tile];
      else if (ringR && d < ringR) tileMap[row][col] = T[ringTile];
    }
  }
});

// ── Map canvas ────────────────────────────
const mapCanvas = document.getElementById('map-canvas');
const ctx = mapCanvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

const TS = CONFIG.tileSize;

function drawTile(r, c) {
  const tIdx = tileMap[r]?.[c] ?? T.GRASS;
  const key   = TILE_KEYS[tIdx];
  const tile  = TILES[key];
  const x = c * TS, y = r * TS;
  const local = seededRand(r * 50 + c + 1000);

  ctx.fillStyle = tile.base;
  ctx.fillRect(x, y, TS, TS);

  // Pixel variation clusters
  const vars = tile.variants;
  for (let px = 0; px < TS; px += 8) {
    for (let py = 0; py < TS; py += 8) {
      const v = local();
      if (v < 0.35) {
        ctx.fillStyle = vars[Math.floor(v * 4 * vars.length) % vars.length];
        ctx.fillRect(x + px, y + py, 8, 8);
      }
    }
  }

  // Water shimmer
  if (key === 'WATER' || key === 'WATER_L') {
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(x + local() * TS, y + local() * TS, 8, 3);
    }
  }

  // Path edge lines
  if (key === 'PATH' || key === 'PATH_D') {
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.fillRect(x, y, TS, 2);
    ctx.fillRect(x, y + TS - 2, TS, 2);
  }
}

for (let r = 0; r < 38; r++) {
  for (let c = 0; c < 50; c++) {
    drawTile(r, c);
  }
}

// Trees painted directly onto map canvas
TREE_POSITIONS.forEach(([x, y]) => SPRITES.tree(ctx, x, y));

// Vignette
const W = CONFIG.worldWidth, H = CONFIG.worldHeight;
const grd = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.75);
grd.addColorStop(0, 'rgba(0,0,0,0)');
grd.addColorStop(1, 'rgba(0,0,0,0.55)');
ctx.fillStyle = grd;
ctx.fillRect(0, 0, W, H);

// ── Build zone DOM from ZONE_DEFS ─────────
const world = document.getElementById('world');

const zones = ZONE_DEFS.map(def => {
  const zoneEl = document.createElement('div');
  zoneEl.className = 'zone-object';
  zoneEl.id = `zone-${def.id}`;
  // Position: sprite is centred on def.x/def.y
  zoneEl.style.left = (def.x - def.spriteW / 2) + 'px';
  zoneEl.style.top  = (def.y - def.spriteH / 2) + 'px';

  const spriteCanvas = document.createElement('canvas');
  spriteCanvas.className = 'zone-sprite';
  spriteCanvas.width  = def.spriteW;
  spriteCanvas.height = def.spriteH;

  const ring = document.createElement('div');
  ring.className = 'zone-proximity-ring';
  ring.style.width  = '200px';
  ring.style.height = '200px';
  ring.style.top    = (def.spriteH / 2) + 'px';
  ring.style.left   = (def.spriteW / 2) + 'px';

  const label = document.createElement('div');
  label.className = 'zone-label';
  label.textContent = def.label;

  zoneEl.appendChild(spriteCanvas);
  zoneEl.appendChild(label);
  zoneEl.appendChild(ring);
  world.appendChild(zoneEl);

  // Draw the sprite
  const sc = spriteCanvas.getContext('2d');
  sc.imageSmoothingEnabled = false;
  SPRITES[def.sprite](sc, def.spriteW, def.spriteH);

  return { ...def, el: zoneEl, ring };
});

// ── Player ────────────────────────────────
const playerEl    = document.getElementById('player');
const playerCanvas = document.getElementById('player-canvas');
const pc           = playerCanvas.getContext('2d');
pc.imageSmoothingEnabled = false;

let playerFrame  = 0;
let playerFacing = 'down';

function drawPlayer(facing, frame) {
  SPRITES.player(pc, facing, frame);
}
drawPlayer('down', 0);

// ── Minimap ───────────────────────────────
// const miniCanvas = document.getElementById('minimap-canvas');
// const mc = miniCanvas.getContext('2d');
// mc.imageSmoothingEnabled = false;

let camX = 0, camY = 0, worldScale = 1.2;

// function drawMinimap(px, py) {
//   mc.clearRect(0, 0, 120, 90);
//   const sx = 120 / W, sy = 90 / H;
//   // Tile overview
//   for (let r = 0; r < 38; r++) {
//     for (let c = 0; c < 50; c++) {
//       const key = TILE_KEYS[tileMap[r][c]];
//       mc.fillStyle = MINIMAP_COLORS[key] || '#2d6035';
//       mc.fillRect(c * TS * sx, r * TS * sy, Math.ceil(TS * sx), Math.ceil(TS * sy));
//     }
//   }
//   // Zone markers
//   zones.forEach(z => {
//     mc.fillStyle = '#e8d44d';
//     mc.fillRect(z.x * sx - 2, z.y * sy - 2, 5, 5);
//   });
//   // Player dot
//   mc.fillStyle = '#fff';
//   mc.fillRect(px * sx - 2, py * sy - 2, 5, 5);
//   // Viewport rect
//   mc.strokeStyle = 'rgba(255,255,255,0.3)';
//   mc.lineWidth = 1;
//   mc.strokeRect(-camX * sx, -camY * sy, window.innerWidth * sx / worldScale, window.innerHeight * sy / worldScale);
// }

// ── Camera ────────────────────────────────
function updateCamera(px, py) {
  const vw = window.innerWidth  / worldScale;
  const vh = window.innerHeight / worldScale;
  let targetX = -(px - vw / 2);
  let targetY = -(py - vh / 2);
  targetX = Math.min(0, Math.max(-(W - vw), targetX));
  targetY = Math.min(0, Math.max(-(H - vh), targetY));
  camX += (targetX - camX) * CONFIG.cameraLerp;
  camY += (targetY - camY) * CONFIG.cameraLerp;
  world.style.transform = `scale(${worldScale}) translate(${camX}px,${camY}px)`;
}

// ── Footsteps ─────────────────────────────
function spawnFootstep(px, py) {
  const el = document.createElement('div');
  el.className = 'footstep';
  el.style.left = (px - 2) + 'px';
  el.style.top  = (py + 24) + 'px';
  world.appendChild(el);
  setTimeout(() => el.remove(), 800);
}

// ── NPCs ──────────────────────────────────
const npcs = NPC_DEFS.map(def => ({ ...def, dialogIndex: 0, element: null, bubble: null }));

function createNpcElements() {
  npcs.forEach(npc => {
    const npcEl = document.createElement('div');
    npcEl.className = 'npc';
    npcEl.style.left = (npc.x - 14) + 'px';
    npcEl.style.top  = (npc.y - 34) + 'px';

    const sprite = document.createElement('div');
    sprite.className = 'npc-sprite';
    sprite.title = npc.name;
    sprite.innerHTML = '<div class="hair"></div><div class="eye-left"></div><div class="eye-right"></div><div class="sword"></div>';

    const bubble = document.createElement('div');
    bubble.className = 'npc-bubble';
    bubble.textContent = npc.dialogs[0];

    npcEl.appendChild(bubble);
    npcEl.appendChild(sprite);
    world.appendChild(npcEl);

    npc.element = npcEl;
    npc.bubble  = bubble;
    requestAnimationFrame(() => setNpcBubble(npc, npc.dialogs[0], true));
  });
}

function setNpcBubble(npc, text, show) {
  npc.bubble.textContent = text;
  npc.bubble.classList.toggle('visible', show);
}

function cycleNpcDialog(npc) {
  npc.dialogIndex = (npc.dialogIndex + 1) % npc.dialogs.length;
  setNpcBubble(npc, npc.dialogs[npc.dialogIndex], true);
}

// ── Input ─────────────────────────────────
const keys = {};
let nearZone = null, nearNpc = null;
const promptEl = document.getElementById('interact-prompt');

window.addEventListener('keydown', e => {
  keys[e.key] = true;
  if (e.key === 'Escape') closePanel();
  if (e.key === 'e' || e.key === 'E' || e.key === 'Enter') {
    if (nearNpc)  cycleNpcDialog(nearNpc);
    else if (nearZone) openPanel(nearZone);
  }
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault();
});
window.addEventListener('keyup', e => { keys[e.key] = false; });

// ── Proximity ─────────────────────────────
function checkProximity(px, py) {
  let closest = null, closestDist = Infinity;

  zones.forEach(z => {
    const dist = Math.hypot(px - z.x, py - z.y);
    if (dist < CONFIG.interactDist && dist < closestDist) { closestDist = dist; closest = z; }
    z.ring.classList.toggle('nearby', dist < CONFIG.interactDist * 1.5);
  });

  nearNpc = null;
  npcs.forEach(npc => {
    const dist = Math.hypot(px - npc.x, py - npc.y);
    const isNear = dist < CONFIG.npcInteractDist;
    if (isNear && dist < closestDist) { closest = null; nearNpc = npc; }
    setNpcBubble(npc, npc.dialogs[npc.dialogIndex], isNear);
  });

  promptEl.style.display = (nearNpc || closest) ? 'block' : 'none';
  nearZone = closest;
}

// ── Panel ─────────────────────────────────
function openPanel(zone) {
  const panel = document.getElementById('zone-panel');
  document.getElementById('panel-zone-icon').textContent = zone.icon;
  document.getElementById('panel-title').textContent     = zone.title;
  document.getElementById('panel-subtitle').textContent  = zone.subtitle;
  document.getElementById('panel-body').innerHTML = PANEL_CONTENT[zone.id] || '<p>Coming soon...</p>';
  panel.classList.add('open');
  promptEl.style.display = 'none';
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
    panel.style.opacity  = '0';
    setTimeout(() => {
      panel.classList.remove('open');
      panel.style.transition = panel.style.clipPath = panel.style.opacity = panel.style.animation = '';
    }, 320);
  });
}

// ── Main loop ─────────────────────────────
let px = 800, py = 800;
let moveTimer = 0, stepTimer = 0, animFrame = 0;

function gameLoop() {
  if (!document.getElementById('zone-panel').classList.contains('open')) {
    let dx = 0, dy = 0;
    if (keys['ArrowLeft']  || keys['a'] || keys['A']) { dx -= CONFIG.playerSpeed; playerFacing = 'left';  }
    if (keys['ArrowRight'] || keys['d'] || keys['D']) { dx += CONFIG.playerSpeed; playerFacing = 'right'; }
    if (keys['ArrowUp']    || keys['w'] || keys['W']) { dy -= CONFIG.playerSpeed; playerFacing = 'up';    }
    if (keys['ArrowDown']  || keys['s'] || keys['S']) { dy += CONFIG.playerSpeed; playerFacing = 'down';  }

    const moving = dx !== 0 || dy !== 0;

    if (moving) {
      if (dx !== 0 && dy !== 0) { dx *= 0.707; dy *= 0.707; }
      px = Math.max(16, Math.min(W - 16, px + dx));
      py = Math.max(16, Math.min(H - 32, py + dy));

      moveTimer++;
      if (moveTimer % CONFIG.walkFrameRate === 0) {
        playerFrame = (playerFrame + 1) % 2;
        drawPlayer(playerFacing, playerFrame);
      }
      stepTimer++;
      if (stepTimer % CONFIG.footstepRate === 0) spawnFootstep(px, py);
      playerCanvas.style.transform = `translateY(${playerFrame === 1 ? '-2px' : '0'})`;
    } else {
      drawPlayer(playerFacing, 0);
      playerCanvas.style.transform = 'translateY(0)';
    }

    playerEl.style.left = (px - 12) + 'px';
    playerEl.style.top  = (py - 28) + 'px';
    checkProximity(px, py);
    updateCamera(px, py);
    // drawMinimap(px, py);
  }
  animFrame++;
  requestAnimationFrame(gameLoop);
}

// ── Cursor ────────────────────────────────
const cursorEl = document.getElementById('cursor');
window.addEventListener('mousemove', e => {
  cursorEl.style.left = e.clientX + 'px';
  cursorEl.style.top  = e.clientY + 'px';
});

// ── Resize ────────────────────────────────
function handleResize() {
  const m = Math.min(window.innerWidth, window.innerHeight);
  worldScale = m < 600 ? 0.8 : m < 900 ? 1.0 : 1.2;
}
window.addEventListener('resize', handleResize);
handleResize();

// ── Start ─────────────────────────────────
createNpcElements();
updateCamera(px, py);
// drawMinimap(px, py);
gameLoop();
