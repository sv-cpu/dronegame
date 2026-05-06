const Input = (() => {
  let touchX = 200;
  let active = false;
  let tap = false;
  let keyLeft = false;
  let keyRight = false;
  let kbX = 200;
  let touchStartTime = 0;
  let touchStartX = 0;
  let dodge = false;

  function init(canvas) {
    canvas.addEventListener('touchstart', e => {
      e.preventDefault();
      const t = e.touches[0];
      touchX = t.clientX;
      active = true;
      tap = true;
      dodge = false;
      touchStartTime = Date.now();
      touchStartX = t.clientX;
      Audio.resumeCtx();
    }, { passive: false });
    canvas.addEventListener('touchmove', e => {
      e.preventDefault();
      const t = e.touches[0];
      touchX = t.clientX;
    }, { passive: false });
    canvas.addEventListener('touchend', e => {
      e.preventDefault();
      const dt = Date.now() - touchStartTime;
      const dx = Math.abs(touchX - touchStartX);
      if (dt < 180 && dx < 15) dodge = true;
      active = false;
    }, { passive: false });
    canvas.addEventListener('touchcancel', e => {
      active = false;
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keyLeft = true;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keyRight = true;
      Audio.resumeCtx();
      e.preventDefault();
    });
    document.addEventListener('keyup', e => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keyLeft = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keyRight = false;
    });

    canvas.addEventListener('mousedown', e => {
      touchX = e.clientX;
      active = true;
      tap = true;
      Audio.resumeCtx();
    });
    canvas.addEventListener('mousemove', e => {
      if (active) touchX = e.clientX;
    });
    canvas.addEventListener('mouseup', () => { active = false; });
  }

  function updateKb() {
    if (keyLeft) kbX = Math.max(0, kbX - 4);
    if (keyRight) kbX = Math.min(400, kbX + 4);
  }

  return {
    init,
    updateKb,
    getX() {
      if (keyLeft || keyRight) return kbX;
      const rect = document.getElementById('gameCanvas').getBoundingClientRect();
      if (!rect.width) return 200;
      const scaleX = 400 / rect.width;
      return Math.max(0, Math.min(400, (touchX - rect.left) * scaleX));
    },
    isActive() { return active || keyLeft || keyRight; },
    consumeTap() { const v = tap; tap = false; return v; },
    isDodge() { const v = dodge; dodge = false; return v; },
    get touchX() { return touchX; },
  };
})();