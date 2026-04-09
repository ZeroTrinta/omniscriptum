/* ==========================================================
   SESSION SYSTEM
   ========================================================== */

let currentSessionId = null;

/* ── Loading screen com animação de warp e partículas ── */
let sessionAnimActive = false;

function runSessionCanvas() {
  const canvas = document.getElementById('session-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W = canvas.width  = window.innerWidth;
  let H = canvas.height = window.innerHeight;
  window.addEventListener('resize', () => {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    stars = genStars();
  });

  function genStars() {
    return Array.from({length: 250}, () => ({
      x: Math.random()*W, y: Math.random()*H,
      r: Math.random()*1.1+.2,
      a: Math.random()*.45+.08,
      tw: Math.random()*Math.PI*2,
    }));
  }
  let stars = genStars();

  // Partículas de warp — raios lentos e suaves
  const particles = Array.from({length: 70}, () => {
    const angle = Math.random()*Math.PI*2;
    const speed = .12 + Math.random()*.35;   // muito mais lentas
    const dist  = Math.random()*Math.min(W,H)*.1;
    return { angle, speed, dist, len: 4+Math.random()*10,
             a: (Math.random()*.18+.06),      // opacidade baixa
             color: Math.random()>.6 ? '#6a40c0' : Math.random()>.5 ? '#3a70b9' : '#90b8e8' };
  });

  let t = 0;
  function draw(ts) {
    if (!sessionAnimActive) return;

    // Fundo escuro com trail leve
    ctx.fillStyle = 'rgba(0,0,8,.22)';
    ctx.fillRect(0,0,W,H);

    const cx = W/2, cy = H/2;

    // Nebulosa central muito sutil
    const ng = ctx.createRadialGradient(cx,cy,0,cx,cy,Math.min(W,H)*.4);
    ng.addColorStop(0,'rgba(40,20,90,.04)');
    ng.addColorStop(1,'transparent');
    ctx.fillStyle = ng; ctx.fillRect(0,0,W,H);

    // Estrelas com twinkle suave
    stars.forEach(s => {
      ctx.globalAlpha = (s.a + Math.sin(ts*.0006+s.tw)*.08) * .7;
      ctx.fillStyle = '#c0d4f0';
      ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2); ctx.fill();
    });

    // Raios de warp lentos e transparentes
    particles.forEach(p => {
      p.dist += p.speed * (1 + p.dist/Math.min(W,H)*.4);
      if (p.dist > Math.max(W,H)*.7) {
        p.dist = Math.random()*Math.min(W,H)*.04;
        p.angle = Math.random()*Math.PI*2;
        p.speed = .12+Math.random()*.35;
      }
      const x1 = cx + Math.cos(p.angle)*p.dist;
      const y1 = cy + Math.sin(p.angle)*p.dist;
      const x2 = cx + Math.cos(p.angle)*(p.dist+p.len*(1+p.dist/120));
      const y2 = cy + Math.sin(p.angle)*(p.dist+p.len*(1+p.dist/120));
      // Opacidade máxima bem baixa para não cobrir o texto
      const alpha = p.a * Math.min(1, p.dist/80) * Math.max(0, 1-p.dist/(Math.max(W,H)*.45));
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = p.color;
      ctx.lineWidth = .5+p.dist/600;
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
    });

    ctx.globalAlpha = 1;
    t++;
    requestAnimationFrame(draw);
  }
  sessionAnimActive = true;
  requestAnimationFrame(draw);
}

