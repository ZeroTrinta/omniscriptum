// ===== PLANET DATA =====
const TC = {
  'Forest':     { c: '#3db86a', g: '#1a6a35' },
  'Jungle':     { c: '#28a045', g: '#0f5520' },
  'Urban':      { c: '#7a9ab0', g: '#3a5a70' },
  'Arid':       { c: '#c87941', g: '#7a4010' },
  'Desert':     { c: '#d4a94a', g: '#8a6010' },
  'Cold':       { c: '#a8cce8', g: '#4a7aaa' },
  'Artict':     { c: '#c8e8f8', g: '#4a80b0' },
  'Mountain':   { c: '#9a8a7a', g: '#5a4a3a' },
  'Swamp':      { c: '#5a8a4a', g: '#2a4a1a' },
  'Infected':   { c: '#7acc44', g: '#3a7a10' },
  'Asteroids':  { c: '#888888', g: '#444444' },
  'Ocean':      { c: '#3a8fd4', g: '#1a5090' },
  'Gasoso':     { c: '#4a90d9', g: '#1a5090' },
};

const PLANET_NAMES = [
  { name: "Marte",        type: "Arid",      x: 0.561, y: 0.542, r: 14 },
  { name: "Terra",        type: "Forest",    x: 0.452, y: 0.436, r: 13 },
  { name: "The Maw",      type: "Infected",  x: 0.557, y: 0.632, r: 12 },
  { name: "Vergessene",   type: "Mountain",  x: 0.653, y: 0.619, r: 11 },
  { name: "Vostroya",     type: "Urban",     x: 0.406, y: 0.594, r: 12 },
  { name: "Ryloth",       type: "Desert",    x: 0.588, y: 0.398, r: 11 },
  { name: "Valguero",     type: "Forest",    x: 0.382, y: 0.33,  r: 14 },
  { name: "Kuat",         type: "Urban",     x: 0.24,  y: 0.495, r: 13 },
  { name: "Badelara",     type: "Jungle",    x: 0.681, y: 0.267, r: 13 },
  { name: "Iter",         type: "Asteroids", x: 0.87,  y: 0.492, r: 11 },
  { name: "Maldives",     type: "Ocean",     x: 0.387, y: 0.792, r: 12 },
  { name: "Creshan RW-0", type: "Arid",      x: 0.246, y: 0.164, r: 13 },
  { name: "Archavios",    type: "Mountain",  x: 0.55,  y: 0.119, r: 11 },
  { name: "Tatooine",     type: "Desert",    x: 0.681, y: 0.097, r: 12 },
  { name: "Magnouthea",   type: "Gasoso",    x: 0.841, y: 0.681, r: 15 },
  { name: "Atlan Prime",  type: "Ocean",     x: 0.514, y: 0.962, r: 13 },
  { name: "Yavin-4",      type: "Jungle",    x: 0.176, y: 0.993, r: 13 },
  { name: "Luyten-B",     type: "Gasoso",    x: 0.057, y: -0.161,r: 17 },
  { name: "Meerasa",      type: "Infected",  x: 0.28,  y: -0.075,r: 16 },
  { name: "New Phyrexia", type: "Infected",  x: 0.874, y: 0.067, r: 14 },
  { name: "Luciferina",   type: "Arid",      x: 0.968, y: 0.246, r: 13 },
  { name: "Limoneno",     type: "Mountain",  x: 0.878, y: -0.222,r: 11 },
  { name: "Mustafar",     type: "Arid",      x: 0.762, y: -0.215,r: 11 },
  { name: "Dagobah",      type: "Swamp",     x: 0.755, y: 1.052, r: 13 },
  { name: "Crait",        type: "Mountain",  x: 0.025, y: 0.054, r: 13 },
  { name: "Cor-155",      type: "Gasoso",    x: -0.19, y: 0.183, r: 18 },
  { name: "Rhen-Var",     type: "Artict",    x: 0.017, y: 0.296, r: 12 },
  { name: "Hoth",         type: "Cold",      x: -0.189,y: 0.535, r: 13 },
  { name: "Cornelia",     type: "Forest",    x: 0.021, y: 0.975, r: 12 },
  { name: "DasSarma",     type: "Mountain",  x: -0.201,y: 1.074, r: 14 },
  { name: "Stygia",       type: "Desert",    x: -0.082,y: -0.153,r: 11 },
  { name: "Birnus",       type: "Ocean",     x: 1.122, y: 0.524, r: 13 },
  { name: "Char",         type: "Arid",      x: 0.756, y: 1.301, r: 11 },
  { name: "NGC-6826",     type: "Gasoso",    x: 1.352, y: -0.102,r: 10 },
];

