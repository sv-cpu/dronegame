const Player = (() => {
  const W = 30, H = 30;
  let x = 185, y = 568;
  let lives = 3;
  let invincible = 0;
  let shootCooldown = 0;
  const SHOOT_INTERVAL = 8;
  let animFrame = 0;
  let animTimer = 0;
  let shells = [];
  let scale = 2;

  function reset() {
    x = 185;
    y = 568;
    lives = 3;
    invincible = 0;
    shootCooldown = 0;
    animFrame = 0;
    animTimer = 0;
    shells = [];
  }

  function update() {
    if (Input.isActive()) {
      x = Input.getX() - W * scale / 2;
    }
    if (x < 0) x = 0;
    if (x > 400 - W * scale) x = 400 - W * scale;

    if (invincible > 0) invincible--;
    if (shootCooldown > 0) shootCooldown--;

    if (shootCooldown > 0 && Math.random() < 0.4) {
      shells.push({
        x: x + W * scale / 2 - 2 + (Math.random() - 0.5) * 4,
        y: y - 4,
        vx: (Math.random() - 0.5) * 2,
        vy: -1 - Math.random(),
        life: 25,
      });
    }

    for (let i = shells.length - 1; i >= 0; i--) {
      const s = shells[i];
      s.x += s.vx;
      s.y += s.vy;
      s.vy += 0.1;
      s.life--;
      if (s.life <= 0) shells.splice(i, 1);
    }

    animTimer++;
    if (animTimer > 8) { animTimer = 0; animFrame = (animFrame + 1) % 2; }
  }

  function getShoot() {
    if (shootCooldown <= 0) {
      shootCooldown = SHOOT_INTERVAL;
      return { x: x + W * scale / 2 - 2, y: y - 6 };
    }
    return null;
  }

  function hit() {
    if (invincible > 0) return false;
    lives--;
    invincible = 60;
    Audio.playerHit();
    Particle.spawn(x + W * scale / 2, y + H * scale / 2, '#c0392b', 8, 3);
    return lives <= 0;
  }

  function getRect() {
    return { x, y, w: W * scale, h: H * scale };
  }

  function draw(ctx) {
    if (invincible > 0 && (invincible % 6) < 3) return;
    Sprites.draw(ctx, 'player', x, y, W * scale, H * scale);

    shells.forEach(s => {
      ctx.fillStyle = '#b8860b';
      ctx.fillRect(s.x | 0, s.y | 0, 3, 2);
    });
  }

  function drawLives(ctx) {
    for (let i = 0; i < 3; i++) {
      const px = 10 + i * 20;
      const fill = i < lives ? '#c0392b' : '#444';
      ctx.fillStyle = fill;
      ctx.fillRect(px + 2, 24, 4, 2);
      ctx.fillRect(px, 26, 8, 2);
      ctx.fillRect(px, 28, 8, 2);
      ctx.fillRect(px + 1, 30, 6, 2);
      ctx.fillRect(px + 2, 32, 4, 2);
      ctx.fillRect(px + 3, 34, 2, 2);
    }
  }

  return { reset, update, getShoot, hit, getRect, draw, drawLives };
})();
