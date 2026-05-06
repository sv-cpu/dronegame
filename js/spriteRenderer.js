const PALETTE = {
  black:    '#1a1a1a',
  dark:     '#2a2a2a',
  grey:     '#6b6b6b',
  white:    '#f0f0f0',
  skin:     '#d2b48c',
  beard:    '#8b7355',
  green:    '#2f6f2f',
  lime:     '#5ea85e',
  dkGreen:  '#1d4a1d',
  khaki:    '#4a5d23',
  ltKhaki:  '#6b8540',
  brown:    '#5c3a1e',
  ltBrown:  '#8b5e3c',
  blue:     '#4a7db0',
  ltBlue:   '#7aadd4',
  dkBlue:   '#2a5580',
  red:      '#c0392b',
  orange:   '#e67e22',
  yellow:   '#f1c40f',
  pink:     '#e84393',
  purple:   '#6c3483',
  cyan:     '#00cec9',
  snow:     '#f8f9fa',
  ice:      '#dfe6e9',
  dkSnow:   '#b2bec3',
  sand:     '#d4a76a',
  ltSand:   '#e8c99b',
  rust:     '#a0522d',
  dkRust:   '#7a3b1e',
  leaf:     '#3a8a2a',
  dkLeaf:   '#2d6a1d',
};

// PNG Sprites loader + renderer with chroma key support
const Sprites = (() => {
  const cache = {};
  let loaded = 0;
  let total = 0;
  let onReadyCb = null;

  function load(id, url, chromaKey) {
    total++;
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        if (chromaKey) {
          const c = document.createElement('canvas');
          c.width = img.width;
          c.height = img.height;
          const ctx = c.getContext('2d');
          ctx.drawImage(img, 0, 0);
          const d = ctx.getImageData(0, 0, c.width, c.height);
          for (let i = 0; i < d.data.length; i += 4) {
            if (Math.abs(d.data[i] - chromaKey.r) < 15 &&
                Math.abs(d.data[i+1] - chromaKey.g) < 15 &&
                Math.abs(d.data[i+2] - chromaKey.b) < 15) {
              d.data[i+3] = 0;
            }
          }
          ctx.putImageData(d, 0, 0);
          cache[id] = c;
        } else {
          cache[id] = img;
        }
        loaded++;
        if (onReadyCb && loaded >= total) onReadyCb();
        resolve(cache[id]);
      };
      img.onerror = () => { loaded++; resolve(null); };
      img.src = url;
    });
  }

  function draw(ctx, id, dx, dy, dw, dh) {
    const src = cache[id];
    if (!src) return;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(src, dx, dy, dw, dh);
  }

  function get(id) { return cache[id]; }

  function onReady(fn) {
    onReadyCb = fn;
    if (loaded >= total && total > 0) fn();
  }

  function progress() { return { loaded, total }; }
  function isReady() { return loaded >= total && total > 0; }

  return { load, draw, get, onReady, progress, isReady };
})();
