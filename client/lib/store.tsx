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