// Passos do loading com mensagens
// Pool de frases aleatórias (embaralhadas a cada loading)
const LOADING_PHRASES = [
  'Inicializando núcleo de processamento...',
  'Estabelecendo conexão subhiperespaçial...',
  'Autenticando credenciais de comando...',
  'Descriptografando protocolos de acesso...',
  'Carregando mapa galáctico...',
  'Triangulando posição dos sistemas estelares...',
  'Sincronizando dados planetários...',
  'Atualizando registros de facções...',
  'Calibrando sistemas de frota orbital...',
  'Compilando relatórios econômicos...',
  'Verificando estado da sessão...',
  'Restaurando logs de combate...',
  'Preparando interface de comando...',
  'Aguardando autorização do comando central...',
  'Escaneando anomalias gravitacionais...',
  'Verificando integridade dos setores...',
  'Sincronizando relógios estelares...',
  'Carregando inteligência de facções...',
  'Calibrando sensores de longo alcance...',
  'Indexando rotas hiperespaciais...',
  'Compilando dados de inteligência militar...',
  'Verificando protocolos de segurança...',
  'Atualizando cartas de navegação...',
  'Conectando ao repositório galáctico...',
];
const LOADING_FINAL = 'Bem-vindo, Comandante.';

let _loadingPhraseInterval = null;
let _loadingCurrentPct = 0;

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function setLoadingProgress(pct, label) {
  const fill = document.getElementById('session-loading-fill');
  const lbl  = document.getElementById('session-loading-label');
  if (fill) fill.style.width = pct + '%';
  if (lbl && label !== undefined) lbl.textContent = label;
}

function startPhraseRotation() {
  const phrases = shuffleArray(LOADING_PHRASES);
  let idx = 0;
  const lbl = document.getElementById('session-loading-label');

  const rotate = () => {
    if (!lbl || lbl.classList.contains('final')) return;
    lbl.style.opacity = '0';
    setTimeout(() => {
      if (!lbl || lbl.classList.contains('final')) return;
      lbl.textContent = phrases[idx % phrases.length];
      lbl.style.opacity = '1';
      idx++;
    }, 300);
  };
  rotate();
  _loadingPhraseInterval = setInterval(rotate, 1800);
}

function stopPhraseRotation() {
  if (_loadingPhraseInterval) {
    clearInterval(_loadingPhraseInterval);
    _loadingPhraseInterval = null;
  }
}

async function runLoadingSequence(tasks) {
  // Avançar a barra suavemente enquanto as tasks reais rodam em paralelo
  startPhraseRotation();

  // Dividir os 95% entre as tasks, reservando 95→100 para o final
  const steps = tasks.length;
  const pctPerStep = 90 / steps;
  let currentPct = 5;

  setLoadingProgress(currentPct);

  // Rodar todas as tasks com timeout — NUNCA travam
  const taskPromises = tasks.map((task, i) =>
    Promise.race([
      task(),
      new Promise(r => setTimeout(r, 5000)) // máx 5s por task
    ]).catch(() => {}).then(() => {
      currentPct = Math.min(93, currentPct + pctPerStep);
      setLoadingProgress(Math.round(currentPct));
    })
  );

  // Avançar suavemente em paralelo — tem timeout total de 12s
  let smoothDone = false;
  const smoothAdvance = (async () => {
    const start = Date.now();
    while (currentPct < 93 && Date.now() - start < 18000) {
      await new Promise(r => setTimeout(r, 300));
      currentPct = Math.min(93, currentPct + 0.6);
      setLoadingProgress(Math.round(currentPct));
    }
    currentPct = 93;
    smoothDone = true;
  })();

  // Esperar: tasks + smooth, com fallback de 13s no total
  await Promise.race([
    Promise.all([...taskPromises, smoothAdvance]),
    new Promise(r => setTimeout(r, 13000)),
  ]);
  currentPct = 93;

  // Chegar a 100%
  setLoadingProgress(95); await new Promise(r => setTimeout(r, 300));
  setLoadingProgress(98); await new Promise(r => setTimeout(r, 300));
  setLoadingProgress(100);

  // Parar frases aleatórias e mostrar frase final
  stopPhraseRotation();
  const lbl = document.getElementById('session-loading-label');
  if (lbl) {
    lbl.style.opacity = '0';
    await new Promise(r => setTimeout(r, 300));
    lbl.textContent = LOADING_FINAL;
    lbl.classList.add('final');
    lbl.style.opacity = '1';
  }

  // Aguardar 3 segundos na frase final
  await new Promise(r => setTimeout(r, 3000));

  // Limpar estado
  if (lbl) lbl.classList.remove('final');
}

