/* Spruce — the paper diorama composer. Builds the room shell (walls as folded
   card, a receding floor plane, window + art) and places furniture cutouts
   back-to-front as layered paper. Returns an SVG string; screens overlay the
   HTML price-tags + mascot on top. Ported from the step-2 design harness. */
import { F } from './furniture';

export type RoomPiece = {
  t: string;          // furniture function name
  x: number;          // horizontal centre in the diorama viewBox
  base: number;       // floor-contact y (larger = closer/front)
  s?: number;         // scale
  r?: number;         // rotation (deg)
  o?: Record<string, unknown>;
  ghost?: number;     // if set, draw at this opacity (a "dropped" ghost)
};

export type RoomSpec = {
  W?: number;
  H?: number;
  horizon?: number;
  window?: { x: number; y: number; w?: number; h?: number };
  art?: Array<{ x: number; y: number; scene?: string; frame?: string; w?: number; h?: number }>;
  pieces?: RoomPiece[];
  grain?: boolean;
};

export function buildRoom(spec: RoomSpec): string {
  const W = spec.W || 900, H = spec.H || 640;
  const horizon = spec.horizon ?? Math.round(H * 0.52);   // wall/floor meet
  const win = spec.window, arts = spec.art || [], pieces = spec.pieces || [];

  const defs = `
  <defs>
    <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#DBE9EF"/><stop offset="1" stop-color="#F2E6D3"/></linearGradient>
    <linearGradient id="wallGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EFEAE0"/><stop offset="1" stop-color="#E7DFD1"/></linearGradient>
    <linearGradient id="floorGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E5DAC6"/><stop offset="1" stop-color="#EFE7D7"/></linearGradient>
    <linearGradient id="lightPool" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F8ECCF" stop-opacity=".55"/><stop offset="1" stop-color="#F8ECCF" stop-opacity="0"/></linearGradient>
    <filter id="paperGrain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0.55  0 0 0 0 0.52  0 0 0 0 0.47  0 0 0 0.5 0"/></filter>
  </defs>`;

  // shell: back wall (folded top), a subtle left return wall, floor plane
  const shell = `
    <rect x="0" y="0" width="${W}" height="${horizon}" fill="url(#wallGrad)"/>
    <path d="M0 0 L${Math.round(W * 0.08)} ${Math.round(H * 0.06)} L${Math.round(W * 0.08)} ${horizon} L0 ${horizon} Z" fill="#E1D8C8" opacity=".85"/>
    <rect x="0" y="${horizon}" width="${W}" height="${H - horizon}" fill="url(#floorGrad)"/>
    <rect x="0" y="${horizon - 3}" width="${W}" height="6" fill="#DED3BF"/>
    <ellipse cx="${Math.round(W * 0.52)}" cy="${horizon + 18}" rx="${Math.round(W * 0.5)}" ry="70" fill="url(#lightPool)"/>`;

  const winSVG = win ? `<g transform="translate(${win.x},${win.y})">${F.windowPane({ w: win.w || 150, h: win.h || 184 })}</g>` : '';
  const artSVG = arts.map(a => `<g transform="translate(${a.x},${a.y})">${F.art({ scene: a.scene || 'arch', frame: a.frame || 'walnut', w: a.w, h: a.h })}</g>`).join('');

  // pieces back-to-front (smaller base y = further back)
  const ordered = pieces.map((p, i) => ({ p, i })).sort((a, b) => (a.p.base - b.p.base) || (a.i - b.i));
  const piecesSVG = ordered.map(({ p }) => {
    const s = p.s ?? 1, r = p.r || 0, o = p.o || {};
    const fn = F[p.t];
    if (!fn) return '';
    const dimAttr = p.ghost ? ' opacity="' + (p.ghost) + '"' : '';
    return `<g class="cutpaper"${dimAttr} transform="translate(${p.x},${p.base}) scale(${s}) rotate(${r})">${fn(o)}</g>`;
  }).join('');

  const grain = spec.grain === false ? '' :
    `<rect x="0" y="0" width="${W}" height="${H}" filter="url(#paperGrain)" opacity=".5" style="mix-blend-mode:multiply"/>`;

  return `<svg class="room-svg" viewBox="0 0 ${W} ${H}" width="100%" height="100%" preserveAspectRatio="xMidYMax meet">
    ${defs}${shell}${winSVG}${artSVG}${piecesSVG}${grain}
  </svg>`;
}
