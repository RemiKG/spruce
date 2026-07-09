/* 07 · Your cart (gate 3) — itemized, live links, a one-page spec and a printable
   shopping run. Spruce sources; you check out — no card is charged here. */
import { useNavigate } from 'react-router-dom';
import { useStore } from '../lib/store';
import { Topbar, BudgetPill, IconLink } from '../components/Topbar';
import { CartRow } from '../components/CartRow';
import { GateBadge, Chip, Money } from '../components/bits';
import { money } from '../../shared/numbers';

const PAL: Record<string, string> = {
  walnut: '#8C5A3B', oak: '#C7A97B', boucle: '#EFE7D6', linen: '#E8DEC9', sage: '#9FAE98',
  terracotta: '#D98E5A', clay: '#CE8560', cream: '#F4EFE4', beige: '#DAD0BC', gray: '#6E7A74', brass: '#C69A5B',
};

export function Checkout() {
  const s = useStore();
  const nav = useNavigate();
  const d = s.design!;
  const r = s.live!;
  const items = r.items.filter((i) => i.state !== 'dropped');
  const stamp = items[0]?.product.capturedAt ?? '';
  const palette = (d.concept?.palette ?? ['walnut', 'boucle', 'sage', 'terracotta']).slice(0, 4);
  const swatch = (w: string) => { const t = w.toLowerCase(); for (const k of Object.keys(PAL)) if (t.includes(k)) return PAL[k]; return '#DAD0BC'; };
  const openAll = () => items.forEach((i) => window.open(i.product.retailer.url, '_blank', 'noopener'));

  return (
    <div className="shell">
      <Topbar title="Your cart" sub="sourced · itemized · yours to check out"
        right={<>
          <BudgetPill label="total" value={money(r.total)} under={{ ok: r.underBudget, text: r.underBudget ? `✓ ${money(r.spare)} under` : `${money(-r.spare)} over` }} />
          <IconLink to="/settings" title="Settings">⚙</IconLink>
          <IconLink to="/engine" title="Under the hood">↗</IconLink>
        </>} />

      <div className="stage">
        <div className="rail" style={{ flex: 1, width: 'auto' }}>
          <div className="pcard">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <h2 style={{ margin: 0 }}>{items.length} pieces · {money(r.total)}</h2>
              <GateBadge n={3}>approve &amp; check out</GateBadge>
            </div>
            <div className="cart-sub" style={{ margin: '10px 0 6px' }}>
              in stock at capture · price snapshot {stamp} · <Chip tone="sprig" style={{ marginLeft: 6 }}><span className="dot" /> verify at the store</Chip>
            </div>
            <div style={{ marginTop: 6 }}>
              {items.map((it) => <CartRow key={it.product.id} item={it} showState={false} showOpen />)}
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 18, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div className="eyebrow">total · under {money(r.budget)}</div>
                <div className="totalfoot"><span className="big">{money(r.total)}</span> <span className="spare">✓ {money(Math.max(0, r.spare))} to spare</span></div>
              </div>
              <button className="btn btn-ink" onClick={openAll}>Open all &amp; check out →</button>
            </div>
          </div>
        </div>

        <div className="rail">
          <div className="pcard">
            <div className="phead"><h3>One-page spec</h3><button className="linkbtn" onClick={() => window.print()}>export PDF ↗</button></div>
            <div className="spec-row"><span className="k">Room</span><span className="v">{d.room.widthM.toFixed(1)} × {d.room.depthM.toFixed(1)} m · {d.room.light} light</span></div>
            <div className="spec-row"><span className="k">Direction</span><span className="v">{d.brief.styleTags.slice(0, 2).join(' · ')}</span></div>
            <div className="spec-row"><span className="k">Palette</span><span style={{ display: 'flex', gap: 6 }}>{palette.map((w) => <span key={w} style={{ width: 20, height: 20, borderRadius: 6, background: swatch(w), boxShadow: 'inset 0 0 0 1px var(--hair)' }} />)}</span></div>
            <div className="spec-row"><span className="k">Clearances</span><span className="v">all ≥ {r.clearanceMinM.toFixed(1)} m ✓</span></div>
            <div className="spec-row"><span className="k">Fits the door</span><span className="v">≤ {((d.room.doorwayCm ?? 90) / 100).toFixed(2)} m ✓</span></div>
          </div>

          <div className="pcard">
            <div className="phead"><h3>Shopping run</h3><button className="linkbtn" onClick={() => window.print()}>print ↗</button></div>
            {items.map((it) => (
              <div className="run-row" key={it.product.id}>
                <span className="cbx" />
                <span className="nm">{it.product.title} · <span className="muted">{it.product.retailer.name}</span></span>
                <span className="pr">{money(it.product.price)}</span>
              </div>
            ))}
            <p className="body" style={{ marginTop: 14 }}><b>Spruce sources; you check out.</b> No card is charged here — every link opens the real store, and the purchase is always yours.</p>
            <button className="linkbtn" onClick={() => nav('/limits')} style={{ marginTop: 4 }}>see the honest limits →</button>
          </div>
        </div>
      </div>
      <div className="grain" />
    </div>
  );
}
