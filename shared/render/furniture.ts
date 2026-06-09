/* Spruce — cut-paper furniture. Each piece is an intentional paper-craft SVG
   (2–3 matte tones + a darker cut-edge underlayer + a soft contact shadow).
   Origin (0,0) = the piece's bottom-centre (its floor-contact point); the piece
   is drawn upward into negative y. Place with translate(x, floorY).

   In the SHIPPED app these silhouettes are the paper-craft rendering of the
   piece; the background-removed real product photo + the live price live one
   click away on the real retailer page (the honesty seam — see README §"What is
   REAL"). Ported verbatim from the step-2 design harness so the running app is
   pixel-faithful to the approved mockups. Pure string generation — no DOM. */

export type FurnitureOpts = {
  body?: string; legs?: string; seats?: number;
  base?: string; accent?: string; accent2?: string; w?: number; h?: number; op?: number;
  metal?: string; shade?: string; wood?: string; styled?: boolean;
  pot?: string; frame?: string; scene?: string; drop?: number;
};

const M: Record<string, string> = {
  // matte materials (kept in-family)
  linen: '#E8DEC9', linenHi: '#F1EADA', linenEdge: '#D3C6AC',
  boucle: '#EFE7D6', boucleHi: '#F7F1E6', boucleEdge: '#DBCFB6',
  sage: '#9FAE98', sageHi: '#B7C2B0', sageEdge: '#84957D',
  clay: '#CE8560', clayHi: '#DE9E7C', clayEdge: '#B06B49',
  slate: '#6E7A74', slateHi: '#889089', slateEdge: '#57625C',
  walnut: '#8C5A3B', walnutHi: '#A6764F', walnutEdge: '#6F4429',
  oak: '#C7A97B', oakHi: '#D8BF97', oakEdge: '#AB8C60',
  brass: '#C69A5B', brassHi: '#DcB87E', brassEdge: '#A67E42',
  oat: '#DAD0BC', ink: '#233028', cream: '#F4EFE4',
};

const shadow = (rx: number, o = 0.16) =>
  `<ellipse cx="0" cy="2" rx="${rx}" ry="${Math.max(8, rx * 0.13)}" fill="#233028" opacity="${o}"/>`;

/* rounded-rect helper (paper panel): x,y = top-left, in the piece's frame */
function panel(x: number, y: number, w: number, h: number, r: number, fill: string, edge?: string): string {
  return `<path d="M${x} ${y + h - r} Q${x} ${y + h} ${x + r} ${y + h} L${x + w - r} ${y + h} Q${x + w} ${y + h} ${x + w} ${y + h - r} L${x + w} ${y + r} Q${x + w} ${y} ${x + w - r} ${y} L${x + r} ${y} Q${x} ${y} ${x} ${y + r} Z" fill="${edge || fill}" transform="translate(0,2.5)"/>
    <path d="M${x} ${y + h - r} Q${x} ${y + h} ${x + r} ${y + h} L${x + w - r} ${y + h} Q${x + w} ${y + h} ${x + w} ${y + h - r} L${x + w} ${y + r} Q${x + w} ${y} ${x + w - r} ${y} L${x + r} ${y} Q${x} ${y} ${x} ${y + r} Z" fill="${fill}"/>`;
}

