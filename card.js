// The 1200x630 preview card. Everything that matters sits in the middle 630x630
// square, so it survives the square crop WhatsApp and iMessage use.
const esc = (s) => String(s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

module.exports = function card({ title, description, host, shot, icon }) {
  const titleSize = title.length > 48 ? 30 : title.length > 30 ? 34 : 40;
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;800&display=block" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 1200px; height: 630px; overflow: hidden; }
  body { font-family: 'Outfit', system-ui, sans-serif; color: #fff; background: #030305; position: relative; }
  /* Signature glows: red top-left, blue bottom-right */
  .glow {
    position: absolute; inset: 0;
    background:
      radial-gradient(circle at 10% 10%, rgba(255, 62, 62, 0.38), transparent 42%),
      radial-gradient(circle at 90% 95%, rgba(41, 98, 255, 0.42), transparent 45%);
  }
  .edge { position: absolute; left: 0; right: 0; bottom: 0; height: 8px; background: linear-gradient(90deg, #ff3e3e, #2962ff); }
  /* Quiet words at the sides, only seen on wide previews */
  .side {
    position: absolute; top: 50%; transform: translateY(-50%) rotate(-90deg);
    font-size: 18px; letter-spacing: 6px; font-weight: 600; color: rgba(255, 255, 255, 0.18); white-space: nowrap;
  }
  .card {
    position: absolute; left: 285px; top: 30px; width: 630px; height: 570px;
    border-radius: 28px; overflow: hidden; background: #0b0b12;
    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6);
  }
  .card::before {
    content: ''; position: absolute; inset: 0; border-radius: 28px; padding: 2px; z-index: 3; pointer-events: none;
    background: linear-gradient(135deg, #ff3e3e, rgba(255, 255, 255, 0.08) 50%, #2962ff);
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor; mask-composite: exclude;
  }
  .shot { display: block; width: 100%; height: 320px; object-fit: cover; object-position: top; }
  .body { padding: 22px 30px 0; }
  h1 {
    font-size: ${titleSize}px; font-weight: 800; line-height: 1.1; letter-spacing: -0.5px;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  }
  p {
    margin-top: 10px; font-size: 19px; line-height: 1.35; color: rgba(255, 255, 255, 0.62);
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  }
  .foot {
    position: absolute; left: 30px; right: 30px; bottom: 22px;
    display: flex; justify-content: space-between; align-items: center;
  }
  .host {
    display: inline-flex; align-items: center; gap: 9px;
    padding: 6px 14px 6px 7px; border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.14); background: rgba(255, 255, 255, 0.06);
    font-size: 17px; font-weight: 500; color: rgba(255, 255, 255, 0.85);
  }
  .host img, .host .dot { width: 22px; height: 22px; border-radius: 6px; }
  .host .dot { background: linear-gradient(135deg, #ff3e3e, #2962ff); }
  .sign {
    font-size: 19px; font-weight: 800; letter-spacing: 1px;
    background: linear-gradient(90deg, #ff3e3e, #2962ff);
    -webkit-background-clip: text; background-clip: text; color: transparent;
  }
</style>
</head>
<body>
  <div class="glow"></div>
  <div class="side" style="left: 40px">RED · BLUE</div>
  <div class="side" style="right: 40px">SHERIN.FUN</div>
  <div class="card">
    <img class="shot" src="${shot}">
    <div class="body">
      <h1>${esc(title)}</h1>
      ${description ? `<p>${esc(description)}</p>` : ''}
    </div>
    <div class="foot">
      <span class="host">${icon ? `<img src="${icon}">` : '<span class="dot"></span>'}${esc(host)}</span>
      <span class="sign">sherin.fun</span>
    </div>
  </div>
  <div class="edge"></div>
</body>
</html>`;
};
