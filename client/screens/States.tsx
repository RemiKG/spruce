/* 09 · Gentle states & honest limits — no red, never shaming. Over-budget, the
   out-of-stock auto-swap, the calibration prompt, and the honest-limits list. */
import { useNavigate } from 'react-router-dom';
import { useStore } from '../lib/store';
import { Topbar, IconLink } from '../components/Topbar';
import { Chip } from '../components/bits';
import { Mascot, Thumbnail } from '../lib/svg';
import { money } from '../../shared/numbers';

export function States() {
  const s = useStore();
  const nav = useNavigate();
  const over = s.live && !s.live.underBudget;
  const budgetRef = over ? s.live!.budget : 600;
  const overAmt = over ? -s.live!.spare : 120;
  const raiseTo = over ? Math.ceil((s.live!.total + 20) / 10) * 10 : 720;

  return (
    <div className="shell">
      <Topbar title="Gentle states & honest limits" sub="no red, never shaming"
        right={<>
          <Chip tone="sprig"><span className="dot" /> the honest bits</Chip>
          <IconLink onClick={() => nav(-1)} title="Back">↩</IconLink>
        </>} />

      <div className="stage2">
        <div className="states-top">
          <div className="statecard amber">
            <div className="eyebrow">over budget · gentle</div>
            <h3>That's {money(overAmt)} over your {money(budgetRef)}.</h3>
            <p>No drama — want me to find the same look for less, or nudge the number up?</p>
            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <button className="btn btn-amber btn-sm" onClick={() => nav('/money')}>Find the look for less</button>
              <button className="btn btn-ghost btn-sm" onClick={() => { s.resolveTo(raiseTo); nav('/money'); }}>Raise to {money(raiseTo)}</button>
            </div>
            <div style={{ position: 'absolute', right: 4, top: -6, pointerEvents: 'none' }}><Mascot state="shrug" size={104} /></div>
          </div>

          <div className="statecard">
            <div className="eyebrow">out of stock · auto-swap</div>
            <h3>The walnut table just sold out.</h3>
            <p>Quietly swapped to a near-identical oak one — <b>same {money(96)}</b>, in stock, still fits. Nothing for you to do.</p>
            <div className="swaprow" style={{ marginTop: 14 }}>
              <div className="th"><Thumbnail thumb={{ fn: 'coffeeTable', o: { wood: 'walnut', styled: false }, vb: '-110 -74 220 94' }} /></div>
              <span>→</span>
              <div className="th"><Thumbnail thumb={{ fn: 'coffeeTable', o: { wood: 'oak', styled: false }, vb: '-110 -74 220 94' }} /></div>
              <span className="linkbtn" style={{ marginLeft: 'auto' }}>see the swap →</span>
            </div>
          </div>

          <div className="statecard">
            <div className="eyebrow">accuracy · error bars</div>
            <h3>Single-photo depth is ±0.4 m.</h3>
            <p>Honest by default. Drop a credit card or A4 sheet in the frame and “will it fit?” gets real (<span className="mono">±0.1 m</span>).</p>
            <button className="btn btn-ink btn-sm" style={{ marginTop: 14 }} onClick={() => { s.recalibrate(); nav('/read'); }}>Recalibrate with a reference</button>
          </div>
        </div>

        <div className="states-mid">
          <div className="pcard limits">
            <div className="eyebrow" style={{ marginBottom: 8 }}>honest limits · stated in the UI, not hidden</div>
            <ul>
              <li><span className="di">◇</span><span><b>One photo has error bars.</b> Dimensions carry ± until you add a reference object — that's what the calibration step is for.</span></li>
              <li><span className="di">◇</span><span><b>Catalog coverage starts in one region</b> and expands. Outside it, Spruce leans on live web search rather than faking local stock.</span></li>
              <li><span className="di">◇</span><span><b>Stock &amp; prices move.</b> Every cart is timestamped and re-checkable; a sold-out piece auto-swaps rather than lying about availability.</span></li>
              <li><span className="di">◇</span><span><b>The vision render is labelled.</b> It's inspiration, not a literal install — the buyable truth is the diorama built from real product photos.</span></li>
              <li><span className="di">◇</span><span><b>Spruce sources; you check out.</b> No card is charged here — the purchase is always yours, on the real store.</span></li>
            </ul>
          </div>
          <div className="stack" style={{ gap: 16 }}>
            <div className="pcard"><h3 className="display" style={{ margin: '0 0 6px', fontSize: 17 }}>◆ The buyable diorama <Chip tone="sprig" style={{ marginLeft: 6 }}>what you buy</Chip></h3><p className="body">Real product photos, background-removed and placed in your measured room. What you see is what you buy — to the dollar.</p></div>
            <div className="pcard"><h3 className="display" style={{ margin: '0 0 6px', fontSize: 17 }}>The vision render <Chip tone="amber" style={{ marginLeft: 6 }}>not literal</Chip></h3><p className="body">A qwen-image “dream” of the finished room. Clearly marked — we never pass it off as the thing you'll receive.</p></div>
            <div className="pcard"><h3 className="display" style={{ margin: '0 0 6px', fontSize: 17 }}>⧗ Timestamped &amp; re-checkable</h3><p className="body">Stock &amp; prices move, so every cart is stamped with the date it was priced — every link opens the real store, so confirm there before you buy.</p></div>
          </div>
        </div>
      </div>
      <div className="grain" />
    </div>
  );
}