/* --------------------------------------------------------------- SOFA (2 or 3 seat) */
function sofa(o: FurnitureOpts = {}): string {
  const b = M[o.body || 'linen'], bh = M[(o.body || 'linen') + 'Hi'], be = M[(o.body || 'linen') + 'Edge'];
  const w = M[o.legs || 'walnut'], we = M[(o.legs || 'walnut') + 'Edge'];
  const seats = o.seats || 3, cw = 52, gap = 4, armW = 26;
  const span = seats * cw + (seats - 1) * gap, seatHalf = span / 2 + 8, outer = seatHalf + armW;
  const cxs: number[] = []; for (let i = 0; i < seats; i++) cxs.push(-span / 2 + cw / 2 + i * (cw + gap));
  const legXs = [-(seatHalf - 4), -span / 6, span / 6, (seatHalf - 4)];
  return `<g>${shadow(outer + 6)}
    ${legXs.map(x => `<path d="M${x - 6} -14 L${x + 6} -14 L${x + 4} 0 L${x - 4} 0 Z" fill="${we}"/><path d="M${x - 6} -14 L${x + 4} -14 L${x + 3} 0 L${x - 4} 0 Z" fill="${w}"/>`).join('')}
    ${panel(-seatHalf, -58, seatHalf * 2, 46, 14, b, be)}
    ${panel(-outer, -96, armW, 82, 13, bh, be)}
    ${panel(seatHalf, -96, armW, 82, 13, bh, be)}
    ${cxs.map(cx => panel(cx - (cw + 2) / 2, -112, cw + 2, 60, 14, b, be)).join('')}
    ${cxs.map(cx => panel(cx - cw / 2, -70, cw, 22, 11, bh, be)).join('')}
    <path d="M${cxs[0] - 22} -108 Q${cxs[0]} -114 ${cxs[0] + 22} -108" stroke="${bh}" stroke-width="4" fill="none" opacity=".65" stroke-linecap="round"/>
  </g>`;
}

/* --------------------------------------------------------------- ARMCHAIR */
function armchair(o: FurnitureOpts = {}): string {
  const b = M[o.body || 'boucle'], bh = M[(o.body || 'boucle') + 'Hi'], be = M[(o.body || 'boucle') + 'Edge'];
  const w = M[o.legs || 'walnut'], we = M[(o.legs || 'walnut') + 'Edge'];
  return `<g>${shadow(78)}
    ${[-52, 52].map(x => `<path d="M${x - 6} -12 L${x + 6} -12 L${x + 4} 0 L${x - 4} 0 Z" fill="${we}"/>`).join('')}
    ${panel(-64, -52, 128, 42, 14, b, be)}
    ${panel(-70, -84, 26, 74, 13, bh, be)}
    ${panel(44, -84, 26, 74, 13, bh, be)}
    ${panel(-46, -104, 92, 58, 16, b, be)}
    ${panel(-44, -62, 88, 22, 11, bh, be)}
    <path d="M-40 -100 Q0 -108 40 -100" stroke="${bh}" stroke-width="4" fill="none" opacity=".7" stroke-linecap="round"/>
  </g>`;
}

/* --------------------------------------------------------------- RUG */
function rug(o: FurnitureOpts = {}): string {
  const base = M[o.base || 'oat'], edge = M[(o.base || 'oat') + 'Edge'] || '#C7BBA0', acc = M[o.accent || 'clay'], acc2 = M[o.accent2 || 'sage'];
  const w = o.w || 300, h = o.h || 70;
  return `<g opacity="${o.op ?? 1}">
    <ellipse cx="0" cy="0" rx="${w / 2}" ry="${h / 2}" fill="#233028" opacity=".10"/>
    <ellipse cx="0" cy="-2" rx="${w / 2}" ry="${h / 2}" fill="${edge}"/>
    <ellipse cx="0" cy="-4" rx="${w / 2 - 6}" ry="${h / 2 - 4}" fill="${base}"/>
    <ellipse cx="0" cy="-4" rx="${w / 2 - 20}" ry="${h / 2 - 13}" fill="none" stroke="${acc}" stroke-width="4" opacity=".8"/>
    <ellipse cx="0" cy="-4" rx="${w / 2 - 40}" ry="${h / 2 - 24}" fill="none" stroke="${acc2}" stroke-width="7" stroke-dasharray="2 12" opacity=".7"/>
  </g>`;
}