// MAJOR FACTIONS (têm nuvem territorial)
const MAJOR_FACTIONS = [
  { n: "GUT",             c: "#cc2200", c2: "#ddaa00", major: true, gov: "Dictatorship" },
  { n: "Noble House Ordos",c:"#3a8a1a", c2: "#c8b400", major: true, gov: "Oligarchic" },
  { n: "Phyrexia",        c: "#557766", c2: "#557766", major: true, gov: "Machine Intelligence" },
  { n: "Roving Clans",    c: "#d4aa00", c2: "#e06000", major: true, gov: "Democratic" },
  { n: "Sperare",         c: "#1a4acc", c2: "#cc1a1a", major: true, gov: "Imperial" },
  { n: "Winterberg",      c: "#181818", c2: "#cc1a1a", major: true, gov: "Imperial" },
  { n: "Zerg",            c: "#6622aa", c2: "#5a3300", major: true, gov: "Hive Mind" },
];

// MINOR FACTIONS
const MINOR_FACTIONS = [
  { n: "Asintmah",         c: "#2a8a2a", c2: "#dddddd", major: false, gov: "Hive Mind" },
  { n: "Chaos Cultists",   c: "#6a1a2a", c2: "#5a3a2a", major: false, gov: "Anarchy" },
  { n: "Star Fox",         c: "#dddddd", c2: "#5599ff", major: false, gov: "Democratic" },
  { n: "Elders",           c: "#7722bb", c2: "#dddddd", major: false, gov: "Dictatorship" },
  { n: "Fraternitas Ferrea",c:"#3a3a99", c2: "#888888", major: false, gov: "Oligarchic" },
  { n: "Rêveur",           c: "#2255cc", c2: "#dddddd", major: false, gov: "Oligarchic" },
  { n: "Black Heart Cabal",c: "#111111", c2: "#116611", major: false, gov: "Dictatorship" },
  { n: "Harlequins",       c: "#dd44aa", c2: "#44ddff", major: false, gov: "Oligarchic" },
  { n: "Mechanicus",       c: "#cc2200", c2: "#ee6600", major: false, gov: "Oligarchic" },
  { n: "Nagaraja",         c: "#111111", c2: "#ddcc00", major: false, gov: "Oligarchic" },
  { n: "Mayanarch Dynasty",c: "#888888", c2: "#ee6600", major: false, gov: "Imperial" },
  { n: "Thokt Dynasty",    c: "#778888", c2: "#00cccc", major: false, gov: "Dictatorship" },
  { n: "Orks",             c: "#226622", c2: "#338833", major: false, gov: "Dictatorship" },
  { n: "Pentastar",        c: "#2244cc", c2: "#ddcc00", major: false, gov: "Oligarchic" },
  { n: "Prizrak",          c: "#00ee44", c2: "#ff6600", major: false, gov: "Oligarchic" },
  { n: "Project 66",       c: "#3355cc", c2: "#111133", major: false, gov: "Democratic" },
  { n: "RPL",              c: "#888888", c2: "#888888", major: false, gov: "Democratic" },
  { n: "SRS",              c: "#ee6600", c2: "#2255cc", major: false, gov: "Oligarchic" },
  { n: "Neo-Umbrella",     c: "#cc1111", c2: "#dddddd", major: false, gov: "Unknown" },
  { n: "Doomkeepers",      c: "#2244cc", c2: "#dddddd", major: false, gov: "Unknown" },
];

const FACTIONS_POOL = [...MAJOR_FACTIONS, ...MINOR_FACTIONS];

const POI_POOL = [
  "Porto Espacial", "Templo Antigo", "Fortaleza Abandonada", "Mercado Central",
  "Torre de Vigia", "Cavernas Cristalinas", "Ruínas Ancestrais", "Base Militar",
  "Estação de Pesquisa", "Oásis Escondido", "Catedral de Luz", "Portal Estelar",
  "Arena de Combate", "Biblioteca Arcana", "Jardins Flutuantes", "Necrópole",
  "Fábrica de Droides", "Observatório Celeste", "Taverna Intergaláctica",
  "Cristal Mãe", "Fonte de Energia", "Arena Gladiatória", "Cidadela Sombria",
];

