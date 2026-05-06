const Game = (() => {
  let canvas, ctx;
  const W = 400, H = 700;
  let state = 'title';
  let levelIndex = 0;
  let bullets = [];
  let bossStage = false;
  let levelProgress = 0;
  let levelTimer = 0;
  let bossBulletHitCooldown = 0;
  let bossDefeatTimer = 0;
  let interludeTimer = 0;
  let score = 0;
  let shakeTimer = 0;
  let shakeX = 0;
  let shakeY = 0;
  let paused = false;

  const INTERLUDE_TEXTS = {
    interlude_1: 'неплохо, но впереди еще\nопасный путь.\nСмени памперс и вперед!',
    interlude_2: 'памперсы кончились,\nдуй дальше как есть.',
    interlude_3: 'все триста, ты остался один,\nвся надежда на тебя.',
    interlude_boss: 'ты молодец! Киев наш!\nВперед на Варшаву!',
  };

  function init() {
    canvas = document.getElementById('gameCanvas');
    canvas.width = W;
    canvas.height = H;
    ctx = canvas.getContext('2d');
    Input.init(canvas);

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        if (state === 'playing' || state === 'boss') togglePause();
      }
    });

    const scr = 'assets/sprites/';
    Promise.all([
      Sprites.load('player', scr + 'player.png'),
      Sprites.load('drone_small', scr + 'drones%20(1).png'),
      Sprites.load('drone_med', scr + 'drones%202.png'),
      Sprites.load('boss', scr + 'boss.png'),
      Sprites.load('pardus', scr + 'pardus.png'),
    ]).then(() => {
      Audio.playMusic('start');
      state = 'title';
      resetGame();
      loop();
    });
  }

  function togglePause() {
    if (paused) {
      paused = false;
    } else {
      paused = true;
    }
  }

  function resetGame() {
    levelIndex = 0;
    bossStage = false;
    score = 0;
    Player.reset();
    Enemy.reset();
    Boss.reset();
    bullets = [];
    levelProgress = 0;
    levelTimer = 0;
    Enemy.setDifficulty(0);
    Audio.stopMusic();
    Particle.clear();
  }

  function startLevel(n) {
    levelIndex = n;
    bossStage = false;
    Player.reset();
    Enemy.reset();
    Boss.reset();
    bullets = [];
    levelProgress = 0;
    levelTimer = 0;
    Enemy.setDifficulty(n);
    const lvl = Levels.getLevel(n);
    if (lvl) {
      Audio.playMusic(lvl.music);
      Particle.clear();
      if (lvl.snow) Particle.spawnSnowflakes(30, W, H);
      if (lvl.leaves) Particle.spawnLeaves(20, W, H);
      if (lvl.sand) Particle.spawnSand(25, W, H);
    }
    state = 'playing';
  }

  function startInterlude(id) {
    state = id;
    while (Input.consumeTap()) {}
    interludeTimer = 0;
  }

  function startBoss() {
    bossStage = true;
    Boss.start();
    Enemy.reset();
    bullets = [];
    Player.reset();
    Particle.clear();
    Audio.stopMusic();
    Audio.playMusic('boss');
    state = 'boss';
  }

  function triggerShake(duration) {
    shakeTimer = duration || 10;
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  function update() {
    Input.updateKb();

    if (state === 'title') {
      if (Input.consumeTap()) {
        ScreenManager.startTransition(() => startLevel(0));
      }
      return;
    }

    if (state === 'gameover') {
      if (Input.consumeTap()) {
        resetGame();
        Audio.playMusic('start');
        state = 'title';
      }
      return;
    }

    if (state.startsWith('interlude')) {
      if (Input.consumeTap()) {
        interludeTimer = 0;
        if (state === 'interlude_1') ScreenManager.startTransition(() => startLevel(1));
        else if (state === 'interlude_2') ScreenManager.startTransition(() => startLevel(2));
        else if (state === 'interlude_3') ScreenManager.startTransition(() => startBoss());
        else if (state === 'interlude_boss') {
          state = 'victory';
          DanceAnimation.start(() => {});
        }
      }
      return;
    }

    if (state === 'victory') {
      DanceAnimation.update();
      if (DanceAnimation.isFinished() && Input.consumeTap()) {
        resetGame();
        Audio.playMusic('start');
        state = 'title';
      }
      return;
    }

    // Pause overlay
    if (paused) {
      if (Input.consumeTap()) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = 400 / rect.width;
        const tx = (Input.touchX || 200 - rect.left) * scaleX;
        const barX = (W - 150) / 2;
        const barY = H / 2 + 5;
        // volume slider
        if (tx > barX && tx < barX + 150) {
          const vol = (tx - barX) / 150;
          Audio.setVolume(vol);
        }
      }
      if (Input.isDodge && Input.isDodge()) togglePause();
      return;
    }

    // Dodge on tap during gameplay
    if (Input.consumeTap()) Player.triggerDodge();

    // update shake
    if (shakeTimer > 0) {
      shakeTimer--;
      shakeX = (Math.random() - 0.5) * 6;
      shakeY = (Math.random() - 0.5) * 6;
    } else {
      shakeX = 0;
      shakeY = 0;
    }

    // boss stage
    if (bossStage) {
      Boss.update();

      if (Boss.defeated) {
        bossDefeatTimer++;
        if (bossDefeatTimer === 1) {
          Audio.stopMusic();
          Audio.win();
        }
        if (bossDefeatTimer > 50) {
          while (Input.consumeTap()) {}
          startInterlude('interlude_boss');
          bossDefeatTimer = 0;
        }
        Player.update();
        Particle.update();
        return;
      }

      if (bossBulletHitCooldown > 0) bossBulletHitCooldown--;
      const pRect = Player.getRect();
      const bBullets = Boss.getBullets();
      for (let i = bBullets.length - 1; i >= 0; i--) {
        const b = bBullets[i];
        if (bossBulletHitCooldown <= 0 &&
            b.x < pRect.x + pRect.w && b.x + 5 > pRect.x &&
            b.y < pRect.y + pRect.h && b.y + 10 > pRect.y) {
          bossBulletHitCooldown = 20;
          const dead = Player.hit();
          triggerShake(10);
          bBullets.splice(i, 1);
          if (dead) { Audio.lose(); Audio.stopMusic(); state = 'gameover'; return; }
        }
      }

      const bossRect = Boss.getRect();
      for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        if (b.x < bossRect.x + bossRect.w && b.x + 4 > bossRect.x &&
            b.y < bossRect.y + bossRect.h && b.y + 4 > bossRect.y) {
          Boss.takeDamage();
          bullets.splice(i, 1);
        }
      }

      Player.update();
      const shot = Player.getShoot();
      if (shot) { bullets.push({ x: shot.x, y: shot.y, vy: -7 }); Audio.shoot(); }
      for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y += bullets[i].vy;
        if (bullets[i].y < -10) bullets.splice(i, 1);
      }
      Particle.update();
      return;
    }

    // normal level
    Player.update();
    Enemy.update(levelProgress);

    const shot = Player.getShoot();
    if (shot) { bullets.push({ x: shot.x, y: shot.y, vy: -7 }); Audio.shoot(); }

    for (let i = bullets.length - 1; i >= 0; i--) {
      bullets[i].y += bullets[i].vy;
      if (bullets[i].y < -10) bullets.splice(i, 1);
    }

    const enemies = Enemy.getList();
    for (let ei = enemies.length - 1; ei >= 0; ei--) {
      const e = enemies[ei];
      for (let bi = bullets.length - 1; bi >= 0; bi--) {
        const b = bullets[bi];
        if (b.x < e.x + e.w && b.x + 4 > e.x &&
            b.y < e.y + e.h && b.y + 4 > e.y) {
          bullets.splice(bi, 1);
          if (Enemy.hit(ei)) score++;
          break;
        }
      }
    }

    const pRect = Player.getRect();
    for (let ei = enemies.length - 1; ei >= 0; ei--) {
      const e = enemies[ei];
      if (e.x < pRect.x + pRect.w && e.x + e.w > pRect.x &&
          e.y < pRect.y + pRect.h && e.y + e.h > pRect.y) {
        Enemy.remove(ei);
        const dead = Player.hit();
        triggerShake(10);
        if (dead) { Audio.lose(); Audio.stopMusic(); state = 'gameover'; return; }
      }
    }

    Particle.update();
    const lvl = Levels.getLevel(levelIndex);
    if (lvl) {
      if (lvl.snow) Particle.spawnSnowflakes(1, W, H);
      if (lvl.leaves) Particle.spawnLeaves(1, W, H);
      if (lvl.sand) Particle.spawnSand(1, W, H);
    }

    levelTimer++;
    levelProgress = Math.min(1, levelTimer / 1800);

    if (levelTimer > 2000) {
      Audio.stopMusic();
      Audio.win();
      if (levelIndex === 0) startInterlude('interlude_1');
      else if (levelIndex === 1) startInterlude('interlude_2');
      else if (levelIndex === 2) startInterlude('interlude_3');
      else state = 'levelwin';
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // screen shake
    if (shakeTimer > 0) {
      ctx.save();
      ctx.translate(shakeX, shakeY);
    }

    if (state === 'title') { ScreenManager.drawTitle(ctx, W, H); shakeRestore(); return; }

    if (state === 'gameover') {
      drawLevelBackground();
      if (bossStage) Boss.draw(ctx);
      ScreenManager.drawGameOver(ctx, W, H, score);
      shakeRestore(); return;
    }

    if (state.startsWith('interlude')) {
      drawLevelBackground();
      const text = INTERLUDE_TEXTS[state] || '';
      ScreenManager.drawInterlude(ctx, W, H, text);
      shakeRestore(); return;
    }

    if (state === 'victory') {
      DanceAnimation.draw(ctx, W, H);
      shakeRestore(); return;
    }

    drawLevelBackground();

    if (bossStage) Boss.draw(ctx);
    Enemy.draw(ctx);
    Player.draw(ctx);

    ctx.fillStyle = '#f1c40f';
    bullets.forEach(b => ctx.fillRect(b.x, b.y, 4, 8));

    // HUD
    if (bossStage) {
      ctx.fillStyle = '#c0392b';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('БОСС', 10, 14);
      ctx.fillStyle = '#f1c40f';
      ctx.font = '9px monospace';
      ctx.fillText('' + score, 10, 50);
      Player.drawLives(ctx);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#fff';
      ctx.font = '10px monospace';
      ctx.fillText('HP: ' + Math.max(0, Boss.hp) + '/30', W - 10, 14);
      ctx.textAlign = 'left';
      if (Boss.isRage && Boss.isRage()) {
        ctx.fillStyle = '#ff6b6b';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('⚠ ЯРОСТЬ ⚠', W / 2, 30);
        ctx.textAlign = 'left';
      }
    } else {
      const lvl = Levels.getLevel(levelIndex);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px monospace';
      ctx.fillText((lvl ? lvl.name : ''), 10, 14);
      ctx.fillStyle = '#f1c40f';
      ctx.font = '9px monospace';
      ctx.fillText('' + score, 10, 50);
      Player.drawLives(ctx);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#95a5a6';
      ctx.font = '9px monospace';
      ctx.fillText((levelProgress * 100 | 0) + '%', W - 10, 14);
      ctx.textAlign = 'left';
    }

    // Pause overlay
    if (paused) {
      ScreenManager.drawPause(ctx, W, H);
    }

    // Transition overlay
    ScreenManager.drawTransition(ctx, W, H);

    shakeRestore();
  }

  function shakeRestore() {
    if (shakeTimer > 0) ctx.restore();
  }

  function drawLevelBackground() {
    if (bossStage) {
      ctx.fillStyle = '#1a1a2a';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#2a2a3a';
      ctx.fillRect(0, H - 80, W, 80);
      ctx.fillStyle = '#3a3a4a';
      for (let i = 0; i < W; i += 15) ctx.fillRect(i, H - 82, 8, 3);
      return;
    }
    const lvl = Levels.getLevel(levelIndex);
    if (!lvl) return;

    const grd = ctx.createLinearGradient(0, 0, 0, H);
    grd.addColorStop(0, lvl.bgTop);
    grd.addColorStop(1, lvl.bgBot);
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = lvl.groundColor;
    ctx.fillRect(0, H - 80, W, 80);
    ctx.fillStyle = lvl.groundLine;
    ctx.fillRect(0, H - 82, W, 3);

    lvl.decor(ctx, W, H);
    Particle.draw(ctx);
  }

  return { init };
})();
