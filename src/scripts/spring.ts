// A tiny spring animator, parameterised the way Apple describes springs:
//   response — roughly how long it takes to reach the target, in seconds
//   damping  — 1 = no overshoot (default UI), ~0.8 = slight bounce after a flick
// Springs keep their velocity when the target changes, so any animation can be
// grabbed or redirected mid-flight and continue smoothly from where it is.

export interface SpringOptions {
  response?: number;
  damping?: number;
}

export class Spring {
  value: number;
  velocity = 0;
  target: number;
  stiffness = 0;
  friction = 0;

  constructor(value: number, options: SpringOptions = {}) {
    this.value = value;
    this.target = value;
    this.configure(options);
  }

  /** Changes how the spring moves without touching its position or velocity. */
  configure({ response = 0.35, damping = 1 }: SpringOptions) {
    const omega = (2 * Math.PI) / response;
    this.stiffness = omega * omega;
    this.friction = 2 * damping * omega;
  }

  /** Aims at a new target. Pass `velocity` (units/s) to hand off gesture speed. */
  to(target: number, velocity?: number) {
    this.target = target;
    if (velocity !== undefined) this.velocity = velocity;
  }

  /** Jumps straight to a value and stops (used while the finger is down). */
  set(value: number) {
    this.value = this.target = value;
    this.velocity = 0;
  }

  /** Advances by dt seconds. Returns true once settled. */
  step(dt: number): boolean {
    // Fixed 1 ms sub-steps keep stiff springs stable on slow frames.
    for (let t = 0; t < dt; t += 0.001) {
      const h = Math.min(0.001, dt - t);
      const force = -this.stiffness * (this.value - this.target) - this.friction * this.velocity;
      this.velocity += force * h;
      this.value += this.velocity * h;
    }
    const settled = Math.abs(this.value - this.target) < 0.001 && Math.abs(this.velocity) < 0.01;
    if (settled) this.set(this.target);
    return settled;
  }
}

/** Runs springs on animation frames, calling `render` each frame until all settle. */
export function animateSprings(springs: Spring[], render: () => void, done?: () => void) {
  let last = performance.now();
  let frame = 0;
  const tick = (now: number) => {
    const dt = Math.min((now - last) / 1000, 1 / 30); // don't jump after a stalled tab
    last = now;
    const settled = springs.map((s) => s.step(dt)).every(Boolean);
    render();
    if (settled) done?.();
    else frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(frame);
}

/** Where a flick would come to rest, using Apple's deceleration projection. */
export function project(velocity: number, decelerationRate = 0.998): number {
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate);
}

/** Resistance past a boundary: follows less the further it is pulled. */
export function rubberband(overshoot: number, dimension: number, constant = 0.55): number {
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
}
