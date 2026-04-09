/* ===================================================
   FIREBASE INTEGRATION
   =================================================== */
let currentUser   = null;
let currentPlayer = null;   // { uid, email, name, role, color, credits }
let gameState     = { paused: false, speed: 1 };
let fbReady       = false;
const MASTER_EMAIL = 'mestre@omniscriptum.rpg'; // troque para seu e-mail de admin

// Créditos por tick (1 mês) por nível de construção
const CREDITS_PER_TICK = {
  refinery:  [0, 2400, 5200, 9000, 14000, 20000],
  spaceport: [0, 0, 0, 0, 0, 0], // Espaçoporto não gera renda — gera déficit
  generator: [0, 1800, 3900, 6750, 10500, 15000],
  barracks:  [0, 1200, 2600, 4500,  7000, 10000],
  farm:      [0, 1050, 2275, 3937,  6125,  8750],
  research:  [0, 3000, 6500, 11250, 17500, 25000],
  shipyard:  [0, 4500, 9750, 16875, 26250, 37500],
  colony:    [0, 1500, 3250,  5625,  8750, 12500],
};

// Custos de construção por tipo (nível 1)
const BUILD_COSTS = {
  refinery:  5000, spaceport: 8000, generator: 3500, barracks: 2500,
  farm: 2000, research: 6000, shipyard: 10000, colony: 3000,
};

// Custo de upgrade = custo_base × nível_atual × 1.8
function upgradeCost(type, currentLevel) {
  return Math.round((BUILD_COSTS[type] || 5000) * currentLevel * 1.8);
}

function isMaster() { return currentUser && currentUser.email === MASTER_EMAIL; }

/* ── Mostrar/esconder indicador de salvamento ── */
function showSaved() {
  const el = document.getElementById('save-indicator');
  el.classList.add('visible');
  setTimeout(() => el.classList.remove('visible'), 2000);
}

/* ── Carregar estado do jogo ── */
async function loadGameState() {
  const { db, doc, getDoc, onSnapshot } = window._fb;
  const gsRef = doc(db, 'game_state', 'main');
  onSnapshot(gsRef, snap => {
    if (snap.exists()) {
      gameState = snap.data();
      const btn = document.getElementById('admin-pause-btn');
      if (btn) btn.textContent = gameState.paused ? '▶ Retomar Tempo' : '⏸ Pausar Tempo';
    }
  });
}

/* ── Carregar dados do jogador atual ── */
async function loadCurrentPlayer(uid) {
  const { db, doc, getDoc, setDoc } = window._fb;
  const pRef = doc(db, 'players', uid);
  const snap = await getDoc(pRef);
  if (snap.exists()) {
    currentPlayer = snap.data();
  } else {
    currentPlayer = {
      uid, email: currentUser.email,
      name: currentUser.email.split('@')[0],
      role: isMaster() ? 'master' : 'player',
      color: '#4a90d9', credits: 0,
    };
    await setDoc(pRef, currentPlayer);
  }
  updateUserBadge();
  // Escutar mudanças no próprio jogador em tempo real (créditos, etc.)
  const { onSnapshot } = window._fb;
  onSnapshot(pRef, snap2 => {
    if (snap2.exists()) {
      const updated = snap2.data();
      if (currentPlayer) currentPlayer.credits = updated.credits || 0;
      // Atualizar UI de órbita se aberta
      const pBalEl = document.getElementById('op-player-balance');
      if (pBalEl) pBalEl.textContent = (currentPlayer.credits || 0).toLocaleString() + ' ₢';
      const sbCred = document.getElementById('sb-player-credits-value');
      if (sbCred) sbCred.textContent = (currentPlayer.credits || 0).toLocaleString() + ' ₢';
      updateStatusBar();
    }
  });
}

/* ── Presença online via Realtime Database ── */
let onlinePlayers = new Set(); // UIDs online

