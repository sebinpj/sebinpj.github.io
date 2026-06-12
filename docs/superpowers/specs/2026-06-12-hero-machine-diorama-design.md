# Hero diorama — The Machine That Builds Anything (2026-06-12)

## Problem

The hero's floating-pavilion summit read as scenery (serene retreat), not
capability. The new headline ("If it runs on computers, I can build it, fix
it, or scale it.") needs a scene that shows work being produced across
visibly different domains, continuously.

## Design (user-approved)

Keep the floating peak, cloud sea, sun, sky clouds, wisps, one pine and the
lantern — the summit/descent framing and the busiest-set-on-the-page density
stay. Replace the pavilion + desk with a workshop machine:

- **Intake (left)**: small jade funnel; raw slate/earth cubes fall in on a
  deterministic loop — unshaped problems dropping in.
- **Body (center)**: rice shell, vermillion roof lip, slate porthole ring
  with a pulsing gold core, two spinning gold gears with rim bolts, chimney
  with a looping steam puff, gold spout on the right side.
- **Output (right)**: four finished artifacts emerge from the spout, scale
  in, and drift up and away — each a miniature of a chapter below: robot
  head (Maggi/AI), phone (PSCTalks/mobile), database stack (data pipelines),
  browser window (web). The summit machine visibly produces everything the
  page descends through.

## Mechanics

All motion is deterministic in `t` (scrub-safe, no per-frame allocations),
reusing the magnit set's path-loop technique. Grounded machine parts share
the peak's bob (amp 0.06, speed 0.7); path riders add the same sine term so
nothing drifts against the lawn. Artifact/cube loops use phase-offset `u`
with scale-in/scale-out at the ends (toon materials are shared, so loops
shrink instead of fading).

## Invariants

- LAYOUT, CameraRig, DioramaStage, m-overrides untouched.
- Mesh budget within ~+20 of the old set (pavilion+desk removed).
- 390px: rising artifacts must not collide with the chip cloud copy zone.
- og.png regenerated after the swap.
