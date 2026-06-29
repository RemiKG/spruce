/* Spruce client — bridges the pure SVG-string render harness into React. The art
   is procedural hand-authored vector (NOT diffusion) — that's why it doesn't read
   as AI. */
import type { CSSProperties } from 'react';
import { wordmark, logomark, mascot, sprig } from '../../shared/render/paper';
import { F } from '../../shared/render/furniture';
import { buildRoom, type RoomSpec } from '../../shared/render/room';
import type { Thumb } from '../../shared/types';

export function Raw({ html, className, style, onClick, title }: { html: string; className?: string; style?: CSSProperties; onClick?: () => void; title?: string }) {
  return <div className={className} style={style} onClick={onClick} title={title} dangerouslySetInnerHTML={{ __html: html }} />;
}

export function Wordmark({ size = 96, reverse = false, className }: { size?: number; reverse?: boolean; className?: string }) {
  return <Raw className={className} html={wordmark({ size, reverse })} style={{ display: 'inline-flex' }} />;
}

export function Logomark({ size = 120, reverse = false }: { size?: number; reverse?: boolean }) {
  return <Raw html={logomark({ size, reverse })} style={{ display: 'inline-flex', lineHeight: 0 }} />;
}

export function Mascot({ state = 'hero', size = 220 }: { state?: 'hero' | 'shrug' | 'clean'; size?: number }) {
  return <Raw html={mascot(state, { size })} style={{ display: 'inline-flex', lineHeight: 0 }} />;
}

export function Sprig({ size = 40 }: { size?: number }) {
  return <Raw html={`<svg viewBox="0 0 100 150" width="${size}" height="${size * 1.5}">${sprig()}</svg>`} style={{ display: 'inline-flex', lineHeight: 0 }} />;
}

export function Thumbnail({ thumb }: { thumb: Thumb }) {
  const inner = F[thumb.fn]?.(thumb.o || {}) || '';
  return <Raw html={`<svg viewBox="${thumb.vb}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">${inner}</svg>`} style={{ width: '100%', height: '100%' }} />;
}

export function Diorama({ spec, ghosts = '', className }: { spec: RoomSpec; ghosts?: string; className?: string }) {
  const svg = ghosts ? buildRoom(spec).replace('</svg>', ghosts + '</svg>') : buildRoom(spec);
  return <Raw className={className} html={svg} style={{ position: 'absolute', inset: 0 }} />;
}