/* --------------------------------------------------------------- ARC LAMP */
function arcLamp(o: FurnitureOpts = {}): string {
  const m = M[o.metal || 'brass'], me = M[(o.metal || 'brass') + 'Edge'], sh = M[o.shade || 'ink'];
  const shHi = o.shade === 'cream' ? '#FFFFFF' : '#3A4A41';
  return `<g>${shadow(40)}
    <ellipse cx="0" cy="-6" rx="34" ry="10" fill="${me}"/>
    <ellipse cx="0" cy="-8" rx="30" ry="8" fill="${m}"/>
    <path d="M0 -12 C 0 -150 60 -210 150 -214" fill="none" stroke="${me}" stroke-width="9" stroke-linecap="round"/>
    <path d="M0 -12 C 0 -150 60 -210 150 -214" fill="none" stroke="${m}" stroke-width="5.5" stroke-linecap="round"/>
    <ellipse cx="150" cy="-196" rx="34" ry="22" fill="#F2C879" opacity=".28"/>
    <path d="M124 -214 A26 22 0 0 1 176 -214 Z" fill="${sh}"/>
    <path d="M124 -214 A26 22 0 0 1 176 -214" fill="none" stroke="${shHi}" stroke-width="3" opacity=".5"/>
    <ellipse cx="150" cy="-213" rx="24" ry="5" fill="#F7DFA6" opacity=".9"/>
  </g>`;
}

/* --------------------------------------------------------------- FLOOR LAMP (tripod) */
function floorLamp(o: FurnitureOpts = {}): string {
  const m = M[o.metal || 'walnut'], me = M[(o.metal || 'walnut') + 'Edge'], sh = M[o.shade || 'linen'], shHi = M[(o.shade || 'linen') + 'Hi'];
  return `<g>${shadow(34)}
    <path d="M0 -150 L-30 -6" stroke="${me}" stroke-width="7" stroke-linecap="round"/>
    <path d="M0 -150 L30 -6" stroke="${me}" stroke-width="7" stroke-linecap="round"/>
    <path d="M0 -150 L0 -8" stroke="${m}" stroke-width="7" stroke-linecap="round"/>
    <ellipse cx="0" cy="-206" rx="30" ry="20" fill="#F2C879" opacity=".22"/>
    <path d="M-30 -150 L30 -150 L22 -204 L-22 -204 Z" fill="${sh}"/>
    <path d="M-22 -204 L22 -204 L20 -210 L-20 -210 Z" fill="${shHi}"/>
    <ellipse cx="0" cy="-150" rx="30" ry="6" fill="#F7DFA6" opacity=".85"/>
  </g>`;
}

/* --------------------------------------------------------------- COFFEE TABLE */
function coffeeTable(o: FurnitureOpts = {}): string {
  const w = M[o.wood || 'walnut'], wh = M[(o.wood || 'walnut') + 'Hi'], we = M[(o.wood || 'walnut') + 'Edge'];
  return `<g>${shadow(96)}
    ${[-78, 78].map(x => `<path d="M${x - 5} -40 L${x + 5} -40 L${x + 8} 0 L${x - 2} 0 Z" fill="${we}"/>`).join('')}
    ${[-58, 58].map(x => `<path d="M${x - 5} -40 L${x + 5} -40 L${x + 3} 0 L${x - 7} 0 Z" fill="${w}"/>`).join('')}
    <ellipse cx="0" cy="-40" rx="96" ry="20" fill="${we}"/>
    <ellipse cx="0" cy="-44" rx="96" ry="18" fill="${w}"/>
    <ellipse cx="0" cy="-47" rx="86" ry="13" fill="${wh}" opacity=".55"/>
    ${o.styled !== false ? `
    <path d="M-40 -47 q-3 -22 14 -22 q17 0 14 22 Z" fill="${M.sage}"/>
    <rect x="18" y="-58" width="40" height="11" rx="3" fill="${M.clay}"/>
    <rect x="22" y="-66" width="32" height="9" rx="3" fill="${M.oat}"/>` : ''}
  </g>`;
}

/* --------------------------------------------------------------- POUF / OTTOMAN */
function pouf(o: FurnitureOpts = {}): string {
  const b = M[o.body || 'clay'], bh = M[(o.body || 'clay') + 'Hi'], be = M[(o.body || 'clay') + 'Edge'];
  return `<g>${shadow(52)}
    <ellipse cx="0" cy="-6" rx="52" ry="18" fill="${be}"/>
    <path d="M-52 -6 A52 18 0 0 1 52 -6 L50 -30 A50 16 0 0 0 -50 -30 Z" fill="${b}"/>
    <ellipse cx="0" cy="-30" rx="50" ry="16" fill="${bh}"/>
    <path d="M0 -46 L0 -14 M-24 -42 L-24 -12 M24 -42 L24 -12" stroke="${be}" stroke-width="2" opacity=".5"/>
  </g>`;
}

