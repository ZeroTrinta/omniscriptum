/* ===== SOM GLOBAL — hover e click em todos os elementos clicáveis ===== */
(function() {
  // Seletores de tudo que é clicável
  const CLICKABLE = 'button, [role="button"], .filter-btn, .top-btn, .zoom-btn, .orbit-zoom-btn, .op-mil-block.clickable, .build-card, .sr-item, .tb-btn, #orbit-back, #btn-orbit, #close-btn, #editor-close, #gov-modal-close, #build-popup-close, .editor-btn, .cb-item, .faction-sec-remove, input[type="range"]';

  // Click: sons em qualquer clicável
  document.addEventListener('click', e => {
    const target = e.target.closest(CLICKABLE);
    if (target) playClick();
  }, true);

  // Hover: som no mouseenter de qualquer clicável
  document.addEventListener('mouseover', e => {
    const target = e.target.closest(CLICKABLE);
    if (!target || target === document._lastHoverTarget) return;
    document._lastHoverTarget = target;
    playHover();
  }, true);

  document.addEventListener('mouseout', e => {
    const target = e.target.closest(CLICKABLE);
    if (target && document._lastHoverTarget === target) {
      document._lastHoverTarget = null;
    }
  }, true);
})();


/* ==========================================================
   AUDIO SYSTEM
   ========================================================== */
let musicVolume = 0.6;
let sfxVolume   = 0.5;
let audioPanelOpen = false;

function initAudio() {
  const music = document.getElementById('bg-music');
  if (!music) return;
  music.volume = musicVolume;

  // Tentar iniciar imediatamente, senão aguarda primeira interação
  const tryPlay = () => {
    music.play().then(() => {
      console.log('Música iniciada.');
    }).catch(() => {
      // Navegador bloqueou — aguardar qualquer interação
      const startOnInteraction = () => {
        music.play().catch(() => {});
        document.removeEventListener('click', startOnInteraction);
        document.removeEventListener('keydown', startOnInteraction);
        document.removeEventListener('touchstart', startOnInteraction);
      };
      document.addEventListener('click', startOnInteraction);
      document.addEventListener('keydown', startOnInteraction);
      document.addEventListener('touchstart', startOnInteraction);
    });
  };
  tryPlay();

  // Botão de som
  const btn = document.getElementById('audio-btn');
  const panel = document.getElementById('audio-panel');

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    audioPanelOpen = !audioPanelOpen;
    panel.classList.toggle('open', audioPanelOpen);
    // Toggle mute no clique direto (sem arrastar)
  });

  // Fechar painel ao clicar fora
  document.addEventListener('click', () => {
    audioPanelOpen = false;
    panel.classList.remove('open');
  });
  panel.addEventListener('click', e => e.stopPropagation());

  // Aplicar volume inicial
  music.volume = musicVolume;
  document.getElementById('music-vol').value = musicVolume * 100;
  document.getElementById('music-val').textContent = Math.round(musicVolume * 100) + '%';
  document.getElementById('sfx-vol').value = sfxVolume * 100;
  document.getElementById('sfx-val').textContent = Math.round(sfxVolume * 100) + '%';

  // Slider de música
  const musicSlider = document.getElementById('music-vol');
  const musicVal    = document.getElementById('music-val');
  musicSlider.addEventListener('input', () => {
    musicVolume = musicSlider.value / 100;
    music.volume = musicVolume;
    musicVal.textContent = musicSlider.value + '%';
    btn.textContent = musicVolume === 0 ? '♪̶' : '♪';
    btn.classList.toggle('muted', musicVolume === 0);
  });

  // Slider de efeitos
  const sfxSlider = document.getElementById('sfx-vol');
  const sfxVal    = document.getElementById('sfx-val');
  sfxSlider.addEventListener('input', () => {
    sfxVolume = sfxSlider.value / 100;
    sfxVal.textContent = sfxSlider.value + '%';
  });
}

// Sobrescrever playHover e playClick para usar sfxVolume dinâmico
const _origPlayHover = window.playHover;
const _origPlayClick = window.playClick;

function playHover() {
  const audio = document.getElementById('sfx-hover');
  if (audio) { audio.currentTime = 0; audio.volume = sfxVolume * 0.8; audio.play().catch(() => {}); }
}
function playClick() {
  const audio = document.getElementById('sfx-click');
  if (audio) { audio.currentTime = 0; audio.volume = sfxVolume; audio.play().catch(() => {}); }
}
