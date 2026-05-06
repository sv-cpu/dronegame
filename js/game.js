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
  let interludeAutoDone = false;

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

  function resetGame() {
    levelIndex = 0;
    bossStage = false;
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
    while (Input.consumeTap()) {}  // clear buffered taps from gameplay
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

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  function update() {
    Input.updateKb();

    if (state === 'title') {
      if (Input.consumeTap()) startLevel(0);
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

    // Interlude states - only advance on tap
    if (state.startsWith('interlude')) {
      if (Input.consumeTap()) {
        interludeTimer = 0;
        if (state === 'interlude_1') startLevel(1);
        else if (state === 'interlude_2') startLevel(2);
        else if (state === 'interlude_3') startBoss();
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
    Enemy.update();

    const shot = Player.getShoot();
    if (shot) { bullets.push({ x: shot.x, y: shot.y, vy: -6 }); Audio.shoot(); }

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
          Enemy.hit(ei);
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

    if (state === 'title') { ScreenManager.drawTitle(ctx, W, H); return; }

    if (state === 'gameover') {
      drawLevelBackground();
      if (bossStage) Boss.draw(ctx);
      ScreenManager.drawGameOver(ctx, W, H);
      return;
    }

    // Interlude draws over game background
    if (state.startsWith('interlude')) {
      drawLevelBackground();
      const text = INTERLUDE_TEXTS[state] || '';
      ScreenManager.drawInterlude(ctx, W, H, text, null, interludeTimer);
      return;
    }

    if (state === 'victory') {
      DanceAnimation.draw(ctx, W, H);
      return;
    }

    drawLevelBackground();

    if (bossStage) Boss.draw(ctx);
    Enemy.draw(ctx);
    Player.draw(ctx);

    ctx.fillStyle = '#f1c40f';
    bullets.forEach(b => ctx.fillRect(b.x, b.y, 4, 8));

    // HUD
    if (bossStage) {
      ctx.fillStyle = '#e74c3c';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('БОСС', 10, 14);
      Player.drawLives(ctx);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#fff';
      ctx.font = '10px monospace';
      ctx.fillText('HP: ' + Math.max(0, Boss.hp) + '/30', W - 10, 14);
      ctx.textAlign = 'left';
    } else {
      const lvl = Levels.getLevel(levelIndex);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px monospace';
      ctx.fillText((lvl ? lvl.name : ''), 10, 14);
      Player.drawLives(ctx);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#95a5a6';
      ctx.font = '9px monospace';
      ctx.fillText((levelProgress * 100 | 0) + '%', W - 10, 14);
      ctx.textAlign = 'left';
    }
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