/* --------------------------------------------------------------- POTTED PLANT (monstera) */
function plant(o: FurnitureOpts = {}): string {
  const pot = M[o.pot || 'clay'], potE = M[(o.pot || 'clay') + 'Edge'], g = '#3E7A4E', gd = '#2C5A39', gl = '#7CB088';
  return `<g>${shadow(38)}
    <g stroke="none">
      <path d="M-4 -70 C -40 -76 -58 -108 -44 -140 C -18 -128 -2 -100 -4 -70 Z" fill="${gd}"/>
      <path d="M2 -74 C 34 -86 44 -122 24 -150 C 4 -132 -2 -102 2 -74 Z" fill="${g}"/>
      <path d="M-2 -78 C -6 -116 6 -150 2 -172 C -14 -150 -18 -112 -2 -78 Z" fill="${g}"/>
      <path d="M-2 -172 C 0 -150 0 -110 -2 -80 C -3 -80 -4 -80 -5 -80 C -8 -112 -8 -146 -2 -172 Z" fill="${gl}" opacity=".7"/>
      <path d="M-30 -110 l10 -6 M-34 -124 l12 -5 M18 -118 l-10 -7 M22 -132 l-11 -6" stroke="${M.cream}" stroke-width="3" opacity=".5"/>
    </g>
    <path d="M-30 -46 L30 -46 L24 -4 C23 -1 20 0 16 0 L-16 0 C-20 0 -23 -1 -24 -4 Z" fill="${potE}"/>
    <path d="M-27 -46 L27 -46 L22 -5 C21 -2 18 -1 15 -1 L-15 -1 C-18 -1 -21 -2 -22 -5 Z" fill="${pot}"/>
    <path d="M-30 -50 C -10 -44 10 -44 30 -50 L30 -44 C 10 -38 -10 -38 -30 -44 Z" fill="${M[(o.pot || 'clay') + 'Hi'] || '#DE9E7C'}"/>
  </g>`;
}

/* --------------------------------------------------------------- SIDEBOARD / SHELF */
function sideboard(o: FurnitureOpts = {}): string {
  const w = M[o.wood || 'oak'], wh = M[(o.wood || 'oak') + 'Hi'], we = M[(o.wood || 'oak') + 'Edge'];
  return `<g>${shadow(112)}
    ${[-92, 92].map(x => `<path d="M${x - 5} -18 L${x + 5} -18 L${x + 7} 0 L${x - 7} 0 Z" fill="${we}"/>`).join('')}
    ${panel(-100, -84, 200, 68, 8, w, we)}
    <line x1="0" y1="-84" x2="0" y2="-16" stroke="${we}" stroke-width="2.5" opacity=".6"/>
    <circle cx="-16" cy="-50" r="3.4" fill="${we}"/><circle cx="16" cy="-50" r="3.4" fill="${we}"/>
    <rect x="-100" y="-84" width="200" height="7" rx="3" fill="${wh}" opacity=".6"/>
    ${o.styled !== false ? `
    <path d="M-70 -84 q-3 -30 12 -30 q15 0 12 30 Z" fill="${M.sage}"/>
    <rect x="42" y="-104" width="36" height="20" rx="2" fill="${M.clay}"/>
    <rect x="50" y="-100" width="20" height="16" rx="2" fill="${M.oat}"/>` : ''}
  </g>`;
}

