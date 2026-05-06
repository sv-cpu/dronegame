const Levels = (() => {
  const levels = [
    {
      name: 'ЛЕТО',
      music: 'summer',
      bgTop: '#87ceeb',
      bgBot: '#4a90b0',
      groundColor: '#4a7a2a',
      groundLine: '#3a6a1a',
      decor: (ctx, w, h) => {
        for (let i = 0; i < 8; i++) {
          const dx = (i * 55 + 10) % w;
          ctx.fillStyle = '#2d5a1d';
          ctx.fillRect(dx, h - 90, 4, 16);
          ctx.fillStyle = '#3a8a2a';
          ctx.fillRect(dx - 6, h - 100, 16, 12);
          ctx.fillRect(dx + 2, h - 108, 8, 10);
        }
        for (let i = 0; i < 5; i++) {
          ctx.fillStyle = '#f1c40f';
          ctx.fillRect(20 + i * 80, h - 88, 3, 3);
        }
      },
      leaves: true,
      snow: false,
    },
    {
      name: 'СТЕПЬ',
      music: 'steppe',
      bgTop: '#e8a84a',
      bgBot: '#c08030',
      groundColor: '#8b6e3c',
      groundLine: '#6b4e2c',
      decor: (ctx, w, h) => {
        for (let i = 0; i < 5; i++) {
          const dx = 30 + i * 80;
          ctx.fillStyle = '#5c3a1e';
          ctx.fillRect(dx, h - 96, 12, 8);
          ctx.fillRect(dx + 3, h - 100, 6, 6);
        }
        for (let i = 0; i < 6; i++) {
          ctx.fillStyle = '#a08020';
          ctx.fillRect(10 + i * 70, h - 85, 3, 6);
          ctx.fillRect(10 + i * 70 - 2, h - 88, 7, 3);
        }
      },
      sand: true,
      snow: false,
    },
    {
      name: 'СНЕЖНЫЙ ЛЕС',
      music: 'winter',
      bgTop: '#b0c4de',
      bgBot: '#8fa8c8',
      groundColor: '#e8ecf0',
      groundLine: '#c8d0d8',
      decor: (ctx, w, h) => {
        for (let i = 0; i < 6; i++) {
          const dx = 20 + i * 65;
          ctx.fillStyle = '#2d4a1d';
          ctx.fillRect(dx, h - 90, 6, 16);
          ctx.fillStyle = '#1a3a0d';
          ctx.beginPath();
          ctx.moveTo(dx - 4, h - 80);
          ctx.lineTo(dx + 3, h - 106);
          ctx.lineTo(dx + 10, h - 80);
          ctx.fill();
          ctx.fillStyle = '#f0f4f8';
          ctx.fillRect(dx - 4, h - 108, 14, 4);
        }
      },
      snow: true,
    },
  ];

  let currentLevel = 0;

  function getLevel(n) {
    if (n < 0 || n >= levels.length) return null;
    return levels[n];
  }

  function setLevel(n) { currentLevel = n; }
  function getCurrent() { return currentLevel; }

  return { getLevel, setLevel, getCurrent, count: levels.length };
})();