function pickRandom(arr, count) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

// Facção principal canônica e subfacções presentes por planeta
const PLANET_FACTION_MAP = {
  // Major faction homeworlds / controlled planets
  "Terra":        { main: "GUT",              secondary: ["Asintmah", "Prizrak"] },
  "Marte":        { main: "GUT",              secondary: ["Mechanicus"] },
  "Ryloth":       { main: "GUT",              secondary: ["Nagaraja", "Mayanarch Dynasty"] },
  "Kuat":         { main: "Noble House Ordos", secondary: ["Project 66"] },
  "Mustafar":     { main: "Noble House Ordos", secondary: ["Mayanarch Dynasty"] },
  "New Phyrexia": { main: "Phyrexia",          secondary: [] },
  "Tatooine":     { main: "Roving Clans",      secondary: ["Thokt Dynasty"] },
  "Maldives":     { main: "Sperare",           secondary: ["Thokt Dynasty"] },
  "Hoth":         { main: "Winterberg",        secondary: ["Harlequins"] },
  "Rhen-Var":     { main: "Winterberg",        secondary: [] },
  "Char":         { main: "Zerg",              secondary: [] },
  "Dagobah":      { main: "Zerg",              secondary: [] },
  // Minor faction homeworlds
  "Birnus":       { main: "Chaos Cultists",    secondary: [] },
  "Cornelia":     { main: "Star Fox",          secondary: [] },
  "DasSarma":     { main: "Elders",            secondary: [] },
  "Luciferina":   { main: "Orks",              secondary: [] },
  "Meerasa":      { main: "Pentastar",         secondary: [] },
  "The Maw":      { main: "Black Heart Cabal", secondary: [] },
};

function buildPlanetData(p, idx) {
  const typeInfo = TC[p.type] || { c: '#888', g: '#444' };
  const numPoi = 2 + Math.floor(Math.random() * 4);
  const hasRings = p.type === 'Gigante Gasoso' || p.type === 'Estelar';
  const canonFaction = PLANET_FACTION_MAP[p.name];
  const factionMain = canonFaction ? canonFaction.main : '';
  const factionSecondary = canonFaction ? [...canonFaction.secondary] : [];
  return {
    id: idx + 1,
    name: p.name,
    type: p.type,
    color: typeInfo.c,
    glow: typeInfo.g,
    radius: p.r,
    x: p.x,
    y: p.y,
    desc: `[${p.type}] Planeta ${p.name}. Informações detalhadas pendentes — dados de RPG a serem preenchidos pelo mestre.`,
    pop: ["Desconhecida", "N/A", "—" + (Math.floor(Math.random() * 10) + 1) + " Mi", (Math.floor(Math.random() * 5) + 1) + "." + Math.floor(Math.random() * 9) + " Bi"][Math.floor(Math.random() * 4)],
    system: p.name + " Prime",
    climate: ["Temperado", "Árido", "Glacial", "Tropical", "Infernal", "Radioativo", "Nebuloso", "Desconhecido"][Math.floor(Math.random() * 8)],
    gov: ["Democratic", "Oligarchic", "Dictatorial", "Imperial", "Machine Intelligence", "Hive Mind", ""][Math.floor(Math.random() * 7)],
    factions: [],
    factionMain,
    factionSecondary,
    poi: pickRandom(POI_POOL, numPoi),
    rings: hasRings,
  };
}

// Dragões anciões presentes em cada planeta (múltiplos possíveis)
const PLANET_STARS_MAP = {
  "Tatooine":     ["Shara-Ishvalda"],
  "The Maw":      ["Alatreon", "Safi-Jiiva"],
  "Terra":        ["Behemoth"],
  "Hoth":         ["Vorsphyroa"],
  "Luciferina":   ["Gaismagorm"],
  "Maldives":     ["Goldbeard Ceadeus"],
  "Char":         ["Kulve Taroth"],
  "Crait":        ["Allmother Narwa"],
  "Birnus":       ["Risen Shagaru Magala"],
  "Creshan RW-0": ["Ruiner Nergigante"],
  "Kuat":         ["Shah Dalamadur"],
  "Meerasa":      ["Shantien"],
  "Iter":         ["Shen Gaoren"],
  "Valguero":     ["Steel Lao-Shan-Lung"],
  "Yavin-4":      ["White Fatalis"],
  "Mustafar":     ["Zorah Magdaros"],
  "Ryloth":       ["Ahtal-ka"],  
};