async function openSessionScreen() {
  const ss = document.getElementById('session-screen');
  ss.style.display = 'flex';
  ss.classList.remove('hidden');
  document.getElementById('session-cards').classList.add('visible');

  if (isMaster()) {
    document.getElementById('session-master-card').style.display = 'block';
    document.getElementById('session-player-card').style.display = 'none';
    await loadAllPlayers().catch(()=>{});
    loadSaveList();
  } else {
    document.getElementById('session-master-card').style.display = 'none';
    document.getElementById('session-player-card').style.display = 'block';

    // Verificar sessão ativa imediatamente
    let sessionActive = false;
    try {
      const { db, doc, getDoc } = window._fb;
      const snap = await getDoc(doc(db, 'game_state', 'session'));
      if (snap.exists() && snap.data().active) sessionActive = true;
    } catch(e) {}

    if (sessionActive) {
      closeSessionScreen();
      return;
    }

    document.getElementById('session-player-msg').textContent =
      'Aguardando o mestre iniciar uma sessão...';

    // Escutar em tempo real
    const { db, doc, onSnapshot } = window._fb;
    onSnapshot(doc(db, 'game_state', 'session'), snap => {
      if (snap.exists() && snap.data().active) closeSessionScreen();
    });
  }
}

function closeSessionScreen() {
  sessionAnimActive = false;
  const ss = document.getElementById('session-screen');
  ss.classList.add('hidden');
  setTimeout(() => { ss.style.display = 'none'; }, 800);
}

async function loadSaveList() {
  const list = document.getElementById('session-save-list');
  list.innerHTML = '<div style="font-size:11px;color:#2a4060;padding:4px 0">Carregando saves...</div>';
  try {
    const { db, collection, getDocs } = window._fb;
    const snap = await getDocs(collection(db, 'sessions'));
    if (snap.empty) {
      list.innerHTML = '<div style="font-size:11px;color:#2a4060;padding:4px 0">Nenhum save encontrado. Crie uma nova sessão!</div>';
      return;
    }
    const saves = [];
    snap.forEach(d => saves.push({ id: d.id, ...d.data() }));
    saves.sort((a,b) => (b.savedAt||0) - (a.savedAt||0));
    list.innerHTML = saves.map(s => {
      const date = s.savedAt ? new Date(s.savedAt).toLocaleString('pt-BR') : '—';
      return `<div class="session-save-item" data-id="${s.id}">
        <span class="session-save-icon">◈</span>
        <span class="session-save-name">${s.name || s.id}</span>
        <span class="session-save-date">${date}</span>
        <button class="session-save-delete" onclick="deleteSession('${s.id}',event)" title="Apagar">✕</button>
      </div>`;
    }).join('');
    list.querySelectorAll('.session-save-item').forEach(item => {
      item.addEventListener('click', () => loadSession(item.dataset.id));
    });
  } catch(e) {
    console.warn('loadSaveList error:', e.message);
    list.innerHTML = '<div style="font-size:11px;color:#2a4060;padding:4px 0">Nenhum save ainda. Crie uma nova sessão!</div>';
  }
}

