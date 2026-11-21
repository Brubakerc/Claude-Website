import { test } from "node:test";
import assert from "node:assert/strict";
import { Spring, project, rubberband } from "./spring.ts";

const run = (s: Spring, seconds: number) => {
  let max = -Infinity;
  for (let t = 0; t < seconds; t += 1 / 60) {
    s.step(1 / 60);
    max = Math.max(max, s.value);
  }
  return max;
};

test("critically damped spring settles on target without overshoot", () => {
  const s = new Spring(0, { response: 0.35, damping: 1 });
  s.to(100);
  const max = run(s, 2);
  assert.equal(s.value, 100);
  assert.ok(max <= 100.01, `overshot to ${max}`);
});

test("under-damped spring overshoots a little", () => {
  const s = new Spring(0, { response: 0.35, damping: 0.8 });
  s.to(100);
  const max = run(s, 2);
  assert.ok(max > 100.5 && max < 110, `max was ${max}`);
  assert.equal(s.value, 100);
});

test("retargeting keeps velocity (no hard stop)", () => {
  const s = new Spring(0);
  s.to(100);
  for (let i = 0; i < 6; i++) s.step(1 / 60);
  const v = s.velocity;
  s.to(0);
  assert.equal(s.velocity, v);
  s.step(1 / 60);
  assert.ok(s.value > 0, "still moving forward right after reversal");
});

test("handed-off velocity is used", () => {
  const s = new Spring(0);
  s.to(0, 2000);
  s.step(1 / 60);
  assert.ok(s.value > 10);
});

test("projection and rubber band", () => {
  assert.ok(Math.abs(project(1000) - 499) < 1);
  assert.equal(rubberband(0, 500), 0);
  assert.ok(rubberband(200, 500) < 200 && rubberband(200, 500) > 0);
  assert.ok(rubberband(-200, 500) < 0);
});
