/* 08 · Settings — power user. Six focused groups. Defaults just work; the
   solver-affecting dials re-solve the cart live. */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../lib/store';
import { Topbar, IconLink } from '../components/Topbar';
import { Chip } from '../components/bits';
import { DEFAULT_SETTINGS, type Currency } from '../../shared/types';

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return <div className={`toggle ${on ? 'on' : ''}`} onClick={onClick} role="switch" aria-checked={on}><span className="k" /></div>;
}
function Seg<T extends string | number>({ options, value, onChange }: { options: { v: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return <div className="seg">{options.map((o) => <button key={String(o.v)} className={value === o.v ? 'on' : ''} onClick={() => onChange(o.v)}>{o.label}</button>)}</div>;
}

function download(name: string, text: string, type: string) {
  const b = new Blob([text], { type }); const u = URL.createObjectURL(b);
  const a = document.createElement('a'); a.href = u; a.download = name; a.click(); URL.revokeObjectURL(u);
}

export function Settings() {
  const s = useStore();
  const nav = useNavigate();
  const set = s.settings;
  const [pt, setPt] = useState(true);
  const [maxTools, setMaxTools] = useState(80);
  const [slack] = useState(true);
  const [affiliate, setAffiliate] = useState(true);

  const live = s.live;
  const pinTargets = live ? live.items.filter((i) => i.slot === 'lighting' || i.slot === 'coffee_table') : [];

  function exportJSON() {
    if (!s.design || !live) return;
    download('spruce-cart.json', JSON.stringify({ room: s.design.room, brief: s.design.brief, total: live.total, cart: live.items.map((i) => ({ title: i.product.title, price: i.product.price, retailer: i.product.retailer.name, url: i.product.retailer.url })) }, null, 2), 'application/json');
  }
  function exportCSV() {
    if (!live) return;
    const rows = [['title', 'retailer', 'price', 'url'], ...live.items.map((i) => [i.product.title, i.product.retailer.name, String(i.product.price), i.product.retailer.url])];
    download('spruce-cart.csv', rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n'), 'text/csv');
  }

  return (
    <div className="shell">
      <Topbar title="Settings" sub="power user"
        right={<>
          <Chip tone="sprig"><span className="dot" /> defaults just work</Chip>
          <IconLink onClick={() => nav(-1)} title="Back">↩</IconLink>
        </>} />

      <div className="stage2">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="display" style={{ margin: '4px 0 6px', fontSize: 34 }}>Settings</h1>
            <p className="muted" style={{ maxWidth: '46em' }}>Spruce is great on defaults. These dials are for the people who do this all day — stagers, realtors and small studios.</p>
          </div>
          <button className="btn btn-ghost" onClick={() => s.applySettings(DEFAULT_SETTINGS)}>Reset to defaults</button>
        </div>

        <div className="settings-grid">
          {/* Budget & the solver */}
          <div className="setcard">
            <h3><span className="ic">◇</span> Budget &amp; the solver</h3>
            <div className="setrow"><div className="lab">Cap mode<div className="s">never exceeds vs. soft ±</div></div>
              <Seg options={[{ v: 'hard', label: 'hard cap' }, { v: 'soft', label: 'soft ±5%' }]} value={set.capMode} onChange={(v) => s.applySettings({ capMode: v as any })} /></div>
            <div className="setrow"><div className="lab">Leave headroom</div><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><input type="range" min={0} max={0.1} step={0.01} value={set.leaveHeadroomPct} onChange={(e) => s.applySettings({ leaveHeadroomPct: Number(e.target.value) })} /><span className="val">{Math.round(set.leaveHeadroomPct * 100)}%</span></div></div>
            <div className="setrow"><div className="lab">Include tax + shipping</div><Toggle on={set.includeTaxShipping} onClick={() => s.applySettings({ includeTaxShipping: !set.includeTaxShipping })} /></div>
            <div className="setrow"><div className="lab">Currency</div>
              <select className="val" value={set.currency} onChange={(e) => s.applySettings({ currency: e.target.value as Currency })} style={{ background: 'var(--cream-lo)', border: 0, padding: '8px 10px', borderRadius: 10 }}>
                {['USD', 'EUR', 'GBP', 'CAD', 'AUD'].map((c) => <option key={c} value={c}>{c} {c === 'USD' ? '$' : ''}</option>)}
              </select></div>
          </div>

          {/* Fit & safety */}
          <div className="setcard">
            <h3><span className="ic">↔</span> Fit &amp; safety</h3>
            <div className="setrow"><div className="lab">Clearance margin<div className="s">walkways around pieces</div></div><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><input type="range" min={20} max={100} step={5} value={set.clearanceMarginCm} onChange={(e) => s.applySettings({ clearanceMarginCm: Number(e.target.value) })} /><span className="val">{set.clearanceMarginCm} cm</span></div></div>
            <div className="setrow"><div className="lab">Must fit through the doorway</div><Toggle on={set.mustFitDoorway} onClick={() => s.applySettings({ mustFitDoorway: !set.mustFitDoorway })} /></div>
            <div className="setrow"><div className="lab">Assembled-size check</div><Toggle on={set.assembledCheck} onClick={() => s.applySettings({ assembledCheck: !set.assembledCheck })} /></div>
            <div className="setrow"><div className="lab">Units</div><Seg options={[{ v: 'cm', label: 'cm' }, { v: 'in', label: 'in' }]} value={set.units} onChange={(v) => s.applySettings({ units: v as any })} /></div>
          </div>

          {/* Where I source */}
          <div className="setcard">
            <h3><span className="ic">◎</span> Where I source</h3>
            <div className="setrow"><div className="lab">Region</div><select className="val" value={set.region} onChange={(e) => s.applySettings({ region: e.target.value })} style={{ background: 'var(--cream-lo)', border: 0, padding: '8px 10px', borderRadius: 10 }}><option value="US">US · West</option><option value="US">US · East</option></select></div>
            <div className="setrow"><div className="lab">Source from</div><Seg options={[{ v: 'true', label: 'catalog' }, { v: 'false', label: 'web + catalog' }]} value={String(set.catalogOnly)} onChange={(v) => s.applySettings({ catalogOnly: v === 'true' })} /></div>
            <div className="setrow"><div className="lab">Secondhand OK</div><Toggle on={set.secondhandOk} onClick={() => s.applySettings({ secondhandOk: !set.secondhandOk })} /></div>
            <div className="setrow" style={{ flexWrap: 'wrap', gap: 8 }}>
              <Chip tone="sprig">IKEA</Chip>
              <span className={`chip ${set.excludeRetailers.includes('FastFurni') ? '' : 'chip-sprig'}`} onClick={() => s.applySettings({ excludeRetailers: set.excludeRetailers.includes('FastFurni') ? set.excludeRetailers.filter((r) => r !== 'FastFurni') : [...set.excludeRetailers, 'FastFurni'] })} style={{ cursor: 'pointer' }}>
                <span className={set.excludeRetailers.includes('FastFurni') ? 'strike' : ''}>FastFurni</span>
              </span>
            </div>
          </div>

          {/* Style & locks */}
          <div className="setcard">
            <h3><span className="ic">✦</span> Style &amp; locks</h3>
            <div className="setrow"><div className="lab">Match strictness<div className="s">loose ↔ exact to the concept</div></div><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><input type="range" min={0} max={1} step={0.01} value={set.matchStrictness} onChange={(e) => s.applySettings({ matchStrictness: Number(e.target.value) })} /><span className="val">{set.matchStrictness.toFixed(2)}</span></div></div>
            <div className="setrow" style={{ flexWrap: 'wrap', gap: 8 }}><div className="lab" style={{ width: '100%' }}>Pinned “keep” pieces</div>
              {pinTargets.map((it) => {
                const on = set.pinnedKeep.includes(it.product.id);
                return <span key={it.product.id} className={`chip ${on ? 'chip-sprig' : ''}`} style={{ cursor: 'pointer' }} onClick={() => s.applySettings({ pinnedKeep: on ? set.pinnedKeep.filter((p) => p !== it.product.id) : [...set.pinnedKeep, it.product.id] })}>
                  {it.slot === 'lighting' ? 'lamp' : 'coffee table'} {on ? '🔒' : ''}</span>;
              })}
              {!pinTargets.length && <span className="muted" style={{ fontSize: 13 }}>source a design to pin pieces</span>}
            </div>
            <div className="setrow" style={{ flexWrap: 'wrap', gap: 8 }}><div className="lab" style={{ width: '100%' }}>Avoid materials</div>
              {['glass', 'chrome', 'leather'].map((m) => {
                const on = set.avoidMaterials.includes(m);
                return <span key={m} className={`chip ${on ? 'chip-amber' : ''}`} style={{ cursor: 'pointer' }} onClick={() => s.applySettings({ avoidMaterials: on ? set.avoidMaterials.filter((x) => x !== m) : [...set.avoidMaterials, m] })}><span className={on ? '' : ''}>{m}</span></span>;
              })}
            </div>
          </div>

          {/* The agent */}
          <div className="setcard">
            <h3><span className="ic">⚙</span> The agent</h3>
            <div className="setrow"><div className="lab">preserve_thinking<div className="s">Alibaba's agentic setting</div></div><Toggle on={pt} onClick={() => setPt(!pt)} /></div>
            <div className="setrow"><div className="lab">Max tool-calls / design</div><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><input type="range" min={10} max={120} step={5} value={maxTools} onChange={(e) => setMaxTools(Number(e.target.value))} /><span className="val">{maxTools}</span></div></div>
            <div className="setrow"><div className="lab">Concept-critic threshold<div className="s">re-source below</div></div><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><input type="range" min={0} max={1} step={0.05} value={set.conceptCriticThreshold} onChange={(e) => s.applySettings({ conceptCriticThreshold: Number(e.target.value) })} /><span className="val">{set.conceptCriticThreshold.toFixed(2)}</span></div></div>
            <div className="setrow"><div className="lab">Re-source attempts</div><Seg options={[{ v: 1, label: '1' }, { v: 2, label: '2' }, { v: 3, label: '3' }]} value={set.reSourceAttempts} onChange={(v) => s.applySettings({ reSourceAttempts: v as number })} /></div>
          </div>

          {/* Connect & export */}
          <div className="setcard">
            <h3><span className="ic">⇄</span> Connect &amp; export</h3>
            <div className="setrow"><div className="lab">Slack<div className="s">approve carts in a channel</div></div><Chip tone="sprig">connected ✓</Chip></div>
            <div className="setrow"><div className="lab">Telegram</div><button className="btn btn-ink btn-sm">connect</button></div>
            <div className="setrow"><div className="lab">Affiliate transparency<div className="s">flag any affiliate link</div></div><Toggle on={affiliate} onClick={() => setAffiliate(!affiliate)} /></div>
            <div className="setrow"><div className="lab">Export</div><div className="seg"><button onClick={() => window.print()}>PDF</button><button onClick={exportCSV}>CSV</button><button onClick={exportJSON}>JSON</button></div></div>
          </div>
        </div>
      </div>
      <div className="grain" />
    </div>
  );
}
