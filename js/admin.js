/* ==========================================================
   MOTOR DE TEMPO — 1s real = 1 dia in-game, 30 dias = 1 mês
   ========================================================== */

const MONTHS_PT = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                   'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const DAYS_PER_MONTH = 30;
const MS_PER_DAY = 1000; // 1 segundo real = 1 dia

// Estado do tempo — salvo no Firestore em game_state
let timeState = {
  year: 3036, month: 0, day: 1,  // Janeiro, dia 1
  paused: false,
  lastRealTime: Date.now(),       // timestamp real de quando o tempo foi retomado
};
let timeInterval = null;

function formatGameDate() {
  return {
    year: `ANO ${timeState.year}`,
    day: `${timeState.day} de ${MONTHS_PT[timeState.month]}`,
  };
}

function updateDateUI() {
  const { year, day } = formatGameDate();

  // Statusbar
  const sbYear = document.getElementById('sb-date-text');
  const sbDay  = document.getElementById('sb-month-day');
  if (sbYear) sbYear.textContent = year;
  if (sbDay)  sbDay.textContent  = `${timeState.day} de ${MONTHS_PT[timeState.month]}`;

  const pct = ((timeState.day - 1) / DAYS_PER_MONTH) * 100;
  const sbFill = document.getElementById('sb-progress-fill');
  if (sbFill) {
    sbFill.style.width = pct + '%';
    sbFill.classList.toggle('paused', timeState.paused);
  }

  // Barra de progresso no admin
  const fill = document.getElementById('admin-progress-fill');
  const val  = document.getElementById('admin-time-value');
  const lbl  = document.getElementById('admin-time-label');
  if (fill) {
    fill.style.width = pct + '%';
    fill.classList.toggle('paused', timeState.paused);
  }
  if (val) val.textContent = `Dia ${timeState.day} / ${DAYS_PER_MONTH}`;
  if (lbl) {
    lbl.textContent = timeState.paused ? '⏸ Tempo pausado' : 'Progresso do mês';
    lbl.classList.toggle('admin-time-paused', timeState.paused);
  }
}

function updateStatusBar() {
  // Créditos do jogador atual
  const credVal = document.getElementById('sb-player-credits-value');
  if (credVal && currentPlayer) credVal.textContent = (currentPlayer.credits || 0).toLocaleString() + ' ₢';

  if (isMaster()) {
    // Mestre: lista de jogadores com créditos e status online
    document.getElementById('sb-players-block').style.display = 'flex';
    document.getElementById('sb-planets-block').style.display = 'none';
    const block = document.getElementById('sb-players-block');
    block.innerHTML = allPlayers.map(pl => {
      const online = onlinePlayers.has(pl.uid);
      return `<div class="sb-player-chip">
        <div class="sb-player-chip-dot" style="background:${pl.color || '#4a90d9'}"></div>
        <div class="sb-online-dot" style="background:${online ? '#3de87a' : '#334455'}"></div>
        <span class="sb-player-chip-name">${pl.name || pl.email.split('@')[0]}</span>
        <span class="sb-player-chip-credits">${(pl.credits||0).toLocaleString()} ₢</span>
      </div>`;
    }).join('');
  } else if (currentPlayer) {
    // Jogador: planetas que controla e quanto cada um produz
    document.getElementById('sb-players-block').style.display = 'none';
    document.getElementById('sb-planets-block').style.display = 'flex';
    const block = document.getElementById('sb-planets-block');
    const myPlanets = PLANETS.filter(p => p.ownerId === currentPlayer.uid);
    if (myPlanets.length === 0) {
      block.innerHTML = '<span style="font-size:10px;color:#2a4060;padding:0 12px;font-family:Rajdhani,sans-serif">Nenhum planeta sob controle</span>';
    } else {
      block.innerHTML = myPlanets.map(p => {
        const income = calcMonthlyCredits(p);
        return `<div class="sb-planet-chip">
          <div class="sb-planet-dot" style="background:${p.color}"></div>
          <span class="sb-planet-name">${p.name}</span>
          <span class="sb-planet-income">+${income.toLocaleString()} ₢</span>
        </div>`;
      }).join('');
    }
  }
}