const PLANETS = PLANET_NAMES.map((p, i) => buildPlanetData(p, i));

// SOL center (declarado cedo para initOrbitalData)
const SOL_X = 0.50, SOL_Y = 0.50;

// ===== CAM / CANVAS =====
const canvas = document.getElementById('galaxy');
const ctx = canvas.getContext('2d');
const wrap = document.getElementById('canvas-wrap');
const GW = 2000, GH = 1600;

let camX = 0, camY = 0, zoom = 1;
let stars = [];
let hoveredPlanet = null, selectedPlanet = null;
let activeFilter = 'all'; // kept for legacy draw compat — now unused
let activeFactionFilters = new Set(); // empty = show all
let showFactionClouds = false;

// Áudio
let lastHoveredPlanet = null;
function playHover() {
  const audio = document.getElementById('sfx-hover');
  if (audio) { audio.currentTime = 0; audio.volume = 0.4; audio.play().catch(() => {}); }
}
function playClick() {
  const audio = document.getElementById('sfx-click');
  if (audio) { audio.currentTime = 0; audio.volume = 0.5; audio.play().catch(() => {}); }
}

let isDragging = false;
let dragStartX = 0, dragStartY = 0;
let dragCamX = 0, dragCamY = 0;

// Arrastar planetas
let isDraggingPlanet = false;
let draggedPlanet = null;
let dragPlanetSnap = false; // true = Shift (imã), false = Alt (livre)

// Animação de ondas nas rotas
let routeAnimationTime = 0;
let lastRouteFrame = 0;

// Simulação orbital
let simActive = false;
const SIM_SPEED_BASE = 0.00004; // velocidade base angular (radianos por ms)

// Inicializa dados orbitais para cada planeta
function initOrbitalData() {
  const cx = SOL_X * GW; // centro em unidades de mundo
  const cy = SOL_Y * GH;
  PLANETS.forEach(p => {
    const dx = p.x * GW - cx;
    const dy = p.y * GH - cy;
    p.orbitRadius = Math.sqrt(dx * dx + dy * dy);
    p.orbitAngle = Math.atan2(dy, dx);
  });
}

function updateSimulation(dt) {
  if (!simActive) return;
  const cx = SOL_X * GW;
  const cy = SOL_Y * GH;
  PLANETS.forEach(p => {
    // Não move planetas sendo arrastados
    if (isDraggingPlanet && draggedPlanet === p) return;
    if (p.orbitRadius < 1) return; // Muito perto do centro, não orbita

    // 3ª lei de Kepler: velocidade angular ∝ 1 / r^1.5
    const angularSpeed = SIM_SPEED_BASE / Math.pow(p.orbitRadius / 200, 1.5);
    p.orbitAngle += angularSpeed * dt;

    // Atualiza posição do planeta baseado no ângulo orbital
    p.x = (cx + p.orbitRadius * Math.cos(p.orbitAngle)) / GW;
    p.y = (cy + p.orbitRadius * Math.sin(p.orbitAngle)) / GH;
  });
}


// Editor de planetas
let editingPlanet = null;
let planetImages = {}; // Armazena imagens PNG carregadas por id do planeta

// 7 anéis de órbita (raios em unidades de mundo, GW = 2000) - espaçamento progressivo
const ORBIT_RINGS = [140, 240, 360, 520, 740, 1020, 1380];
const ORBIT_MAGNET_DIST = 70; // Distância para "puxar" planeta para o anel (em unidades de mundo)

function resize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.width = w;
  canvas.height = h;
  stars = Array.from({length: 600}, () => ({
    x: Math.random() * w, y: Math.random() * h,
    r: Math.random() * 1.5 + 0.3,
    a: Math.random() * 0.5 + 0.1,
    twinkle: Math.random() * Math.PI * 2
  }));
  camX = (w - GW * zoom) / 2;
  camY = (h - GH * zoom) / 2;
}

function w2s(wx, wy) {
  return { x: wx * zoom + camX, y: wy * zoom + camY };
}

