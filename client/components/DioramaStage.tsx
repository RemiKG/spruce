/* Spruce — the buyable diorama with pinned, tappable price-tags, the dropped-piece
   ghost, the click-through hint and the sprig's narration bubble. Tapping a
   price-tag opens the real retailer page at the shown price. */
import { dioramaSpec, ghostSvg, PIN_ANCHOR } from '../../shared/layout';
import { Diorama, Sprig } from '../lib/svg';
import { money } from '../../shared/numbers';
import type { SolveResult, Slot } from '../../shared/types';

const NOUN: Record<Slot, string> = {
  seating_primary: 'sofa', lighting: 'lamp', coffee_table: 'coffee table', rug: 'rug',
  seating_secondary: 'extra seat', side_table: 'side table', plant: 'plant',
  wall_art: 'wall piece', storage: 'shelf', accent: 'accent',
};

export function DioramaStage({ result, narration, showPins = true, framelabel = true }: {
  result: SolveResult; narration?: string; showPins?: boolean; framelabel?: boolean;
}) {
  const spec = dioramaSpec(result.items);
  const ghosts = ghostSvg(result.dropped);
  const sofa = result.items.find((i) => i.slot === 'seating_primary');
  const drop = result.dropped.find((d) => !d.product.wallMount);

  return (
    <div className="diorama" id="dio">
      <Diorama spec={spec} ghosts={ghosts} />
      {framelabel && (
        <div className="framelabel">
          <span className="chip"><span className="dot" /> the buyable diorama — <b>&nbsp;every piece real</b></span>
        </div>
      )}

      {showPins && result.items.map((it) => {
        const a = PIN_ANCHOR[it.slot];
        if (!a || it.product.wallMount) return null;
        const kept = it.state === 'kept';
        return (
          <div className="pin" key={it.slot + it.product.id} style={{ left: `${a.left * 100}%`, top: `${a.top * 100}%` }}
            onClick={() => window.open(it.product.retailer.url, '_blank', 'noopener')} title={`Open ${it.product.retailer.name} ↗`}>
            {it.state === 'swapped' && it.prevPrice != null && <span className="swaptag">was {money(it.prevPrice)} · swapped ↔</span>}
            <span className={`ptag ${kept ? 'kept' : ''}`}>{money(it.product.price)}{kept ? ' · kept' : ''}</span>
            <span className="stem" />
          </div>
        );
      })}

      {drop && (() => {
        const a = PIN_ANCHOR[drop.slot];
        return a ? <div className="dimtag" style={{ left: `${a.left * 100}%`, top: `${Math.min(0.95, a.top + 0.08) * 100}%` }}>
          {NOUN[drop.slot]} · dropped to free {money(drop.prevPrice ?? drop.product.price)}</div> : null;
      })()}

      {sofa && (
        <div className="clickhint" style={{ left: '29%', top: '70%' }}>
          click the sofa → opens <b>&nbsp;{sofa.product.retailer.name}</b>&nbsp; at {money(sofa.product.price)} ↗
        </div>
      )}

      {narration && (
        <div className="narrate" style={{ left: 22, bottom: 20 }}>
          <div className="av"><Sprig size={40} /></div>
          <div className="bubble">{narration}</div>
        </div>
      )}
    </div>
  );
}