function tickOneDay() {
  if (timeState.paused) return;
  timeState.day++;
  if (timeState.day > DAYS_PER_MONTH) {
    // Novo mês — disparar economia
    timeState.day = 1;
    timeState.month++;
    if (timeState.month >= 12) { timeState.month = 0; timeState.year++; }
    runMonthlyEconomy();
  }
  timeState.lastRealTime = Date.now();
  updateDateUI();
  saveTimeState();
}

async function runMonthlyEconomy() {
  // Igual ao advanceTick mas automático, sem alert
  if (!window._fb || !isMaster()) return;
  const { db, doc, updateDoc, getDoc } = window._fb;
  const playerCredits = {};
  for (const p of PLANETS) {
    if (!p.buildings || p.buildings.length === 0) continue;
    let earned = 0;
    p.buildings.forEach(b => {
      if (b.constructing) return;
      const bt = BUILDING_TYPES[b.type];
      const tbl = CREDITS_PER_TICK[b.type];
      earned += tbl ? (tbl[Math.min(b.level || 1, 5)] || 0) : 0;
      if (bt && bt.deficit) earned -= bt.deficit * (b.level || 1);
    });
    earned -= calcFleetMaintain(p);
    if (earned === 0) continue;
    p.credits = (p.credits || 0) + earned;
    p.lastTick = Date.now();
    if (p.ownerId) playerCredits[p.ownerId] = (playerCredits[p.ownerId] || 0) + earned;
    await updateDoc(doc(db, 'planets', String(p.id)), { credits: p.credits, lastTick: p.lastTick });
  }
  for (const [uid, earned] of Object.entries(playerCredits)) {
    const pRef = doc(db, 'players', uid);
    const snap = await getDoc(pRef);
    if (snap.exists()) {
      await updateDoc(pRef, { credits: (snap.data().credits || 0) + earned });
    }
  }
  if (orbitPlanet) {
    document.getElementById('op-balance').textContent = (orbitPlanet.credits || 0).toLocaleString() + ' ₢';
  }
  loadAdminStats();
}

async function saveTimeState() {
  if (!window._fb || !isMaster()) return;
  const { db, doc, setDoc } = window._fb;
  try {
    await setDoc(doc(db, 'game_state', 'time'), {
      year: timeState.year, month: timeState.month,
      day: timeState.day, paused: timeState.paused,
      lastRealTime: Date.now(),
    });
  } catch(e) {}
}

async function loadTimeState() {
  if (!window._fb) return;
  const { db, doc, getDoc, onSnapshot } = window._fb;

  // Escutar mudanças em tempo real (para jogadores verem a data atualizar)
  onSnapshot(doc(db, 'game_state', 'time'), snap => {
    if (!snap.exists()) {
      // Primeira vez — inicializar
      if (isMaster()) saveTimeState();
      return;
    }
    const d = snap.data();
    timeState.year   = d.year   || 3036;
    timeState.month  = d.month  || 0;
    timeState.day    = d.day    || 1;
    timeState.paused = d.paused || false;
    timeState.lastRealTime = d.lastRealTime || Date.now();
    updateDateUI();

    // Só o mestre roda o motor de tempo
    if (isMaster()) startTimerIfNeeded();
  });
}

function startTimerIfNeeded() {
  if (timeInterval) clearInterval(timeInterval);
  if (!timeState.paused) {
    timeInterval = setInterval(tickOneDay, MS_PER_DAY);
  }
}

function togglePause() {
  timeState.paused = !timeState.paused;
  const btn = document.getElementById('admin-pause-btn');
  if (btn) btn.textContent = timeState.paused ? '▶ Retomar Tempo' : '⏸ Pausar Tempo';
  if (isMaster()) {
    startTimerIfNeeded();
    saveTimeState();
  }
  updateDateUI();
}


/* ==========================================================
   EDIT PLAYER SYSTEM
   ========================================================== */
let editingPlayer = null;

function openEditPlayer(uid) {
  const pl = allPlayers.find(p => p.uid === uid);
  if (!pl) return;
  editingPlayer = { ...pl };

  // Preencher header
  const initials = (pl.name || pl.email).slice(0, 2).toUpperCase();
  const av = document.getElementById('epd-avatar');
  av.textContent = initials;
  av.style.background = pl.color || '#4a70d0';

  document.getElementById('epd-title').textContent = pl.name || pl.email.split('@')[0];
  document.getElementById('epd-name').value = pl.name || '';
  document.getElementById('epd-email').value = pl.email || '';
  document.getElementById('epd-credits-display').textContent = (pl.credits || 0).toLocaleString() + ' ₢';
  document.getElementById('epd-credit-amount').value = '';

  // Planetas controlados
  renderEpdPlanets(uid);

  // Select de planetas disponíveis (sem dono ou com outro dono)
  const sel = document.getElementById('epd-assign-select');
  sel.innerHTML = '<option value="">— Selecionar planeta —</option>' +
    PLANETS.filter(p => !p.ownerId || p.ownerId !== uid)
      .map(p => `<option value="${p.id}">${p.name} ${p.ownerId ? '(trocar de dono)' : ''}</option>`)
      .join('');

  document.getElementById('edit-player-drawer').classList.add('open');
}

