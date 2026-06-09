/* Spruce paper-craft identity library — hand-authored SVG. One sprig shape shared
   across wordmark, logomark and mascot; the planter-"u" pun built into the
   letterform. NOT diffusion art — every mark is intentional and reproducible.
   Ported from the step-2 design harness. Pure string generation — no DOM. */

export type Palette = Record<string, string>;

/* the SPRIG: 3 layered fir tiers + a top shoot, as soft paper cutouts. */
export function sprig(p: Palette = {}): string {
  const c = { deep: '#2C5A39', mid: '#3E7A4E', lite: '#7CB088', edge: '#234A2F', ...p };
  return `
  <g class="sprig-g">
    <path d="M50 60 C 40 76, 26 94, 16 108 C 24 110, 30 112, 36 110
             C 40 114, 44 115, 50 113 C 56 115, 60 114, 64 110
             C 70 112, 76 110, 84 108 C 74 94, 60 76, 50 60 Z" fill="${c.deep}"/>
    <path d="M50 36 C 42 50, 32 66, 24 80 C 33 83, 37 88, 44 86
             C 46 93, 50 93, 50 89 C 50 93, 54 93, 56 86
             C 63 88, 67 83, 76 80 C 68 66, 58 50, 50 36 Z" fill="${c.mid}"/>
    <path d="M50 14 C 44 26, 37 40, 31 52 C 39 55, 43 59, 49 57
             C 50 62, 50 62, 51 57 C 57 59, 61 55, 69 52 C 63 40, 56 26, 50 14 Z" fill="${c.mid}"/>
    <path d="M50 14 C 44 26, 37 40, 31 52 C 34 53, 37 54, 40 55 C 45 43, 48 30, 50 20 Z" fill="${c.lite}" opacity=".85"/>
    <path d="M50 36 C 42 50, 32 66, 24 80 C 27 81, 31 83, 34 84 C 40 68, 45 52, 50 42 Z" fill="${c.lite}" opacity=".7"/>
    <path d="M50 16 C 49 10, 50 5, 52 3 C 53 6, 53 11, 51 15 Z" fill="${c.lite}"/>
  </g>`;
}

/* the little terracotta planter cup */
export function planter(p: Palette = {}): string {
  const c = { face: '#D98E5A', edge: '#BE7038', rim: '#EAC1A0', soil: '#7A4A2C', ...p };
  return `
  <g class="planter-g">
    <path d="M22 66 C 22 62, 26 60, 32 60 L 88 60 C 94 60, 98 62, 98 66
             L 92 104 C 91 110, 86 114, 78 114 L 42 114 C 34 114, 29 110, 28 104 Z" fill="${c.edge}"/>
    <path d="M24 64 C 24 60, 28 58, 34 58 L 86 58 C 92 58, 96 60, 96 64
             L 90 101 C 89 107, 84 111, 77 111 L 43 111 C 36 111, 31 107, 30 101 Z" fill="${c.face}"/>
    <path d="M24 64 C 24 60, 28 58, 34 58 L 86 58 C 92 58, 96 60, 96 64 L 94 72
             C 78 66, 42 66, 26 72 Z" fill="${c.rim}" opacity=".9"/>
    <path d="M30 66 C 46 72, 74 72, 90 66 C 78 70, 42 70, 30 66 Z" fill="${c.soil}" opacity=".55"/>
  </g>`;
}

/* the wordmark "u": an x-height terracotta planter-cup (reads as a lowercase u)
   with a small 2-tier sprig rising just above the word. viewBox 0 0 64 100. */
export function wordmarkU(p: Palette = {}): string {
  const c = {
    face: '#D98E5A', edge: '#B76B34', rim: '#EBC3A2', soil: '#5F3A22',
    g_deep: '#2C5A39', g_mid: '#3E7A4E', g_lite: '#7CB088', ...p,
  };
  return `
  <path d="M8 49 L 8 84 C 8 94 15 100 26 100 L 39 100 C 50 100 57 94 57 84 L 57 49 Z" fill="${c.edge}"/>
  <path d="M11 49 L 11 83 C 11 92 17 98 27 98 L 38 98 C 48 98 54 92 54 83 L 54 49 Z" fill="${c.face}"/>
  <path d="M9 47 C 24 43 41 43 56 47 L 56 55 C 41 51 24 51 9 55 Z" fill="${c.rim}"/>
  <path d="M13 51 C 26 55 39 55 52 51 C 41 54 24 54 13 51 Z" fill="${c.soil}" opacity=".55"/>
  <g transform="translate(32.5,50)">
    <path d="M0 2 C -7 -3 -15 -8 -22 -13 C -14 -16 -10 -12 -3 -13 C -1 -8 0 -8 0 -11
             C 0 -8 1 -8 3 -13 C 10 -12 14 -16 22 -13 C 15 -8 7 -3 0 2 Z" fill="${c.g_deep}"/>
    <path d="M0 -11 C -6 -17 -12 -23 -17 -29 C -10 -31 -7 -28 -1 -29 C 0 -24 0 -24 1 -29
             C 7 -28 10 -31 17 -29 C 12 -23 6 -17 0 -11 Z" fill="${c.g_mid}"/>
    <path d="M0 -25 C -5 -30 -9 -35 -13 -40 C -7 -42 -5 -39 -1 -40 C 0 -36 0 -36 1 -40
             C 5 -39 7 -42 13 -40 C 9 -35 5 -30 0 -25 Z" fill="${c.g_mid}"/>
    <path d="M0 -25 C -5 -30 -9 -35 -13 -40 C -11 -40.6 -9 -40.4 -7.5 -40 C -4 -35 -1 -30 0 -27 Z" fill="${c.g_lite}" opacity=".9"/>
    <path d="M0 -39 C -1 -44 0 -48 2 -50 C 3 -47 3 -43 1 -40 Z" fill="${c.g_lite}"/>
  </g>`;
}

