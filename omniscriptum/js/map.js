/* ===== SOL CENTER & ORBITS ===== */
const ORBIT_LABELS = ["1ª Órbita", "2ª Órbita", "3ª Órbita", "4ª Órbita", "5ª Órbita", "6ª Órbita", "7ª Órbita"];

function drawOrbits() {
  const cx = w2s(SOL_X * GW, SOL_Y * GH);
  ORBIT_RINGS.forEach((r, i) => {
    const sr = r * zoom;
    // anel principal
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx.x, cx.y, sr, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(160,200,255,${0.25 - i * 0.02})`;
    ctx.lineWidth = Math.max(0.5, 1.5 * zoom);
    ctx.setLineDash([]);
    ctx.shadowColor = 'rgba(120,170,255,0.5)';
    ctx.shadowBlur = 8 * zoom;
    ctx.stroke();
    ctx.restore();

    // anel brilhante fino por cima
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx.x, cx.y, sr, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(220,235,255,${0.15 - i * 0.012})`;
    ctx.lineWidth = Math.max(0.4, 0.7 * zoom);
    ctx.stroke();
    ctx.restore();

    // label da órbita (só visível com zoom suficiente)
    if (zoom > 0.45) {
      ctx.save();
      ctx.font = `${Math.round(10 * zoom)}px 'Rajdhani', sans-serif`;
      ctx.fillStyle = `rgba(140,180,230,${0.40 - i * 0.04})`;
      ctx.textAlign = 'center';
      ctx.fillText(ORBIT_LABELS[i], cx.x, cx.y - sr - 6 * zoom);
      ctx.restore();
    }
  });
}

function drawSol(t) {
  const pos = w2s(SOL_X * GW, SOL_Y * GH);
  const pulse = Math.sin(t * 0.0015) * 0.08 + 1;
  const r = 26 * zoom * pulse;

  // halo externo difuso
  const halo2 = ctx.createRadialGradient(pos.x, pos.y, r * 1.5, pos.x, pos.y, r * 5);
  halo2.addColorStop(0, 'rgba(255,220,80,0.07)');
  halo2.addColorStop(1, 'transparent');
  ctx.fillStyle = halo2;
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, r * 5, 0, Math.PI * 2);
  ctx.fill();

  // halo médio
  const halo = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, r * 2.8);
  halo.addColorStop(0, 'rgba(255,240,140,0.5)');
  halo.addColorStop(0.4, 'rgba(255,180,40,0.25)');
  halo.addColorStop(1, 'transparent');
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, r * 2.8, 0, Math.PI * 2);
  ctx.fill();

  // corpo da estrela
  const grad = ctx.createRadialGradient(pos.x - r * 0.25, pos.y - r * 0.25, r * 0.05, pos.x, pos.y, r);
  grad.addColorStop(0, '#fff8e0');
  grad.addColorStop(0.3, '#ffe566');
  grad.addColorStop(0.7, '#ffb820');
  grad.addColorStop(1, '#e07a00');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
  ctx.fill();

  // brilho interno
  const shine = ctx.createRadialGradient(pos.x - r * 0.3, pos.y - r * 0.3, 0, pos.x - r * 0.3, pos.y - r * 0.3, r * 0.7);
  shine.addColorStop(0, 'rgba(255,255,220,0.6)');
  shine.addColorStop(1, 'transparent');
  ctx.fillStyle = shine;
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
  ctx.fill();

  // label "Sol"
  if (zoom > 0.35) {
    ctx.font = `${Math.round(11 * zoom)}px 'Orbitron', 'Rajdhani', sans-serif`;
    ctx.fillStyle = 'rgba(255,230,120,0.85)';
    ctx.textAlign = 'center';
    ctx.fillText('Churr-05', pos.x, pos.y + r + 14 * zoom);
  }
}

