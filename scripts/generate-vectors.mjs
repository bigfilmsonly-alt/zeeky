/**
 * generate-vectors.mjs
 *
 * Helper module that generates realistic 84-dimensional DNA vectors for
 * different genre clusters.  Each vector dimension loosely maps to an audio
 * feature extracted by Zeeky's engine:
 *
 *   Dims  0-9   : Tempo / Rhythm features
 *   Dims 10-19  : Energy / Loudness features
 *   Dims 20-29  : Bass / Low-frequency features
 *   Dims 30-39  : Melody / Pitch features
 *   Dims 40-49  : Chroma / Harmonic features
 *   Dims 50-59  : Spectral shape (centroid, rolloff, bandwidth)
 *   Dims 60-69  : MFCC coefficients (timbre)
 *   Dims 70-79  : Instrument / Texture features
 *   Dims 80-83  : Danceability, Vocal presence, Dynamics, Mood valence
 *
 * Exported functions return Float64Arrays of length 84.  Pass a noise
 * parameter (0-1) to control how far each generated vector drifts from the
 * cluster centroid — small noise keeps songs close together in cosine space.
 *
 * Usage:
 *   import { trapVector, popVector, rnbVector, rockVector } from './generate-vectors.mjs';
 *   const vec = trapVector(0.05);   // noise = 5 %
 */

// ── helpers ──────────────────────────────────────────────────────────

/** Clamp a value between 0 and 1. */
function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

/** Seeded pseudo-random (xorshift32). Allows reproducible runs. */
function makeRng(seed) {
  let s = seed | 0 || 1;
  return function next() {
    s ^= s << 13;
    s ^= s >> 17;
    s ^= s << 5;
    return ((s >>> 0) / 0xffffffff);
  };
}

/**
 * Build an 84-dim vector from a base centroid, adding gaussian-ish noise.
 * @param {number[]} centroid  - 84 values in [0,1]
 * @param {number}   noise     - standard deviation of perturbation (0-1)
 * @param {number}   [seed]    - optional RNG seed for reproducibility
 * @returns {number[]}
 */
function perturbVector(centroid, noise, seed) {
  const rng = seed != null ? makeRng(seed) : Math.random;
  return centroid.map((v) => {
    // Box-Muller for a roughly normal perturbation
    const u1 = rng() || 0.0001;
    const u2 = rng();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return clamp01(v + z * noise);
  });
}

// ── genre centroids ──────────────────────────────────────────────────
// Each array has 84 values in [0,1].  The values are hand-tuned so that
// within-cluster cosine similarity is high and across-cluster is low.

/**
 * Trap / Hip-Hop centroid
 * High bass, fast-ish tempo, hard 808s, lower melody variation,
 * hi-hat heavy spectral, characteristic MFCC profile.
 */
const TRAP_CENTROID = [
  // Tempo / Rhythm (0-9) — moderate-to-fast BPM, heavy kick patterns
  0.65, 0.70, 0.72, 0.60, 0.75, 0.68, 0.62, 0.70, 0.66, 0.74,
  // Energy / Loudness (10-19) — loud, compressed
  0.82, 0.85, 0.80, 0.78, 0.83, 0.81, 0.79, 0.84, 0.86, 0.80,
  // Bass / Low-freq (20-29) — dominant 808
  0.90, 0.92, 0.88, 0.91, 0.87, 0.93, 0.89, 0.90, 0.86, 0.91,
  // Melody / Pitch (30-39) — lower variation, auto-tuned
  0.45, 0.42, 0.48, 0.40, 0.50, 0.44, 0.46, 0.43, 0.47, 0.41,
  // Chroma / Harmonic (40-49) — minor keys dominant
  0.55, 0.50, 0.58, 0.52, 0.48, 0.54, 0.56, 0.51, 0.53, 0.49,
  // Spectral shape (50-59) — hi-hat heavy, dark pads
  0.60, 0.65, 0.58, 0.62, 0.67, 0.61, 0.63, 0.59, 0.64, 0.66,
  // MFCC / Timbre (60-69) — characteristic trap timbre
  0.70, 0.68, 0.72, 0.66, 0.74, 0.69, 0.71, 0.67, 0.73, 0.65,
  // Instrument / Texture (70-79) — synth pads, 808, hi-hats
  0.55, 0.60, 0.52, 0.58, 0.50, 0.57, 0.54, 0.59, 0.56, 0.53,
  // Danceability, Vocal, Dynamics, Mood (80-83)
  0.72, 0.65, 0.60, 0.40,
];

/**
 * Pop centroid
 * Moderate everything, higher melody variation, brighter spectral,
 * balanced bass, major key tendency.
 */
