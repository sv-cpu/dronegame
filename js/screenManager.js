const ScreenManager = (() => {
  let blinkTimer = 0;
  let showText = true;

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
      ctx.fillStyle = i === 1 ? PALETTE.red : PALETTE.grey;
      ctx.fillRect(dx, dy, 20, 8);
      ctx.fillStyle = PALETTE.dark;
      ctx.fillRect(dx - 3, dy + 3, 6, 3);
      ctx.fillRect(dx + 17, dy + 3, 6, 3);
    }

    ctx.textAlign = 'center';
    ctx.shadowColor = '#f1c40f';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#f1c40f';
    ctx.font = 'bold 32px monospace';
    ctx.fillText('ВОЙНА', w / 2, 150);
    ctx.fillStyle = '#e74c3c';
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

    // Mission text
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

    // Russian flag
    const fx = 164, fy = 430, fw = 72, fh = 36;
    const stripeH = fh / 3;
    const wave = Date.now() / 400;

    ctx.fillStyle = '#ffffff';
    for (let x = 0; x < fw; x++) {
      const offset = Math.sin((x + wave) * 0.3) * 2;
      ctx.fillRect(fx + x, fy + offset, 1, stripeH);
    }
    ctx.fillStyle = '#0039a6';
    for (let x = 0; x < fw; x++) {
      const offset = Math.sin((x + wave) * 0.3) * 2;
      ctx.fillRect(fx + x, fy + stripeH + offset, 1, stripeH);
    }
    ctx.fillStyle = '#d52b1e';
    for (let x = 0; x < fw; x++) {
      const offset = Math.sin((x + wave) * 0.3) * 2;
      ctx.fillRect(fx + x, fy + stripeH * 2 + offset, 1, stripeH);
    }

    ctx.fillStyle = '#555';
    ctx.font = '9px monospace';
    ctx.fillText('[A/D или ← →] стрельба авто', w / 2, fy + fh + 25);
  }

  function drawInterlude(ctx, w, h, text, callback, timer) {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, w, h);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#f1c40f';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('Шорох,', w / 2, h / 2 - 60);
    ctx.fillStyle = '#ecf0f1';
    ctx.font = 'bold 14px monospace';

    const lines = text.split('\n');
    lines.forEach((line, i) => {
      ctx.fillText(line, w / 2, h / 2 - 30 + i * 24);
    });

    if (timer < 300) {
      const sec = Math.ceil((300 - timer) / 60);
      ctx.fillStyle = '#555';
      ctx.font = '10px monospace';
      ctx.fillText('▶ коснись или подожди ' + sec + 'c ◀', w / 2, h - 40);
    } else {
      blinkTimer++;
      if (blinkTimer > 30) { blinkTimer = 0; showText = !showText; }
      if (showText) {
        ctx.fillStyle = '#2ecc71';
        ctx.font = 'bold 14px monospace';
        ctx.fillText('▶ коснись чтобы продолжить ◀', w / 2, h - 40);
      }
    }
  }

  function drawGameOver(ctx, w, h) {
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(0, 0, w, h);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#e74c3c';
    ctx.font = 'bold 28px monospace';
    ctx.fillText('ПРОИГРЫШ', w / 2, h / 2 - 40);
    ctx.fillStyle = '#bdc3c7';
    ctx.font = '14px monospace';
    ctx.fillText('Все жизни потеряны...', w / 2, h / 2 + 10);
    blinkTimer++;
    if (blinkTimer > 30) { blinkTimer = 0; showText = !showText; }
    if (showText) {
      ctx.fillStyle = '#f1c40f';
      ctx.font = 'bold 16px monospace';
      ctx.fillText('▶ НАЧАТЬ ЗАНОВО ◀', w / 2, h / 2 + 60);
    }
  }

  function drawLevelWin(ctx, w, h, levelName) {
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(0, 0, w, h);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#2ecc71';
    ctx.font = 'bold 24px monospace';
    ctx.fillText('УРОВЕНЬ ПРОЙДЕН!', w / 2, h / 2 - 30);
    ctx.fillStyle = '#f1c40f';
    ctx.font = '16px monospace';
    ctx.fillText(levelName, w / 2, h / 2 + 10);
    blinkTimer++;
    if (blinkTimer > 30) { blinkTimer = 0; showText = !showText; }
    if (showText) {
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px monospace';
      ctx.fillText('▶ ДАЛЕЕ ◀', w / 2, h / 2 + 55);
    }
  }

  return { drawTitle, drawInterlude, drawGameOver, drawLevelWin };
})();
