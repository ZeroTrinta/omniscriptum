let orbitPlanet = null;
let orbitAnimId = null;
let orbitPrimeId = null;
let orbitActive = false;
let orbitStars = [];
let orbitT = 0;
let orbitCloudAngle = 0;
let orbitZoom = 1.0;
const ORBIT_ZOOM_MIN = 0.4;
const ORBIT_ZOOM_MAX = 2.5;

// --- Warp animation ---
let warpAnimId = null;
let warpParticles = [];
let warpCanvas = null;
let warpCtx = null;


/* ===== DADOS DE CONSTRUÇÕES ===== */
const BUILDING_TYPES = {
  refinery:    { name: 'Refinaria',    icon: '⚙', color: '#c87030', credits: 800,  desc: 'Extrai e processa minerais brutos.' },
  spaceport:   { name: 'Espaçoporto', icon: '🚀', color: '#3a90d4', credits: 0, deficit: 500, desc: 'Base orbital militar. Permite construir naves. Gera déficit mensal de manutenção.', isFleetHub: true },
  generator:   { name: 'Gerador',     icon: '⚡', color: '#d4c030', credits: 600,  desc: 'Fornece energia para a colônia.' },
  barracks:    { name: 'Quartel',      icon: '⚔', color: '#c04040', credits: 400,  desc: 'Treina e abriga forças militares.' },
  farm:        { name: 'Fazenda',      icon: '⬡', color: '#40a050', credits: 350,  desc: 'Produção de alimentos e suprimentos.' },
  research:    { name: 'Laboratório',  icon: '◎', color: '#8060d0', credits: 1000, desc: 'Pesquisa e desenvolvimento tecnológico.' },
  shipyard:    { name: 'Estaleiro',    icon: '◈', color: '#4060c0', credits: 1500, desc: 'Construção e reparo de naves.' },
  colony:      { name: 'Colônia',      icon: '⬟', color: '#30a090', credits: 500,  desc: 'Aumenta a capacidade populacional.' },
};

// Tipos de naves disponíveis no Espaçoporto
const SHIP_TYPES_BUILD = {
  corvette:  { name: 'Corvette',  icon: '◁', color: '#4a90d9', buildCost: 1500, maintainCost: 200, buildTime: 1000,  desc: 'Nave leve e ágil. Ideal para patrulha e escolta.' },
  bomber:    { name: 'Bomber',    icon: '▽', color: '#c87030', buildCost: 4000, maintainCost: 500, buildTime: 3000,  desc: 'Bombardeiro pesado. Alto poder de fogo contra estruturas.' },
  frigate:   { name: 'Fragata',   icon: '◆', color: '#9b59d4', buildCost: 8000, maintainCost: 900, buildTime: 5000,  desc: 'Nave de guerra versátil. Equilíbrio entre ataque e defesa.' },
};

// Custo mensal de manutenção total da frota (calculado dinamicamente)
function calcFleetMaintain(planet) {
  if (!planet.fleet || planet.fleet.length === 0) return 0;
  return planet.fleet.reduce((sum, s) => {
    const st = SHIP_TYPES_BUILD[s.type];
    return sum + (st ? st.maintainCost * s.count : 0);
  }, 0);
}

// Inicializar construções dos planetas (placeholder aleatório)
function initPlanetBuildings(planet) {
  if (planet.buildings) return;
  planet.buildings = []; // começa vazio — sem geração aleatória
}

function updateOrbitEconUI(planet) {
  const income  = calcMonthlyIncome(planet);
  const deficit = calcMonthlyDeficit(planet);
  const net     = income - deficit;
  const el = id => document.getElementById(id);
  if (el('op-income'))  el('op-income').textContent  = '+' + income.toLocaleString() + ' ₢';
  if (el('op-deficit')) el('op-deficit').textContent = deficit > 0 ? '-' + deficit.toLocaleString() + ' ₢' : '0 ₢';
  const credEl = el('op-credits');
  if (credEl) {
    credEl.textContent = (net >= 0 ? '+' : '') + net.toLocaleString() + ' ₢';
    credEl.style.color = net >= 0 ? '#5acc80' : '#e06060';
  }
  if (el('op-balance')) el('op-balance').textContent = (planet.credits || 0).toLocaleString() + ' ₢';
  if (el('op-player-balance')) el('op-player-balance').textContent = currentPlayer ? (currentPlayer.credits || 0).toLocaleString() + ' ₢' : '— ₢';
}

function calcMonthlyCredits(planet) {
  let income = 0, deficit = 0;
  (planet.buildings || []).forEach(b => {
    if (b.constructing) return;
    const bt = BUILDING_TYPES[b.type];
    const tbl = CREDITS_PER_TICK[b.type];
    income += tbl ? (tbl[Math.min(b.level || 1, 5)] || 0) : 0;
    if (bt && bt.deficit) deficit += bt.deficit * (b.level || 1);
  });
  // Manutenção da frota
  deficit += calcFleetMaintain(planet);
  return income - deficit;
}

// Separados para exibição
function calcMonthlyIncome(planet) {
  return (planet.buildings || []).reduce((sum, b) => {
    if (b.constructing) return sum;
    const tbl = CREDITS_PER_TICK[b.type];
    return sum + (tbl ? (tbl[Math.min(b.level || 1, 5)] || 0) : 0);
  }, 0);
}
function calcMonthlyDeficit(planet) {
  let d = 0;
  (planet.buildings || []).forEach(b => {
    if (b.constructing) return;
    const bt = BUILDING_TYPES[b.type];
    if (bt && bt.deficit) d += bt.deficit * (b.level || 1);
  });
  return d + calcFleetMaintain(planet);
}