function drawPlanet(p, t) {
  if (!planetMatchesFactionFilter(p)) return;
  const pos = planetScreenPos(p);
  const r = p.radius * zoom;
  const isH = hoveredPlanet === p;
  const isS = selectedPlanet === p;

  if (isS) {
    const pulse = Math.sin(t * 0.003) * 0.3 + 0.7;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, r + 16 * zoom * pulse, 0, Math.PI * 2);
    ctx.strokeStyle = p.color + Math.floor(pulse * 60).toString(16).padStart(2, '0');
    ctx.lineWidth = 2 * pulse;
    ctx.stroke();
  }
  if (isH && !isS) {
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, r + 8 * zoom, 0, Math.PI * 2);
    ctx.strokeStyle = p.color + '44';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // Anel de dono (antes do glow)
  if (p.ownerId) drawOwnerRing(p, pos, p.radius);

  const glowR = r * 3;
  const glow = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, glowR);
  glow.addColorStop(0, p.glow + '60');
  glow.addColorStop(0.5, p.glow + '18');
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, glowR, 0, Math.PI * 2);
  ctx.fill();

  // Desenha imagem PNG se existir, senão usa gradiente
  if (p.image && planetImages[p.id]) {
    const img = planetImages[p.id];
    ctx.save();
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img, pos.x - r, pos.y - r, r * 2, r * 2);
    ctx.restore();
  } else {
    const grad = ctx.createRadialGradient(pos.x - r * 0.3, pos.y - r * 0.3, r * 0.1, pos.x, pos.y, r);
    grad.addColorStop(0, lighten(p.color, 50));
    grad.addColorStop(0.6, p.color);
    grad.addColorStop(1, darken(p.color, 50));
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
    ctx.fill();

    // Calotas de gelo
    if (p.ice) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
      ctx.clip();
      // Calota norte
      const iceGrad1 = ctx.createRadialGradient(pos.x, pos.y - r * 0.75, 0, pos.x, pos.y - r * 0.75, r * 0.55);
      iceGrad1.addColorStop(0, 'rgba(220,240,255,0.5)');
      iceGrad1.addColorStop(0.6, 'rgba(180,220,255,0.2)');
      iceGrad1.addColorStop(1, 'transparent');
      ctx.fillStyle = iceGrad1;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y - r * 0.75, r * 0.55, 0, Math.PI * 2);
      ctx.fill();
      // Calota sul
      const iceGrad2 = ctx.createRadialGradient(pos.x, pos.y + r * 0.75, 0, pos.x, pos.y + r * 0.75, r * 0.45);
      iceGrad2.addColorStop(0, 'rgba(220,240,255,0.4)');
      iceGrad2.addColorStop(0.6, 'rgba(180,220,255,0.15)');
      iceGrad2.addColorStop(1, 'transparent');
      ctx.fillStyle = iceGrad2;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y + r * 0.75, r * 0.45, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Nuvens (faixas semi-transparentes animadas)
    if (p.clouds) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
      ctx.clip();
      const drift = t * 0.0001;
      for (let k = 0; k < 4; k++) {
        const bandY = pos.y - r * 0.6 + (k * r * 0.4);
        const offset = Math.sin(drift + k * 2.1) * r * 0.3;
        ctx.beginPath();
        ctx.ellipse(pos.x + offset, bandY, r * 0.9, r * 0.08, 0.1 * k, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${0.08 + k * 0.02})`;
        ctx.fill();
      }
      ctx.restore();
    }

    // Satélite (lua orbitando o planeta)
    if (p.satellite) {
      ctx.save();
      // Ângulo da lua: durante simulação usa tempo real, senão animação constante
      const moonAngle = t * 0.0008 + (p.id || 0) * 1.5;
      const moonOrbitR = r * 2.2;
      const moonR = Math.max(2, r * 0.25);
      const moonX = pos.x + Math.cos(moonAngle) * moonOrbitR;
      const moonY = pos.y + Math.sin(moonAngle) * moonOrbitR * 0.45; // elipse achatada

      // Órbita da lua (linha tracejada sutil)
      ctx.beginPath();
      ctx.ellipse(pos.x, pos.y, moonOrbitR, moonOrbitR * 0.45, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(180,200,230,0.12)';
      ctx.lineWidth = Math.max(0.5, 0.8 * zoom);
      ctx.setLineDash([3 * zoom, 4 * zoom]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Corpo da lua
      const moonGrad = ctx.createRadialGradient(moonX - moonR * 0.3, moonY - moonR * 0.3, moonR * 0.1, moonX, moonY, moonR);
      moonGrad.addColorStop(0, '#e0e8f0');
      moonGrad.addColorStop(0.5, '#a0a8b8');
      moonGrad.addColorStop(1, '#606878');
      ctx.fillStyle = moonGrad;
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
      ctx.fill();

      // Glow sutil da lua
      const moonGlow = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, moonR * 2.5);
      moonGlow.addColorStop(0, 'rgba(200,210,230,0.15)');
      moonGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = moonGlow;
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonR * 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  // Atmosfera (halo colorido externo)
  if (p.atmosphere) {
    const atmoGrad = ctx.createRadialGradient(pos.x, pos.y, r * 0.9, pos.x, pos.y, r * 1.4);
    atmoGrad.addColorStop(0, p.color + '30');
    atmoGrad.addColorStop(0.5, p.color + '15');
    atmoGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = atmoGrad;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, r * 1.4, 0, Math.PI * 2);
    ctx.fill();
    // Borda brilhante da atmosfera
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, r * 1.05, 0, Math.PI * 2);
    ctx.strokeStyle = p.color + '25';
    ctx.lineWidth = Math.max(1, 2.5 * zoom);
    ctx.stroke();
  }

  if (p.rings) {
    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.scale(1, 0.28);
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.7, 0, Math.PI * 2);
    ctx.strokeStyle = p.color + '66';
    ctx.lineWidth = Math.max(1, 5 * zoom);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, r * 2.1, 0, Math.PI * 2);
    ctx.strokeStyle = p.color + '44';
    ctx.lineWidth = Math.max(1, 3 * zoom);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.35, 0, Math.PI * 2);
    ctx.strokeStyle = p.color + '33';
    ctx.lineWidth = Math.max(0.5, 2 * zoom);
    ctx.stroke();
    ctx.restore();
  }

  if (zoom > 0.4 || isH || isS) {
    const fontSize = Math.max(9, 11 * zoom);
    ctx.fillStyle = isH || isS ? '#e0f0ff' : 'rgba(192,208,240,0.7)';
    ctx.font = `${fontSize}px 'Rajdhani', sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(p.name, pos.x, pos.y + r + 14 * zoom);
  }
}

let lastFrameTime = 0;

