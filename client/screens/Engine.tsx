/* 06 · Under the hood — the sourcing engine (for the judges). The pipeline, the
   live auditable NDJSON log, and the measured numbers. Every hard part is a Qwen
   call; strip Qwen out and Spruce doesn't exist. */
import { useNavigate } from 'react-router-dom';
import { useStore } from '../lib/store';
import { Topbar, IconLink } from '../components/Topbar';
import { Chip, StatGrid } from '../components/bits';
import { fmtDur, money, inStockPct } from '../../shared/numbers';

export function Engine() {
  const s = useStore();
  const nav = useNavigate();
  const d = s.design!;
  const e = d.engine;
  const objs = d.room.objects.length;

  const rows = [
    { lead: { m: 'input', s: 'client' }, node: 'fill', title: 'Photo + budget + vibe', desc: `one photo · "${money(d.brief.budget)}" · "${d.brief.styleTags.slice(0, 2).join(', ')}"` },
    { lead: { m: e.grounding, s: 'vision' }, node: 'open', title: 'Ground the room & calibrate', desc: `${objs} objects · clearances · ${d.room.light} light · ${d.room.widthM.toFixed(1)}×${d.room.depthM.toFixed(1)} m ${d.room.calibrated ? '±0.1 (ref)' : `±${d.room.errM.toFixed(1)}`}` },
    { lead: { m: e.styleSearch, s: 'style match' }, node: 'open', title: 'Semantic style search', desc: `brief → rank ${e.catalogSize} real catalog items to "${d.brief.styleTags.slice(0, 3).join(', ')}"` },
    { lead: { m: e.agentLoop, s: e.provider === 'qwen' ? 'preserve_thinking' : 'agentic', amber: true }, node: 'open', title: 'Agentic sourcing loop', desc: 'plans the room, calls tools, reasons over trade-offs', chips: ['web_search', 'web_extractor', 'catalog MCP · skill'] },
    { lead: { m: 'deterministic', s: 'the trust gate' }, node: 'open', title: 'Budget-solver gate', desc: `proves total ${money(d.result.total)} ≤ ${money(d.result.budget)} & every piece fits — before you see it` },
    { lead: { m: e.provider === 'qwen' ? 'qwen3.7-plus' : e.agentLoop, s: 'structured out' }, node: 'open', title: 'Structured cart + rationale', desc: 'strict spec + cart JSON + a "why" for every swap' },
    { lead: { m: e.critic, s: 'VL-as-judge' }, node: 'open', title: `Concept-critic ${d.criticScore?.toFixed(2)}`, desc: `"does the sourced cart achieve the approved look?"  ↺ re-source if < ${d.settings.conceptCriticThreshold}` },
    { lead: { m: 'human', s: 'gate 1·2·3' }, node: 'sprig', title: 'You approve — Spruce never spends', desc: 'propose → solver disposes → you sign off · the purchase is always yours' },
  ];

  return (
    <div className="shell">
      <Topbar title="Under the hood" sub="the sourcing engine · every hard part is a Qwen call"
        right={<>
          <Chip tone="amber">custom skill + MCP</Chip>
          <IconLink to="/money" title="Back to the cart">↩</IconLink>
        </>} />

      <div className="stage" style={{ display: 'block' }}>
        <div className="engine-2">
          <div className="pcard">
            <h2>The engine</h2>
            <p className="body" style={{ marginBottom: 14 }}>Strip Qwen Cloud out and Spruce doesn't exist. Photo &amp; budget in → a real, in-budget cart out.{e.provider !== 'qwen' && <> <b>(Running on the {e.provider} fallback here; the Qwen path is env-ready.)</b></>}</p>
            <div className="pipe">
              {rows.map((row, i) => (
                <div className="pipe-row" key={i}>
                  <div className="lead"><div className={`m ${row.lead.amber ? 'amber' : ''}`}>{row.lead.m}</div><div className="s">{row.lead.s}</div></div>
                  <div className="pipe-node"><div className={`o ${row.node === 'fill' ? 'fill' : row.node === 'sprig' ? 'sprig' : ''}`} />{i < rows.length - 1 && <div className="line" />}</div>
                  <div className="body">
                    <b>{row.title}</b>
                    <div className="d">{row.desc}</div>
                    {row.chips && <div className="toolchips">{row.chips.map((c) => <span key={c} className={`tc ${c.includes('catalog') ? 'amber' : ''}`}>{c}</span>)}</div>}
                  </div>
                </div>
              ))}
            </div>
            <div className="toolchips" style={{ marginTop: 12 }}>
              <span className="tc">↳ cosyvoice-v3-plus · the sprig's voice</span>
              <span className="tc">↳ qwen-image-2.0-pro · vision render (labelled)</span>
            </div>
          </div>

          <div className="stack" style={{ gap: 20 }}>
            <div className="logbox">
              <div className="lh"><span>THE SOURCING RUN · {e.provider.toUpperCase()}</span><span><span className="dot" /> {e.logHash}</span></div>
              {(d.log ?? []).map((ev, i) => (
                <div className="logline" key={i}><span className="tm">{ev.t}</span><span className="st">{ev.step}</span><span>{ev.detail}</span></div>
              ))}
              <div className="logfoot">auditable NDJSON · hash-stamped · replayable · {e.provider === 'qwen' ? 'dashscope-intl.aliyuncs.com' : `engine: ${e.provider}`}</div>
            </div>
            <StatGrid stats={[
              { v: e.catalogSize.toLocaleString(), k: 'catalog searched' },
              { v: e.toolCalls, k: 'tool-calls / design' },
              { v: fmtDur(s.live!.reSolveMs), k: 're-solve latency' },
              { v: <>{money(Math.abs(d.result.budget - d.result.total))}<small>/{money(d.result.budget)}</small></>, k: 'budget-fit error' },
              { v: d.criticScore?.toFixed(2), k: 'concept-critic' },
              { v: `${inStockPct(d.result)}%`, k: 'in stock & clickable' },
            ]} />
          </div>
        </div>
      </div>
      <div className="grain" />
    </div>
  );
}