function s2w(sx, sy) {
  return { x: (sx - camX) / zoom, y: (sy - camY) / zoom };
}

function planetScreenPos(p) {
  return w2s(p.x * GW, p.y * GH);
}

/* --- Draw --- */

// Convex hull (Graham scan)
function convexHull(pts) {
  if (pts.length < 3) return pts;
  pts = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0]-o[0])*(b[1]-o[1]) - (a[1]-o[1])*(b[0]-o[0]);
  const lower = [], upper = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length-2], lower[lower.length-1], p) <= 0) lower.pop();
    lower.push(p);
  }
  for (let i = pts.length-1; i >= 0; i--) {
    const p = pts[i];
    while (upper.length >= 2 && cross(upper[upper.length-2], upper[upper.length-1], p) <= 0) upper.pop();
    upper.push(p);
  }
  upper.pop(); lower.pop();
  return lower.concat(upper);
}

// Draw a rounded/bloated polygon (faction cloud)
function drawBlobPath(hull, pad) {
  if (hull.length === 0) return;
  if (hull.length === 1) {
    ctx.arc(hull[0][0], hull[0][1], pad, 0, Math.PI * 2);
    return;
  }
  if (hull.length === 2) {
    const [x1,y1] = hull[0], [x2,y2] = hull[1];
    const cx = (x1+x2)/2, cy = (y1+y2)/2;
    const dx = x2-x1, dy = y2-y1;
    const len = Math.sqrt(dx*dx+dy*dy) || 1;
    ctx.ellipse(cx, cy, len/2 + pad, pad, Math.atan2(dy, dx), 0, Math.PI*2);
    return;
  }
  // Expand each point outward from centroid
  const cx = hull.reduce((s,p) => s+p[0], 0) / hull.length;
  const cy = hull.reduce((s,p) => s+p[1], 0) / hull.length;
  const expanded = hull.map(([x,y]) => {
    const dx = x - cx, dy = y - cy;
    const len = Math.sqrt(dx*dx+dy*dy) || 1;
    return [x + dx/len*pad, y + dy/len*pad];
  });
  // Draw smooth bezier through expanded hull
  ctx.moveTo((expanded[0][0]+expanded[expanded.length-1][0])/2, (expanded[0][1]+expanded[expanded.length-1][1])/2);
  for (let i = 0; i < expanded.length; i++) {
    const curr = expanded[i];
    const next = expanded[(i+1) % expanded.length];
    ctx.quadraticCurveTo(curr[0], curr[1], (curr[0]+next[0])/2, (curr[1]+next[1])/2);
  }
  ctx.closePath();
}

// Offscreen canvas reusado para metaballs
let _factionOffscreen = null;
let _factionOffCtx = null;

function getFactionOffscreen(w, h) {
  if (!_factionOffscreen || _factionOffscreen.width !== w || _factionOffscreen.height !== h) {
    _factionOffscreen = document.createElement('canvas');
    _factionOffscreen.width = w;
    _factionOffscreen.height = h;
    _factionOffCtx = _factionOffscreen.getContext('2d');
  }
  return { oc: _factionOffscreen, ox: _factionOffCtx };
}

// Agrupa planetas de mesma facção em clusters conectados (distância <= mergeThreshold)
function clusterPlanets(pts, mergeThreshold) {
  const visited = new Array(pts.length).fill(false);
  const clusters = [];
  for (let i = 0; i < pts.length; i++) {
    if (visited[i]) continue;
    const cluster = [i];
    visited[i] = true;
    const queue = [i];
    while (queue.length) {
      const cur = queue.shift();
      for (let j = 0; j < pts.length; j++) {
        if (visited[j]) continue;
        const dx = pts[cur][0] - pts[j][0];
        const dy = pts[cur][1] - pts[j][1];
        if (Math.sqrt(dx*dx + dy*dy) <= mergeThreshold) {
          visited[j] = true;
          cluster.push(j);
          queue.push(j);
        }
      }
    }
    clusters.push(cluster.map(idx => pts[idx]));
  }
  return clusters;
}