const POP_CENTROID = [
  // Tempo / Rhythm (0-9) — moderate, danceable
  0.60, 0.58, 0.62, 0.55, 0.65, 0.59, 0.57, 0.63, 0.61, 0.56,
  // Energy / Loudness (10-19) — moderate-high
  0.70, 0.72, 0.68, 0.74, 0.66, 0.71, 0.73, 0.69, 0.67, 0.75,
  // Bass / Low-freq (20-29) — present but not dominant
  0.55, 0.52, 0.58, 0.50, 0.60, 0.54, 0.56, 0.53, 0.57, 0.51,
  // Melody / Pitch (30-39) — high variation, catchy hooks
  0.80, 0.82, 0.78, 0.85, 0.76, 0.83, 0.81, 0.84, 0.79, 0.77,
  // Chroma / Harmonic (40-49) — major keys, bright chords
  0.75, 0.78, 0.72, 0.80, 0.70, 0.76, 0.74, 0.79, 0.73, 0.77,
  // Spectral shape (50-59) — bright, full-range
  0.72, 0.75, 0.70, 0.78, 0.68, 0.74, 0.71, 0.76, 0.73, 0.69,
  // MFCC / Timbre (60-69) — clean vocal-forward timbre
  0.50, 0.52, 0.48, 0.55, 0.46, 0.51, 0.53, 0.49, 0.54, 0.47,
  // Instrument / Texture (70-79) — layered production, synths + live
  0.68, 0.72, 0.65, 0.70, 0.62, 0.69, 0.71, 0.66, 0.73, 0.64,
  // Danceability, Vocal, Dynamics, Mood (80-83)
  0.78, 0.82, 0.70, 0.75,
];

/**
 * R&B centroid
 * Slower tempo, high vocal presence, smooth spectral, warm bass,
 * rich harmonic content.
 */
const RNB_CENTROID = [
  // Tempo / Rhythm (0-9) — slow to moderate
  0.40, 0.42, 0.38, 0.45, 0.36, 0.41, 0.43, 0.39, 0.44, 0.37,
  // Energy / Loudness (10-19) — moderate, dynamic
  0.58, 0.60, 0.55, 0.62, 0.53, 0.59, 0.61, 0.56, 0.57, 0.63,
  // Bass / Low-freq (20-29) — warm, round bass
  0.70, 0.72, 0.68, 0.74, 0.66, 0.71, 0.69, 0.73, 0.67, 0.75,
  // Melody / Pitch (30-39) — high melodic variation, runs
  0.78, 0.80, 0.76, 0.82, 0.74, 0.79, 0.81, 0.77, 0.75, 0.83,
  // Chroma / Harmonic (40-49) — jazz-influenced harmony
  0.80, 0.82, 0.78, 0.84, 0.76, 0.81, 0.83, 0.79, 0.77, 0.85,
  // Spectral shape (50-59) — smooth, warm
  0.48, 0.50, 0.45, 0.52, 0.43, 0.49, 0.51, 0.46, 0.47, 0.53,
  // MFCC / Timbre (60-69) — warm vocal timbre
  0.62, 0.65, 0.60, 0.67, 0.58, 0.63, 0.64, 0.61, 0.66, 0.59,
  // Instrument / Texture (70-79) — keys, pads, minimal percussion
  0.45, 0.48, 0.42, 0.50, 0.40, 0.46, 0.49, 0.43, 0.47, 0.41,
  // Danceability, Vocal, Dynamics, Mood (80-83)
  0.55, 0.90, 0.75, 0.65,
];

/**
 * Rock centroid
 * High energy, guitar-heavy spectral, fast tempo, loud,
 * distorted texture.
 */
const ROCK_CENTROID = [
  // Tempo / Rhythm (0-9) — fast, driving
  0.75, 0.78, 0.72, 0.80, 0.70, 0.76, 0.74, 0.79, 0.73, 0.77,
  // Energy / Loudness (10-19) — very high
  0.88, 0.90, 0.85, 0.92, 0.83, 0.89, 0.87, 0.91, 0.86, 0.84,
  // Bass / Low-freq (20-29) — present, guitar-bass focus
  0.65, 0.68, 0.62, 0.70, 0.60, 0.66, 0.64, 0.69, 0.63, 0.67,
  // Melody / Pitch (30-39) — moderate, riff-based
  0.58, 0.55, 0.60, 0.52, 0.62, 0.57, 0.59, 0.54, 0.61, 0.56,
  // Chroma / Harmonic (40-49) — power chords, simple harmony
  0.45, 0.42, 0.48, 0.40, 0.50, 0.44, 0.46, 0.43, 0.47, 0.41,
  // Spectral shape (50-59) — guitar-heavy, midrange peak
  0.80, 0.82, 0.78, 0.84, 0.76, 0.81, 0.79, 0.83, 0.77, 0.85,
  // MFCC / Timbre (60-69) — distorted, gritty
  0.78, 0.75, 0.80, 0.73, 0.82, 0.76, 0.79, 0.74, 0.81, 0.72,
  // Instrument / Texture (70-79) — guitars, drums, bass guitar
  0.85, 0.82, 0.88, 0.80, 0.90, 0.84, 0.86, 0.81, 0.87, 0.83,
  // Danceability, Vocal, Dynamics, Mood (80-83)
  0.60, 0.70, 0.85, 0.55,
];

