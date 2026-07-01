/* 01 · Snap — the landing IS the intake. Pain-first hook on the left, the
   photo + budget + vibe card on the right, a seeded demo one tap away. */
import { useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../lib/store';
import { Wordmark, Thumbnail } from '../lib/svg';
import { Mascot } from '../lib/svg';

export function Snap() {
  const s = useStore();
  const nav = useNavigate();
  const fileInput = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);

  function onFile(f: File | null) {
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  async function spruce() {
    try { await s.ground(file); nav('/read'); } catch { /* toast shows */ }
  }
  async function demo() {
    await s.startDemo(); nav('/read');
  }

  const provider = s.config?.provider;
  const pill = provider === 'qwen'
    ? { dot: true, text: 'live on Alibaba Cloud' }
    : provider === 'anthropic'
      ? { dot: true, text: 'engine · Anthropic' }
      : { dot: false, text: 'offline · deterministic' };

  return (
    <div className="shell">
      <div className="land-head">
        <Wordmark size={30} />
        <div className="land-nav">
          <Link to="/engine" onClick={(e) => { if (!s.design) { e.preventDefault(); demo(); } }}>How it works</Link>
          <a href="https://github.com/" target="_blank" rel="noopener">GitHub ↗</a>
          <span className="chip pill" style={{ background: pill.dot ? 'color-mix(in srgb, var(--sprig) 14%, var(--cream-hi))' : undefined }}>
            {pill.dot && <span className="dot" />} {pill.text}
          </span>
        </div>
      </div>

      <div className="landing">
        <div className="hero">
          <div className="eyebrow">Autopilot · a designer + sourcing agent</div>
          <h1>Snap the room.<br />Set your number.<br /><span className="green">Approve the cart.</span></h1>
          <p className="lead">
            An interior designer is $2,000 and three weeks. Spruce reads your actual room,
            designs a direction, then sources every piece for real — live products, live
            prices, in stock, that fit your space and add up to <i>under your budget</i>.
          </p>
          <p className="pullquote">A mood board you can't buy is just a tease. The picture is the cart.</p>
          <div className="steps">
            <span className="step"><span className="n">1</span> Snap &amp; tell</span>
            <span className="step"><span className="n">2</span> Approve the look</span>
            <span className="step"><span className="n">3</span> Approve the cart</span>
          </div>
        </div>

        <div className="intake">
          <div className="intake-card">
            <h2>Start with your room.</h2>

            <div className={`drop ${drag ? 'dragover' : ''}`} onClick={() => fileInput.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); onFile(e.dataTransfer.files?.[0] ?? null); }}>
              <div className="drop-thumb">
                {preview ? <img src={preview} alt="your room" />
                  : <Thumbnail thumb={{ fn: 'sofa', o: { seats: 3, body: 'sage', legs: 'walnut' }, vb: '-150 -150 300 176' }} />}
              </div>
              <div className="drop-meta">
                <div className="fn">{file?.name ?? 'add a room photo'}</div>
                <div className="sub">grounded by Qwen3-VL · 1 photo is enough</div>
                <div className="retake">↻ {file ? 'retake or add a quick pan' : 'tap to upload · or drag one in'}</div>
              </div>
              <input ref={fileInput} type="file" accept="image/*" capture="environment" hidden
                onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
            </div>

            <div className="field">
              <div className="lbl">your budget</div>
              <div className="box">
                <span className="cur">$</span>
                <input className="big" type="number" min={100} step={10} value={s.budget}
                  onChange={(e) => s.setBudget(Number(e.target.value))} />
                <span className="hint">all-in · sources under this</span>
              </div>
            </div>

            <div className="field">
              <div className="lbl">the vibe — say it however</div>
              <div className="box">
                <textarea rows={2} value={s.vibe} onChange={(e) => s.setVibe(e.target.value)} />
              </div>
            </div>

            <div className="primary-row">
              <button className="btn btn-ink" onClick={spruce} disabled={s.busy}>Spruce it up →</button>
            </div>
            <div className="subline">
              no account needed · or <a onClick={demo} style={{ cursor: 'pointer' }}>try a seeded demo room →</a> <span className="muted">(clearly marked)</span>
            </div>
          </div>
          <div className="mascot-corner"><Mascot state="hero" size={150} /></div>
        </div>
      </div>
    </div>
  );
}
