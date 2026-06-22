/* Spruce — the seeded demo room. One tap pre-fills a real room grounding + budget
   + vibe into the SAME fields and runs the SAME live engine — not a canned output.
   The only convenience is pre-typing the input; delete it and use your own room. */
import type { RoomModel } from '../shared/types';
import type { RoomSpec } from '../shared/render/room';

export const DEMO_VIBE = 'cozier but not grandma, warm woods, keep my green couch, under $800';
export const DEMO_BUDGET = 800;

export function demoRoom(): RoomModel {
  return {
    widthM: 4.1, depthM: 2.6, heightM: 2.6, errM: 0.1, calibrated: true,
    light: 'SW', currentStyle: 'student-flat neutral', doorwayCm: 90,
    objects: [
      { label: 'green sofa', note: 'worn', keepCandidate: true },
      { label: 'window', note: 'warm SW light' },
      { label: 'wool rug', note: 'tired' },
      { label: 'blank wall', note: '2.4 m' },
      { label: 'coffee table', note: 'scratched' },
      { label: 'floor', note: 'oak-look laminate' },
      { label: 'ceiling light', note: 'bare' },
    ],
    clarify: {
      question: "You said keep the green couch — but it's worn. Keep it, or find you a warmer one in budget?",
      options: ['Keep it as-is', 'Find me better'],
    },
  };
}

/** The tired "as-is" room, rendered as the demo's uploaded-photo stand-in. */
export function demoCurrentRoomSpec(): RoomSpec {
  return {
    W: 922, H: 790, horizon: 408,
    window: { x: 700, y: 306, w: 150, h: 196 },
    art: [],
    pieces: [
      { t: 'rug', x: 452, base: 650, s: 1.0, o: { base: 'oat', accent: 'slate', accent2: 'sage', w: 300, h: 70, op: 0.8 } },
      { t: 'sofa', x: 452, base: 606, s: 1.25, o: { seats: 3, body: 'sage', legs: 'walnut' } },
      { t: 'coffeeTable', x: 452, base: 690, s: 0.95, o: { wood: 'oak', styled: true } },
    ],
  };
}
