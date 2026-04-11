'use strict';
// node scripts/gen-installer-assets.js
const fs   = require('fs');
const path = require('path');

// ── BMP writer (24-bit, bottom-up for max NSIS compat) ────────────────────────
function writeBMP(filePath, width, height, pixelFn) {
  const rowSize   = Math.floor((width * 3 + 3) / 4) * 4;
  const pixelData = rowSize * height;
  const fileSize  = 54 + pixelData;
  const buf       = Buffer.alloc(fileSize, 0);
  buf.write('BM', 0, 'ascii');
  buf.writeUInt32LE(fileSize, 2);
  buf.writeUInt32LE(0, 6);
  buf.writeUInt32LE(54, 10);
  buf.writeUInt32LE(40, 14);
  buf.writeInt32LE(width,  18);
  buf.writeInt32LE(height, 22); // positive = bottom-up (standard BMP)
  buf.writeUInt16LE(1,  26);
  buf.writeUInt16LE(24, 28);
  buf.writeUInt32LE(0,  30);
  buf.writeUInt32LE(pixelData, 34);
  buf.writeInt32LE(2835, 38);
  buf.writeInt32LE(2835, 42);
  // bottom-up: row 0 in file = bottom row of image
  for (let y = 0; y < height; y++) {
    const imgY = height - 1 - y; // flip
    for (let x = 0; x < width; x++) {
      const [r, g, b] = pixelFn(x, imgY);
      const off = 54 + y * rowSize + x * 3;
      buf[off]   = Math.max(0, Math.min(255, Math.round(b)));
      buf[off+1] = Math.max(0, Math.min(255, Math.round(g)));
      buf[off+2] = Math.max(0, Math.min(255, Math.round(r)));
    }
  }
  fs.writeFileSync(filePath, buf);
  console.log('Written:', filePath);
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const c = (v) => Math.max(0, Math.min(255, Math.round(v)));
function lerp(a, b, t) { return a + (b-a)*t; }
function lerpC(a, b, t) { return [lerp(a[0],b[0],t), lerp(a[1],b[1],t), lerp(a[2],b[2],t)]; }
function addG(bg, col, s) { return [bg[0]+col[0]*s, bg[1]+col[1]*s, bg[2]+col[2]*s]; }

// ── Colours ───────────────────────────────────────────────────────────────────
const BG_TOP  = [12, 30, 46];
const BG_BOT  = [5,  12, 20];
const ACC     = [0, 240, 201];
const ACC2    = [0, 190, 158];
const ACC3    = [0,  80,  66];
const WHITE   = [235, 252, 248];
const MUTED   = [80, 160, 135];
const STRIPE  = [0, 210, 175];

// ── 5×7 pixel font ────────────────────────────────────────────────────────────
const GLYPHS = {
  ' ':[[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]],
  'S':[[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,0],[0,1,1,1,0],[0,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
  'a':[[0,0,0,0,0],[0,1,1,1,0],[0,0,0,0,1],[0,1,1,1,1],[1,0,0,0,1],[1,0,0,1,1],[0,1,1,0,1]],
  'f':[[0,0,1,1,1],[0,1,0,0,0],[0,1,0,0,0],[1,1,1,0,0],[0,1,0,0,0],[0,1,0,0,0],[0,1,0,0,0]],
  'e':[[0,0,0,0,0],[0,1,1,1,0],[1,0,0,0,1],[1,1,1,1,1],[1,0,0,0,0],[1,0,0,0,1],[0,1,1,1,0]],
  'V':[[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,0,1,0],[0,1,0,1,0],[0,0,1,0,0],[0,0,1,0,0]],
  'u':[[0,0,0,0,0],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,1,1],[0,1,1,0,1]],
  'l':[[1,1,0,0,0],[0,1,0,0,0],[0,1,0,0,0],[0,1,0,0,0],[0,1,0,0,0],[0,1,0,0,0],[0,1,1,1,0]],
  't':[[0,1,0,0,0],[0,1,0,0,0],[1,1,1,0,0],[0,1,0,0,0],[0,1,0,0,0],[0,1,0,0,1],[0,0,1,1,0]],
  'T':[[1,1,1,1,1],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0]],
  'n':[[0,0,0,0,0],[1,0,1,1,0],[1,1,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1]],
  'g':[[0,0,0,0,0],[0,1,1,1,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,1],[0,0,0,0,1],[0,1,1,1,0]],
  'r':[[0,0,0,0,0],[1,0,1,1,0],[1,1,0,0,1],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0]],
  's':[[0,0,0,0,0],[0,1,1,1,1],[1,0,0,0,0],[0,1,1,1,0],[0,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
  'o':[[0,0,0,0,0],[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
  'i':[[0,0,1,0,0],[0,0,0,0,0],[0,1,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,1,1,1,0]],
  'v':[[0,0,0,0,0],[1,0,0,0,1],[1,0,0,0,1],[0,1,0,1,0],[0,1,0,1,0],[0,0,1,0,0],[0,0,1,0,0]],
  '3':[[1,1,1,1,0],[0,0,0,0,1],[0,0,0,0,1],[0,1,1,1,0],[0,0,0,0,1],[0,0,0,0,1],[1,1,1,1,0]],
  '.':[[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,1,1,0,0],[0,1,1,0,0]],
  '0':[[0,1,1,1,0],[1,0,0,1,1],[1,0,1,0,1],[1,1,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
  'A':[[0,0,1,0,0],[0,1,0,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,1],[1,0,0,0,1],[1,0,0,0,1]],
  'E':[[1,1,1,1,1],[1,0,0,0,0],[1,0,0,0,0],[1,1,1,1,0],[1,0,0,0,0],[1,0,0,0,0],[1,1,1,1,1]],
  'P':[[1,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0]],
  'W':[[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,1,0,1],[1,1,0,1,1],[1,0,0,0,1],[1,0,0,0,1]],
  'R':[[1,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,0],[1,0,1,0,0],[1,0,0,1,0],[1,0,0,0,1]],
  'D':[[1,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,0]],
  'M':[[1,0,0,0,1],[1,1,0,1,1],[1,0,1,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1]],
  'G':[[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,0],[1,0,1,1,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
  'R':[[1,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,0],[1,0,1,0,0],[1,0,0,1,0],[1,0,0,0,1]],
  'C':[[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,1],[0,1,1,1,0]],
  'U':[[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
  'R':[[1,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,0],[1,0,1,0,0],[1,0,0,1,0],[1,0,0,0,1]],
  'E':[[1,1,1,1,1],[1,0,0,0,0],[1,0,0,0,0],[1,1,1,1,0],[1,0,0,0,0],[1,0,0,0,0],[1,1,1,1,1]],
};

function textHit(px, py, text, tx, ty, sc) {
  let cx = tx;
  for (const ch of text) {
    const g = GLYPHS[ch];
    if (!g) { cx += (5+1)*sc; continue; }
    if (px >= cx && px < cx+5*sc && py >= ty && py < ty+7*sc) {
      const gx = Math.floor((px-cx)/sc);
      const gy = Math.floor((py-ty)/sc);
      if (gx>=0&&gx<5&&gy>=0&&gy<7&&g[gy]&&g[gy][gx]) return true;
    }
    cx += (5+1)*sc;
    if (px < cx-sc) break;
  }
  return false;
}
function tW(text, sc) { return text.length * 6 * sc; }
function cX(text, sc, W, pad=6) { return Math.floor((W - pad - tW(text,sc)) / 2); }

// ── Shield + lock geometry ────────────────────────────────────────────────────
function inShield(x, y, cx, cy, sz) {
  const nx=(x-cx)/sz, ny=(y-cy)/sz;
  if (ny < -1.0 || ny > 1.3) return false;
  if (ny < 0) return Math.abs(nx) < 0.98;
  return Math.abs(nx) < 0.98 - ny*0.75;
}
function inShieldBorder(x,y,cx,cy,sz) {
  return inShield(x,y,cx,cy,sz) && !inShield(x,y,cx,cy,sz*0.82);
}
function inLockBody(x,y,cx,cy,s) {
  return x>=cx-s&&x<=cx+s&&y>=cy-2&&y<=cy+Math.round(s*1.6);
}
function inLockShackle(x,y,cx,cy,s) {
  const dx=x-cx, dy=y-(cy-s*0.5);
  const r2=dx*dx+dy*dy;
  return r2<=(s*1.05)*(s*1.05) && r2>=(s*0.52)*(s*0.52) && dy<=0;
}
function inKeyhole(x,y,cx,cy,s) {
  const dx=x-cx, dy=y-(cy+s*0.3);
  if (dx*dx+dy*dy<=(s*0.32)*(s*0.32)) return true;
  return Math.abs(dx)<=s*0.15 && dy>=0 && dy<=s*0.7;
}

// ── Decorative circuit lines ──────────────────────────────────────────────────
function isCircuit(x, y) {
  // Horizontal lines
  if (y===220&&x>=10&&x<=80) return true;
  if (y===240&&x>=40&&x<=120) return true;
  if (y===260&&x>=20&&x<=90) return true;
  if (y===280&&x>=60&&x<=140) return true;
  // Vertical connectors
  if (x===40&&y>=220&&y<=240) return true;
  if (x===80&&y>=220&&y<=260) return true;
  if (x===60&&y>=260&&y<=280) return true;
  if (x===120&&y>=240&&y<=280) return true;
  // Nodes (small squares at junctions)
  const nodes=[[40,220],[80,220],[80,240],[40,240],[120,240],[60,260],[80,260],[60,280],[120,280]];
  for(const[nx,ny] of nodes) if(Math.abs(x-nx)<=2&&Math.abs(y-ny)<=2) return true;
  return false;
}

// ── SIDEBAR 164×314 ───────────────────────────────────────────────────────────
const SW=164, SH=314;
const SCX=82, SCY=88, SSZ=50;
const LCX=SCX, LCY=SCY+8, LSZ=13;

writeBMP(path.join(__dirname,'../assets/installer-sidebar.bmp'), SW, SH, (x,y) => {
  const t = y/SH;
  const bg = lerpC(BG_TOP, BG_BOT, t);

  // Right accent stripe (4px gradient)
  if (x >= SW-4) {
    return lerpC(STRIPE, ACC2, t);
  }

  // ── Shield border ──
  if (inShieldBorder(x,y,SCX,SCY,SSZ)) {
    const st=(y-(SCY-SSZ))/(SSZ*2.3);
    return lerpC(ACC, ACC2, Math.max(0,Math.min(1,st)));
  }

  // ── Shield inner fill ──
  if (inShield(x,y,SCX,SCY,SSZ) && !inShieldBorder(x,y,SCX,SCY,SSZ)) {
    const dx=x-SCX, dy=y-SCY;
    const dist=Math.sqrt(dx*dx+dy*dy);
    const glow=Math.max(0,1-dist/(SSZ*0.75))*0.32;
    const base=[BG_BOT[0]+8,BG_BOT[1]+8,BG_BOT[2]+8];
    return addG(base, ACC, glow);
  }

  // ── Lock body ──
  if (inLockBody(x,y,LCX,LCY,LSZ)) {
    if (inKeyhole(x,y,LCX,LCY,LSZ)) {
      return [BG_BOT[0]+4,BG_BOT[1]+4,BG_BOT[2]+4];
    }
    // Gradient on lock body
    const lt=(y-(LCY-2))/(LSZ*1.6+2);
    return lerpC(ACC, ACC2, lt);
  }
  if (inLockShackle(x,y,LCX,LCY,LSZ)) {
    return lerpC(ACC, ACC2, 0.3);
  }

  // ── Glow halo ──
  const dx=x-SCX, dy=y-SCY;
  const dist=Math.sqrt(dx*dx+dy*dy);
  if (dist < SSZ+22 && dist > SSZ) {
    const glow=Math.max(0,1-(dist-SSZ)/22)*0.20;
    return addG(bg, ACC, glow);
  }

  // ── Top ambient glow (above shield) ──
  if (y < SCY-SSZ+10) {
    const gy=Math.max(0,1-(SCY-SSZ-y)/30)*0.08;
    return addG(bg, ACC, gy);
  }

  // ── Divider line at y=152 ──
  if (y>=152&&y<=154&&x<SW-4) {
    const fade=Math.min(1,Math.min(x,SW-4-x)/20);
    return [ACC3[0]*fade,ACC3[1]*fade,ACC3[2]*fade];
  }

  // ── "SafeVault" text — scale 2, y=162 ──
  if (textHit(x,y,'SafeVault',cX('SafeVault',2,SW),162,2)) return WHITE;

  // ── "v 3.0.0" — scale 1, y=182 ──
  if (textHit(x,y,'v 3.0.0',cX('v 3.0.0',1,SW),182,1)) return ACC;

  // ── Second divider at y=196 ──
  if (y>=196&&y<=197&&x<SW-4) {
    const fade=Math.min(1,Math.min(x,SW-4-x)/20)*0.5;
    return [ACC3[0]*fade,ACC3[1]*fade,ACC3[2]*fade];
  }

  // ── Circuit board decoration ──
  if (isCircuit(x,y)) {
    return [ACC3[0]+20,ACC3[1]+20,ACC3[2]+20];
  }

  // ── Dot grid ──
  if (y>200&&y<285&&x<SW-4&&x%8===3&&y%8===3) {
    return [bg[0]+20,bg[1]+20,bg[2]+20];
  }

  // ── "Tangersoft" — scale 1, y=292 ──
  if (textHit(x,y,'Tangersoft',cX('Tangersoft',1,SW),292,1)) return MUTED;

  // ── Bottom accent line ──
  if (y>=SH-4&&x<SW-4) return lerpC(ACC3, [2,6,10], (x/(SW-4)));

  return bg;
});

// ── HEADER 150×57 ─────────────────────────────────────────────────────────────
writeBMP(path.join(__dirname,'../assets/installer-header.bmp'), 150, 57, (x,y) => {
  const t=x/150;
  const bg=lerpC(BG_TOP,[18,40,60],t);

  // Bottom accent line 2px
  if (y>=55) return lerpC(ACC, ACC2, t);
  // Top highlight
  if (y===0) return [bg[0]+22,bg[1]+22,bg[2]+22];
  // Right glow
  if (x>95) {
    const g=((x-95)/55)*0.18;
    return addG(bg,ACC,g);
  }
  return bg;
});

console.log('Done.');
