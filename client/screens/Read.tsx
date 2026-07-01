/* 02 · Read the room — Qwen3-VL grounding + the one clarifying question + the
   scale-calibration flex (±0.4 m → ±0.1 m). */
import { useNavigate } from 'react-router-dom';
import { useStore } from '../lib/store';
import { Diorama } from '../lib/svg';
import { Topbar, IconLink } from '../components/Topbar';
import { Chip } from '../components/bits';

const ANCHORS = [
  { left: '52%', top: '33%' }, { left: '17%', top: '40%' },
  { left: '33%', top: '64%' }, { left: '31%', top: '82%' },
];

export function Read() {
  const s = useStore();
  const nav = useNavigate();
  const room = s.room!;
  const spec = s.currentRoomSpec;

  async function toDirection() {
    try { if (!s.design) await s.runDesign(); nav('/direction'); } catch { /* toast */ }
  }

  return (
    <div className="shell">
      <Topbar title="Reading your room" sub="grounding the actual space"
        right={<>
          <Chip tone="sprig"><span className="dot" /> {s.config?.provider === 'qwen' ? 'Qwen3-VL · plus' : s.config?.provider === 'anthropic' ? 'vision · Anthropic' : 'manual grounding'}</Chip>
          <IconLink to="/settings" title="Settings">⚙</IconLink>
        </>} />

      <div className="stage">
        <div className="diorama">
          {s.photoUrl
            ? <div className="photoclip"><img src={s.photoUrl} alt="your room" /></div>
            : spec ? <Diorama spec={spec} /> : null}
          <div className="framelabel"><Chip><span className="dot" /> your photo — <b>&nbsp;as-is</b></Chip></div>

          {room.objects.slice(0, 4).map((o, i) => (
            <div key={i} className={`detlabel ${o.keepCandidate ? 'keep' : ''}`} style={ANCHORS[i]}>
              {o.label}{o.note ? ` · ${o.note}` : ''}{o.keepCandidate ? ' · keep or replace?' : ''}
            </div>
          ))}
          <div className="dimtag" style={{ left: '50%', top: '95%' }}>◄ ≈ {room.widthM.toFixed(1)} m ►</div>
          <div className="dimtag" style={{ left: '6%', top: '62%' }}>≈ {room.depthM.toFixed(1)} m</div>
          {room.calibrated && <div className="detlabel keep" style={{ left: '66%', top: '88%' }}>A4 sheet · scale locked ✓</div>}
        </div>

        <div className="rail">
          <div className="pcard">
            <div className="eyebrow">the read · {s.config?.provider === 'qwen' ? 'qwen3-vl grounding' : 'vl grounding'}</div>
            <div className="readout" style={{ marginTop: 14 }}>
              <div><div className="v">{room.objects.length}</div><div className="k">objects detected</div></div>
              <div><div className="v">{room.light}</div><div className="k">light direction</div></div>
              <div><div className="v">{room.widthM.toFixed(1)}<span className="u">×</span>{room.depthM.toFixed(1)}<span className="u">m</span></div><div className="k">room, {room.calibrated ? 'calibrated' : `±${room.errM.toFixed(1)} m`}</div></div>
            </div>
            <p className="body">
              Existing: <b>{room.objects.slice(0, 4).map((o) => o.label + (o.note ? ` (${o.note})` : '')).join(', ')}</b>.
              Current style: <b>{room.currentStyle}</b>. I can keep the sofa — or find you a warmer one in budget.
            </p>
          </div>

          {room.clarify && (
            <div className="clarify">
              <div className="eyebrow">◆ one quick thing —</div>
              <h3>{room.clarify.question}</h3>
              <div className="row">
                <button className={`btn ${s.clarify === room.clarify.options[0] ? 'btn-amber' : 'btn-ghost'}`} onClick={() => s.setClarify(room.clarify!.options[0])}>{room.clarify.options[0]}</button>
                <button className={`btn ${s.clarify === room.clarify.options[1] ? 'btn-amber' : 'btn-ghost'}`} onClick={() => s.setClarify(room.clarify!.options[1])}>{room.clarify.options[1]} ✓</button>
              </div>
            </div>
          )}

          <div className="pcard calib">
            <div className="phead"><h3 style={{ font: 'inherit' }} className="display">Scale calibration</h3><Chip tone="amber">the accuracy flex</Chip></div>
            <p className="body">Drop an <b>A4 sheet</b> or a credit card into the frame and “will it fit?” becomes measured, not guessed.</p>
            <div className="meterrow"><div className="top"><span>before · single photo</span><span className="amt">±0.4 m</span></div><div className="meter"><i style={{ width: '60%', background: 'var(--ink-25)' }} /></div></div>
            <div className="meterrow"><div className="top"><span>after · reference</span><span className="amt">±0.1 m</span></div><div className="meter"><i style={{ width: '18%' }} /></div></div>
            {!room.calibrated && <button className="btn btn-ghost btn-sm" style={{ marginTop: 8 }} onClick={s.recalibrate}>Recalibrate with a reference</button>}
          </div>

          <button className="btn btn-ink" style={{ justifyContent: 'center' }} onClick={toDirection} disabled={s.busy}>
            Design the direction → <span style={{ opacity: .6 }}>gate 1</span>
          </button>
        </div>
      </div>
      <div className="grain" />
    </div>
  );
}