// ── public API ───────────────────────────────────────────────────────

/**
 * Generate a trap/hip-hop DNA vector.
 * @param {number} [noise=0.03] - perturbation strength (0-1)
 * @param {number} [seed]       - optional RNG seed
 * @returns {number[]} 84-dim vector with values in [0,1]
 */
export function trapVector(noise = 0.03, seed) {
  return perturbVector(TRAP_CENTROID, noise, seed);
}

/**
 * Generate a pop DNA vector.
 * @param {number} [noise=0.03] - perturbation strength (0-1)
 * @param {number} [seed]       - optional RNG seed
 * @returns {number[]} 84-dim vector with values in [0,1]
 */
export function popVector(noise = 0.03, seed) {
  return perturbVector(POP_CENTROID, noise, seed);
}

/**
 * Generate an R&B DNA vector.
 * @param {number} [noise=0.03] - perturbation strength (0-1)
 * @param {number} [seed]       - optional RNG seed
 * @returns {number[]} 84-dim vector with values in [0,1]
 */
export function rnbVector(noise = 0.03, seed) {
  return perturbVector(RNB_CENTROID, noise, seed);
}

/**
 * Generate a rock DNA vector.
 * @param {number} [noise=0.03] - perturbation strength (0-1)
 * @param {number} [seed]       - optional RNG seed
 * @returns {number[]} 84-dim vector with values in [0,1]
 */
export function rockVector(noise = 0.03, seed) {
  return perturbVector(ROCK_CENTROID, noise, seed);
}

/**
 * Generate a blended vector between two genre centroids.
 * Useful for crossover tracks (e.g. pop-rap, R&B-trap).
 * @param {Function} genA - first genre generator (trapVector, popVector, etc.)
 * @param {Function} genB - second genre generator
 * @param {number}   mix  - blend ratio (0 = all A, 1 = all B)
 * @param {number}   [noise=0.03]
 * @param {number}   [seed]
 * @returns {number[]}
 */
export function blendedVector(genA, genB, mix = 0.5, noise = 0.03, seed) {
  const a = genA(0, seed);            // clean centroid
  const b = genB(0, seed ? seed + 1 : undefined);
  const blended = a.map((v, i) => clamp01(v * (1 - mix) + b[i] * mix));
  return perturbVector(blended, noise, seed ? seed + 2 : undefined);
}

/**
 * Format a vector as a pgvector-compatible string: '[0.1,0.2,...]'
 * @param {number[]} vec
 * @returns {string}
 */
export function toPgVector(vec) {
  return `[${vec.map((v) => v.toFixed(6)).join(",")}]`;
}

// ── centroids (exported for reference / testing) ─────────────────────
export { TRAP_CENTROID, POP_CENTROID, RNB_CENTROID, ROCK_CENTROID };

// ── CLI mode ─────────────────────────────────────────────────────────
// When run directly, print sample vectors for verification.
const isMain = process.argv[1]?.endsWith("generate-vectors.mjs");
if (isMain) {
  console.log("=== Zeeky DNA Vector Generator ===\n");

  const genres = [
    { name: "Trap / Hip-Hop", fn: trapVector },
    { name: "Pop",            fn: popVector },
    { name: "R&B",            fn: rnbVector },
    { name: "Rock",           fn: rockVector },
  ];

  for (const g of genres) {
    const v1 = g.fn(0.03, 42);
    const v2 = g.fn(0.03, 99);

    // Cosine similarity between two vectors from the same cluster
    const dot = v1.reduce((s, a, i) => s + a * v2[i], 0);
    const magA = Math.sqrt(v1.reduce((s, a) => s + a * a, 0));
    const magB = Math.sqrt(v2.reduce((s, a) => s + a * a, 0));
    const sim = dot / (magA * magB);

    console.log(`${g.name}:`);
    console.log(`  Vector length: ${v1.length}`);
    console.log(`  Sample values: [${v1.slice(0, 5).map((v) => v.toFixed(4)).join(", ")}, ...]`);
    console.log(`  Intra-cluster cosine similarity: ${sim.toFixed(4)}`);
    console.log();
  }

  // Cross-cluster comparison
  const trap = trapVector(0.03, 42);
  const pop = popVector(0.03, 42);
  const dotCross = trap.reduce((s, a, i) => s + a * pop[i], 0);
  const magT = Math.sqrt(trap.reduce((s, a) => s + a * a, 0));
  const magP = Math.sqrt(pop.reduce((s, a) => s + a * a, 0));
  console.log(`Cross-cluster (Trap vs Pop) cosine similarity: ${(dotCross / (magT * magP)).toFixed(4)}`);
  console.log("\nVectors are designed so intra-cluster similarity >> cross-cluster similarity.");
}