function initPresence(uid) {
  const { rtdb, ref, set, onDisconnect, rtdbTimestamp, onValue } = window._fb;
  const presRef = ref(rtdb, `presence/${uid}`);

  // Marcar como online
  set(presRef, { online: true, uid, lastSeen: Date.now() });

  // Quando desconectar, marcar como offline automaticamente
  onDisconnect(presRef).set({ online: false, uid, lastSeen: Date.now() });

  // Escutar todos os presentes
  const allPresRef = ref(rtdb, 'presence');
  onValue(allPresRef, snap => {
    onlinePlayers.clear();
    snap.forEach(child => {
      const d = child.val();
      if (d && d.online) onlinePlayers.add(d.uid);
    });
    // Re-renderizar lista de jogadores se o admin estiver aberto
    const panel = document.getElementById('admin-panel');
    if (panel && panel.classList.contains('open')) loadAdminStats();
  });
}

/* ── Atualizar badge no topbar ── */
function updateUserBadge() {
  if (!currentPlayer) return;
  document.getElementById('ub-name').textContent = currentPlayer.name || currentPlayer.email;
  document.getElementById('ub-role').textContent = isMaster() ? 'mestre' : 'jogador';
  document.getElementById('user-badge').style.display = 'flex';
  document.getElementById('btn-logout').style.display = '';
  if (isMaster()) document.getElementById('btn-admin').style.display = '';
}

/* ── Sincronizar planetas locais → Firestore (só mestre) ── */
async function syncPlanetsToFirestore() {
  if (!isMaster()) return;
  const { db, doc, setDoc } = window._fb;
  let count = 0;
  for (const p of PLANETS) {
    const pData = {
      id: p.id, name: p.name, type: p.type,
      color: p.color, glow: p.glow, radius: p.radius,
      x: p.x, y: p.y,
      desc: p.desc || '', pop: p.pop || '',
      system: p.system || '', climate: p.climate || '',
      gov: p.gov || '', factionMain: p.factionMain || '',
      factionSecondary: p.factionSecondary || [],
      poi: p.poi || [],
      ownerId: p.ownerId || null,
      ownerName: p.ownerName || null,
      credits: p.credits || 0,
      buildings: p.buildings || [],
      fleet: p.fleet || [],
      fleetTotal: p.fleetTotal || 0,
      troops: p.troops || 0,
      lastTick: p.lastTick || Date.now(),
    };
    await setDoc(doc(db, 'planets', String(p.id)), pData);
    count++;
  }
  showSaved();
  alert(`${count} planetas sincronizados com o servidor!`);
}

/* ── Carregar planetas do Firestore → local ── */
async function loadPlanetsFromFirestore() {
  try {
  const { db, collection, getDocs, onSnapshot } = window._fb;
  const snap = await getDocs(collection(db, 'planets'));
  if (snap.empty) {
    console.log('Nenhum planeta no Firestore — usando dados locais');
    return;
  }
  snap.forEach(docSnap => {
    const data = docSnap.data();
    const local = PLANETS.find(p => String(p.id) === docSnap.id);
    if (local) Object.assign(local, data);
  });
  // Escutar mudanças em tempo real
  onSnapshot(collection(db, 'planets'), querySnap => {
    querySnap.docChanges().forEach(change => {
      if (change.type === 'modified') {
        const data = change.doc.data();
        const local = PLANETS.find(p => String(p.id) === change.doc.id);
        if (local) {
          Object.assign(local, data);
          if (selectedPlanet && selectedPlanet.id === local.id) showPanel(local);
        }
      }
    });
  });
  } catch(e) {
    console.warn('loadPlanetsFromFirestore error:', e.message);
  }
}

/* ── Salvar planeta individual no Firestore ── */
async function savePlanet(planet) {
  if (!currentUser) return;
  const { db, doc, updateDoc } = window._fb;
  const fields = {
    buildings: planet.buildings || [],
    credits: planet.credits || 0,
    fleet: planet.fleet || [],
    fleetTotal: planet.fleetTotal || 0,
    troops: planet.troops || 0,
    ownerId: planet.ownerId || null,
    ownerName: planet.ownerName || null,
    factionMain: planet.factionMain || '',
    factionSecondary: planet.factionSecondary || [],
    desc: planet.desc || '',
    pop: planet.pop || '',
    gov: planet.gov || '',
    climate: planet.climate || '',
  };
  try {
    await updateDoc(doc(db, 'planets', String(planet.id)), fields);
    showSaved();
  } catch(e) {
    console.warn('savePlanet error:', e.message);
  }
}