function draw(t) {
  const dt = lastFrameTime ? t - lastFrameTime : 16;
  lastFrameTime = t;

  updateSimulation(dt);

  const w = canvas.width, h = canvas.height;
  const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.7);
  bgGrad.addColorStop(0, '#0a1025');
  bgGrad.addColorStop(0.5, '#060c1a');
  bgGrad.addColorStop(1, '#020408');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  stars.forEach(s => {
    const a = s.a + Math.sin(t * 0.001 + s.twinkle) * 0.15;
    ctx.globalAlpha = a;
    ctx.fillStyle = '#d8e4ff';
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;

  drawNebula();
  if (showFactionClouds) drawFactionClouds(t);
  drawOrbits();
  drawSol(t);
  drawConnections();

  const sorted = [...PLANETS].sort((a, b) => a.y - b.y);
  sorted.forEach(p => drawPlanet(p, t));

  requestAnimationFrame(draw);
}

/* ===== HIT TEST ===== */
function getPlanetAt(clientX, clientY) {
  for (let i = PLANETS.length - 1; i >= 0; i--) {
    const p = PLANETS[i];
    const pos = planetScreenPos(p);
    const hitR = Math.max(p.radius, 16) * zoom + 6;
    const dx = clientX - pos.x, dy = clientY - pos.y;
    if (dx * dx + dy * dy < hitR * hitR) return p;
  }
  return null;
}

/* ===== MOUSE INPUT ===== */
wrap.addEventListener('mousedown', e => {
  if (e.button !== 0) return;
  // Shift = arrastar com imã de órbita, Alt = arrastar livre
  if (e.shiftKey || e.altKey) {
    const p = getPlanetAt(e.clientX, e.clientY);
    if (p) {
      isDraggingPlanet = true;
      draggedPlanet = p;
      dragPlanetSnap = e.shiftKey;
      return;
    }
  }
  isDragging = true;
  dragStartX = e.clientX;
  dragStartY = e.clientY;
  dragCamX = camX;
  dragCamY = camY;
  wrap.classList.add('dragging');
});

window.addEventListener('mouseup', e => {
  if (isDraggingPlanet) {
    isDraggingPlanet = false;
    draggedPlanet = null;
  }
  isDragging = false;
  wrap.classList.remove('dragging');
});

function snapToOrbit(wx, wy) {
  // Calcula distância do centro (Sol)
  const dx = wx - SOL_X * GW;
  const dy = wy - SOL_Y * GH;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Encontra o anel mais próximo
  let closestRing = ORBIT_RINGS[0];
  let minDiff = Math.abs(dist - ORBIT_RINGS[0]);

  for (const ring of ORBIT_RINGS) {
    const diff = Math.abs(dist - ring);
    if (diff < minDiff) {
      minDiff = diff;
      closestRing = ring;
    }
  }

  // Se está dentro da distância do imã, cola no anel
  if (minDiff < ORBIT_MAGNET_DIST && dist > 10) {
    // Normaliza a direção e projeta no anel
    const angle = Math.atan2(dy, dx);
    const newWx = SOL_X * GW + closestRing * Math.cos(angle);
    const newWy = SOL_Y * GH + closestRing * Math.sin(angle);
    return { x: newWx / GW, y: newWy / GH, snapped: true, ring: ORBIT_RINGS.indexOf(closestRing) + 1 };
  }

  return { x: wx / GW, y: wy / GH, snapped: false };
}

window.addEventListener('mousemove', e => {
  if (isDraggingPlanet && draggedPlanet) {
    const wx = (e.clientX - camX) / zoom;
    const wy = (e.clientY - camY) / zoom;
    if (dragPlanetSnap) {
      const snapped = snapToOrbit(wx, wy);
      draggedPlanet.x = snapped.x;
      draggedPlanet.y = snapped.y;
    } else {
      draggedPlanet.x = wx / GW;
      draggedPlanet.y = wy / GH;
    }
    wrap.style.cursor = 'grabbing';
    return;
  }
  if (isDragging) {
    camX = dragCamX + (e.clientX - dragStartX);
    camY = dragCamY + (e.clientY - dragStartY);
    return;
  }
  const newHovered = getPlanetAt(e.clientX, e.clientY);
  if (newHovered !== hoveredPlanet) {
    hoveredPlanet = newHovered;
    if (hoveredPlanet && hoveredPlanet !== lastHoveredPlanet) {
      playHover();
      lastHoveredPlanet = hoveredPlanet;
    }
  }
  wrap.style.cursor = hoveredPlanet ? 'pointer' : 'grab';
});

wrap.addEventListener('click', e => {
  const p = getPlanetAt(e.clientX, e.clientY);
  const dist = Math.max(Math.abs(e.clientX - dragStartX), Math.abs(e.clientY - dragStartY));
  if (p && dist < 8) showPanel(p);
});

/* ===== TOUCH ===== */
let lastTouchDist = 0;
let touchStartTime = 0;
let longPressTimer = null;
let touchMoved = false;
let touchStartPlanet = null;

wrap.addEventListener('touchstart', e => {
  if (e.touches.length === 1) {
    const tx = e.touches[0].clientX, ty = e.touches[0].clientY;
    dragStartX = tx;
    dragStartY = ty;
    dragCamX = camX;
    dragCamY = camY;
    touchMoved = false;
    touchStartTime = Date.now();
    touchStartPlanet = getPlanetAt(tx, ty);

    // Long press (500ms) para arrastar planeta
    clearTimeout(longPressTimer);
    longPressTimer = setTimeout(() => {
      if (!touchMoved && touchStartPlanet) {
        isDraggingPlanet = true;
        draggedPlanet = touchStartPlanet;
        dragPlanetSnap = false;
        isDragging = false;
        // Vibração de feedback (se suportado)
        if (navigator.vibrate) navigator.vibrate(30);
      }
    }, 500);

    isDragging = true;
  } else if (e.touches.length === 2) {
    clearTimeout(longPressTimer);
    isDragging = false;
    isDraggingPlanet = false;
    draggedPlanet = null;
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    lastTouchDist = Math.sqrt(dx * dx + dy * dy);
  }
}, { passive: false });

wrap.addEventListener('touchmove', e => {
  e.preventDefault();
  if (e.touches.length === 1) {
    const tx = e.touches[0].clientX, ty = e.touches[0].clientY;
    const moved = Math.abs(tx - dragStartX) + Math.abs(ty - dragStartY);
    if (moved > 8) touchMoved = true;

    if (isDraggingPlanet && draggedPlanet) {
      clearTimeout(longPressTimer);
      const wx = (tx - camX) / zoom;
      const wy = (ty - camY) / zoom;
      draggedPlanet.x = wx / GW;
      draggedPlanet.y = wy / GH;
    } else if (isDragging) {
      if (touchMoved) clearTimeout(longPressTimer);
      camX = dragCamX + (tx - dragStartX);
      camY = dragCamY + (ty - dragStartY);
    }
  } else if (e.touches.length === 2) {
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    const dist = Math.sqrt(dx*dx + dy*dy);
    if (lastTouchDist > 0) {
      const ratio = dist / lastTouchDist;
      const oldZoom = zoom;
      zoom = Math.max(0.15, Math.min(4, zoom * ratio));
      const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      camX = cx - (cx - camX) * (zoom / oldZoom);
      camY = cy - (cy - camY) * (zoom / oldZoom);
      updateZoomLevel();
    }
    lastTouchDist = dist;
  }
}, { passive: false });

wrap.addEventListener('touchend', e => {
  clearTimeout(longPressTimer);
  if (e.touches.length < 2) lastTouchDist = 0;

  if (e.touches.length === 0) {
    // Recalcula órbita se soltou planeta durante simulação
    if (isDraggingPlanet && draggedPlanet && simActive) {
      const cx = SOL_X * GW, cy = SOL_Y * GH;
      const dx = draggedPlanet.x * GW - cx;
      const dy = draggedPlanet.y * GH - cy;
      draggedPlanet.orbitRadius = Math.sqrt(dx * dx + dy * dy);
      draggedPlanet.orbitAngle = Math.atan2(dy, dx);
    }

    // Tap curto em planeta = abrir painel
    if (!touchMoved && !isDraggingPlanet && touchStartPlanet) {
      showPanel(touchStartPlanet);
      playClick();
    }

    isDragging = false;
    isDraggingPlanet = false;
    draggedPlanet = null;
  }
});

/* ===== WHEEL ===== */
wrap.addEventListener('wheel', e => {
  e.preventDefault();
  const mx = e.clientX, my = e.clientY;
  const oldZoom = zoom;
  zoom = e.deltaY < 0 ? Math.min(4, zoom * 1.12) : Math.max(0.15, zoom / 1.12);
  camX = mx - (mx - camX) * (zoom / oldZoom);
  camY = my - (my - camY) * (zoom / oldZoom);
  updateZoomLevel();
}, { passive: false });

/* ===== PANEL ===== */
function showPanel(p) {
  selectedPlanet = p;
  playClick();
  document.getElementById('planet-name').textContent = p.name;
  document.getElementById('planet-type').textContent = p.type;
  // Owner badge
  const existingBadge = document.getElementById('owner-badge-el');
  if (existingBadge) existingBadge.remove();
  if (p.ownerName) {
    const badge = document.createElement('div');
    badge.id = 'owner-badge-el';
    badge.className = 'owner-badge';
    badge.style.cssText = `color:${p.color};border-color:${p.color}44;background:${p.color}15`;
    badge.innerHTML = `<span style="width:6px;height:6px;border-radius:50%;background:${p.color};display:inline-block"></span> ${p.ownerName}`;
    document.getElementById('planet-type').after(badge);
  }
  document.getElementById('planet-desc').textContent = p.desc;

  // Estrelas (dragões anciões)
  const starsEl = document.getElementById('planet-stars');
  const stars = PLANET_STARS_MAP[p.name] || [];
  if (stars.length > 0) {
    starsEl.textContent = '✦ Estrela' + (stars.length > 1 ? 's' : '') + ': ' + stars.join(', ');
    starsEl.style.display = '';
  } else {
    starsEl.style.display = 'none';
  }
  document.getElementById('s-pop').textContent = p.pop || '—';
  document.getElementById('s-sys').textContent = p.ownerName || 'Sem dono';
  document.getElementById('s-clim').textContent = p.climate || '—';
  const govVal = p.gov || '—';
  document.getElementById('s-gov-text').textContent = govVal;
  document.getElementById('gov-info-btn').style.display = GOV_DESCS[govVal] ? '' : 'none';
  // Facção Principal
  const fmBlock = document.getElementById('faction-main-block');
  const fmDisplay = document.getElementById('faction-main-display');
  if (p.factionMain) {
    const fc = getFactionColor(p.factionMain) || p.color || '#888';
    fmDisplay.innerHTML = `<span class="faction-tag" style="background:${fc}22;color:${fc};border-color:${fc}55">${p.factionMain}</span>`;
    fmBlock.style.display = '';
  } else {
    fmBlock.style.display = 'none';
  }

  // Subfacções
  const fsBlock = document.getElementById('faction-secondary-block');
  const fsDisplay = document.getElementById('faction-secondary-display');
  const secList = p.factionSecondary || [];
  if (secList.length > 0) {
    fsDisplay.innerHTML = secList.map(name => {
      const fc = getFactionColor(name) || '#8899bb';
      return `<span class="faction-tag" style="background:${fc}22;color:${fc};border-color:${fc}55">${name}</span>`;
    }).join('');
    fsBlock.style.display = '';
  } else {
    fsBlock.style.display = 'none';
  }

  document.getElementById('poi-list').innerHTML = (p.poi || []).map(poi =>
    `<div class="poi-item">${poi}</div>`
  ).join('');
  document.getElementById('panel').classList.add('open');

  // Se o editor está aberto, atualiza para o novo planeta
  if (document.getElementById('editor-panel').classList.contains('open')) {
    openEditor(p);
  }
}

document.getElementById('close-btn').addEventListener('click', () => {
  document.getElementById('panel').classList.remove('open');
  selectedPlanet = null;
});

wrap.addEventListener('dblclick', e => {
  const p = getPlanetAt(e.clientX, e.clientY);
  if (!p) {
    document.getElementById('panel').classList.remove('open');
    selectedPlanet = null;
  }
});

/* ===== FILTERS (Facções) ===== */
function getAllFactions() {
  const map = new Map(); // name -> color
  PLANETS.forEach(p => {
    if (p.factionMain) {
      const c = getFactionColor(p.factionMain) || p.color || '#888';
      if (!map.has(p.factionMain)) map.set(p.factionMain, c);
    }
    (p.factionSecondary || []).forEach(name => {
      const c = getFactionColor(name) || '#888';
      if (!map.has(name)) map.set(name, c);
    });
    // also include legacy factions array
    (p.factions || []).forEach(f => {
      if (!map.has(f.name)) map.set(f.name, f.c || '#888');
    });
  });
  return map;
}

function planetMatchesFactionFilter(p) {
  if (activeFactionFilters.size === 0) return true;
  const names = new Set();
  if (p.factionMain) names.add(p.factionMain);
  (p.factionSecondary || []).forEach(n => names.add(n));
  (p.factions || []).forEach(f => names.add(f.name));
  for (const f of activeFactionFilters) {
    if (names.has(f)) return true;
  }
  return false;
}

function buildFilters() {
  const factionMap = getAllFactions();
  const bar = document.getElementById('filterbar');
  const allActive = activeFactionFilters.size === 0;
  let html = `<div class="filter-btn ${allActive ? 'active' : ''}" data-filter="all"><span class="filter-dot" style="background:#fff"></span>Todos</div>`;
  factionMap.forEach((color, name) => {
    const isActive = activeFactionFilters.has(name);
    html += `<div class="filter-btn ${isActive ? 'active' : ''}" data-filter="${name}"><span class="filter-dot" style="background:${color}"></span>${name}</div>`;
  });
  bar.innerHTML = html;
  bar.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.filter === 'all') {
        activeFactionFilters.clear();
      } else {
        if (activeFactionFilters.has(btn.dataset.filter)) {
          activeFactionFilters.delete(btn.dataset.filter);
        } else {
          activeFactionFilters.add(btn.dataset.filter);
        }
      }
      buildFilters();
    });
  });
}