function drawFactionClouds(t) {
  const cw = canvas.width, ch = canvas.height;

  // Offscreen 1: acumula gradientes brancos (alpha = metaball field)
  if (!drawFactionClouds._oc1 || drawFactionClouds._oc1.width !== cw || drawFactionClouds._oc1.height !== ch) {
    drawFactionClouds._oc1 = document.createElement('canvas');
    drawFactionClouds._oc1.width = cw; drawFactionClouds._oc1.height = ch;
    drawFactionClouds._ox1 = drawFactionClouds._oc1.getContext('2d');
  }
  // Offscreen 2: colorização final
  if (!drawFactionClouds._oc2 || drawFactionClouds._oc2.width !== cw || drawFactionClouds._oc2.height !== ch) {
    drawFactionClouds._oc2 = document.createElement('canvas');
    drawFactionClouds._oc2.width = cw; drawFactionClouds._oc2.height = ch;
    drawFactionClouds._ox2 = drawFactionClouds._oc2.getContext('2d');
  }
  const ox1 = drawFactionClouds._ox1, oc1 = drawFactionClouds._oc1;
  const ox2 = drawFactionClouds._ox2, oc2 = drawFactionClouds._oc2;

  // Group planets by factionMain
  const groups = new Map();
  PLANETS.forEach(p => {
    const name = p.factionMain;
    if (!name) return;
    if (activeFactionFilters.size > 0 && !activeFactionFilters.has(name)) return;
    if (!groups.has(name)) {
      const c = getFactionColor(name) || p.color || '#8888ff';
      groups.set(name, { color: c, planets: [] });
    }
    groups.get(name).planets.push(p);
  });

  const bubbleWorldR = 100;
  const bubbleR = bubbleWorldR * zoom;
  const mergeThreshold = bubbleR * 2.1;

  groups.forEach(({ color, planets }, factionName) => {
    if (!planets.length) return;

    let rv = 128, gv = 128, bv = 255;
    const m = color.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
    if (m) { rv = parseInt(m[1],16); gv = parseInt(m[2],16); bv = parseInt(m[3],16); }

    const pulse = Math.sin(t * 0.0004 + (rv+gv+bv) * 0.007) * 0.02 + 0.08;
    const pts = planets.map(p => { const s = planetScreenPos(p); return [s.x, s.y]; });
    const clusters = clusterPlanets(pts, mergeThreshold);

    clusters.forEach(clusterPts => {
      // ── PASSO 1: desenha metaballs brancos no ox1 ──
      ox1.clearRect(0, 0, cw, ch);
      ox1.globalCompositeOperation = 'source-over';
      clusterPts.forEach(([px, py]) => {
        // Gradiente interno denso + aba difusa para fusão suave entre bolhas
        const grad = ox1.createRadialGradient(px, py, 0, px, py, bubbleR * 1.3);
        grad.addColorStop(0,    'rgba(255,255,255,0.9)');
        grad.addColorStop(0.35, 'rgba(255,255,255,0.75)');
        grad.addColorStop(0.6,  'rgba(255,255,255,0.45)');
        grad.addColorStop(0.8,  'rgba(255,255,255,0.15)');
        grad.addColorStop(1,    'rgba(255,255,255,0)');
        ox1.fillStyle = grad;
        ox1.beginPath();
        ox1.arc(px, py, bubbleR * 1.3, 0, Math.PI * 2);
        ox1.fill();
      });

      // ── PASSO 2: coloriza — ox2 = cor sólida recortada pelo alpha de ox1 ──
      ox2.clearRect(0, 0, cw, ch);
      ox2.globalCompositeOperation = 'source-over';
      ox2.fillStyle = `rgb(${rv},${gv},${bv})`;
      ox2.fillRect(0, 0, cw, ch);
      ox2.globalCompositeOperation = 'destination-in';
      ox2.drawImage(oc1, 0, 0);
      ox2.globalCompositeOperation = 'source-over';

      // ── PASSO 3: compõe no canvas principal ──
      ctx.save();
      ctx.globalAlpha = pulse;
      ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(oc2, 0, 0);
      ctx.globalAlpha = 1;
      ctx.restore();

      // ── PASSO 4: borda suave por planeta ──
      ctx.save();
      ctx.strokeStyle = `rgba(${rv},${gv},${bv},0.55)`;
      ctx.lineWidth = Math.max(1, 1.5 * zoom);
      ctx.setLineDash([4 * zoom, 3 * zoom]);
      clusterPts.forEach(([px, py]) => {
        ctx.beginPath();
        ctx.arc(px, py, bubbleR * 0.92, 0, Math.PI * 2);
        ctx.stroke();
      });
      ctx.setLineDash([]);
      ctx.restore();

      // ── PASSO 5: label no centroide ──
      if (zoom > 0.2) {
        const cx2 = clusterPts.reduce((s,p) => s+p[0], 0) / clusterPts.length;
        const cy2 = clusterPts.reduce((s,p) => s+p[1], 0) / clusterPts.length;
        const fontSize = Math.max(8, Math.round(11 * zoom));
        ctx.save();
        ctx.font = `600 ${fontSize}px 'Orbitron', sans-serif`;
        ctx.textAlign = 'center';
        // Sombra para legibilidade
        ctx.shadowColor = `rgba(${rv},${gv},${bv},1)`;
        ctx.shadowBlur = 12;
        ctx.fillStyle = `rgba(255,255,255,0.9)`;
        ctx.fillText(factionName.toUpperCase(), cx2, cy2 + bubbleR * 1.05);
        ctx.shadowBlur = 0;
        ctx.restore();
      }
    });
  });
}

