const Boss = (() => {
  const W = 64, H = 64;
  const SCALE = 1.5;
  let x = 200, y = -60;
  let hp = 30;
  let maxHp = 30;
  let active = false;
  let phase = 0;
  let enterProgress = 0;
  let attackTimer = 0;
  let burstCount = 0;
  let burstTimer = 0;
  let bullets = [];
  let deathTimer = 0;
  let defeated = false;

  function reset() {
    x = 200; y = -60;
    hp = 30; maxHp = 30;
    active = false;
    phase = 0;
    enterProgress = 0;
    attackTimer = 0;
    burstCount = 0;
    burstTimer = 0;
    bullets = [];
    deathTimer = 0;
    defeated = false;
  }

  function start() {
    reset();
    active = true;
    phase = 0;
  }

  function update() {
    if (!active || defeated) return;

    if (phase === 0) {
      enterProgress += 1.5;
      y = -60 + enterProgress;
      if (y >= 30) { y = 30; phase = 1; }
      return;
    }

    if (phase === 2) {
      deathTimer++;
      if (deathTimer > 120) { defeated = true; }
      return;
    }

    x += Math.sin(Date.now() / 600) * 1.2;
    if (x < 5) x = 5;
    if (x > 400 - W * SCALE - 5) x = 400 - W * SCALE - 5;

    const cx = x + W * SCALE / 2;
    const cy = y + H * SCALE;

    attackTimer++;
    if (attackTimer > 50) {
      attackTimer = 0;
      burstCount = 2;
      burstTimer = 0;
    }

    if (burstCount > 0) {
      burstTimer++;
      if (burstTimer % 6 === 0) {
        const dir = burstCount === 2 ? -0.4 : 0.4;
        bullets.push({ x: cx - 3, y: cy, vy: 3.5, vx: dir });
        bullets.push({ x: cx + 3, y: cy, vy: 3.5, vx: -dir });
        burstCount--;
      }
    }

    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      b.x += b.vx;
      b.y += b.vy;
      if (b.y > 750) bullets.splice(i, 1);
    }
  }

  function takeDamage() {
    if (phase !== 1) return;
    hp--;
    Audio.bossHit();
    Particle.spawn(x + W * SCALE / 2, y + H * SCALE / 2, '#e67e22', 5, 2);
    if (hp <= 0) {
      phase = 2;
      Particle.spawnExplosion(x + W * SCALE / 2, y + H * SCALE / 2);
      Audio.explode();
    }
  }

  function getRect() {
    return { x, y, w: W * SCALE, h: H * SCALE };
  }

  function draw(ctx) {
    if (!active) return;
    if (phase === 2 && deathTimer % 4 < 2) return;
    Sprites.draw(ctx, 'boss', x, y, W * SCALE, H * SCALE);

    const barY = y - 12;
    const barW = W * SCALE;
    ctx.fillStyle = '#333';
    ctx.fillRect(x, barY, barW, 6);
    ctx.fillStyle = hp > 10 ? '#c0392b' : '#e67e22';
    ctx.fillRect(x, barY, barW * (hp / maxHp), 6);

    ctx.fillStyle = '#f1c40f';
    bullets.forEach(b => ctx.fillRect(b.x, b.y, 5, 10));
  }

  function getBullets() { return bullets; }

  return { reset, start, update, takeDamage, getRect, draw, getBullets,
    get active() { return active; },
    get defeated() { return defeated; },
    get hp() { return hp; }
  };
})();