/* ===== SEARCH ===== */
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');

searchInput.addEventListener('input', () => {
  const q = searchInput.value.toLowerCase().trim();
  if (!q) { searchResults.classList.remove('has-items'); searchResults.innerHTML = ''; return; }
  const matches = PLANETS.filter(p => p.name.toLowerCase().includes(q) || p.type.toLowerCase().includes(q));
  if (!matches.length) { searchResults.classList.remove('has-items'); return; }
  searchResults.classList.add('has-items');
  searchResults.innerHTML = matches.map(p =>
    `<div class="sr-item" data-id="${p.id}"><span class="sr-dot" style="background:${p.color}"></span><span class="sr-name">${p.name}</span><span class="sr-type">${p.type}</span></div>`
  ).join('');
  searchResults.querySelectorAll('.sr-item').forEach(item => {
    item.addEventListener('click', () => {
      const planet = PLANETS.find(pp => pp.id == item.dataset.id);
      if (planet) { flyTo(planet); showPanel(planet); }
      searchResults.classList.remove('has-items');
      searchInput.value = '';
    });
  });
});

searchInput.addEventListener('blur', () => {
  setTimeout(() => searchResults.classList.remove('has-items'), 200);
});

function flyTo(p) {
  const cw = window.innerWidth, ch = window.innerHeight;
  const targetZoom = 1.8;
  const px = p.x * GW, py = p.y * GH;
  const targetCamX = cw / 2 - px * targetZoom;
  const targetCamY = ch / 2 - py * targetZoom;
  const scx = camX, scy = camY, sz = zoom;
  const dur = 800, start = performance.now();
  function anim(now) {
    const t = Math.min(1, (now - start) / dur);
    const ease = t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3) / 2;
    camX = scx + (targetCamX - scx) * ease;
    camY = scy + (targetCamY - scy) * ease;
    zoom = sz + (targetZoom - sz) * ease;
    updateZoomLevel();
    if (t < 1) requestAnimationFrame(anim);
  }
  requestAnimationFrame(anim);
}

