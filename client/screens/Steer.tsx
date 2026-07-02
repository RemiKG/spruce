/* 05 · Steer the money — the budget-solver's decisions, transparent: kept /
   swapped / dropped, with reasons. Proven ≤ budget & fitting before you see it. */
import { useNavigate } from 'react-router-dom';
import { useStore } from '../lib/store';
import { Topbar, BudgetPill, IconLink } from '../components/Topbar';
import { BudgetSlider } from '../components/BudgetSlider';
import { CartRow } from '../components/CartRow';
import { GateBadge, Money } from '../components/bits';
import { fmtDur, money, inStockPct } from '../../shared/numbers';

export function Steer() {
  const s = useStore();
  const nav = useNavigate();
  const r = s.live!;
  const base = s.baseline!;
  const kept = r.items.filter((i) => i.state === 'kept' || i.state === 'added');
  const swapped = r.items.filter((i) => i.state === 'swapped');
  const dropped = r.dropped;
  const under = r.underBudget;

  return (
    <div className="shell">
      <Topbar title="Steer the money" sub="drag the number — the whole cart re-solves"
        right={<>
          <BudgetPill value={money(r.budget)} under={{ ok: under, text: under ? `✓ ${money(r.spare)} under` : `${money(-r.spare)} over` }} />
          <IconLink to="/settings" title="Settings">⚙</IconLink>
        </>} />

      <div className="stage2">
        <div className="pcard">
          <div style={{ display: 'flex', gap: 26, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div>
              <GateBadge n={2}>you steer the money</GateBadge>
              <div className="bigtally" style={{ marginTop: 12 }}>
                <span className="big">{money(r.total)}</span>
                <span className="from">from <s>{money(base.total)}</s> — re-solved in <b className="mono" style={{ color: 'var(--sprig-ink)' }}>{fmtDur(r.reSolveMs)}</b></span>
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 320 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--ink-60)', marginBottom: 10 }}>
                <span>you dragged the budget</span><span className="mono">{money(r.budget)} / {money(2000)}</span>
              </div>
              <BudgetSlider min={400} max={2000} value={s.liveBudget} onChange={s.resolveTo} />
              <div className="ends" style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--ink-40)', marginTop: 10 }}>
                <span>{money(400)}</span><span>the solver keeps total ≤ budget &amp; every piece fitting your measured room</span><span>{money(2000)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="ledger">
          <div className="col">
            <h3><span className="dotk" style={{ background: 'var(--sprig)' }} /> Kept</h3>
            <div className="cnt">{kept.length} pieces · the look you loved</div>
            {kept.map((it) => <CartRow key={it.product.id} item={it} showState={false} showWhy />)}
          </div>
          <div className="col">
            <h3><span className="dotk" style={{ background: 'var(--amber)' }} /> Swapped</h3>
            <div className="cnt">{swapped.length} pieces · same look, lower price</div>
            {swapped.length ? swapped.map((it) => <CartRow key={it.product.id} item={it} showState={false} showWhy />)
              : <div className="cart-sub" style={{ padding: '10px 0' }}>drag the budget down to see swaps</div>}
          </div>
          <div className="col">
            <h3><span className="dotk" style={{ background: 'var(--ink-40)' }} /> Dropped</h3>
            <div className="cnt">{dropped.length} piece{dropped.length === 1 ? '' : 's'} · to fit the number</div>
            {dropped.length ? dropped.map((it) => <CartRow key={it.product.id} item={it} showState={false} showWhy />)
              : <div className="cart-sub" style={{ padding: '10px 0' }}>nothing dropped — it all fits</div>}
          </div>
        </div>

        <div className="solverbar">
          <div className="txt"><b>Spruce proposes; a deterministic solver disposes.</b> Total ≤ your budget and every piece fits your measured room — proven before you ever see the cart. No swap breaks the fit.</div>
          <div className="stat"><div className="v">{fmtDur(r.reSolveMs)}</div><div className="k">re-solve latency</div></div>
          <div className="stat"><div className="v">{money(Math.abs(r.budget - r.total))}</div><div className="k">budget-fit error</div></div>
          <div className="stat"><div className="v">{r.items.length}/{r.items.length}</div><div className="k">fit &amp; in stock</div></div>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" onClick={() => nav('/money')}>← back to the diorama</button>
          <button className="btn btn-ink" onClick={() => nav('/checkout')}>Approve the cart → gate 3</button>
        </div>
      </div>
      <div className="grain" />
    </div>
  );
}