async function createNewSession(name) {
  const { db, doc, setDoc, collection, getDocs, updateDoc } = window._fb;
  const sessionId = 'session_' + Date.now();

  // 1. Salvar snapshot atual dos planetas nessa sessão
  const sessionData = {
    name: name || 'Sessão ' + new Date().toLocaleDateString('pt-BR'),
    savedAt: Date.now(),
    timeState: { year: 3036, month: 0, day: 1, paused: false },
  };
  await setDoc(doc(db, 'sessions', sessionId), sessionData);

  // 2. Resetar todos os planetas
  for (const p of PLANETS) {
    p.buildings = []; p.fleet = []; p.fleetTotal = 0;
    p.troops = 0; p.credits = 0;
    p.ownerId = null; p.ownerName = null;
    await updateDoc(doc(db, 'planets', String(p.id)), {
      buildings: [], fleet: [], fleetTotal: 0, troops: 0,
      credits: 0, ownerId: null, ownerName: null,
    });
  }

  // 3. Resetar créditos dos jogadores
  const pSnap = await getDocs(collection(db, 'players'));
  pSnap.forEach(async pd => {
    await updateDoc(doc(db, 'players', pd.id), { credits: 0 });
    const pl = allPlayers.find(p => p.uid === pd.id);
    if (pl) pl.credits = 0;
    if (currentPlayer && currentPlayer.uid === pd.id) currentPlayer.credits = 0;
  });

  // 4. Resetar tempo
  timeState = { year: 3036, month: 0, day: 1, paused: false, lastRealTime: Date.now() };
  await setDoc(doc(db, 'game_state', 'time'), timeState);

  // 5. Marcar sessão como ativa
  currentSessionId = sessionId;
  await setDoc(doc(db, 'game_state', 'session'), { active: true, id: sessionId, name: sessionData.name });

  closeSessionScreen();
  updateDateUI();
  updateStatusBar();
  loadAdminStats();
}

async function loadSession(sessionId) {
  const { db, doc, getDoc, setDoc, collection, getDocs, updateDoc } = window._fb;

  // Salvar primeiro o estado atual como novo save automático antes de carregar
  const snap = await getDoc(doc(db, 'sessions', sessionId));
  if (!snap.exists()) { alert('Save não encontrado.'); return; }

  const sessionData = snap.data();

  // Restaurar tempo
  if (sessionData.timeState) {
    timeState = { ...sessionData.timeState, lastRealTime: Date.now() };
    await setDoc(doc(db, 'game_state', 'time'), timeState);
  }

  // Marcar sessão como ativa
  currentSessionId = sessionId;
  await setDoc(doc(db, 'game_state', 'session'), { active: true, id: sessionId, name: sessionData.name });

  // Recarregar dados
  await loadPlanetsFromFirestore();
  await loadAllPlayers();
  updateDateUI();
  updateStatusBar();
  loadAdminStats();
  closeSessionScreen();
}

async function saveCurrentSession() {
  if (!isMaster() || !currentSessionId) return;
  const { db, doc, setDoc, collection, getDocs } = window._fb;
  const sessionData = {
    name: currentSessionId,
    savedAt: Date.now(),
    timeState: { ...timeState },
  };
  await setDoc(doc(db, 'sessions', currentSessionId), sessionData, { merge: true });
  showSaved();
}

async function deleteSession(id, e) {
  e.stopPropagation();
  if (!confirm('Apagar este save permanentemente?')) return;
  const { db, doc, deleteDoc } = window._fb;
  await deleteDoc(doc(db, 'sessions', id));
  loadSaveList();
}

// Auto-save a cada 5 minutos
setInterval(() => { if (isMaster() && currentSessionId) saveCurrentSession(); }, 5 * 60 * 1000);

/* ==========================================================
   OWNERSHIP SYSTEM
   ========================================================== */

// Paleta de cores para jogadores (distintas entre si)
const PLAYER_COLORS = [
  '#e05050','#50c0e0','#50e080','#e0b050',
  '#c050e0','#e07840','#50a0e0','#e050a0',
];
let playerColorMap = {}; // uid -> cor

let assignTarget = null;   // planeta sendo atribuído
let assignSelected = null; // jogador selecionado no popup
let allPlayers = [];       // cache de jogadores