/* ===== ZOOM BUTTONS ===== */
document.getElementById('zoom-in').addEventListener('click', () => {
  const cw = window.innerWidth / 2, ch = window.innerHeight / 2;
  const oldZoom = zoom;
  zoom = Math.min(4, zoom * 1.3);
  camX = cw - (cw - camX) * (zoom / oldZoom);
  camY = ch - (ch - camY) * (zoom / oldZoom);
  updateZoomLevel();
});
document.getElementById('zoom-out').addEventListener('click', () => {
  const cw = window.innerWidth / 2, ch = window.innerHeight / 2;
  const oldZoom = zoom;
  zoom = Math.max(0.15, zoom / 1.3);
  camX = cw - (cw - camX) * (zoom / oldZoom);
  camY = ch - (ch - camY) * (zoom / oldZoom);
  updateZoomLevel();
});
document.getElementById('btn-reset').addEventListener('click', () => {
  const w = window.innerWidth, h = window.innerHeight;
  const scx = camX, scy = camY, sz = zoom;
  const tx = (w - GW) / 2, ty = (h - GH) / 2, tz = 1;
  const dur = 600, start = performance.now();
  function anim(now) {
    const t = Math.min(1, (now - start) / dur);
    const ease = t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3) / 2;
    camX = scx + (tx - scx) * ease;
    camY = scy + (ty - scy) * ease;
    zoom = sz + (tz - sz) * ease;
    updateZoomLevel();
    if (t < 1) requestAnimationFrame(anim);
  }
  requestAnimationFrame(anim);
});