/* --------------------------------------------------------------- FRAMED ART (wall) */
function art(o: FurnitureOpts = {}): string {
  const frame = M[o.frame || 'walnut'], fe = M[(o.frame || 'walnut') + 'Edge'];
  const w = o.w || 90, h = o.h || 118, mat = M.cream;
  const scene = o.scene || 'arch';
  let inner = '';
  if (scene === 'arch') inner = `<rect x="${-w / 2 + 14}" y="${-h + 14}" width="${w - 28}" height="${h - 28}" fill="${M.oat}"/>
    <path d="M${-w / 2 + 22} ${-14} L${-w / 2 + 22} ${-h / 2} A${w / 2 - 22} ${w / 2 - 22} 0 0 1 ${w / 2 - 22} ${-h / 2} L${w / 2 - 22} ${-14} Z" fill="${M.clay}"/>
    <circle cx="0" cy="${-h / 2 - 6}" r="12" fill="${M.oat}"/>`;
  else inner = `<rect x="${-w / 2 + 14}" y="${-h + 14}" width="${w - 28}" height="${h - 28}" fill="${M.oat}"/>
    <circle cx="-8" cy="${-h / 2}" r="18" fill="${M.sage}"/><rect x="2" y="${-h / 2}" width="26" height="34" fill="${M.clay}"/>`;
  return `<g>
    <rect x="${-w / 2 - 4}" y="${-h - 4}" width="${w + 8}" height="${h + 8}" rx="4" fill="${fe}"/>
    <rect x="${-w / 2}" y="${-h}" width="${w}" height="${h}" rx="3" fill="${frame}"/>
    <rect x="${-w / 2 + 7}" y="${-h + 7}" width="${w - 14}" height="${h - 14}" fill="${mat}"/>
    ${inner}</g>`;
}

/* --------------------------------------------------------------- WINDOW (wall) */
function windowPane(o: FurnitureOpts = {}): string {
  const w = o.w || 150, h = o.h || 180, fr = M.cream, fre = '#D9D0BE';
  return `<g>
    <rect x="${-w / 2 - 6}" y="${-h - 6}" width="${w + 12}" height="${h + 12}" rx="10" fill="${fre}"/>
    <rect x="${-w / 2}" y="${-h}" width="${w}" height="${h}" rx="6" fill="#EAF1F2"/>
    <rect x="${-w / 2}" y="${-h}" width="${w}" height="${h}" rx="6" fill="url(#skyGrad)"/>
    <circle cx="${w / 6}" cy="${-h * 0.66}" r="20" fill="#F6D98C" opacity=".8"/>
    <line x1="0" y1="${-h}" x2="0" y2="0" stroke="${fr}" stroke-width="7"/>
    <line x1="${-w / 2}" y1="${-h / 2}" x2="${w / 2}" y2="${-h / 2}" stroke="${fr}" stroke-width="7"/>
    <rect x="${-w / 2}" y="${-h}" width="${w}" height="${h}" rx="6" fill="none" stroke="${fr}" stroke-width="8"/>
  </g>`;
}

/* --------------------------------------------------------------- PENDANT LAMP (ceiling) */
function pendant(o: FurnitureOpts = {}): string {
  const m = M[o.shade || 'brass'], me = M[(o.shade || 'brass') + 'Edge'], drop = o.drop || 70;
  return `<g>
    <line x1="0" y1="0" x2="0" y2="${drop}" stroke="${M.ink}" stroke-width="2.5" opacity=".7"/>
    <ellipse cx="0" cy="${drop + 34}" rx="30" ry="18" fill="#F2C879" opacity=".22"/>
    <path d="M-26 ${drop} A26 24 0 0 1 26 ${drop} L20 ${drop + 18} L-20 ${drop + 18} Z" fill="${me}"/>
    <path d="M-24 ${drop} A24 22 0 0 1 24 ${drop} L19 ${drop + 16} L-19 ${drop + 16} Z" fill="${m}"/>
    <ellipse cx="0" cy="${drop + 17}" rx="19" ry="4" fill="#F7DFA6"/>
  </g>`;
}

export type FurnitureFn = (o?: FurnitureOpts) => string;

export const F: Record<string, FurnitureFn> = {
  sofa, armchair, rug, arcLamp, floorLamp, coffeeTable, pouf, plant, sideboard, art, windowPane, pendant,
};

export { M, panel, shadow };
