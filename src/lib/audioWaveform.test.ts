import test from "node:test";
import assert from "node:assert/strict";
import {
  computeWaveformBars,
  getWaveformAriaLabel,
  IDLE_BAR_LEVEL,
  MAX_BAR_LEVEL,
  MIN_BAR_LEVEL,
} from "./audioWaveform";

test("computeWaveformBars returns flat clinical baseline when inactive or muted", () => {
  const paused = computeWaveformBars(12, 1.5, false, "output", 1);
  assert.equal(paused.length, 12);
  for (const level of paused) {
    assert.ok(level >= MIN_BAR_LEVEL && level <= IDLE_BAR_LEVEL + 0.001);
  }

  const muted = computeWaveformBars(12, 2.2, true, "output", 0);
  assert.equal(muted.length, 12);
  for (const level of muted) {
    assert.ok(level >= MIN_BAR_LEVEL && level <= IDLE_BAR_LEVEL + 0.001);
  }
});

test("computeWaveformBars produces dynamic modulated output heights while speaking", () => {
  const frameA = computeWaveformBars(16, 0.4, true, "output", 1);
  const frameB = computeWaveformBars(16, 1.1, true, "output", 1);

  assert.equal(frameA.length, 16);
  const maxA = Math.max(...frameA);
  const minA = Math.min(...frameA);
  assert.ok(maxA > IDLE_BAR_LEVEL + 0.25, `Expected active peak > 0.39, got ${maxA}`);
  assert.ok(maxA <= MAX_BAR_LEVEL);
  assert.ok(minA >= MIN_BAR_LEVEL);
  assert.notDeepEqual(frameA, frameB);
});

test("computeWaveformBars maps real Web Audio frequency bins for microphone input", () => {
  const bins = new Uint8Array([10, 40, 120, 220, 255, 180, 90, 30, 10, 0]);
  const bars = computeWaveformBars(8, 0.2, true, "input", 1, bins);

  assert.equal(bars.length, 8);
  const maxBar = Math.max(...bars);
  const minBar = Math.min(...bars);
  assert.ok(maxBar > 0.75, `Expected strong mic peak > 0.75, got ${maxBar}`);
  assert.ok(minBar < maxBar, "Expected variation across frequency bins");
  for (const level of bars) {
    assert.ok(level >= MIN_BAR_LEVEL && level <= MAX_BAR_LEVEL);
  }
});

test("computeWaveformBars scales amplitude proportionally with volume", () => {
  const loud = computeWaveformBars(12, 0.8, true, "output", 1.0);
  const quiet = computeWaveformBars(12, 0.8, true, "output", 0.35);

  const avgLoud = loud.reduce((a, b) => a + b, 0) / loud.length;
  const avgQuiet = quiet.reduce((a, b) => a + b, 0) / quiet.length;
  assert.ok(avgLoud > avgQuiet + 0.15);
});

test("getWaveformAriaLabel returns clear status copy for screen readers", () => {
  assert.match(getWaveformAriaLabel(true, "input"), /microphone.*active/i);
  assert.match(getWaveformAriaLabel(false, "input"), /microphone.*idle/i);
  assert.match(getWaveformAriaLabel(true, "output"), /narration.*active/i);
  assert.match(getWaveformAriaLabel(false, "output"), /narration.*paused/i);
});
