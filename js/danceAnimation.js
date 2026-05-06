const DanceAnimation = (() => {
  let timer = 0;
  let playing = false;
  let finished = false;
  let callback = null;

  function start(cb) {
    timer = 0;
    playing = true;
    finished = false;
    callback = cb || null;
    Audio.stopMusic();
    Audio.playMusic('pardus');
    Audio.playMusic('pardus');
  }

  function update() {
    if (!playing || finished) return;
    timer++;
    if (timer > 300) {
      finished = true;
      playing = false;
      if (callback) callback();
    }
  }

  function draw(ctx, w, h) {
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, w, h);

    // title
    ctx.textAlign = 'center';
    ctx.shadowColor = '#f1c40f';
    ctx.shadowBlur = 15;
    ctx.fillStyle = '#f1c40f';
    ctx.font = 'bold 18px monospace';
    ctx.fillText('Музыкальная пауза —', w / 2, 60);
    ctx.fillText('это когда дроны не жужжат', w / 2, 85);
    ctx.shadowBlur = 0;

    // pardus image
    const pw = 160 * 2;
    const ph = 153 * 2;
    const px = (w - pw) / 2;
    const py = (h - ph) / 2 - 20;
    Sprites.draw(ctx, 'pardus', px, py, pw, ph);

    if (finished) {
      ctx.fillStyle = '#2ecc71';
      ctx.font = 'bold 16px monospace';
      ctx.fillText('ТЫ ГЕРОЙ!', w / 2, h - 50);
      ctx.font = '12px monospace';
      ctx.fillStyle = '#95a5a6';
      ctx.fillText('▶ коснись чтобы продолжить ◀', w / 2, h - 25);
    } else {
      const sec = Math.ceil((300 - timer) / 60);
      ctx.fillStyle = '#555';
      ctx.font = '10px monospace';
      ctx.fillText('▶ коснись или подожди ' + sec + 'c ◀', w / 2, h - 25);
    }
  }

  function isPlaying() { return playing; }
  function isFinished() { return finished; }
  function stop() { playing = false; finished = false; Audio.stopMusic(); }

  return { start, update, draw, isPlaying, isFinished, stop };
})();
