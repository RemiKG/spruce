/* Spruce client store. Holds the inputs, the grounded room, and the sourced
   design. The budget slider re-solves the WHOLE cart locally, in the browser,
   using the exact same deterministic solver the server used to prove the initial
   cart — so a drag re-solves in milliseconds against the sourced candidates. */
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Design, RoomModel, SolveResult, SolverSettings, Slot } from '../../shared/types';
import type { RoomSpec } from '../../shared/render/room';
import { DEFAULT_SETTINGS } from '../../shared/types';
import { solve, planFor } from '../../shared/solver';
import { api, fileToBase64, type Config } from './api';

type Store = {
  config: Config | null;
  loadConfig: () => Promise<void>;

  vibe: string; setVibe: (v: string) => void;
  budget: number; setBudget: (n: number) => void;
  hasReference: boolean; setHasReference: (b: boolean) => void;
  photoUrl: string | null;

  room: RoomModel | null;
  currentRoomSpec: RoomSpec | null;
  design: Design | null;
  baseline: SolveResult | null;
  live: SolveResult | null;
  liveBudget: number;
  settings: SolverSettings;
  plan: Slot[];

  clarify: string | null; setClarify: (s: string | null) => void;
  nudges: string[]; setNudges: (n: string[]) => void;
  showWhy: boolean; setShowWhy: (b: boolean) => void;
  seeded: boolean;

  busy: boolean; error: string | null;

  startDemo: () => Promise<void>;
  ground: (file?: File | null) => Promise<void>;
  runDesign: () => Promise<void>;
  resolveTo: (budget: number) => void;
  applySettings: (patch: Partial<SolverSettings>) => void;
  recalibrate: () => Promise<void>;
  loadShare: (token: string) => Promise<void>;
  reset: () => void;
};

const Ctx = createContext<Store | null>(null);
export const useStore = () => {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore outside provider');
  return s;
};

const DEMO_VIBE = 'cozier but not grandma, warm woods, keep my green couch, under $800';

export function StoreProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<Config | null>(null);
  const [vibe, setVibe] = useState(DEMO_VIBE);
  const [budget, setBudget] = useState(800);
  const [hasReference, setHasReference] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [room, setRoom] = useState<RoomModel | null>(null);
  const [currentRoomSpec, setCurrentRoomSpec] = useState<RoomSpec | null>(null);
  const [design, setDesign] = useState<Design | null>(null);
  const [baseline, setBaseline] = useState<SolveResult | null>(null);
  const [live, setLive] = useState<SolveResult | null>(null);
  const [liveBudget, setLiveBudget] = useState(800);
  const [settings, setSettings] = useState<SolverSettings>(DEFAULT_SETTINGS);
  const [clarify, setClarify] = useState<string | null>(null);
  const [nudges, setNudges] = useState<string[]>([]);
  const [showWhy, setShowWhy] = useState(false);
  const [seeded, setSeeded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const plan = useMemo(() => (design ? planFor(design.room, design.brief) : []), [design]);

  async function loadConfig() {
    try { setConfig(await api.config()); } catch (e) { /* offline is fine */ }
  }

  async function startDemo() {
    setBusy(true); setError(null);
    try {
      const { design: d, currentRoomSpec: crs, vibe: dv, budget: db } = await api.demo();
      setSeeded(true); setVibe(dv); setBudget(db); setPhotoUrl(null);
      setRoom(d.room); setCurrentRoomSpec(crs);
      setDesign(d); setSettings(d.settings);
      setBaseline(d.result); setLive(d.result); setLiveBudget(db);
      setClarify(d.room.clarify ? d.room.clarify.options[1] : null);
    } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }

  async function ground(file?: File | null) {
    setBusy(true); setError(null); setSeeded(false);
    try {
      let imageBase64: string | undefined; let mediaType: string | undefined;
      if (file) {
        // decode + downscale first; only a renderable JPEG ever becomes the preview
        const r = await fileToBase64(file);
        setPhotoUrl(r.previewUrl);
        imageBase64 = r.base64; mediaType = r.mediaType;
      } else {
        setPhotoUrl(null);
      }
      const out = await api.ground({ imageBase64, mediaType, vibe, budget, hasReference });
      setRoom(out.room); setCurrentRoomSpec(out.currentRoomSpec || null);
      setClarify(out.room.clarify ? out.room.clarify.options[1] : null);
    } catch (e) { setError((e as Error).message); throw e; } finally { setBusy(false); }
  }

  async function runDesign() {
    if (!room) return;
    setBusy(true); setError(null);
    try {
      const d = await api.design({ room, vibe, budget, seeded });
      setDesign(d); setSettings(d.settings);
      setBaseline(d.result); setLive(d.result); setLiveBudget(budget);
    } catch (e) { setError((e as Error).message); throw e; } finally { setBusy(false); }
  }

  function resolveTo(nextBudget: number) {
    if (!design || !baseline) return;
    setLiveBudget(nextBudget);
    const r = solve(design.candidates, { budget: nextBudget, settings, room: design.room, plan, prior: baseline });
    setLive(r);
  }

  function applySettings(patch: Partial<SolverSettings>) {
    const next = { ...settings, ...patch };
    setSettings(next);
    if (design && baseline) {
      const r = solve(design.candidates, { budget: liveBudget, settings: next, room: design.room, plan, prior: baseline });
      setLive(r);
    }
  }

  async function recalibrate() {
    setHasReference(true);
    if (room) setRoom({ ...room, calibrated: true, errM: 0.1 });
  }

  async function loadShare(token: string) {
    setBusy(true); setError(null);
    try {
      const { design: d } = await api.share(token);
      setSeeded(!!d.seeded); setVibe(d.brief.vibeText); setBudget(d.brief.budget); setPhotoUrl(null);
      setRoom(d.room); setDesign(d); setSettings(d.settings);
      setBaseline(d.result); setLive(d.result); setLiveBudget(d.brief.budget);
    } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }

  function reset() {
    setDesign(null); setBaseline(null); setLive(null); setRoom(null);
    setCurrentRoomSpec(null); setPhotoUrl(null); setSeeded(false); setClarify(null); setNudges([]);
    setVibe(DEMO_VIBE); setBudget(800); setHasReference(false);
  }

  const value: Store = {
    config, loadConfig, vibe, setVibe, budget, setBudget, hasReference, setHasReference, photoUrl,
    room, currentRoomSpec, design, baseline, live, liveBudget, settings, plan,
    clarify, setClarify, nudges, setNudges, showWhy, setShowWhy, seeded, busy, error,
    startDemo, ground, runDesign, resolveTo, applySettings, recalibrate, loadShare, reset,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
