/* Spruce — the app topbar (wordmark + breadcrumb on the left, actions on right). */
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Wordmark } from '../lib/svg';

export function Topbar({ title, sub, right }: { title?: ReactNode; sub?: ReactNode; right?: ReactNode }) {
  return (
    <div className="topbar">
      <div className="tb-l">
        <Link to="/" style={{ display: 'inline-flex' }} aria-label="Spruce home"><Wordmark size={26} /></Link>
        {title && (
          <span className="tb-crumb">&nbsp;·&nbsp; <b>{title}</b> {sub && <span className="k">{sub}</span>}</span>
        )}
      </div>
      <div className="tb-r">{right}</div>
    </div>
  );
}

export function BudgetPill({ label = 'budget', value, under }: { label?: string; value: string; under?: { ok: boolean; text: string } }) {
  return (
    <div className="tb-budget">
      <span className="lab">{label}</span>
      <span className="v">{value}</span>
      {under && <span className={under.ok ? 'under' : 'over'}>{under.text}</span>}
    </div>
  );
}

export function IconLink({ to, children, onClick, title }: { to?: string; children: ReactNode; onClick?: () => void; title?: string }) {
  if (to) return <Link className="tb-icon" to={to} title={title}>{children}</Link>;
  return <button className="tb-icon" onClick={onClick} title={title}>{children}</button>;
}
