/* ===================================================
   SHIP BUILD SYSTEM
   =================================================== */
let shipBuildSpaceportIdx = -1;

function openShipBuildPopup(spaceportIdx) {
  shipBuildSpaceportIdx = spaceportIdx;
  const grid = document.getElementById('ship-build-grid');
  grid.innerHTML = Object.entries(SHIP_TYPES_BUILD).map(([key, st]) => `
    <div class="ship-build-card" data-stype="${key}">
      <div class="ship-build-icon" style="background:${st.color}22;color:${st.color}">${st.icon}</div>
      <div class="ship-build-info">
        <div class="ship-build-name">${st.name}</div>
        <div class="ship-build-desc">${st.desc}</div>
        <div class="ship-build-meta">
          <span class="ship-build-cost">Custo: ${st.buildCost.toLocaleString()} ₢</span>
          <span class="ship-build-maint">Mant.: ${st.maintainCost.toLocaleString()} ₢/mês</span>
          <span class="ship-build-time">⏱ ${st.buildTime/1000}s</span>
        </div>
      </div>
    </div>
  `).join('');

  grid.querySelectorAll('.ship-build-card').forEach(card => {
    card.addEventListener('click', () => {
      buildShip(card.dataset.stype);
      document.getElementById('ship-build-overlay').classList.remove('active');
    });
  });
  document.getElementById('ship-build-overlay').classList.add('active');
}

async function buildShip(type) {
  const planet = orbitPlanet;
  if (!planet) return;
  const st = SHIP_TYPES_BUILD[type];
  if (!st) return;
  const ownsIt = isMaster() || (currentPlayer && planet.ownerId === currentPlayer.uid);
  if (!ownsIt) { alert('Você não controla este planeta.'); return; }
  const playerCreds = currentPlayer ? (currentPlayer.credits || 0) : 0;
  if (!isMaster() && playerCreds < st.buildCost) {
    alert(`Créditos insuficientes!\nNecessário: ${st.buildCost.toLocaleString()} ₢\nSeus créditos: ${playerCreds.toLocaleString()} ₢`);
    return;
  }
  // Debitar do jogador
  if (!isMaster() && currentPlayer) {
    currentPlayer.credits -= st.buildCost;
    const { db, doc, updateDoc } = window._fb;
    await updateDoc(doc(db, 'players', currentPlayer.uid), { credits: currentPlayer.credits });
  }
  // Adicionar nave em construção
  planet.fleet = planet.fleet || [];
  const now = Date.now();
  planet.fleet.push({
    type, name: st.name, count: 0,
    constructing: true,
    constructingStart: now,
    constructingEnd: now + st.buildTime,
  });
  // Recalcular total
  planet.fleetTotal = planet.fleet.filter(s => !s.constructing).reduce((s, n) => s + n.count, 0);
  await savePlanet(planet);
  renderFleetList(planet);
  updateOrbitEconUI(planet);
}

