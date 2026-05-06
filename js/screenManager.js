const ScreenManager = (() => {
  let blinkTimer = 0;
  let showText = true;
  let transitionAlpha = 0;
  let transitioning = false;
  let transitionCallback = null;

  function drawTitle(ctx, w, h) {
    const grd = ctx.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0, '#0a0a2a');
    grd.addColorStop(0.5, '#1a0a3a');
    grd.addColorStop(1, '#0a0a2a');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < 3; i++) {
      const dx = 80 + i * 130;
      const dy = 160 + Math.sin(Date.now() / 1000 + i * 2) * 20;
      ctx.fillStyle = i === 1 ? '#c0392b' : '#6b6b6b';
      ctx.fillRect(dx, dy, 20, 8);
      ctx.fillStyle = '#2a2a2a';
      ctx.fillRect(dx - 3, dy + 3, 6, 3);
      ctx.fillRect(dx + 17, dy + 3, 6, 3);
    }

    ctx.textAlign = 'center';
    ctx.shadowColor = '#f1c40f';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#f1c40f';
    ctx.font = 'bold 32px monospace';
    ctx.fillText('ВОЙНА', w / 2, 150);
    ctx.fillStyle = '#c0392b';
    ctx.font = 'bold 28px monospace';
    ctx.fillText('ДРОНОВ', w / 2, 190);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#7f8c8d';
    ctx.font = '12px monospace';
    ctx.fillText('отражай атаки дронов', w / 2, 220);
    ctx.fillText('пройди 3 уровня и уничтожь босса!', w / 2, 238);

    ctx.fillStyle = '#95a5a6';
    ctx.font = '10px monospace';
    ctx.fillText('двигай пальцем по экрану', w / 2, 270);

    ctx.fillStyle = '#f1c40f';
    ctx.font = 'bold 14px monospace';
    ctx.fillText('Шорох, поступила боевая задача', w / 2, 330);
    ctx.fillText('доставить груз на позицию.', w / 2, 350);

    blinkTimer++;
    if (blinkTimer > 30) { blinkTimer = 0; showText = !showText; }
    if (showText) {
      ctx.fillStyle = '#2ecc71';
      ctx.font = 'bold 14px monospace';
      ctx.fillText('▶ коснись чтобы начать ◀', w / 2, 390);
    }

    const fx = 164, fy = 430, fw = 72, fh = 36;
    const stripeH = fh / 3;
    const wave = Date.now() / 400;
    ctx.fillStyle = '#ffffff';
    for (let x = 0; x < fw; x++) {
      ctx.fillRect(fx + x, fy + Math.sin((x + wave) * 0.3) * 2, 1, stripeH);
    }
    ctx.fillStyle = '#0039a6';
    for (let x = 0; x < fw; x++) {
      ctx.fillRect(fx + x, fy + stripeH + Math.sin((x + wave) * 0.3) * 2, 1, stripeH);
    }
    ctx.fillStyle = '#d52b1e';
    for (let x = 0; x < fw; x++) {
      ctx.fillRect(fx + x, fy + stripeH * 2 + Math.sin((x + wave) * 0.3) * 2, 1, stripeH);
    }

    ctx.fillStyle = '#555';
    ctx.font = '9px monospace';
    ctx.fillText('[A/D или ← →] стрельба авто', w / 2, fy + fh + 25);
  }

  function drawInterlude(ctx, w, h, text) {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, w, h);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f1c40f';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('Шорох,', w / 2, h / 2 - 60);
    ctx.fillStyle = '#ecf0f1';
    ctx.font = 'bold 14px monospace';
    const lines = text.split('\n');
    lines.forEach((line, i) => ctx.fillText(line, w / 2, h / 2 - 30 + i * 24));
    ctx.fillStyle = '#2ecc71';
    ctx.font = 'bold 14px monospace';
    ctx.fillText('▶ коснись чтобы продолжить ◀', w / 2, h - 40);
  }

  function drawPause(ctx, w, h) {
    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    ctx.fillRect(0, 0, w, h);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f1c40f';
    ctx.font = 'bold 24px monospace';
    ctx.fillText('ПАУЗА', w / 2, h / 2 - 60);
    ctx.fillStyle = '#ecf0f1';
    ctx.font = '14px monospace';
    ctx.fillText('Громкость музыки', w / 2, h / 2 - 15);

    const vol = Audio.getVolume ? Audio.getVolume() : 0.5;
    const barW = 150;
    const barX = (w - barW) / 2;
    const barY = h / 2 + 5;
    ctx.fillStyle = '#555';
    ctx.fillRect(barX, barY, barW, 10);
    ctx.fillStyle = '#2ecc71';
    ctx.fillRect(barX, barY, barW * vol, 10);
    ctx.fillStyle = '#fff';
    ctx.font = '10px monospace';
    ctx.fillText('-', barX - 15, barY + 9);
    ctx.fillText('+', barX + barW + 8, barY + 9);

    blinkTimer++;
    if (blinkTimer > 30) { blinkTimer = 0; showText = !showText; }
    if (showText) {
      ctx.fillStyle = '#2ecc71';
      ctx.font = 'bold 14px monospace';
      ctx.fillText('▶ ПРОДОЛЖИТЬ ◀', w / 2, h / 2 + 55);
    }
  }

  function startTransition(cb) {
    transitionAlpha = 0;
    transitioning = true;
    transitionCallback = cb;
  }

  function updateTransition() {
    if (!transitioning) return false;
    transitionAlpha += 0.05;
    if (transitionAlpha >= 1) {
      if (transitionCallback) transitionCallback();
    }
    if (transitionAlpha >= 2) {
      transitioning = false;
      transitionAlpha = 0;
      return true;
    }
    return false;
  }

  function drawTransition(ctx, w, h) {
    if (!transitioning && transitionAlpha === 0) return;
    const alpha = transitionAlpha > 1 ? 2 - transitionAlpha : transitionAlpha;
    ctx.fillStyle = 'rgba(0,0,0,' + alpha + ')';
    ctx.fillRect(0, 0, w, h);
  }

  function drawGameOver(ctx, w, h, score) {
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(0, 0, w, h);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#c0392b';
    ctx.font = 'bold 28px monospace';
    ctx.fillText('ПРОИГРЫШ', w / 2, h / 2 - 50);
    ctx.fillStyle = '#bdc3c7';
    ctx.font = '14px monospace';
    ctx.fillText('Все жизни потеряны...', w / 2, h / 2);
    if (score > 0) {
      ctx.fillStyle = '#f1c40f';
      ctx.font = '12px monospace';
      ctx.fillText('Сбито дронов: ' + score, w / 2, h / 2 + 30);
    }
    blinkTimer++;
    if (blinkTimer > 30) { blinkTimer = 0; showText = !showText; }
    if (showText) {
      ctx.fillStyle = '#f1c40f';
      ctx.font = 'bold 16px monospace';
      ctx.fillText('▶ НАЧАТЬ ЗАНОВО ◀', w / 2, h / 2 + 70);
    }
  }

  function drawLevelWin(ctx, w, h, levelName, score) {
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(0, 0, w, h);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#2ecc71';
    ctx.font = 'bold 24px monospace';
    ctx.fillText('УРОВЕНЬ ПРОЙДЕН!', w / 2, h / 2 - 40);
    ctx.fillStyle = '#f1c40f';
    ctx.font = '16px monospace';
    ctx.fillText(levelName, w / 2, h / 2);
    if (score > 0) {
      ctx.fillStyle = '#fff';
      ctx.font = '12px monospace';
      ctx.fillText('Сбито дронов: ' + score, w / 2, h / 2 + 30);
    }
    blinkTimer++;
    if (blinkTimer > 30) { blinkTimer = 0; showText = !showText; }
    if (showText) {
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px monospace';
      ctx.fillText('▶ ДАЛЕЕ ◀', w / 2, h / 2 + 60);
    }
  }

  return { drawTitle, drawInterlude, drawPause, drawGameOver, drawLevelWin,
    startTransition, updateTransition, drawTransition };
})();