/* ── Carregar todos os jogadores do Firestore ── */
async function loadAllPlayers() {
  try {
    const { db, collection, getDocs } = window._fb;
    const snap = await getDocs(collection(db, 'players'));
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
    });
    updateOwnerLegend();
  } catch(e) {
    // Jogadores podem não ter permissão de listar todos — ignorar silenciosamente
    console.log('loadAllPlayers: acesso restrito, OK para jogadores');
  }
}

/* ── Criar jogador: Auth via REST + documento no Firestore ── */
async function createPlayer(name, email, password) {
  const API_KEY = FB_CONFIG.apiKey;
  const errEl = document.getElementById('admin-player-error');
  errEl.textContent = '';

  // 1. Criar usuário no Firebase Auth via REST
  let uid;
  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
      { method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ email, password, returnSecureToken: true }) }
    );
    const data = await res.json();
    if (data.error) { errEl.textContent = data.error.message; return; }
    uid = data.localId;
  } catch(e) {
    errEl.textContent = 'Erro ao criar usuário: ' + e.message;
    return;
  }

  // 2. Gravar documento do jogador no Firestore
  const color = PLAYER_COLORS[allPlayers.length % PLAYER_COLORS.length];
  const playerDoc = { uid, email, name, role: 'player', color, credits: 0 };
  const { db, doc, setDoc } = window._fb;
  await setDoc(doc(db, 'players', uid), playerDoc);

  playerColorMap[uid] = color;
  allPlayers.push(playerDoc);

  // 3. Fechar form e atualizar UI
  document.getElementById('admin-add-player-form').style.display = 'none';
  document.getElementById('new-player-name').value = '';
  document.getElementById('new-player-email').value = '';
  document.getElementById('new-player-pass').value = '';
  loadAdminStats();
  updateOwnerLegend();
  showSaved();
}

