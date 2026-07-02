/* 04 · The money shot (gate 2) — the buyable diorama + the always-visible budget
   slider that re-solves the WHOLE cart live. The one mechanic: drag the number,
   watch the cart re-solve, tap a piece to open the real store at that price. */
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../lib/store';
import { Topbar, BudgetPill, IconLink } from '../components/Topbar';
import { DioramaStage } from '../components/DioramaStage';
import { BudgetSlider } from '../components/BudgetSlider';
import { CartRow } from '../components/CartRow';
import { GateBadge, StatGrid, Money, Chip } from '../components/bits';
import { templateNarration } from '../../shared/narrate';
import { SLOT_WEIGHT } from '../../shared/solver';
import { fmtDur, money } from '../../shared/numbers';

export function MoneyShot() {
  const s = useStore();
  const nav = useNavigate();
  const d = s.design!;
  const r = s.live!;
  const [copied, setCopied] = useState(false);

  const kept = r.items.filter((i) => i.state === 'kept');
  const swapped = r.items.filter((i) => i.state === 'swapped');
  const narration = useMemo(
    () => templateNarration({ budget: r.budget, total: r.total, kept, swapped, dropped: r.dropped }),
    [r],
  );

  const rows = useMemo(() => {
    const all = [...r.items, ...r.dropped];
    return all.sort((a, b) => (SLOT_WEIGHT[b.slot] - SLOT_WEIGHT[a.slot]));
  }, [r]);

  const under = r.underBudget;
  function copyShare() {
    const url = `${location.origin}/d/${d.share ?? ''}`;
    navigator.clipboard?.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1600); });
  }

  return (
    <div className="shell">
      <Topbar title="Your living room" sub={`${d.brief.styleTags.slice(0, 2).join(' · ')}`}
        right={<>
          <BudgetPill value={money(r.budget)} under={{ ok: under, text: under ? `✓ ${money(r.spare)} under` : `${money(-r.spare)} over` }} />
          <IconLink to="/settings" title="Settings">⚙</IconLink>
          <IconLink to="/engine" title="Under the hood">↗</IconLink>
          <IconLink onClick={copyShare} title="Copy share link">{copied ? '✓' : '⧉'}</IconLink>
        </>} />

      <div className="stage">
        <DioramaStage result={r} narration={narration} />

        <div className="rail">
          <div className="pcard">
            <GateBadge n={2}>you steer the money</GateBadge>
            <div className="tally" style={{ marginTop: 14 }}>
              <span className="big">{money(r.total)}</span><span className="goal">/ {money(r.budget)}</span>
            </div>
            <div className="tally-sub">
              <Chip tone={under ? 'sprig' : 'amber'}><span className="dot" /> {under ? 'under budget' : 'over budget'}</Chip>
              <span className={`spare ${under ? '' : 'over'}`}>{under ? `${money(r.spare)} to spare` : `${money(-r.spare)} over`}</span>
              · re-solved in <span className="mono" style={{ color: 'var(--ink)' }}>{fmtDur(r.reSolveMs)}</span>
            </div>
            <div className="sliderblock">
              <BudgetSlider min={400} max={2000} value={s.liveBudget} onChange={s.resolveTo} />
              <div className="ends"><span>{money(400)}</span><span>drag to re-solve the whole cart</span><span>{money(2000)}</span></div>
            </div>
          </div>

          <div className="pcard grow">
            <div className="phead">
              <h3>The cart · sourced live</h3>
              <span style={{ display: 'flex', gap: 14 }}>
                <button className="linkbtn" onClick={() => nav('/steer')}>steer →</button>
                <button className="linkbtn" onClick={() => s.setShowWhy(!s.showWhy)}>why this? ↓</button>
              </span>
            </div>
            <div className="cart-list">
              {rows.map((it) => <CartRow key={it.slot + it.product.id} item={it} showWhy={s.showWhy} />)}
            </div>
            <StatGrid stats={[
              { v: d.engine.catalogSize.toLocaleString(), k: 'catalog searched' },
              { v: d.engine.toolCalls, k: 'tool-calls' },
              { v: <>{money(Math.abs(r.budget - r.total))}<small>/{money(r.budget)}</small></>, k: 'budget-fit' },
            ]} />
            <button className="btn btn-ink" style={{ marginTop: 16, justifyContent: 'center', width: '100%' }} onClick={() => nav('/checkout')}>
              Approve the cart → <span style={{ opacity: .6 }}>gate 3</span>
            </button>
          </div>
        </div>
      </div>
      <div className="grain" />
    </div>
  );
}