/* ── Tick econômico: avançar 1 mês para todos os planetas ── */
async function advanceTick() {
  if (!isMaster()) return;
  const { db, doc, updateDoc } = window._fb;
  let totalNew = 0;
  const playerCredits = {};

  for (const p of PLANETS) {
    if (!p.buildings || p.buildings.length === 0) continue;
    let earned = 0;
    p.buildings.forEach(b => {
      if (b.constructing) return; // não conta enquanto constrói
      const tbl = CREDITS_PER_TICK[b.type];
      earned += tbl ? (tbl[Math.min(b.level, 5)] || 0) : 0;
    });
    p.credits = (p.credits || 0) + earned;
    totalNew += earned;
    p.lastTick = Date.now();

    // Acumular para o dono do planeta
    if (p.ownerId) {
      playerCredits[p.ownerId] = (playerCredits[p.ownerId] || 0) + earned;
    }

    await updateDoc(doc(db, 'planets', String(p.id)), {
      credits: p.credits, lastTick: p.lastTick,
    });
  }

  // Distribuir créditos aos jogadores
  for (const [uid, earned] of Object.entries(playerCredits)) {
    const pRef = doc(db, 'players', uid);
    const snap = await window._fb.getDoc(pRef);
    if (snap.exists()) {
      const cur = snap.data().credits || 0;
      await updateDoc(pRef, { credits: cur + earned });
    }
  }

  // Avançar data para próximo mês
  timeState.day = 1;
  timeState.month++;
  if (timeState.month >= 12) { timeState.month = 0; timeState.year++; }
  await saveTimeState();
  updateDateUI();

  // Atualizar UI de órbita se estiver aberta
  if (orbitPlanet) {
    document.getElementById('op-balance').textContent = (orbitPlanet.credits || 0).toLocaleString() + ' ₢';
  }
  updateStatusBar();
  showSaved();
  loadAdminStats();
  alert(`Mês avançado! +${totalNew.toLocaleString()} ₢ distribuídos.`);
}

/* ── Comprar construção usando créditos do planet ── */
async function buyBuilding(planet, type) {
  const cost = BUILD_COSTS[type] || 5000;
  const ownsIt = isMaster() || (currentPlayer && planet.ownerId === currentPlayer.uid);
  if (!ownsIt) { alert('Você não controla este planeta.'); return; }
  // Créditos do JOGADOR (não do planeta)
  const playerCreds = currentPlayer ? (currentPlayer.credits || 0) : 0;
  if (!isMaster() && playerCreds < cost) {
    alert(`Créditos insuficientes!\nNecessário: ${cost.toLocaleString()} ₢\nSeus créditos: ${playerCreds.toLocaleString()} ₢`);
    return;
  }
  // Debitar do jogador
  if (!isMaster() && currentPlayer) {
    currentPlayer.credits -= cost;
    const { db, doc, updateDoc } = window._fb;
    await updateDoc(doc(db, 'players', currentPlayer.uid), { credits: currentPlayer.credits });
  }
  const now = Date.now();
  planet.buildings = planet.buildings || [];
  planet.buildings.push({
    type, level: 0,
    constructing: true,
    constructingStart: now,
    constructingEnd: now + BUILD_DURATION_MS,
  });
  await savePlanet(planet);
  renderBuildingsList(planet);
  updateOrbitEconUI(planet);
}

