const Particle = (() => {
  const particles = [];

  function spawn(x, y, color, count, speed) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = (Math.random() * 0.8 + 0.2) * (speed || 3);
      particles.push({
        x, y, color,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        life: 1,
        decay: 0.015 + Math.random() * 0.025,
        size: 2 + Math.random() * 3,
      });
    }
  }

  function spawnExplosion(x, y) {
    const colors = [PALETTE.orange, PALETTE.yellow, PALETTE.red, PALETTE.grey];
    colors.forEach(c => spawn(x, y, c, 6, 4));
    // smoke
    for (let i = 0; i < 5; i++) {
      particles.push({
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 10,
        color: '#555',
        vx: (Math.random() - 0.5) * 0.5,
        vy: -0.3 - Math.random() * 0.5,
        life: 1,
        decay: 0.005 + Math.random() * 0.005,
        size: 4 + Math.random() * 5,
      });
    }
  }

  function spawnHitSparks(x, y) {
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = 1 + Math.random() * 3;
      particles.push({
        x, y,
        color: '#f1c40f',
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        life: 1,
        decay: 0.05 + Math.random() * 0.05,
        size: 1 + Math.random() * 2,
      });
    }
  }

  function spawnBossExplosion(x, y) {
    for (let ring = 0; ring < 3; ring++) {
      setTimeout(() => {
        spawn(x, y, PALETTE.orange, 10, 5 + ring * 2);
        spawn(x, y, PALETTE.yellow, 8, 3 + ring * 2);
        spawn(x, y, PALETTE.red, 6, 2 + ring * 1.5);
      }, ring * 200);
    }
  }

  function spawnSnowflakes(count, canvasW, canvasH) {
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvasW,
        y: Math.random() * canvasH,
        color: '#f0f0f0',
        vx: (Math.random() - 0.5) * 0.3,
        vy: 0.3 + Math.random() * 0.5,
        life: 1,
        decay: 0.001,
        size: 1 + Math.random() * 2,
      });
    }
  }

  function spawnLeaves(count, w, h) {
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        color: Math.random() < 0.5 ? '#3a8a2a' : '#f1c40f',
        vx: (Math.random() - 0.5) * 0.5,
        vy: 0.3 + Math.random() * 0.4,
        life: 1,
        decay: 0.0008,
        size: 2 + Math.random() * 3,
        wobble: Math.random() * 100,
      });
    }
  }

  function spawnSand(count, w, h) {
    for (let i = 0; i < count; i++) {
      particles.push({
        x: -5 - Math.random() * 20,
        y: Math.random() * h,
        color: Math.random() < 0.5 ? '#d4a76a' : '#2a2a2a',
        vx: 0.8 + Math.random() * 1.2,
        vy: (Math.random() - 0.5) * 0.3,
        life: 1,
        decay: 0.0006 + Math.random() * 0.0004,
        size: 1 + Math.random() * 2,
      });
    }
  }

  function update() {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.vy !== undefined) p.vy += 0.02;
      if (p.wobble !== undefined) {
        p.x += Math.sin(p.wobble + i) * 0.3;
        p.wobble += 0.05;
      }
      p.life -= p.decay;
      if (p.life <= 0) particles.splice(i, 1);
    }
  }

  function draw(ctx) {
    particles.forEach(p => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x | 0, p.y | 0, p.size, p.size);
    });
    ctx.globalAlpha = 1;
  }

  function clear() { particles.length = 0; }

  return { spawn, spawnExplosion, spawnHitSparks, spawnBossExplosion, spawnSnowflakes, spawnLeaves, spawnSand, update, draw, clear };
})();
