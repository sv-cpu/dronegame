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
    colors.forEach(c => spawn(x, y, c, 5, 4));
  }

  function spawnSnowflakes(count, canvasW, canvasH) {
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvasW,
        y: Math.random() * canvasH,
        color: PALETTE.white,
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
        color: Math.random() < 0.5 ? PALETTE.leaf : PALETTE.yellow,
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
        color: Math.random() < 0.5 ? PALETTE.sand : PALETTE.dark,
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

  return { spawn, spawnExplosion, spawnSnowflakes, spawnLeaves, spawnSand, update, draw, clear };
})();