// Exportar dados completos dos planetas
document.getElementById('btn-export').addEventListener('click', () => {
  const exportData = PLANETS.map(p => ({
    name: p.name,
    type: p.type,
    x: parseFloat(p.x.toFixed(3)),
    y: parseFloat(p.y.toFixed(3)),
    r: p.radius,
    color: p.color,
    glow: p.glow,
    desc: p.desc,
    pop: p.pop,
    system: p.system,
    climate: p.climate,
    gov: p.gov,
    factions: (p.factions || []).map(f => ({ name: f.name, color: f.c || f.color || '#888' })),
    factionMain: p.factionMain || '',
    factionMainColor: getFactionColor(p.factionMain) || '',
    factionSecondary: (p.factionSecondary || []).map(name => ({ name, color: getFactionColor(name) || '#888' })),
    poi: p.poi || [],
    rings: p.rings || false,
    clouds: p.clouds || false,
    ice: p.ice || false,
    atmosphere: p.atmosphere || false,
    satellite: p.satellite || false,
  }));
  const code = JSON.stringify(exportData, null, 2);

  const blob = new Blob([code], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'planetas_dados.json';
  a.click();
  URL.revokeObjectURL(url);

  // Copia para clipboard
  navigator.clipboard.writeText(code).then(() => {
    const btn = document.getElementById('btn-export');
    const orig = btn.textContent;
    btn.textContent = '✅ Copiado!';
    setTimeout(() => btn.textContent = orig, 2000);
  });
});

function updateZoomLevel() {
  document.getElementById('zoom-level').textContent = Math.round(zoom * 100) + '%';
}

/* ===== EDITOR PANEL ===== */
const VISUAL_PROPS = ['rings', 'clouds', 'ice', 'atmosphere', 'satellite'];

function syncEditorToModel() {
  if (!editingPlanet) return;
  editingPlanet.name = document.getElementById('edit-name').value;
  editingPlanet.type = document.getElementById('edit-type').value;
  editingPlanet.desc = document.getElementById('edit-desc').value;
  editingPlanet.radius = Math.round(parseInt(document.getElementById('edit-diameter').value) / 2) || 10;
  editingPlanet.pop = document.getElementById('edit-pop').value;
  editingPlanet.climate = document.getElementById('edit-climate').value;
  editingPlanet.gov = document.getElementById('edit-gov').value;
  editingPlanet.system = document.getElementById('edit-system-row').value;
  editingPlanet.color = document.getElementById('edit-color').value;
  editingPlanet.glow = document.getElementById('edit-glow').value;
  editingPlanet.factionMain = document.getElementById('edit-faction-main').value;

  // Atualiza painel de detalhes se aberto
  if (selectedPlanet === editingPlanet) {
    document.getElementById('planet-name').textContent = editingPlanet.name;
    document.getElementById('planet-type').textContent = editingPlanet.type;
    document.getElementById('planet-desc').textContent = editingPlanet.desc;
    document.getElementById('s-pop').textContent = editingPlanet.pop || '—';
    document.getElementById('s-sys').textContent = editingPlanet.system || '—';
    document.getElementById('s-clim').textContent = editingPlanet.climate || '—';
    const govVal2 = editingPlanet.gov || '—';
    document.getElementById('s-gov-text').textContent = govVal2;
    document.getElementById('gov-info-btn').style.display = GOV_DESCS[govVal2] ? '' : 'none';
  }
}

function updateCheckboxUI() {
  document.querySelectorAll('.cb-item').forEach(item => {
    const prop = item.dataset.prop;
    const cb = item.querySelector('input[type="checkbox"]');
    if (editingPlanet && editingPlanet[prop]) {
      cb.checked = true;
      item.classList.add('active');
    } else {
      cb.checked = false;
      item.classList.remove('active');
    }
  });
}

function openEditor(p) {
  editingPlanet = p;
  document.getElementById('edit-name').value = p.name;
  document.getElementById('edit-type').value = p.type;
  document.getElementById('edit-desc').value = p.desc || '';
  document.getElementById('edit-diameter').value = p.radius * 2;
  document.getElementById('diameter-value').textContent = p.radius * 2;
  document.getElementById('edit-pop').value = p.pop || '';
  document.getElementById('edit-climate').value = p.climate || '';
  document.getElementById('edit-gov').value = p.gov || '';
  updateGovDesc(p.gov || '');
  document.getElementById('edit-system-row').value = p.system || '';
  document.getElementById('edit-color').value = p.color || '#4dc98a';
  document.getElementById('edit-color-text').value = p.color || '#4dc98a';
  document.getElementById('edit-glow').value = p.glow || '#2d8a5a';
  document.getElementById('edit-glow-text').value = p.glow || '#2d8a5a';

  updateCheckboxUI();

  // Facção Principal — populate dropdown and select current
  const fmSelect = document.getElementById('edit-faction-main');
  fmSelect.innerHTML = '<option value="">— Nenhuma —</option>';
  FACTIONS_POOL.forEach(f => {
    const opt = document.createElement('option');
    opt.value = f.n;
    opt.textContent = f.n;
    if (f.n === p.factionMain) opt.selected = true;
    fmSelect.appendChild(opt);
  });
  updateFactionMainDot(p.factionMain || '');

  // Facções Secundárias — popula dropdown
  const secSelect = document.getElementById('edit-faction-secondary-input');
  secSelect.innerHTML = '<option value="">— Selecionar facção —</option>';
  FACTIONS_POOL.forEach(f => {
    const opt = document.createElement('option');
    opt.value = f.n; opt.textContent = f.n;
    secSelect.appendChild(opt);
  });
  secSelect.value = '';
  renderFactionSecondaryList(p.factionSecondary || []);

  // POIs
  renderPoiEditList(p.poi || []);
  document.getElementById('edit-poi-input').value = '';

  const preview = document.getElementById('planet-image-preview');
  if (planetImages[p.id]) {
    preview.src = planetImages[p.id].src;
    preview.style.display = 'block';
  } else {
    preview.style.display = 'none';
  }

  document.getElementById('editor-panel').classList.add('open');
}

function getFactionColor(name) {
  const f = FACTIONS_POOL.find(f => f.n === name);
  return f ? f.c : null;
}

const GOV_DESCS = {
  'Democratic':          'Eleições a cada 10 anos. Não pode iniciar guerra sem apoio popular. Ganha +50% Influence (arredondado para cima).',
  'Oligarchic':          'Controlado por um pequeno grupo. Eleições a cada 20 anos, somente o grupo vota. Governadores têm maior importância e devem ser agradados.',
  'Dictatorial':         'Líder com poder absoluto. Sem eleições — novo líder vem do círculo interno após a morte do anterior. Ganho de Influence cortado à metade.',
  'Imperial':            'Governo por Rei ou Imperador. Sem eleições, sucessão por descendência. Não se preocupa com Influence, mas não pode ter Governadores.',
  'Machine Intelligence':'Criado por IAs. Segue estrutura oligárquica, mas todas as máquinas perseguem um único objetivo. ~70% da população sem consciência própria.',
  'Hive Mind':           'Uma única entidade controla todos. Nenhum indivíduo tem pensamento próprio — apenas executam os comandos da Hive Mind.',
};

function updateGovDesc(val) {
  const el = document.getElementById('gov-desc');
  if (GOV_DESCS[val]) {
    el.textContent = GOV_DESCS[val];
    el.style.display = '';
  } else {
    el.style.display = 'none';
  }
}

// ── Modal de Governo ──
document.getElementById('gov-info-btn').addEventListener('click', () => {
  const gov = document.getElementById('s-gov-text').textContent;
  if (!GOV_DESCS[gov]) return;
  document.getElementById('gov-modal-title').textContent = gov;
  document.getElementById('gov-modal-body').textContent = GOV_DESCS[gov];
  document.getElementById('gov-modal').style.display = 'flex';
});
document.getElementById('gov-modal-close').addEventListener('click', () => {
  document.getElementById('gov-modal').style.display = 'none';
});
document.getElementById('gov-modal').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) e.currentTarget.style.display = 'none';
});

