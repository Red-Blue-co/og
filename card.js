// The 1200x630 preview card: page screenshot in a framed window, red-blue signature
const esc = (s) => String(s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

module.exports = function card({ title, description, host, shot, icon }) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;800&display=block" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 1200px; height: 630px; overflow: hidden; }
  body {
    font-family: 'Outfit', system-ui, sans-serif;
    color: #fff;
    background: #030305;
    position: relative;
  }
  /* Signature glows: red top-left, blue bottom-right */
  .glow {
    position: absolute; inset: 0;
    background:
      radial-gradient(circle at 8% 12%, rgba(255, 62, 62, 0.38), transparent 42%),
      radial-gradient(circle at 92% 95%, rgba(41, 98, 255, 0.42), transparent 45%);
  }
  .grid {
    position: absolute; inset: 0;
    background-image: radial-gradient(rgba(255, 255, 255, 0.07) 1px, transparent 1px);
    background-size: 22px 22px;
    -webkit-mask: linear-gradient(90deg, #000, transparent 70%);
  }
  /* Red-to-blue line along the bottom edge */
  .edge {
    position: absolute; left: 0; right: 0; bottom: 0; height: 8px;
    background: linear-gradient(90deg, #ff3e3e, #2962ff);
  }
  .text {
    position: absolute; left: 64px; top: 64px; width: 440px; bottom: 64px;
    display: flex; flex-direction: column;
  }
  .host {
    display: inline-flex; align-items: center; gap: 12px; align-self: flex-start;
    padding: 9px 18px 9px 10px;
    border: 1px solid rgba(255, 255, 255, 0.14);
    background: rgba(255, 255, 255, 0.05);
    border-radius: 999px;
    font-size: 22px; font-weight: 500; color: rgba(255, 255, 255, 0.85);
  }
  .host img, .host .dot { width: 30px; height: 30px; border-radius: 8px; }
  .host .dot { background: linear-gradient(135deg, #ff3e3e, #2962ff); }
  h1 {
    margin-top: 34px;
    font-size: ${title.length > 40 ? 50 : 60}px; font-weight: 800; line-height: 1.05; letter-spacing: -1.5px;
    display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
  }
  p {
    margin-top: 22px;
    font-size: 25px; line-height: 1.4; color: rgba(255, 255, 255, 0.62);
    display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
  }
  .sign {
    margin-top: auto;
    align-self: flex-start;
    font-size: 24px; font-weight: 800; letter-spacing: 1px;
    background: linear-gradient(90deg, #ff3e3e, #2962ff);
    -webkit-background-clip: text; background-clip: text; color: transparent;
  }
  /* The screenshot, in a browser window tilted toward the text */
  .stage { position: absolute; left: 560px; top: 70px; width: 700px; height: 500px; perspective: 1600px; }
  .window {
    position: absolute; left: 0; top: 0; width: 700px; height: 470px;
    border-radius: 18px; overflow: hidden;
    background: #0b0b12;
    transform: rotateY(-14deg) rotateX(4deg);
    transform-origin: left center;
    box-shadow: 0 40px 80px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.08);
  }
  .window::before {
    content: ''; position: absolute; inset: 0; border-radius: 18px; padding: 2px; z-index: 3;
    background: linear-gradient(135deg, #ff3e3e, rgba(255, 255, 255, 0.1) 45%, #2962ff);
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor; mask-composite: exclude;
  }
  .bar {
    height: 38px; display: flex; align-items: center; gap: 8px; padding: 0 16px;
    background: #15151d; border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }
  .bar i { width: 11px; height: 11px; border-radius: 50%; background: rgba(255, 255, 255, 0.18); }
  .bar i:nth-child(1) { background: #ff3e3e; }
  .bar i:nth-child(3) { background: #2962ff; }
  .bar span {
    margin-left: 14px; flex: 1; height: 22px; border-radius: 6px; background: rgba(255, 255, 255, 0.06);
    font-size: 13px; line-height: 22px; padding: 0 10px; color: rgba(255, 255, 255, 0.5);
  }
  .shot { display: block; width: 100%; height: calc(100% - 38px); object-fit: cover; object-position: top; }
</style>
</head>
<body>
  <div class="glow"></div>
  <div class="grid"></div>
  <div class="text">
    <div class="host">${icon ? `<img src="${icon}">` : '<span class="dot"></span>'}${esc(host)}</div>
    <h1>${esc(title)}</h1>
    ${description ? `<p>${esc(description)}</p>` : ''}
    <div class="sign">sherin.fun</div>
  </div>
  <div class="stage">
    <div class="window">
      <div class="bar"><i></i><i></i><i></i><span>${esc(host)}</span></div>
      <img class="shot" src="${shot}">
    </div>
  </div>
  <div class="edge"></div>
</body>
</html>`;
};