/* ── Remover jogador ── */
async function removePlayer(uid, name) {
  if (!confirm(`Remover jogador "${name}"? Os planetas atribuídos a ele ficarão sem dono.`)) return;
  const { db, doc, collection, getDocs, updateDoc } = window._fb;
  const API_KEY = window.FB_CONFIG.apiKey;

  // 1. Remover ownership dos planetas desse jogador
  const planetsOwned = PLANETS.filter(p => p.ownerId === uid);
  for (const p of planetsOwned) {
    p.ownerId = null; p.ownerName = null;
    await updateDoc(doc(db, 'planets', String(p.id)), { ownerId: null, ownerName: null });
  }

  // 2. Deletar documento do Firestore
  const { deleteDoc } = window._fb;
  await deleteDoc(doc(db, 'players', uid));

  // 3. Deletar do Auth via REST (requer o token do mestre logado)
  try {
    const token = await window._fb.auth.currentUser.getIdToken();
    await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:delete?key=${API_KEY}`,
      { method: 'POST', headers: {'Content-Type':'application/json', 'Authorization': 'Bearer ' + token},
        body: JSON.stringify({ localId: uid }) }
    );
  } catch(e) {
    console.warn('Não foi possível deletar do Auth (sem permissão admin):', e.message);
  }

  // 4. Atualizar local
  allPlayers = allPlayers.filter(p => p.uid !== uid);
  delete playerColorMap[uid];
  loadAdminStats();
  updateOwnerLegend();
  showSaved();
}

/* ── Atualizar legenda de donos no mapa ── */
function updateOwnerLegend() {
  const legend = document.getElementById('owner-legend');
  const owners = allPlayers.filter(pl => PLANETS.some(p => p.ownerId === pl.uid));
  if (owners.length === 0) { legend.style.display = 'none'; return; }
  legend.style.display = 'flex';
  legend.innerHTML = owners.map(pl => {
    const count = PLANETS.filter(p => p.ownerId === pl.uid).length;
    return `<div class="owner-legend-item">
      <div class="owner-legend-dot" style="background:${pl.color}"></div>
      <span>${pl.name || pl.email.split('@')[0]} <span style="opacity:.5">(${count})</span></span>
    </div>`;
  }).join('');
}

/* ── Abrir popup de atribuição ── */
function openAssignPopup(planet) {
  if (!isMaster()) return;
  assignTarget = planet;
  assignSelected = null;

  const title = document.getElementById('assign-popup-title');
  title.textContent = 'Atribuir — ' + planet.name;

  const list = document.getElementById('assign-players-list');
  if (allPlayers.length === 0) {
    list.innerHTML = '<div style="font-size:12px;color:#3a5060;padding:1rem 0">Nenhum jogador cadastrado ainda.</div>';
  } else {
    list.innerHTML = allPlayers
      .filter(pl => pl.email !== MASTER_EMAIL)
      .map(pl => {
        const pCount = PLANETS.filter(p => p.ownerId === pl.uid).length;
        const isCurrent = planet.ownerId === pl.uid;
        return `<div class="player-select-row ${isCurrent ? 'selected' : ''}" data-uid="${pl.uid}" data-name="${pl.name || pl.email.split('@')[0]}" data-color="${pl.color}">
          <div class="player-select-dot" style="background:${pl.color}"></div>
          <span class="player-select-name">${pl.name || pl.email.split('@')[0]}</span>
          <span class="player-select-planets">${pCount} planetas</span>
          <span class="player-select-credits">${(pl.credits||0).toLocaleString()} ₢</span>
        </div>`;
      }).join('');

    list.querySelectorAll('.player-select-row').forEach(row => {
      row.addEventListener('click', () => {
        list.querySelectorAll('.player-select-row').forEach(r => r.classList.remove('selected'));
        row.classList.add('selected');
        assignSelected = { uid: row.dataset.uid, name: row.dataset.name, color: row.dataset.color };
      });
      if (planet.ownerId === row.dataset.uid) {
        assignSelected = { uid: row.dataset.uid, name: row.dataset.name, color: row.dataset.color };
      }
    });
  }

  document.getElementById('assign-popup-overlay').classList.add('active');
}

/* ── Confirmar atribuição ── */
async function confirmAssign() {
  if (!assignTarget || !assignSelected) { alert('Selecione um jogador.'); return; }
  const { db, doc, updateDoc } = window._fb;
  assignTarget.ownerId   = assignSelected.uid;
  assignTarget.ownerName = assignSelected.name;
  await updateDoc(doc(db, 'planets', String(assignTarget.id)), {
    ownerId:   assignSelected.uid,
    ownerName: assignSelected.name,
  });
  showSaved();
  closeAssignPopup();
  if (selectedPlanet && selectedPlanet.id === assignTarget.id) showPanel(assignTarget);
  updateOwnerLegend();
  loadAdminStats();
}

/* ── Remover dono ── */
async function removeOwner() {
  if (!assignTarget) return;
  const { db, doc, updateDoc } = window._fb;
  assignTarget.ownerId   = null;
  assignTarget.ownerName = null;
  await updateDoc(doc(db, 'planets', String(assignTarget.id)), {
    ownerId: null, ownerName: null,
  });
  showSaved();
  closeAssignPopup();
  if (selectedPlanet && selectedPlanet.id === assignTarget.id) showPanel(assignTarget);
  updateOwnerLegend();
}

function closeAssignPopup() {
  document.getElementById('assign-popup-overlay').classList.remove('active');
  assignTarget = null; assignSelected = null;
}

/* ── Desenhar anel de dono ao redor do planeta no mapa ── */
function drawOwnerRing(p, pos, r) {
  if (!p.ownerId) return;
  const color = playerColorMap[p.ownerId];
  if (!color) return;
  ctx.save();
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, r * zoom + 5 * zoom, 0, Math.PI * 2);
  ctx.strokeStyle = color + 'aa';
  ctx.lineWidth = 2.5 * zoom;
  ctx.stroke();
  // segundo anel fino
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, r * zoom + 9 * zoom, 0, Math.PI * 2);
  ctx.strokeStyle = color + '33';
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();
  ctx.restore();
}
