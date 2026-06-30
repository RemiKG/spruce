/* Spruce — small shared UI atoms. */
import type { ReactNode } from 'react';
import { money as fmtMoney } from '../../shared/numbers';
import type { Currency } from '../../shared/types';

export function Money({ n, c = 'USD' as Currency, className }: { n: number; c?: Currency; className?: string }) {
  return <span className={`mono ${className ?? ''}`}>{fmtMoney(n, c)}</span>;
}

export function Chip({ children, tone, style }: { children: ReactNode; tone?: 'sprig' | 'amber'; style?: React.CSSProperties }) {
  return <span className={`chip ${tone === 'sprig' ? 'chip-sprig' : tone === 'amber' ? 'chip-amber' : ''}`} style={style}>{children}</span>;
}

export function Dot() { return <span className="dot" />; }

export function Eyebrow({ children }: { children: ReactNode }) {
  return <div className="eyebrow">{children}</div>;
}

export function GateBadge({ n, children }: { n: number; children: ReactNode }) {
  return <div className="gate"><span className="n">{n}</span> {children}</div>;
}

export type Stat = { v: ReactNode; k: ReactNode };
export function StatGrid({ stats }: { stats: Stat[] }) {
  return (
    <div className="engine">
      {stats.map((s, i) => (
        <div className="cellstat" key={i}><div className="v">{s.v}</div><div className="k">{s.k}</div></div>
      ))}
    </div>
  );
}