function renderEpdPlanets(uid) {
  const owned = PLANETS.filter(p => p.ownerId === uid);
  const list = document.getElementById('epd-planets-list');
  if (owned.length === 0) {
    list.innerHTML = '<div style="font-size:11px;color:#2a4060;padding:4px 0">Nenhum planeta atribuído.</div>';
    return;
  }
  list.innerHTML = owned.map(p => `
    <div class="epd-planet-row">
      <div class="epd-planet-dot" style="background:${p.color}"></div>
      <span class="epd-planet-name">${p.name}</span>
      <span class="epd-planet-type">${p.type}</span>
      <button class="epd-planet-unassign" onclick="unassignPlanet(${p.id})" title="Remover planeta">✕</button>
    </div>`).join('');
}

async function unassignPlanet(planetId) {
  const p = PLANETS.find(pl => pl.id === planetId);
  if (!p) return;
  const { db, doc, updateDoc } = window._fb;
  p.ownerId = null; p.ownerName = null;
  await updateDoc(doc(db, 'planets', String(p.id)), { ownerId: null, ownerName: null });
  renderEpdPlanets(editingPlayer.uid);
  updateOwnerLegend();
  showSaved();
}

async function assignPlanetToEditing() {
  const sel = document.getElementById('epd-assign-select');
  const planetId = parseInt(sel.value);
  if (!planetId || !editingPlayer) return;
  const p = PLANETS.find(pl => pl.id === planetId);
  if (!p) return;
  const { db, doc, updateDoc } = window._fb;
  p.ownerId = editingPlayer.uid;
  p.ownerName = editingPlayer.name || editingPlayer.email.split('@')[0];
  await updateDoc(doc(db, 'planets', String(p.id)), { ownerId: p.ownerId, ownerName: p.ownerName });
  sel.value = '';
  renderEpdPlanets(editingPlayer.uid);
  updateOwnerLegend();
  showSaved();
}

async function applyCredits(add) {
  const amount = parseInt(document.getElementById('epd-credit-amount').value) || 0;
  if (amount <= 0) return;
  const { db, doc, updateDoc } = window._fb;
  const delta = add ? amount : -amount;
  editingPlayer.credits = Math.max(0, (editingPlayer.credits || 0) + delta);
  await updateDoc(doc(db, 'players', editingPlayer.uid), { credits: editingPlayer.credits });
  // Atualizar em allPlayers
  const idx = allPlayers.findIndex(p => p.uid === editingPlayer.uid);
  if (idx >= 0) allPlayers[idx].credits = editingPlayer.credits;
  document.getElementById('epd-credits-display').textContent = editingPlayer.credits.toLocaleString() + ' ₢';
  document.getElementById('epd-credit-amount').value = '';
  showSaved();
}

async function saveEditPlayer() {
  if (!editingPlayer) return;
  const newName = document.getElementById('epd-name').value.trim();
  if (!newName) { alert('Nome não pode ser vazio.'); return; }
  const { db, doc, updateDoc } = window._fb;
  editingPlayer.name = newName;
  await updateDoc(doc(db, 'players', editingPlayer.uid), { name: newName });
  // Atualizar ownerName nos planetas desse jogador
  for (const p of PLANETS.filter(pl => pl.ownerId === editingPlayer.uid)) {
    p.ownerName = newName;
    await updateDoc(doc(db, 'planets', String(p.id)), { ownerName: newName });
  }
  const idx = allPlayers.findIndex(p => p.uid === editingPlayer.uid);
  if (idx >= 0) allPlayers[idx].name = newName;
  closeEditPlayer();
  loadAdminStats();
  showSaved();
}

function closeEditPlayer() {
  document.getElementById('edit-player-drawer').classList.remove('open');
  editingPlayer = null;
}