/* ── Upgrade de construção ── */
async function upgradeBuilding(planet, idx) {
  const b = planet.buildings[idx];
  if (!b || b.constructing) return;
  const ownsIt = isMaster() || (currentPlayer && planet.ownerId === currentPlayer.uid);
  if (!ownsIt) { alert('Você não controla este planeta.'); return; }
  if (b.level >= 5) { alert('Nível máximo atingido!'); return; }
  const cost = upgradeCost(b.type, b.level);
  const playerCreds2 = currentPlayer ? (currentPlayer.credits || 0) : 0;
  if (!isMaster() && playerCreds2 < cost) {
    alert(`Créditos insuficientes!\nNecessário: ${cost.toLocaleString()} ₢\nSeus créditos: ${playerCreds2.toLocaleString()} ₢`);
    return;
  }
  if (!isMaster() && currentPlayer) {
    currentPlayer.credits -= cost;
    const { db, doc, updateDoc } = window._fb;
    await updateDoc(doc(db, 'players', currentPlayer.uid), { credits: currentPlayer.credits });
  }
  b.level++;
  await savePlanet(planet);
  renderBuildingsList(planet);
  updateOrbitEconUI(planet);
}

/* ── Estatísticas do admin ── */
async function loadAdminStats() {
  if (!isMaster()) return;
  const { db, collection, getDocs } = window._fb;
  const snap = await getDocs(collection(db, 'players'));
  let total = 0; const rows = [];
  // Remontar allPlayers para manter sincronizado
  allPlayers = [];
  let colorIdx = 0;
  snap.forEach(d => {
    const pl = d.data();
    if (pl.email === MASTER_EMAIL) return;
    if (!playerColorMap[pl.uid]) {
      playerColorMap[pl.uid] = pl.color || PLAYER_COLORS[colorIdx % PLAYER_COLORS.length];
      colorIdx++;
    }
    allPlayers.push({ ...pl, color: playerColorMap[pl.uid] });
    const planetCount = PLANETS.filter(p => p.ownerId === pl.uid).length;
    total += pl.credits || 0;
    rows.push({ uid: pl.uid, email: pl.email, name: pl.name || pl.email.split('@')[0], credits: pl.credits || 0, planets: planetCount, color: playerColorMap[pl.uid] || '#888', online: onlinePlayers.has(pl.uid) });
  });
  document.getElementById('admin-total-credits').textContent = total.toLocaleString() + ' ₢';
  document.getElementById('admin-player-count').textContent = rows.length;
  document.getElementById('admin-players-list').innerHTML = rows.length
    ? rows.map(r =>
      `<div class="admin-player-row" style="flex-direction:column;align-items:flex-start;gap:4px;padding:8px 0">
        <div style="display:flex;align-items:center;gap:8px;width:100%">
          <div style="position:relative;width:10px;height:10px;flex-shrink:0">
            <div style="width:10px;height:10px;border-radius:50%;background:${r.color}"></div>
            <div style="position:absolute;bottom:-1px;right:-1px;width:6px;height:6px;border-radius:50%;background:${r.online ? '#3de87a' : '#334455'};border:1.5px solid rgba(6,10,24,.99)"></div>
          </div>
          <span class="admin-player-name" style="flex:1">${r.name}</span>
          <span class="admin-player-planets">${r.planets} planetas</span>
          <span class="admin-player-credits">${r.credits.toLocaleString()} ₢</span>
          <button class="admin-edit-btn" onclick="openEditPlayer('${r.uid}')" title="Editar jogador">✎</button>
        </div>
        <div class="admin-player-email" style="padding-left:16px">${r.email}</div>
      </div>`).join('')
    : '<div style="font-size:12px;color:#3a5060;padding:.5rem 0">Nenhum jogador ainda.</div>';
  updateOwnerLegend();
  updateStatusBar();
}

/* ── Loading inicial (antes do login) ── */
async function runInitialLoading() {
  // Mostrar session-screen como loading
  const ss = document.getElementById('session-screen');
  ss.style.display = 'flex';
  ss.classList.remove('hidden');
  document.getElementById('session-cards').classList.remove('visible');
  setLoadingProgress(0);
  runSessionCanvas();

  // Tasks de inicialização (sem Firebase ainda)
  const tasks = [
    () => new Promise(r => setTimeout(r, 600)),
    () => new Promise(r => setTimeout(r, 500)),
    () => new Promise(r => setTimeout(r, 700)),
    () => new Promise(r => setTimeout(r, 500)),
    () => new Promise(r => setTimeout(r, 600)),
    () => new Promise(r => setTimeout(r, 400)),
    () => new Promise(r => setTimeout(r, 500)),
    () => new Promise(r => setTimeout(r, 600)),
    () => new Promise(r => setTimeout(r, 400)),
  ];
  await runLoadingSequence(tasks);

  // Esconder loading, mostrar login
  ss.classList.add('hidden');
  setTimeout(() => {
    ss.style.display = 'none';
    document.getElementById('session-cards').classList.remove('visible');
  }, 600);
  const ls = document.getElementById('login-screen');
  ls.style.display = 'flex';
  ls.classList.remove('hidden');
}

