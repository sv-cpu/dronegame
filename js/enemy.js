const Enemy = (() => {
  const enemies = [];
  let spawnTimer = 0;
  let difficulty = 0;
  const SCALE = 2;

  const TYPES = {
    small: { sprite: 'drone_small', w: 24, h: 24, hp: 1 },
    medium: { sprite: 'drone_med', w: 32, h: 32, hp: 3 },
  };

  function reset() {
    enemies.length = 0;
    spawnTimer = 0;
    difficulty = 0;
  }

  function setDifficulty(d) { difficulty = d; }

  function spawn() {
    const type = Math.random() < 0.7 ? 'small' : 'medium';
    const t = TYPES[type];
    const sw = t.w * SCALE;
    const sh = t.h * SCALE;
    const speed = 0.7 + Math.random() * 0.5 + difficulty * 0.05;
    const drift = (Math.random() - 0.5) * 1.2;
    const ex = 10 + Math.random() * (380 - sw);
    enemies.push({
      x: ex, y: -sh, w: sw, h: sh,
      hp: t.hp, maxHp: t.hp, speed, drift, type,
    });
  }

  function update() {
    spawnTimer++;
    const interval = Math.max(15, 45 - difficulty * 5);
    if (spawnTimer >= interval) {
      spawnTimer = 0;
      if (Math.random() < 0.65) spawn();
    }

    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];
      e.y += e.speed;
      e.x += e.drift;
      if (e.x < 0) { e.x = 0; e.drift *= -1; }
      if (e.x > 400 - e.w) { e.x = 400 - e.w; e.drift *= -1; }
      if (e.y > 750) enemies.splice(i, 1);
    }
  }

  function getList() { return enemies; }

  function remove(index) { enemies.splice(index, 1); }

  function hit(index) {
    const e = enemies[index];
    e.hp--;
    if (e.hp <= 0) {
      Particle.spawnExplosion(e.x + e.w / 2, e.y + e.h / 2);
      Audio.explode();
      enemies.splice(index, 1);
      return true;
    }
    return false;
  }

  function draw(ctx) {
    enemies.forEach(e => {
      const sid = e.type === 'medium' ? 'drone_med' : 'drone_small';
      Sprites.draw(ctx, sid, e.x, e.y, e.w, e.h);
      if (e.maxHp > 1) {
        ctx.fillStyle = '#333';
        ctx.fillRect(e.x, e.y - 6, e.w, 4);
        ctx.fillStyle = '#c0392b';
        ctx.fillRect(e.x, e.y - 6, e.w * (e.hp / e.maxHp), 4);
      }
    });
  }

  return { reset, setDifficulty, update, getList, remove, hit, draw };
})();