function drawNebula() {
  const nebulas = [
    { wx:0.35,wy:0.5,rx:0.3,ry:0.2,c:'rgba(80,40,140,0.06)' },
    { wx:0.65,wy:0.35,rx:0.25,ry:0.15,c:'rgba(40,80,160,0.05)' },
    { wx:0.5,wy:0.75,rx:0.2,ry:0.12,c:'rgba(40,120,80,0.04)' },
    { wx:0.12,wy:0.2,rx:0.15,ry:0.18,c:'rgba(120,40,100,0.04)' },
    { wx:0.85,wy:0.5,rx:0.18,ry:0.12,c:'rgba(40,60,160,0.04)' },
    { wx:0.75,wy:0.7,rx:0.15,ry:0.1,c:'rgba(160,80,40,0.03)' },
  ];
  nebulas.forEach(n => {
    const pos = w2s(n.wx * GW, n.wy * GH);
    const rx = n.rx * GW * zoom;
    const ry = n.ry * GH * zoom;
    ctx.save();
    const grad = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, Math.max(rx, ry));
    grad.addColorStop(0, n.c);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.translate(pos.x, pos.y);
    ctx.scale(rx / (ry || 1), 1);
    ctx.beginPath();
    ctx.arc(0, 0, ry || 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

function drawConnections() {
  const connections = new Set();
  const maxDist = 450; // Distância máxima para conexão

  // Primeiro: encontra a conexão mais próxima para cada planeta (garante que todos tenham pelo menos 1)
  for (let i = 0; i < PLANETS.length; i++) {
    const a = PLANETS[i];
    if (!planetMatchesFactionFilter(a)) continue;

    let closestDist = Infinity;
    let closestJ = -1;

    for (let j = 0; j < PLANETS.length; j++) {
      if (i === j) continue;
      const b = PLANETS[j];
      if (!planetMatchesFactionFilter(b)) continue;

      const dist = Math.sqrt(((a.x - b.x) * GW) ** 2 + ((a.y - b.y) * GH) ** 2);
      if (dist < closestDist) {
        closestDist = dist;
        closestJ = j;
      }
    }

    // Adiciona conexão com o mais próximo (se dentro do limite)
    if (closestJ >= 0 && closestDist < maxDist * 1.5) {
      const key = i < closestJ ? `${i}-${closestJ}` : `${closestJ}-${i}`;
      connections.add(key);
    }
  }

  // Segundo: adiciona conexões extras para planetas dentro do alcance
  for (let i = 0; i < PLANETS.length; i++) {
    const a = PLANETS[i];
    if (!planetMatchesFactionFilter(a)) continue;

    for (let j = i + 1; j < PLANETS.length; j++) {
      if (!planetMatchesFactionFilter(PLANETS[j])) continue;
      const b = PLANETS[j];
      const dist = Math.sqrt(((a.x - b.x) * GW) ** 2 + ((a.y - b.y) * GH) ** 2);

      if (dist < maxDist) {
        const key = `${i}-${j}`;
        connections.add(key);
      }
    }
  }

  // Atualiza tempo da animação de rotas (loop contínuo)
  const now = performance.now();
  if (selectedPlanet) {
    if (lastRouteFrame === 0) lastRouteFrame = now;
    routeAnimationTime += (now - lastRouteFrame) / 1000;
    lastRouteFrame = now;
  } else {
    routeAnimationTime = 0;
    lastRouteFrame = 0;
  }

  // Desenha todas as conexões
  connections.forEach(key => {
    const [i, j] = key.split('-').map(Number);
    const a = PLANETS[i], b = PLANETS[j];
    const pa = planetScreenPos(a), pb = planetScreenPos(b);
    const dist = Math.sqrt(((a.x - b.x) * GW) ** 2 + ((a.y - b.y) * GH) ** 2);
    const isRoute = selectedPlanet && (selectedPlanet === a || selectedPlanet === b);

    if (isRoute) {
      // Determina direção (do planeta selecionado para o outro)
      const fromPlanet = selectedPlanet === a ? a : b;
      const toPlanet = selectedPlanet === a ? b : a;
      const fromPos = planetScreenPos(fromPlanet);
      const toPos = planetScreenPos(toPlanet);

      const lineLength = Math.sqrt((toPos.x - fromPos.x) ** 2 + (toPos.y - fromPos.y) ** 2);
      const angle = Math.atan2(toPos.y - fromPos.y, toPos.x - fromPos.x);

      // Desenha linha base
      ctx.beginPath();
      ctx.moveTo(fromPos.x, fromPos.y);
      ctx.lineTo(toPos.x, toPos.y);
      ctx.strokeStyle = 'rgba(60,100,180,0.20)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([]);
      ctx.stroke();

      // Desenha múltiplas ondas em loop (lento)
      const numWaves = 2;
      const waveSpeed = 0.15;

      for (let w = 0; w < numWaves; w++) {
        const waveOffset = (w / numWaves);
        let waveProgress = ((routeAnimationTime * waveSpeed) + waveOffset) % 1;

        const waveDist = lineLength * waveProgress;
        const waveX = fromPos.x + Math.cos(angle) * waveDist;
        const waveY = fromPos.y + Math.sin(angle) * waveDist;

        // Alpha varia ao longo do ciclo
        const waveAlpha = Math.sin(waveProgress * Math.PI) * 0.9;
        // Tamanho fixo em pixels de tela (não muda com zoom)
        const waveR = 3 + Math.sin(waveProgress * Math.PI) * 5;

        // Gradiente da onda
        const gradient = ctx.createRadialGradient(waveX, waveY, 0, waveX, waveY, waveR * 3);
        gradient.addColorStop(0, `rgba(140,200,255,${waveAlpha * 0.8})`);
        gradient.addColorStop(0.4, `rgba(100,160,255,${waveAlpha * 0.4})`);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.ellipse(waveX, waveY, waveR * 2, waveR, angle, 0, Math.PI * 2);
        ctx.fill();

        // Núcleo brilhante
        ctx.fillStyle = `rgba(200,230,255,${waveAlpha})`;
        ctx.beginPath();
        ctx.ellipse(waveX, waveY, waveR, waveR * 0.6, angle, 0, Math.PI * 2);
        ctx.fill();
      }

      // Rastro luminoso ao longo da linha
      const trailGradient = ctx.createLinearGradient(fromPos.x, fromPos.y, toPos.x, toPos.y);
      trailGradient.addColorStop(0, 'rgba(100,160,255,0.3)');
      trailGradient.addColorStop(0.5, 'rgba(120,180,255,0.5)');
      trailGradient.addColorStop(1, 'rgba(100,160,255,0.3)');

      ctx.strokeStyle = trailGradient;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(fromPos.x, fromPos.y);
      ctx.lineTo(toPos.x, toPos.y);
      ctx.stroke();

    } else {
      // Conexões normais (sem pulso)
      const alpha = Math.max(0.05, 0.30 - dist / 4000);
      ctx.strokeStyle = `rgba(80,120,200,${alpha})`;
      ctx.lineWidth = 0.8;
      ctx.setLineDash([3 * zoom, 6 * zoom]);
      ctx.beginPath();
      ctx.moveTo(pa.x, pa.y);
      ctx.lineTo(pb.x, pb.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  });
}

function lighten(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${Math.min(255,(n>>16)+amt)},${Math.min(255,((n>>8)&0xff)+amt)},${Math.min(255,(n&0xff)+amt)})`;
}
function darken(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${Math.max(0,(n>>16)-amt)},${Math.max(0,((n>>8)&0xff)-amt)},${Math.max(0,(n&0xff)-amt)})`;
}