/* WORDMARK — HTML flex so the browser kerns the Baloo text; the planter-u sits
   inline as the "u", seated on the text baseline. `reverse` = cream on ink. */
export function wordmark(opts: { size?: number; reverse?: boolean } = {}): string {
  const size = opts.size || 128;
  const rev = !!opts.reverse;
  const inkText = rev ? '#F4EFE4' : '#233028';
  const uW = size * 0.60;
  const uH = size;
  const sp: Palette = rev ? { g_deep: '#2C5A39', g_mid: '#4E8C5C', g_lite: '#8FBE99' } : {};
  return `
  <span class="wm" style="--wm:${size}px; color:${inkText}">
    <span class="wm-t">Spr</span><span class="wm-u" style="width:${uW}px;height:${uH}px"><svg viewBox="0 0 64 100" width="${uW}" height="${uH}" style="overflow:visible;display:block">${wordmarkU(sp)}</svg></span><span class="wm-t">ce</span>
  </span>`;
}

/* LOGOMARK — the sprig standing in the planter, in a soft cream tile. */
export function logomark(opts: { size?: number; reverse?: boolean; tile?: boolean } = {}): string {
  const tile = opts.tile !== false;
  const bg = opts.reverse ? '#233028' : '#F4EFE4';
  const sp: Palette = opts.reverse ? { deep: '#2C5A39', mid: '#4E8C5C', lite: '#8FBE99' } : {};
  return `
  <svg viewBox="0 0 200 200" width="${opts.size || 200}" height="${opts.size || 200}">
    ${tile ? `<rect x="6" y="6" width="188" height="188" rx="46" fill="${bg}"/>` : ''}
    <g transform="translate(40,84) scale(1.0)">${planter()}</g>
    <g transform="translate(52,20) scale(1.28)">${sprig(sp)}</g>
  </svg>`;
}

/* MASCOT — the round-glasses spruce sprig, "the little designer".
   state: 'hero' (tape + tag) | 'shrug' (arms up) | 'clean' (no face/props) */
