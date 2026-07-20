/* 03 · The direction (gate 1) — a paper diorama of the concept, the palette, the
   vision-vs-buyable honesty seam, and the approve/nudge gate. */
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../lib/store';
import { Diorama } from '../lib/svg';
import { dioramaSpec } from '../../shared/layout';
import { Topbar, IconLink } from '../components/Topbar';
import { Chip, GateBadge } from '../components/bits';

const PAL: Record<string, string> = {
  walnut: '#8C5A3B', oak: '#C7A97B', boucle: '#EFE7D6', linen: '#E8DEC9', sage: '#9FAE98',
  terracotta: '#D98E5A', clay: '#CE8560', cream: '#F4EFE4', beige: '#DAD0BC', oat: '#E4D9C0',
  gray: '#6E7A74', grey: '#6E7A74', brass: '#C69A5B', black: '#233028', white: '#FCFBF7', green: '#3E7A4E', nickel: '#889089',
  teak: '#8A5C3A', pine: '#A87F4F', birch: '#D9C6A5', maple: '#C89B66', mahogany: '#6E3F2E', chestnut: '#7A4A32',
  wood: '#9C6B44', timber: '#9C6B44', rattan: '#C2A06B', wicker: '#B99668', jute: '#C7B190', bamboo: '#C9B27A',
  wool: '#E5DCC8', cotton: '#F0E9DA', canvas: '#E3D9C2', ivory: '#F2EAD8', bone: '#EAE2D0', pearl: '#EFECE2',
  sand: '#D8C9A8', stone: '#B8B0A2', taupe: '#A89887', greige: '#B5AC9C', mushroom: '#B3A695', khaki: '#A79B72',
  charcoal: '#3A423E', graphite: '#4C5450', slate: '#5C6864', ink: '#2A342E', smoke: '#9AA19B', fog: '#C6C9C2',
  olive: '#7A7A4E', moss: '#6D7A55', forest: '#3E5A44', mint: '#A9C4AD', eucalyptus: '#8FA893', fern: '#5F7A54',
  jade: '#6FA184', emerald: '#3F7A5C', pistachio: '#B5C398', avocado: '#8A9155',
  teal: '#5E8A80', aqua: '#8FBDB4', seafoam: '#A9CBBB', turquoise: '#63A39B',
  navy: '#3A4A5A', denim: '#5C6E84', indigo: '#4A4E6E', blue: '#6B7F94', steel: '#7A8590', cobalt: '#4A5F8A',
  mustard: '#C9A13B', ochre: '#C08A3E', amber: '#D99A3D', gold: '#C9A54F', honey: '#D9A85C', butter: '#EFDFA8',
  caramel: '#B97F4A', tan: '#C4996C', camel: '#B78A5C', wheat: '#DCC79A', straw: '#D9C583', latte: '#CBB393',
  copper: '#B0714A', bronze: '#8A6A45', rust: '#B06A42', cinnamon: '#A5683F', paprika: '#B25C3B',
  chocolate: '#5A3E2C', espresso: '#4A362A', coffee: '#6B4E38', mocha: '#8A6E56', umber: '#7A5638',
  peach: '#EBB58E', apricot: '#E8A874', blush: '#E3B8A6', rose: '#C98A87', coral: '#D98A72', salmon: '#DE9B82',
  plum: '#6E4A5E', mauve: '#A08398', lavender: '#A99BB8', lilac: '#B7A6C4', burgundy: '#6E3A44', wine: '#743F4C',
};
const NUDGES = ['warmer', 'less wood', 'bolder art', 'more plants', 'keep it calm'];
const GATE_BEAT = ['sealing the direction…', 'laying out the buyable diorama…', 'cart ready ✓'];

/** Word → swatch colour: dictionary first, then a deterministic muted hue from
 *  the word itself — so five palette words always give five real colours. */
function swatchColor(word: string): string {
  const t = word.toLowerCase();
  for (const k of Object.keys(PAL)) if (t.includes(k)) return PAL[k];
  let h = 7;
  for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) % 997;
  return `hsl(${30 + (h % 180)} 32% 62%)`;
}

export function Direction() {
  const s = useStore();
  const nav = useNavigate();
  const d = s.design!;
  const spec = dioramaSpec(d.result.items);
  const [beat, setBeat] = useState<string | null>(null);
  const palette = (d.concept?.palette?.length ? d.concept.palette : ['walnut', 'boucle', 'sage', 'terracotta', 'cream']).slice(0, 5);
  const swatches = useMemo(() => {
    const used = new Map<string, number>();
    return palette.map((w) => {
      let c = swatchColor(w);
      const n = used.get(c) ?? 0; used.set(c, n + 1);
      if (n > 0) c = `color-mix(in srgb, ${c} ${100 - n * 24}%, ${n % 2 ? '#233028' : '#FCFBF7'})`;
      return { w, c };
    });
  }, [palette.join('|')]);
  const moodWash = `linear-gradient(135deg, ${swatches.map((s2, i) => `${s2.c} ${Math.round((i / Math.max(1, swatches.length - 1)) * 100)}%`).join(', ')})`;

  function toggleNudge(n: string) {
    s.setNudges(s.nudges.includes(n) ? s.nudges.filter((y) => y !== n) : [...s.nudges, n]);
  }

  function approve() {
    if (beat) return;
    setBeat(GATE_BEAT[0]);
    setTimeout(() => setBeat(GATE_BEAT[1]), 480);
    setTimeout(() => setBeat(GATE_BEAT[2]), 980);
    setTimeout(() => nav('/money'), 1300);
  }

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
              {swatches.map(({ w, c }) => (
                <div className="sw" key={w}><div className="chip-sw" style={{ background: c }} /><div className="nm">{w}</div></div>
              ))}
            </div>
          </div>

          <div className="pcard">
            <h3 className="display" style={{ margin: '0 0 12px', fontSize: 18 }}>Vision vs. the buyable truth</h3>
            <div className="vv">
              <div className="vv-card vision">
                <Diorama spec={spec} />
                <div className="moodwash" style={{ background: moodWash }} />
                <div className="mood-title">{d.brief.directionTitle}</div>
                <div className="cap">the vision · a mood, not a promise</div>
              </div>
              <div className="vv-card"><Diorama spec={spec} /><div className="cap real">◆ what you'll buy · real pieces</div></div>
            </div>
            <p className="body">The dream render is <i>inspiration</i>. The paper diorama is made from the <b>real product photos</b> — so what you see is what you buy.</p>
          </div>

          <div className="pcard">
            <h3 className="display" style={{ margin: '0 0 12px', fontSize: 18 }}>Nudge it, or commit</h3>
            <div className="nudges">
              {NUDGES.map((n) => (
                <span key={n} className={`chip ${s.nudges.includes(n) ? 'on' : ''}`} onClick={() => toggleNudge(n)}>{n}</span>
              ))}
            </div>
            {s.nudges.length > 0 && <p className="body" style={{ margin: '0 0 12px', fontSize: 13 }}>noted: <b>{s.nudges.join(' · ')}</b> — I'll point at how the cart answers each one.</p>}
            <button className="btn btn-ink" style={{ justifyContent: 'center', width: '100%' }} onClick={approve} disabled={!!beat}>
              {beat ? <><span className="spin" style={{ borderColor: 'rgba(255,255,255,.35)', borderTopColor: '#fff' }} /> {beat}</> : <>Approve the direction → source it for real</>}
            </button>
          </div>
        </div>
      </div>
      <div className="grain" />
    </div>
  );
}
