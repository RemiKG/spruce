/* 03 · The direction (gate 1) — a paper diorama of the concept, the palette, the
   vision-vs-buyable honesty seam, and the approve/nudge gate. */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../lib/store';
import { Diorama } from '../lib/svg';
import { dioramaSpec } from '../../shared/layout';
import { Topbar, IconLink } from '../components/Topbar';
import { Chip, GateBadge } from '../components/bits';

const PAL: Record<string, string> = {
  walnut: '#8C5A3B', oak: '#C7A97B', boucle: '#EFE7D6', linen: '#E8DEC9', sage: '#9FAE98',
  terracotta: '#D98E5A', clay: '#CE8560', cream: '#F4EFE4', beige: '#DAD0BC', oat: '#DAD0BC',
  gray: '#6E7A74', grey: '#6E7A74', brass: '#C69A5B', black: '#233028', white: '#FCFBF7', green: '#3E7A4E', nickel: '#889089',
};
const NUDGES = ['warmer', 'less wood', 'bolder art', 'more plants', 'keep it calm'];

export function Direction() {
  const s = useStore();
  const nav = useNavigate();
  const d = s.design!;
  const spec = dioramaSpec(d.result.items);
  const [nudges, setNudges] = useState<string[]>([]);
  const palette = (d.concept?.palette?.length ? d.concept.palette : ['walnut', 'boucle', 'sage', 'terracotta', 'cream']).slice(0, 5);
  const swatch = (w: string) => { const t = w.toLowerCase(); for (const k of Object.keys(PAL)) if (t.includes(k)) return PAL[k]; return '#DAD0BC'; };

  return (
    <div className="shell">
      <Topbar title="The direction" sub="a concept you approve, then I source it"
        right={<>
          <Chip tone="sprig"><span className="dot" /> {d.brief.directionTitle}</Chip>
          <IconLink to="/settings" title="Settings">⚙</IconLink>
          <IconLink to="/money" title="Skip to the cart">↗</IconLink>
        </>} />

      <div className="stage">
        <div className="diorama">
          <Diorama spec={spec} />
          <div className="framelabel"><Chip><span className="dot" /> the direction — <b>&nbsp;assembling</b></Chip></div>
          <div className="clickhint" style={{ left: '50%', top: '90%', transform: 'translateX(-50%)' }}>nudge any piece, or approve the whole look</div>
        </div>

        <div className="rail">
          <div className="pcard">
            <GateBadge n={1}>approve the look</GateBadge>
            <h2 style={{ marginTop: 14 }}>{d.brief.directionTitle}</h2>
            <p className="body">{d.brief.directionRationale}</p>
            <div className="palette">
              {palette.map((w) => (
                <div className="sw" key={w}><div className="chip-sw" style={{ background: swatch(w) }} /><div className="nm">{w}</div></div>
              ))}
            </div>
          </div>

          <div className="pcard">
            <h3 className="display" style={{ margin: '0 0 12px', fontSize: 18 }}>Vision vs. the buyable truth</h3>
            <div className="vv">
              <div className="vv-card vision"><Diorama spec={spec} /><div className="cap">the vision · not literal</div></div>
              <div className="vv-card"><Diorama spec={spec} /><div className="cap real">◆ what you'll buy · real pieces</div></div>
            </div>
            <p className="body">The dream render is <i>inspiration</i>. The paper diorama is made from the <b>real product photos</b> — so what you see is what you buy.</p>
          </div>

          <div className="pcard">
            <h3 className="display" style={{ margin: '0 0 12px', fontSize: 18 }}>Nudge it, or commit</h3>
            <div className="nudges">
              {NUDGES.map((n) => (
                <span key={n} className={`chip ${nudges.includes(n) ? 'on' : ''}`} onClick={() => setNudges((x) => x.includes(n) ? x.filter((y) => y !== n) : [...x, n])}>{n}</span>
              ))}
            </div>
            <button className="btn btn-ink" style={{ justifyContent: 'center', width: '100%' }} onClick={() => nav('/money')}>
              Approve the direction → source it for real
            </button>
          </div>
        </div>
      </div>
      <div className="grain" />
    </div>
  );
}