export function mascot(state: 'hero' | 'shrug' | 'clean' = 'hero', opts: { size?: number } = {}): string {
  const size = opts.size || 260;
  const clean = state === 'clean';
  const shrug = state === 'shrug';
  const pot = `
    <g class="mascot-pot">
      <path d="M72 235 L228 235 L214 298 C213 304 208 307 201 307 L99 307 C92 307 87 304 86 298 Z" fill="#B76B34"/>
      <path d="M76 237 L224 237 L211 295 C210 301 205 304 199 304 L101 304 C95 304 90 301 89 295 Z" fill="#D98E5A"/>
      <path d="M64 230 C 110 222 190 222 236 230 L232 247 C 190 239 110 239 68 247 Z" fill="#C9793F"/>
      <path d="M64 230 C 110 222 190 222 236 230 L234 238 C 190 231 110 231 66 238 Z" fill="#EAC1A0" opacity=".9"/>
    </g>`;
  const body = `
    <ellipse cx="150" cy="306" rx="94" ry="15" fill="#233028" opacity=".12"/>
    <g transform="translate(65,38) scale(1.7,1.5)">
      <path d="M50 60 C 36 78, 20 100, 8 120 C 22 126, 28 132, 40 129
               C 43 140, 50 140, 50 133 C 50 140, 57 140, 60 129 C 72 132, 78 126, 92 120
               C 80 100, 64 78, 50 60 Z" fill="#2C5A39"/>
      <path d="M50 34 C 40 52, 27 74, 17 92 C 30 97, 35 103, 46 100
               C 47 110, 50 110, 50 104 C 50 110, 53 110, 54 100 C 65 103, 70 97, 83 92
               C 73 74, 60 52, 50 34 Z" fill="#3E7A4E"/>
      <path d="M50 12 C 43 28, 34 46, 26 62 C 36 66, 41 71, 49 68
               C 50 76, 50 76, 51 68 C 59 71, 64 66, 74 62 C 66 46, 57 28, 50 12 Z" fill="#3E7A4E"/>
      <path d="M50 12 C 43 28, 34 46, 26 62 C 30 63, 34 65, 37 66 C 43 50, 47 34, 50 22 Z" fill="#7CB088" opacity=".8"/>
      <path d="M50 34 C 40 52, 27 74, 17 92 C 21 93, 26 95, 30 96 C 38 76, 45 56, 50 44 Z" fill="#7CB088" opacity=".6"/>
    </g>`;
  const face = clean ? '' : `
    <g transform="translate(150,150)">
      <ellipse cx="0" cy="2" rx="50" ry="41" fill="#EAF1E6"/>
      <circle cx="-30" cy="14" r="9" fill="#EAC1A0" opacity=".8"/>
      <circle cx="30" cy="14" r="9" fill="#EAC1A0" opacity=".8"/>
      <g fill="none" stroke="#233028" stroke-width="4.5">
        <circle cx="-18" cy="-2" r="16"/>
        <circle cx="18" cy="-2" r="16"/>
        <path d="M-2 -2 h4" />
        <path d="M-34 -6 l-10 -4" />
        <path d="M34 -6 l10 -4" />
      </g>
      <circle cx="-18" cy="-2" r="4.6" fill="#233028"/>
      <circle cx="18" cy="-2" r="4.6" fill="#233028"/>
      <circle cx="-16.4" cy="-3.6" r="1.5" fill="#F4EFE4"/>
      <circle cx="19.6" cy="-3.6" r="1.5" fill="#F4EFE4"/>
      <path d="M-11 20 Q 0 30 11 20" fill="none" stroke="#233028" stroke-width="3.6" stroke-linecap="round"/>
    </g>`;
  let arms = '';
  if (!clean && !shrug) {
    arms = `
    <g>
      <path d="M104 214 C 78 210, 60 214, 48 224" fill="none" stroke="#2C5A39" stroke-width="9" stroke-linecap="round"/>
      <g transform="translate(28,214)">
        <rect x="-4" y="0" width="46" height="34" rx="9" fill="#BE7038"/>
        <rect x="-4" y="0" width="46" height="30" rx="9" fill="#D98E5A"/>
        <rect x="0" y="6" width="24" height="18" rx="5" fill="#EAC1A0"/>
        <rect x="34" y="8" width="10" height="14" rx="3" fill="#EAC1A0"/>
        <path d="M-4 26 C -22 26, -34 22, -44 14 L -44 22 C -34 30, -20 34, -4 34 Z" fill="#F1E7C9"/>
        <g stroke="#8A4F26" stroke-width="1.4">
          <path d="M-14 24 v6"/><path d="M-22 22 v6"/><path d="M-30 20 v6"/><path d="M-38 18 v5"/>
        </g>
      </g>
    </g>
    <g>
      <path d="M196 214 C 224 210, 244 216, 256 230" fill="none" stroke="#3E7A4E" stroke-width="9" stroke-linecap="round"/>
      <g transform="translate(238,224) rotate(12)">
        <path d="M4 0 L40 0 C 46 0 50 4 50 10 L50 34 C 50 40 46 44 40 44 L4 44
                 L-14 22 Z" fill="#BE7038"/>
        <path d="M4 -2 L40 -2 C 46 -2 50 2 50 8 L50 32 C 50 38 46 42 40 42 L4 42
                 L-14 20 Z" fill="#D98E5A"/>
        <circle cx="2" cy="20" r="4.5" fill="#F4EFE4"/>
        <text x="24" y="27" font-family="'IBM Plex Mono',monospace" font-size="18" font-weight="700" fill="#4A2A12" text-anchor="middle">$</text>
      </g>
    </g>`;
  } else if (shrug) {
    arms = `
    <g>
      <path d="M108 206 C 86 196, 70 184, 62 168" fill="none" stroke="#2C5A39" stroke-width="9" stroke-linecap="round"/>
      <path d="M192 206 C 214 196, 230 184, 238 168" fill="none" stroke="#3E7A4E" stroke-width="9" stroke-linecap="round"/>
      <circle cx="60" cy="164" r="7" fill="#2C5A39"/>
      <circle cx="240" cy="164" r="7" fill="#3E7A4E"/>
    </g>`;
  }
  return `<svg viewBox="0 0 300 322" width="${size}" height="${Math.round(size * 322 / 300)}" style="overflow:visible">
    ${body}${pot}${arms}${face}
  </svg>`;
}
