const Audio = (() => {
  let ctx = null;
  let musicEl = null;
  let musicId = null;

  function getCtx() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return ctx;
  }

  function playNote(freq, duration, type, gainVal) {
    const c = getCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type || 'square';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(gainVal || 0.15, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + duration);
  }

  function sfx(type, freq, duration) {
    const c = getCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, c.currentTime);
    if (type === 'sawtooth' || type === 'square') {
      osc.frequency.exponentialRampToValueAtTime(freq * 0.5, c.currentTime + duration);
    }
    gain.gain.setValueAtTime(0.12, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + duration);
  }

  function playMusic(id) {
    stopMusic();
    if (!id) return;
    const url = 'assets/music/' + id + '.mp3';
    const el = document.createElement('audio');
    el.loop = true;
    el.preload = 'auto';
    el.src = url;
    el.volume = 0.5;
    el.play().catch(() => {});
    musicEl = el;
    musicId = id;
  }

  function stopMusic() {
    if (musicEl) {
      musicEl.pause();
      musicEl.src = '';
      musicEl = null;
    }
    musicId = null;
  }

  return {
    shoot() { sfx('square', 880, 0.08); },
    hit() { sfx('sawtooth', 220, 0.15); },
    explode() { sfx('sawtooth', 110, 0.25); },
    playerHit() { sfx('square', 180, 0.3); },
    bossHit() { sfx('sawtooth', 150, 0.2); },
    win() {
      playNote(523, 0.2, 'square', 0.15);
      setTimeout(() => playNote(659, 0.2, 'square', 0.15), 120);
      setTimeout(() => playNote(784, 0.2, 'square', 0.15), 240);
      setTimeout(() => playNote(1047, 0.3, 'square', 0.15), 360);
    },
    lose() {
      playNote(400, 0.3, 'sawtooth', 0.1);
      setTimeout(() => playNote(350, 0.3, 'sawtooth', 0.1), 150);
      setTimeout(() => playNote(300, 0.3, 'sawtooth', 0.1), 300);
      setTimeout(() => playNote(200, 0.4, 'sawtooth', 0.1), 450);
    },
    playMusic,
    stopMusic,
    resumeCtx() {
      const c = getCtx();
      if (c.state === 'suspended') c.resume();
    }
  };
})();
