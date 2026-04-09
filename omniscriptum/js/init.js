/* ===== INIT ===== */
window.addEventListener('resize', resize);
resize();
buildFilters();
requestAnimationFrame(draw);
initAudio();
waitForFB(() => {
  runInitialLoading().then(() => initAuth());
});