function updateFactionMainDot(name) {
  const dot = document.getElementById('edit-faction-main-dot');
  const c = getFactionColor(name);
  dot.style.background = c || 'rgba(80,80,100,0.5)';
}

function renderFactionSecondaryList(list) {
  const container = document.getElementById('faction-secondary-list');
  container.innerHTML = (list || []).map((name, i) => {
    const c = getFactionColor(name);
    const dotStyle = c ? `background:${c}` : 'background:rgba(80,80,100,0.5)';
    return `<div class="faction-sec-row" data-idx="${i}">
      <span class="faction-sec-dot" style="${dotStyle}"></span>
      <span class="faction-sec-name">${name}</span>
      <button class="faction-sec-remove" data-idx="${i}">✕</button>
    </div>`;
  }).join('');
  container.querySelectorAll('.faction-sec-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!editingPlanet) return;
      const idx = parseInt(btn.dataset.idx);
      editingPlanet.factionSecondary = (editingPlanet.factionSecondary || []).filter((_, i) => i !== idx);
      renderFactionSecondaryList(editingPlanet.factionSecondary);
    });
  });
}

function renderPoiEditList(list) {
  const container = document.getElementById('poi-edit-list');
  container.innerHTML = (list || []).map((poi, i) =>
    `<div class="faction-sec-row" data-idx="${i}">
      <span class="faction-sec-name" style="flex:1">${poi}</span>
      <button class="faction-sec-remove" data-idx="${i}">✕</button>
    </div>`
  ).join('');
  container.querySelectorAll('.faction-sec-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!editingPlanet) return;
      const idx = parseInt(btn.dataset.idx);
      editingPlanet.poi = (editingPlanet.poi || []).filter((_, i) => i !== idx);
      renderPoiEditList(editingPlanet.poi);
      // Atualiza painel de detalhes se aberto
      if (selectedPlanet === editingPlanet) {
        document.getElementById('poi-list').innerHTML = (editingPlanet.poi || []).map(p =>
          `<div class="poi-item">${p}</div>`).join('');
      }
    });
  });
}

document.getElementById('editor-close').addEventListener('click', () => {
  document.getElementById('editor-panel').classList.remove('open');
  editingPlanet = null;
});

document.getElementById('btn-edit').addEventListener('click', () => {
  if (selectedPlanet) {
    openEditor(selectedPlanet);
  } else {
    alert('Selecione um planeta primeiro clicando nele!');
  }
});

// Todos os campos aplicam em tempo real
['edit-name', 'edit-type', 'edit-desc', 'edit-pop', 'edit-climate', 'edit-system-row'].forEach(id => {
  document.getElementById(id).addEventListener('input', syncEditorToModel);
});
document.getElementById('edit-type').addEventListener('change', syncEditorToModel);
document.getElementById('edit-gov').addEventListener('change', () => {
  syncEditorToModel();
  updateGovDesc(document.getElementById('edit-gov').value);
});