function renderFleetList(planet) {
  const fleetEl = document.getElementById('op-fleet');
  const shipsEl = document.getElementById('op-ships-list');
  if (!fleetEl || !shipsEl) return;

  const activeFleet = (planet.fleet || []).filter(s => !s.constructing);
  const building    = (planet.fleet || []).filter(s => s.constructing);

  const total = activeFleet.reduce((s, n) => s + (n.count || 0), 0);
  fleetEl.textContent = total > 0 ? total + ' naves' : 'Nenhuma';

  // Naves em construção
  let html = building.map((s, i) => {
    const st = SHIP_TYPES_BUILD[s.type];
    const pct = Math.min(100, ((Date.now() - s.constructingStart) / (s.constructingEnd - s.constructingStart)) * 100);
    return `<div class="ship-building-row">
      <span class="ship-building-name">▶ ${s.name}</span>
      <div class="ship-building-bar"><div class="ship-building-fill" id="sbf-${i}" style="width:${pct}%"></div></div>
    </div>`;
  }).join('');

  // Naves prontas
  html += activeFleet.map(s => {
    const st = SHIP_TYPES_BUILD[s.type] || {};
    return `<div class="op-ship-row">
      <span class="op-ship-icon" style="color:${st.color||'#888'}">${st.icon||'◈'}</span>
      <span class="op-ship-name">${s.name}</span>
      <span class="op-ship-count">${s.count}x</span>
    </div>`;
  }).join('');

  shipsEl.innerHTML = html || '<div style="font-size:11px;color:#2a3a50;padding:4px 0">Sem naves registradas.</div>';

  // Tickar barras de construção
  building.forEach((s, i) => {
    const bar = document.getElementById(`sbf-${i}`);
    if (!bar) return;
    const tick = () => {
      if (!s.constructing) return;
      const now = Date.now();
      if (now >= s.constructingEnd) {
        s.constructing = false;
        s.count = 1;
        // Agrupar com naves do mesmo tipo
        const existing = (planet.fleet || []).find(f => f.type === s.type && !f.constructing && f !== s);
        if (existing) {
          existing.count = (existing.count || 0) + 1;
          planet.fleet = planet.fleet.filter(f => f !== s);
        }
        planet.fleetTotal = planet.fleet.filter(f => !f.constructing).reduce((sum, n) => sum + (n.count || 0), 0);
        savePlanet(planet);
        renderFleetList(planet);
        updateOrbitEconUI(planet);
        return;
      }
      const pct = Math.min(100, ((now - s.constructingStart) / (s.constructingEnd - s.constructingStart)) * 100);
      if (bar) bar.style.width = pct + '%';
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

/* ===== SISTEMA DE CONSTRUÇÃO ===== */
const BUILD_DURATION_MS = 5000; // 5 segundos universal

function renderBuildingsList(planet) {
  const bList = document.getElementById('op-buildings-list');
  if (!planet || !planet.buildings) return;
  if (planet.buildings.length === 0) {
    bList.innerHTML = '<div class="op-building-empty">Nenhuma construção registrada neste planeta.</div>';
    return;
  }
  bList.innerHTML = planet.buildings.map((b, idx) => {
    const bt = BUILDING_TYPES[b.type];
    if (!bt) return '';
    const lvlStars = '●'.repeat(b.level) + '○'.repeat(Math.max(0, 3 - b.level));
    const isBuilding = b.constructing && Date.now() < b.constructingEnd;
    const progress = isBuilding ? Math.min(100, ((Date.now() - b.constructingStart) / BUILD_DURATION_MS) * 100) : 100;
    const isSpaceport = b.type === 'spaceport' && !isBuilding;
    let creditBadge = '';
    if (!isBuilding) {
      if (bt.deficit) {
        creditBadge = `<div class="op-building-credit" style="color:#e06060">-${(bt.deficit * (b.level||1)).toLocaleString()} ₢</div>`;
      } else if (bt.credits) {
        creditBadge = `<div class="op-building-credit">+${(bt.credits * (b.level||1)).toLocaleString()} ₢</div>`;
      }
    }
    return `<div class="op-building ${isBuilding ? 'building-constructing' : ''}" data-idx="${idx}">
      <div class="op-building-icon" style="background:${bt.color}22;color:${bt.color}">${bt.icon}</div>
      <div class="op-building-info" style="flex:1">
        ${isBuilding ? '<div class="build-status-badge">▶ Construindo</div>' : ''}
        <div class="op-building-name">${bt.name}</div>
        <div class="op-building-desc">${bt.desc}</div>
        <div class="op-building-lvl">${lvlStars} Nível ${b.level}</div>
        ${isBuilding ? `<div class="build-progress-bar"><div class="build-progress-fill" id="bpf-${idx}" style="width:${progress}%"></div></div>` : ''}
        ${isSpaceport ? `<button class="epd-assign-btn" style="margin-top:6px;font-size:10px;padding:5px 10px" onclick="openShipBuildPopup(${idx})">+ Construir Nave</button>` : ''}
      </div>
      ${creditBadge}
    </div>`;
  }).join('');

  // Atualizar barras de progresso em loop
  planet.buildings.forEach((b, idx) => {
    if (b.constructing && Date.now() < b.constructingEnd) {
      const bar = document.getElementById(`bpf-${idx}`);
      if (!bar) return;
      const tick = () => {
        if (!b.constructing) return;
        const now = Date.now();
        if (now >= b.constructingEnd) {
          b.constructing = false;
          b.level = 1;
          // recalcular créditos e salvar
          initPlanetBuildings(planet);
          updateOrbitEconUI(planet);
          renderBuildingsList(planet);
          if (window._fb && currentUser) savePlanet(planet);
          return;
        }
        const pct = Math.min(100, ((now - b.constructingStart) / BUILD_DURATION_MS) * 100);
        if (bar) bar.style.width = pct + '%';
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
  });
}

function openBuildPopup() {
  const overlay = document.getElementById('build-popup-overlay');
  const grid = document.getElementById('build-popup-grid');
  grid.innerHTML = Object.entries(BUILDING_TYPES).map(([key, bt]) => `
    <div class="build-card" data-btype="${key}">
      <div class="build-card-top">
        <div class="build-card-icon" style="background:${bt.color}22;color:${bt.color}">${bt.icon}</div>
        <div>
          <div class="build-card-name">${bt.name}</div>
          <div class="build-card-income" style="color:${bt.deficit ? '#e06060' : '#5acc80'}">${bt.deficit ? '-' + bt.deficit.toLocaleString() + ' ₢/mês (déficit)' : bt.credits > 0 ? '+' + bt.credits.toLocaleString() + ' ₢/mês' : 'Sem renda'}</div>
        </div>
      </div>
      <div class="build-card-desc">${bt.desc}</div>
      <div class="build-card-time">⏱ Tempo: 5s &nbsp;·&nbsp; Custo: ${(BUILD_COSTS[key]||5000).toLocaleString()} ₢</div>
    </div>
  `).join('');

  grid.querySelectorAll('.build-card').forEach(card => {
    card.addEventListener('click', () => {
      const type = card.dataset.btype;
      const cost = BUILD_COSTS[type] || 5000;
      closeBuildPopup();
      if (window._fb && currentUser) {
        buyBuilding(orbitPlanet, type);
      } else {
        startBuilding(type); // fallback offline
      }
    });
  });

  overlay.classList.add('active');
}

function closeBuildPopup() {
  document.getElementById('build-popup-overlay').classList.remove('active');
}

function startBuilding(type) {
  const planet = orbitPlanet;
  if (!planet) return;
  if (!planet.buildings) planet.buildings = [];
  const now = Date.now();
  planet.buildings.push({
    type,
    level: 0,
    constructing: true,
    constructingStart: now,
    constructingEnd: now + BUILD_DURATION_MS,
  });
  // Recalcular créditos (ainda 0 enquanto constrói)
  renderBuildingsList(planet);
}

function initWarpCanvasEl() {
  if (!warpCanvas) {
    warpCanvas = document.getElementById('warp-canvas');
    warpCtx = warpCanvas.getContext('2d');
    warpCanvas.width = window.innerWidth;
    warpCanvas.height = window.innerHeight;
  }
}

function initWarpParticles(accentColor) {
  // Reutiliza a animação do loading mas com cor do planeta
  const W = warpCanvas.width, H = warpCanvas.height;
  // Derivar cores a partir da cor do planeta
  const hex = accentColor || '#4a90d9';
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  const bright = `rgba(${Math.min(255,r+60)},${Math.min(255,g+60)},${Math.min(255,b+60)},1)`;
  const mid    = `rgba(${r},${g},${b},1)`;
  const white  = '#d0e8ff';

  warpParticles = Array.from({length: 90}, () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = .18 + Math.random() * .55;
    const dist  = Math.random() * Math.min(W,H) * .1;
    return { angle, speed, dist,
             len: 5 + Math.random() * 14,
             a: Math.random() * .22 + .06,
             color: Math.random() > .55 ? bright : Math.random() > .5 ? mid : white };
  });
  warpStars = Array.from({length: 200}, () => ({
    x: Math.random()*W, y: Math.random()*H,
    r: Math.random()*1.1+.2,
    a: Math.random()*.4+.08,
    tw: Math.random()*Math.PI*2,
  }));
}

let warpStars = [];

function drawWarp(ts) {
  const W = warpCanvas.width, H = warpCanvas.height;
  const cx = W/2, cy = H/2;
  warpCtx.fillStyle = 'rgba(0,0,8,.2)';
  warpCtx.fillRect(0,0,W,H);

  // Nebulosa central
  const ng = warpCtx.createRadialGradient(cx,cy,0,cx,cy,Math.min(W,H)*.4);
  ng.addColorStop(0,'rgba(30,15,70,.05)');
  ng.addColorStop(1,'transparent');
  warpCtx.fillStyle = ng; warpCtx.fillRect(0,0,W,H);

  // Estrelas
  warpStars.forEach(s => {
    warpCtx.globalAlpha = (s.a + Math.sin(ts*.0007+s.tw)*.1) * .65;
    warpCtx.fillStyle = '#b8d4f0';
    warpCtx.beginPath(); warpCtx.arc(s.x,s.y,s.r,0,Math.PI*2); warpCtx.fill();
  });

  // Raios de warp
  warpParticles.forEach(p => {
    p.dist += p.speed * (1 + p.dist/Math.min(W,H)*.5);
    if (p.dist > Math.max(W,H)*.72) {
      p.dist = Math.random()*Math.min(W,H)*.04;
      p.angle = Math.random()*Math.PI*2;
      p.speed = .18+Math.random()*.55;
    }
    const x1 = cx + Math.cos(p.angle)*p.dist;
    const y1 = cy + Math.sin(p.angle)*p.dist;
    const x2 = cx + Math.cos(p.angle)*(p.dist+p.len*(1+p.dist/130));
    const y2 = cy + Math.sin(p.angle)*(p.dist+p.len*(1+p.dist/130));
    const alpha = p.a * Math.min(1,p.dist/70) * Math.max(0,1-p.dist/(Math.max(W,H)*.44));
    warpCtx.globalAlpha = alpha;
    warpCtx.strokeStyle = p.color;
    warpCtx.lineWidth = .5+p.dist/700;
    warpCtx.beginPath(); warpCtx.moveTo(x1,y1); warpCtx.lineTo(x2,y2); warpCtx.stroke();
  });
  warpCtx.globalAlpha = 1;
}

function enterOrbit(planet) {
  initWarpCanvasEl();
  // Resize do canvas
  warpCanvas.width  = window.innerWidth;
  warpCanvas.height = window.innerHeight;

  // Preencher textos do warp
  document.getElementById('warp-name').textContent = planet.name.toUpperCase();
  document.getElementById('warp-sub').textContent = planet.type + ' · Entrando em órbita';
  const ws = document.getElementById('warp-screen');
  ws.classList.add('active');

  // Iniciar animação com a cor do planeta
  initWarpParticles(planet.color);

  let warpT = 0;
  function animWarp(ts) {
    drawWarp(ts);
    warpT++;
    if (warpT < 280) {            // ~4.7s a 60fps
      warpAnimId = requestAnimationFrame(animWarp);
    } else {
      ws.style.transition = 'opacity 0.7s';
      ws.style.opacity = '0';
      setTimeout(() => {
        ws.classList.remove('active');
        ws.style.opacity = '';
        ws.style.transition = '';
        cancelAnimationFrame(warpAnimId);
        openOrbitScreen(planet);
      }, 720);
    }
  }
  warpAnimId = requestAnimationFrame(animWarp);
}

function openOrbitScreen(planet) {
  orbitPlanet = planet;
  orbitT = 0;
  orbitCloudAngle = 0;

  // Preencher painel de dados
  document.getElementById('orbit-planet-title').textContent = planet.name;
  const badge = document.getElementById('orbit-planet-type-badge');
  badge.textContent = planet.type;
  badge.style.color = planet.color;
  badge.style.borderColor = planet.color + '66';
  badge.style.background = planet.color + '18';

  document.getElementById('op-desc').textContent = planet.desc || 'Dados de campo pendentes.';
  document.getElementById('op-pop').textContent = planet.pop || '—';
  document.getElementById('op-sys').textContent = planet.ownerName || 'Sem dono';

  // Facções
  const fEl = document.getElementById('op-factions');
  const allFactions = [];
  if (planet.factionMain) allFactions.push({ name: planet.factionMain, main: true });
  (planet.factionSecondary || []).forEach(n => allFactions.push({ name: n, main: false }));
  if (allFactions.length) {
    fEl.innerHTML = allFactions.map(f => {
      const fc = getFactionColor(f.name) || planet.color || '#8899bb';
      return `<span class="op-faction-tag" style="background:${fc}22;color:${fc};border-color:${fc}55">
        <span style="width:6px;height:6px;border-radius:50%;background:${fc};display:inline-block;flex-shrink:0"></span>
        ${f.name}${f.main ? ' <small style=\"opacity:.5\">(principal)</small>' : ''}
      </span>`;
    }).join('');
  } else {
    fEl.textContent = 'Nenhuma facção registrada.';
  }

  // POIs
  const poi = planet.poi || [];
  document.getElementById('op-poi').innerHTML = poi.length
    ? poi.map(p => `<div class="op-poi">${p}</div>`).join('')
    : '<div style="font-size:12px;color:#3a5060">Nenhum ponto registrado.</div>';

  // Fleet e tropas (placeholder aleatório por planeta)
  if (!planet.fleet) {
    planet.fleet = [];
    planet.fleetTotal = 0;
    planet.troops = 0;
  }
  document.getElementById('op-fleet').textContent = planet.fleetTotal > 0 ? planet.fleetTotal + ' naves' : 'Nenhuma';
  document.getElementById('op-troops').textContent = planet.troops > 0 ? planet.troops.toLocaleString() : 'Nenhuma';
  // Fechar dropdown ao trocar de planeta
  const shipsList = document.getElementById('op-ships-list');
  if (shipsList) shipsList.classList.remove('open');
  const ftBtn = document.getElementById('fleet-toggle-btn');
  if (ftBtn) ftBtn.classList.remove('expanded');
  renderFleetList(planet);

  // Construções e créditos
  initPlanetBuildings(planet);
  updateOrbitEconUI(planet);

  // Owner badge na topbar de órbita
  const ownerBadge = document.getElementById('orbit-owner-badge');
  if (planet.ownerName) {
    const ownerColor = playerColorMap[planet.ownerId] || '#4a90d9';
    document.getElementById('orbit-owner-dot').style.background = ownerColor;
    document.getElementById('orbit-owner-name').textContent = planet.ownerName;
    ownerBadge.style.display = 'flex';
    ownerBadge.style.borderColor = ownerColor + '44';
  } else {
    ownerBadge.style.display = 'none';
  }

  renderBuildingsList(planet);

  // HUD coords placeholder
  const ra = (planet.x * 360).toFixed(1);
  const dec = ((planet.y - 0.5) * 180).toFixed(1);
  document.getElementById('hud-coords').textContent = `RA: ${ra}° / Dec: ${dec}°`;
  document.getElementById('hud-alt').textContent = `Alt: ${Math.round(500 + planet.radius * 50).toLocaleString()} km`;
  document.getElementById('hud-vel').textContent = `Vel orbital: ${(8 + Math.random() * 12).toFixed(1)} km/s`;

  // Gerar estrelas de fundo da cena orbital
  const oc = document.getElementById('orbit-canvas');
  orbitStars = Array.from({length: 300}, () => ({
    x: Math.random() * oc.width, y: Math.random() * oc.height,
    r: Math.random() * 1.2 + 0.2,
    a: Math.random() * 0.5 + 0.1,
    tw: Math.random() * Math.PI * 2,
  }));

  // Preparar canvas ANTES de mostrar a tela (evita flash do fundo vazio)
  orbitActive = false; // reset antes de tudo
  cancelAnimationFrame(orbitAnimId);
  cancelAnimationFrame(orbitPrimeId);
  orbitZoom = 1.0;
  document.getElementById('orbit-zoom-level').textContent = '100%';
  window._orbitOpenTime = null;
  const os = document.getElementById('orbit-screen');

  // Deixar tela invisível mas no DOM para que clientWidth/Height funcionem
  os.style.opacity = '0';
  os.style.pointerEvents = 'none';
  os.classList.add('active');

  resizeOrbitCanvas();
  cancelAnimationFrame(orbitAnimId);

  orbitActive = true;
  // Renderizar 2 frames antes de tornar visível — canvas já terá conteúdo
  let _primeFrames = 0;
  function _primeAndShow(ts) {
    if (!orbitActive) return; // cancelado enquanto primava
    drawOrbitScene(ts);
    _primeFrames++;
    if (_primeFrames < 2) {
      orbitPrimeId = requestAnimationFrame(_primeAndShow);
    } else {
      orbitPrimeId = null;
      if (!orbitActive) return;
      // Agora mostrar com transição suave
      os.style.transition = 'opacity 0.35s ease';
      os.style.opacity = '1';
      os.style.pointerEvents = '';
      setTimeout(() => { if (os.style.transition) os.style.transition = ''; }, 400);
      orbitAnimId = requestAnimationFrame(drawOrbitScene);
    }
  }
  orbitPrimeId = requestAnimationFrame(_primeAndShow);
}

function resizeOrbitCanvas() {
  const view = document.getElementById('orbit-view');
  const oc = document.getElementById('orbit-canvas');
  oc.width = view.clientWidth;
  oc.height = view.clientHeight;
  if (orbitPlanet) {
    orbitStars = Array.from({length: 300}, () => ({
      x: Math.random() * oc.width, y: Math.random() * oc.height,
      r: Math.random() * 1.2 + 0.2, a: Math.random() * 0.5 + 0.1, tw: Math.random() * Math.PI * 2,
    }));
  }
}

function drawOrbitScene(ts) {
  const oc = document.getElementById('orbit-canvas');
  const octx = oc.getContext('2d');
  const W = oc.width, H = oc.height;
  const p = orbitPlanet;
  if (!p) return;

  if (!orbitActive || !orbitPlanet) return;
  if (!window._orbitOpenTime) window._orbitOpenTime = ts;
  orbitT = ts;
  orbitCloudAngle += 0.0003;

  // fundo
  octx.clearRect(0, 0, W, H);
  const bgGrad = octx.createRadialGradient(W*0.5, H*0.5, 0, W*0.5, H*0.5, Math.max(W,H)*0.8);
  bgGrad.addColorStop(0, 'rgba(10,15,35,1)');
  bgGrad.addColorStop(1, 'rgba(2,4,12,1)');
  octx.fillStyle = bgGrad;
  octx.fillRect(0, 0, W, H);

  // estrelas
  orbitStars.forEach(s => {
    octx.globalAlpha = s.a + Math.sin(ts * 0.001 + s.tw) * 0.12;
    octx.fillStyle = '#d8e8ff';
    octx.beginPath();
    octx.arc(s.x, s.y, s.r, 0, Math.PI*2);
    octx.fill();
  });
  octx.globalAlpha = 1;

  // posição do planeta: ligeiramente deslocado do centro, com oscilação suave
  const sway = Math.sin(ts * 0.0002) * 6;
  const px = W * 0.5 + sway;
  const py = H * 0.5 + Math.cos(ts * 0.00015) * 4;

  // raio: ocupa ~35% da menor dimensão × zoom
  const baseR = Math.min(W, H) * 0.35 * orbitZoom;

  // glow externo grande
  const glowOuter = octx.createRadialGradient(px, py, baseR * 0.5, px, py, baseR * 2.2);
  glowOuter.addColorStop(0, p.glow + '30');
  glowOuter.addColorStop(0.5, p.glow + '12');
  glowOuter.addColorStop(1, 'transparent');
  octx.fillStyle = glowOuter;
  octx.beginPath(); octx.arc(px, py, baseR * 2.2, 0, Math.PI*2); octx.fill();

  // atmosfera
  const atmR = baseR * 1.12;
  const atm = octx.createRadialGradient(px, py, baseR * 0.95, px, py, atmR);
  atm.addColorStop(0, p.color + '55');
  atm.addColorStop(0.5, p.color + '22');
  atm.addColorStop(1, 'transparent');
  octx.fillStyle = atm;
  octx.beginPath(); octx.arc(px, py, atmR, 0, Math.PI*2); octx.fill();

  // corpo do planeta
  const bodyGrad = octx.createRadialGradient(px - baseR*0.28, py - baseR*0.28, baseR*0.05, px, py, baseR);
  bodyGrad.addColorStop(0, lightenColor(p.color, 55));
  bodyGrad.addColorStop(0.45, p.color);
  bodyGrad.addColorStop(1, darkenColor(p.color, 60));
  octx.fillStyle = bodyGrad;
  octx.beginPath(); octx.arc(px, py, baseR, 0, Math.PI*2); octx.fill();

  // nuvens / bandas giratórias (para planetas gasosos e habitados)
  if (p.type === 'Gigante Gasoso' || p.type === 'Habitado' || p.type === 'Oceânico') {
    octx.save();
    octx.globalAlpha = p.type === 'Gigante Gasoso' ? 0.22 : 0.12;
    octx.translate(px, py);
    octx.rotate(orbitCloudAngle);
    const bands = p.type === 'Gigante Gasoso' ? 5 : 3;
    for (let i = 0; i < bands; i++) {
      const by = -baseR + (baseR * 2 / (bands + 1)) * (i + 1);
      const bh = baseR * (0.06 + i * 0.02);
      const bw = Math.sqrt(Math.max(0, baseR*baseR - by*by));
      const bGrad = octx.createLinearGradient(-bw, by - bh, bw, by + bh);
      bGrad.addColorStop(0, 'transparent');
      bGrad.addColorStop(0.3, lightenColor(p.color, 30) + 'aa');
      bGrad.addColorStop(0.7, darkenColor(p.color, 20) + '88');
      bGrad.addColorStop(1, 'transparent');
      octx.fillStyle = bGrad;
      octx.save();
      octx.beginPath(); octx.ellipse(0, by, bw, bh, 0, 0, Math.PI*2); octx.fill();
      octx.restore();
    }
    octx.restore();
  }

  // calota glacial (planetas glaciais e rochosos)
  if (p.type === 'Glacial' || p.type === 'Rochoso') {
    octx.save();
    octx.globalAlpha = 0.35;
    const iceCap = octx.createRadialGradient(px, py - baseR*0.7, 0, px, py - baseR*0.7, baseR*0.5);
    iceCap.addColorStop(0, 'rgba(220,235,255,0.9)');
    iceCap.addColorStop(0.6, 'rgba(180,210,240,0.4)');
    iceCap.addColorStop(1, 'transparent');
    octx.fillStyle = iceCap;
    octx.beginPath(); octx.arc(px, py, baseR, 0, Math.PI*2); octx.clip();
    octx.fillRect(px - baseR, py - baseR, baseR*2, baseR*0.6);
    octx.restore();
  }

  // sombra de iluminação (rim light da estrela)
  const shadowGrad = octx.createRadialGradient(px + baseR*0.5, py + baseR*0.5, baseR*0.3, px + baseR*0.6, py + baseR*0.6, baseR*1.1);
  shadowGrad.addColorStop(0, 'rgba(0,0,0,0)');
  shadowGrad.addColorStop(0.6, 'rgba(0,0,0,0.45)');
  shadowGrad.addColorStop(1, 'rgba(0,0,0,0.8)');
  octx.fillStyle = shadowGrad;
  octx.beginPath(); octx.arc(px, py, baseR, 0, Math.PI*2); octx.fill();

  // brilho especular
  const specGrad = octx.createRadialGradient(px - baseR*0.32, py - baseR*0.32, 0, px - baseR*0.25, py - baseR*0.25, baseR*0.55);
  specGrad.addColorStop(0, 'rgba(255,255,255,0.25)');
  specGrad.addColorStop(0.5, 'rgba(255,255,255,0.06)');
  specGrad.addColorStop(1, 'transparent');
  octx.fillStyle = specGrad;
  octx.beginPath(); octx.arc(px, py, baseR, 0, Math.PI*2); octx.fill();

  // anéis para Gigante Gasoso
  if (p.type === 'Gigante Gasoso' || p.rings) {
    octx.save();
    octx.translate(px, py);
    octx.scale(1, 0.22);
    [1.55, 1.78, 2.05, 2.28].forEach((mult, i) => {
      const alpha = [0.35, 0.22, 0.28, 0.15][i];
      const lw = [6, 4, 8, 3][i];
      octx.beginPath();
      octx.arc(0, 0, baseR * mult, 0, Math.PI*2);
      octx.strokeStyle = lightenColor(p.color, 20) + Math.floor(alpha*255).toString(16).padStart(2,'0');
      octx.lineWidth = lw;
      octx.stroke();
    });
    octx.restore();
  }

  // ===== HUD LABELS com setas ao redor do planeta =====
  // Montar labels dinamicamente com distribuição circular uniforme
  initPlanetBuildings(p);
  const _hudStars = (typeof PLANET_STARS_MAP !== 'undefined' && PLANET_STARS_MAP[p.name]) || [];
  const _hudRawLabels = [
    { label: p.type || '—',        key: 'TIPO' },
    { label: p.factionMain || '—', key: 'FACÇÃO PRINCIPAL' },
    { label: p.gov || '—',         key: 'GOVERNO' },
    { label: p.pop || '—',         key: 'POPULAÇÃO' },
  ];
  if (_hudStars.length > 0) _hudRawLabels.push({ label: _hudStars[0], key: 'ESTRELA' });

  // Distribuir igualmente em arco lateral: de -130° a +130° (evitando topo/base)
  const _arcMin = -0.72 * Math.PI;   // -130°
  const _arcMax =  0.72 * Math.PI;   // +130°
  const _arcSpan = _arcMax - _arcMin;
  const _n = _hudRawLabels.length;
  const hudLabels = _hudRawLabels.map((item, i) => ({
    ...item,
    angle: _n === 1
      ? 0
      : _arcMin + (_arcSpan / (_n - 1)) * i,
  }));

  const orbitSwayX = Math.sin(ts * 0.0002) * 6;
  const orbitSwayY = Math.cos(ts * 0.00015) * 4;
  const opx = W * 0.5 + orbitSwayX;
  const opy = H * 0.5 + orbitSwayY;

  const hudFade = Math.min(1, (ts - (window._orbitOpenTime || ts)) / 1200);

  hudLabels.forEach((h, i) => {
    const lineStart = baseR * 1.18;
    const lineEnd   = baseR * 1.52;
    const labelDist = baseR * 1.62;
    const tickLen   = baseR * 0.06;

    const cos = Math.cos(h.angle);
    const sin = Math.sin(h.angle);

    const lx1 = opx + cos * lineStart;
    const ly1 = opy + sin * lineStart;
    const lx2 = opx + cos * lineEnd;
    const ly2 = opy + sin * lineEnd;

    // linha
    octx.save();
    octx.globalAlpha = 0.45 * hudFade;
    octx.strokeStyle = 'rgba(140,200,255,0.7)';
    octx.lineWidth = 0.8;
    octx.setLineDash([3, 4]);
    octx.beginPath();
    octx.moveTo(lx1, ly1);
    octx.lineTo(lx2, ly2);
    octx.stroke();
    octx.setLineDash([]);

    // tick final horizontal
    const isRight = cos > 0;
    const tickX2 = lx2 + (isRight ? tickLen : -tickLen);
    octx.globalAlpha = 0.55 * hudFade;
    octx.beginPath();
    octx.moveTo(lx2, ly2);
    octx.lineTo(tickX2, ly2);
    octx.stroke();

    // ponto de conexão
    octx.globalAlpha = 0.7 * hudFade;
    octx.fillStyle = 'rgba(140,200,255,0.8)';
    octx.beginPath();
    octx.arc(lx1, ly1, 2.5, 0, Math.PI*2);
    octx.fill();

    // textos
    const tx = tickX2 + (isRight ? 6 : -6);
    const align = isRight ? 'left' : 'right';

    octx.globalAlpha = 0.45 * hudFade;
    octx.font = `500 ${Math.max(8, 9 * Math.min(W,H)/400)}px 'Orbitron', sans-serif`;
    octx.fillStyle = 'rgba(100,160,220,0.8)';
    octx.textAlign = align;
    octx.fillText(h.key, tx, ly2 - 7);

    octx.globalAlpha = 0.9 * hudFade;
    octx.font = `600 ${Math.max(10, 11 * Math.min(W,H)/400)}px 'Rajdhani', sans-serif`;
    octx.fillStyle = '#d8eeff';
    octx.textAlign = align;
    octx.fillText(h.label, tx, ly2 + 7);

    octx.restore();
  });

  // nome do planeta no canto inferior
  octx.font = `600 12px 'Orbitron', sans-serif`;
  octx.fillStyle = 'rgba(200,220,255,0.25)';
  octx.textAlign = 'left';
  octx.fillText(p.name.toUpperCase(), 16, H - 16);

  if (orbitActive) orbitAnimId = requestAnimationFrame(drawOrbitScene);
}

function closeOrbitScreen() {
  // Parar todos os loops de animação de órbita imediatamente
  orbitActive = false;
  cancelAnimationFrame(orbitAnimId);
  cancelAnimationFrame(orbitPrimeId);
  orbitAnimId = null;
  orbitPrimeId = null;

  const os = document.getElementById('orbit-screen');
  os.classList.remove('active');
  // Limpar estilos inline que possam ter ficado do _primeAndShow
  os.style.opacity = '';
  os.style.pointerEvents = '';
  os.style.transition = '';

  orbitPlanet = null;
}

// --- Event listeners ---
document.getElementById('btn-orbit').addEventListener('click', () => {
  if (selectedPlanet) {
    document.getElementById('panel').classList.remove('open');
    enterOrbit(selectedPlanet);
  }
});

document.getElementById('orbit-back').addEventListener('click', () => {
  closeOrbitScreen();
});
document.getElementById('ship-build-close').addEventListener('click', () => {
  document.getElementById('ship-build-overlay').classList.remove('active');
});
document.getElementById('ship-build-overlay').addEventListener('click', e => {
  if (e.target === document.getElementById('ship-build-overlay'))
    document.getElementById('ship-build-overlay').classList.remove('active');
});

// Session screen
document.getElementById('session-btn-new').addEventListener('click', () => {
  const form = document.getElementById('session-new-form');
  form.classList.toggle('visible');
});
document.getElementById('session-btn-load').addEventListener('click', () => {
  loadSaveList();
});
document.getElementById('session-confirm-btn').addEventListener('click', () => {
  const name = document.getElementById('session-name-input').value.trim() || 'Sessão ' + new Date().toLocaleDateString('pt-BR');
  createNewSession(name);
});
document.getElementById('session-name-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('session-confirm-btn').click();
});

// Edit player drawer
document.getElementById('epd-close').addEventListener('click', closeEditPlayer);
document.getElementById('epd-save-btn').addEventListener('click', saveEditPlayer);
document.getElementById('epd-delete-btn').addEventListener('click', () => {
  if (editingPlayer) { closeEditPlayer(); removePlayer(editingPlayer.uid, editingPlayer.name); }
});
document.getElementById('epd-btn-add-credits').addEventListener('click', () => applyCredits(true));
document.getElementById('epd-btn-sub-credits').addEventListener('click', () => applyCredits(false));
document.getElementById('epd-assign-btn').addEventListener('click', assignPlanetToEditing);

// Admin — adicionar jogador
document.getElementById('admin-add-player-btn').addEventListener('click', () => {
  const form = document.getElementById('admin-add-player-form');
  form.style.display = form.style.display === 'none' ? 'block' : 'none';
});
document.getElementById('admin-cancel-player-btn').addEventListener('click', () => {
  document.getElementById('admin-add-player-form').style.display = 'none';
  document.getElementById('admin-player-error').textContent = '';
});
document.getElementById('admin-create-player-btn').addEventListener('click', async () => {
  const name  = document.getElementById('new-player-name').value.trim();
  const email = document.getElementById('new-player-email').value.trim();
  const pass  = document.getElementById('new-player-pass').value;
  if (!name || !email || !pass) {
    document.getElementById('admin-player-error').textContent = 'Preencha todos os campos.';
    return;
  }
  document.getElementById('admin-create-player-btn').textContent = 'Criando...';
  await createPlayer(name, email, pass);
  document.getElementById('admin-create-player-btn').textContent = 'Criar Jogador';
});

// btn-assign-planet removido — atribuição agora feita pelo painel de edição de jogador
document.getElementById('assign-popup-close').addEventListener('click', closeAssignPopup);
document.getElementById('assign-btn-confirm').addEventListener('click', confirmAssign);
document.getElementById('assign-btn-remove').addEventListener('click', removeOwner);
document.getElementById('assign-popup-overlay').addEventListener('click', e => {
  if (e.target === document.getElementById('assign-popup-overlay')) closeAssignPopup();
});

document.getElementById('fleet-toggle-btn').addEventListener('click', () => {
  const btn = document.getElementById('fleet-toggle-btn');
  const list = document.getElementById('op-ships-list');
  const isOpen = list.classList.contains('open');
  list.classList.toggle('open', !isOpen);
  btn.classList.toggle('expanded', !isOpen);
});

document.getElementById('orbit-zoom-in').addEventListener('click', () => {
  orbitZoom = Math.min(ORBIT_ZOOM_MAX, orbitZoom * 1.25);
  document.getElementById('orbit-zoom-level').textContent = Math.round(orbitZoom * 100) + '%';
});
document.getElementById('orbit-zoom-out').addEventListener('click', () => {
  orbitZoom = Math.max(ORBIT_ZOOM_MIN, orbitZoom / 1.25);
  document.getElementById('orbit-zoom-level').textContent = Math.round(orbitZoom * 100) + '%';
});

// Scroll to zoom no canvas de órbita
document.getElementById('orbit-canvas').addEventListener('wheel', e => {
  e.preventDefault();
  orbitZoom = e.deltaY < 0
    ? Math.min(ORBIT_ZOOM_MAX, orbitZoom * 1.1)
    : Math.max(ORBIT_ZOOM_MIN, orbitZoom / 1.1);
  document.getElementById('orbit-zoom-level').textContent = Math.round(orbitZoom * 100) + '%';
}, { passive: false });

document.getElementById('btn-add-building').addEventListener('click', openBuildPopup);
document.getElementById('build-popup-close').addEventListener('click', closeBuildPopup);
document.getElementById('build-popup-overlay').addEventListener('click', e => {
  if (e.target === document.getElementById('build-popup-overlay')) closeBuildPopup();
});

window.addEventListener('resize', () => {
  resizeOrbitCanvas();
  if (warpCanvas) { warpCanvas.width = window.innerWidth; warpCanvas.height = window.innerHeight; }
});