/* ── Auth flow ── */
function initAuth() {
  const { auth, onAuthStateChanged, signInWithEmailAndPassword, signOut } = window._fb;

  onAuthStateChanged(auth, async user => {
    if (user) {
      currentUser = user;
      await loadCurrentPlayer(user.uid);
      await loadGameState();
      await loadPlanetsFromFirestore().catch(()=>{});
      await loadTimeState().catch(()=>{});
      initPresence(user.uid);
      updateUserBadge();
      updateStatusBar();
      fbReady = true;
      // Esconder login
      const ls = document.getElementById('login-screen');
      ls.classList.add('hidden');
      setTimeout(() => ls.style.display = 'none', 500);
      // Ir para tela de sessão
      openSessionScreen();
    } else {
      currentUser = null; currentPlayer = null; fbReady = false;
      document.getElementById('login-screen').style.display = 'flex';
      document.getElementById('login-screen').classList.remove('hidden');
      document.getElementById('user-badge').style.display = 'none';
      document.getElementById('btn-logout').style.display = 'none';
      document.getElementById('btn-admin').style.display = 'none';
    }
  });

  document.getElementById('login-btn').addEventListener('click', async () => {
    const email = document.getElementById('login-email').value.trim();
    const pass  = document.getElementById('login-password').value;
    const errEl = document.getElementById('login-error');
    errEl.textContent = '';
    if (!email || !pass) { errEl.textContent = 'Preencha e-mail e senha.'; return; }
    try {
      document.getElementById('login-btn').textContent = 'Entrando...';
      await signInWithEmailAndPassword(auth, email, pass);
    } catch(e) {
      document.getElementById('login-btn').textContent = 'Entrar no Sistema';
      errEl.textContent = 'E-mail ou senha incorretos.';
    }
  });

  document.getElementById('login-password').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('login-btn').click();
  });

  document.getElementById('btn-logout').addEventListener('click', () => signOut(auth));

  // Admin panel toggle
  document.getElementById('btn-admin').addEventListener('click', () => {
    const panel = document.getElementById('admin-panel');
    const isOpen = panel.classList.toggle('open');
    if (isOpen) loadAdminStats();
  });
  document.getElementById('admin-close-btn').addEventListener('click', () => {
    document.getElementById('admin-panel').classList.remove('open');
  });
  document.getElementById('admin-tick-btn').addEventListener('click', advanceTick);
  document.getElementById('admin-pause-btn').addEventListener('click', () => {
    togglePause();
  });
  document.getElementById('admin-save-session-btn').addEventListener('click', () => {
    if (!currentSessionId) { alert('Nenhuma sessão ativa. Use "Trocar Sessão" para criar ou carregar uma.'); return; }
    saveCurrentSession();
  });
  document.getElementById('admin-sessions-btn').addEventListener('click', () => {
    document.getElementById('admin-panel').classList.remove('open');
    openSessionScreen();
  });
  document.getElementById('admin-sync-btn').addEventListener('click', () => {
    if (confirm('Sincronizar todos os planetas locais para o servidor? Isso sobrescreve os dados existentes.')) {
      syncPlanetsToFirestore();
    }
  });
}

/* ── Aguardar Firebase SDK modular carregar ── */
function waitForFB(cb, tries = 0) {
  if (window._fb) { cb(); return; }
  if (tries > 30) { console.error('Firebase não carregou'); return; }
  setTimeout(() => waitForFB(cb, tries + 1), 200);
}