// Facção Principal
document.getElementById('edit-faction-main').addEventListener('change', (e) => {
  syncEditorToModel();
  updateFactionMainDot(e.target.value);
  buildFilters(); // refresh filter bar so new faction appears
});

// Adicionar facção secundária
document.getElementById('btn-add-faction-secondary').addEventListener('click', () => {
  if (!editingPlanet) return;
  const input = document.getElementById('edit-faction-secondary-input');
  const name = input.value.trim();
  if (!name) return;
  if (!editingPlanet.factionSecondary) editingPlanet.factionSecondary = [];
  if (!editingPlanet.factionSecondary.includes(name)) {
    editingPlanet.factionSecondary.push(name);
    renderFactionSecondaryList(editingPlanet.factionSecondary);
  }
  input.value = '';
});
// Select: ao mudar valor, adiciona automaticamente
document.getElementById('edit-faction-secondary-input').addEventListener('change', () => {
  document.getElementById('btn-add-faction-secondary').click();
});

// Adicionar POI
document.getElementById('btn-add-poi').addEventListener('click', () => {
  if (!editingPlanet) return;
  const input = document.getElementById('edit-poi-input');
  const name = input.value.trim();
  if (!name) return;
  if (!editingPlanet.poi) editingPlanet.poi = [];
  editingPlanet.poi.push(name);
  renderPoiEditList(editingPlanet.poi);
  if (selectedPlanet === editingPlanet) {
    document.getElementById('poi-list').innerHTML = (editingPlanet.poi || []).map(p =>
      `<div class="poi-item">${p}</div>`).join('');
  }
  input.value = '';
});
document.getElementById('edit-poi-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') document.getElementById('btn-add-poi').click();
});

document.getElementById('edit-diameter').addEventListener('input', (e) => {
  document.getElementById('diameter-value').textContent = e.target.value;
  syncEditorToModel();
});

// Color pickers em tempo real
['color', 'glow'].forEach(type => {
  const colorInput = document.getElementById(`edit-${type}`);
  const textInput = document.getElementById(`edit-${type}-text`);

  colorInput.addEventListener('input', () => {
    textInput.value = colorInput.value;
    syncEditorToModel();
  });

  textInput.addEventListener('input', () => {
    if (/^#[0-9A-Fa-f]{6}$/.test(textInput.value)) {
      colorInput.value = textInput.value;
      syncEditorToModel();
    }
  });
});

// Checkboxes visuais em tempo real
document.querySelectorAll('.cb-item').forEach(item => {
  item.addEventListener('click', (e) => {
    if (!editingPlanet) return;
    const prop = item.dataset.prop;
    const cb = item.querySelector('input[type="checkbox"]');
    // O click no label já togglou o checkbox
    editingPlanet[prop] = cb.checked;
    item.classList.toggle('active', cb.checked);
  });
});

// Upload de imagem PNG
document.getElementById('edit-image').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file && file.type === 'image/png') {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        if (editingPlanet) {
          planetImages[editingPlanet.id] = img;
          editingPlanet.image = true;
          document.getElementById('planet-image-preview').src = img.src;
          document.getElementById('planet-image-preview').style.display = 'block';
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  } else {
    alert('Por favor selecione um arquivo PNG!');
  }
});

// Botão de simulação orbital
document.getElementById('btn-factions').addEventListener('click', () => {
  showFactionClouds = !showFactionClouds;
  const btn = document.getElementById('btn-factions');
  btn.classList.toggle('active', showFactionClouds);
  const bar = document.getElementById('filterbar');
  bar.classList.toggle('visible', showFactionClouds);
  if (!showFactionClouds) {
    // Reset faction filter when closing
    activeFactionFilters.clear();
    buildFilters();
  }
});

document.getElementById('btn-sim').addEventListener('click', () => {
  simActive = !simActive;
  const btn = document.getElementById('btn-sim');
  if (simActive) {
    initOrbitalData(); // recalcula órbitas a partir das posições atuais
    btn.textContent = '⏸ Simulação';
    btn.classList.add('active');
  } else {
    btn.textContent = '▶ Simulação';
    btn.classList.remove('active');
  }
});

// Ao soltar um planeta durante a simulação, recalcula sua órbita
const origMouseUp = window.onmouseup;
window.addEventListener('mouseup', () => {
  if (simActive && draggedPlanet) {
    // Recalcula orbital data para o planeta que foi movido
    const cx = SOL_X * GW, cy = SOL_Y * GH;
    const dx = draggedPlanet.x * GW - cx;
    const dy = draggedPlanet.y * GH - cy;
    draggedPlanet.orbitRadius = Math.sqrt(dx * dx + dy * dy);
    draggedPlanet.orbitAngle = Math.atan2(dy, dx);
  }
});



/* ============================================================
   SISTEMA DE ÓRBITA
   ============================================================ */

// --- Utilitários de cor ---
function hexToRgb(hex) {
  const n = parseInt(hex.replace('#',''), 16);
  return [(n>>16)&255, (n>>8)&255, n&255];
}
function lightenColor(hex, amt) {
  const [r,g,b] = hexToRgb(hex);
  return `rgb(${Math.min(255,r+amt)},${Math.min(255,g+amt)},${Math.min(255,b+amt)})`;
}
function darkenColor(hex, amt) {
  const [r,g,b] = hexToRgb(hex);
  return `rgb(${Math.max(0,r-amt)},${Math.max(0,g-amt)},${Math.max(0,b-amt)})`;
}

// --- Estado da órbita ---
