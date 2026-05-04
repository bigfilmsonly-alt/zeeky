/**
 * seed-songs.mjs
 *
 * Comprehensive seed script for the Zeeky music database.
 * Inserts 57 real songs into the `songs` and `song_dna` tables with
 * realistic 84-dimensional DNA vectors grouped by genre cluster so that
 * pgvector cosine similarity returns meaningful neighbors.
 *
 * Schema (songs):
 *   id (uuid PK), user_id (uuid nullable), title (text), artist (text),
 *   audio_url (text), status (text), created_at (timestamptz)
 *
 * Schema (song_dna):
 *   id (uuid PK), song_id (uuid FK->songs), tempo, key, energy,
 *   danceability, bass_presence, bass_variation, melody_variation,
 *   percussion_variation, spectral_variation, chord_progression,
 *   rolloff, loudness, dna_vector (vector(84)), hit_score (int),
 *   created_at (timestamptz)
 *
 * Usage:
 *   SUPABASE_SERVICE_KEY=<your-service-role-key> node scripts/seed-songs.mjs
 *
 * The service_role key is required because both tables have RLS enabled.
 * The songs table requires auth.uid() = user_id for the anon key, so only
 * the service role key (which bypasses RLS) can insert seed data without
 * a logged-in user.  Get the key from:
 *   Supabase Dashboard > Settings > API > service_role (secret)
 *
 * Requires:
 *   - NEXT_PUBLIC_SUPABASE_URL (from .env.local or environment)
 *   - SUPABASE_SERVICE_KEY (env var — falls back to NEXT_PUBLIC_SUPABASE_ANON_KEY
 *     but that will fail due to RLS unless policies are relaxed)
 *   - @supabase/supabase-js installed
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import {
  trapVector,
  popVector,
  rnbVector,
  rockVector,
  blendedVector,
  toPgVector,
} from "./generate-vectors.mjs";

// ── env loading ──────────────────────────────────────────────────────

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  try {
    const envPath = resolve(__dirname, "..", ".env.local");
    const lines = readFileSync(envPath, "utf8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    // .env.local not found — rely on process.env
  }
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY / NEXT_PUBLIC_SUPABASE_ANON_KEY.\n" +
      "Set them in .env.local or as environment variables."
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── song data ────────────────────────────────────────────────────────
// Each entry contains metadata and DNA attribute values that populate
// the individual song_dna columns.  The `cluster` field controls which
// vector generator produces the 84-dim dna_vector.
//
// DNA attributes (all 0-100 scale):
//   tempo, energy, danceability, bass_presence, bass_variation,
//   melody_variation, percussion_variation, spectral_variation,
//   chord_progression, rolloff, loudness
// Plus: key (text), hit_score (int 60-95)

let seedCounter = 1000;
function nextSeed() {
  return seedCounter++;
}

const SONGS = [
  // ═══════════════════════════════════════════════════════════════════
  // TRAP / HIP-HOP CLUSTER  (neighbors of "Scarface")
  // ═══════════════════════════════════════════════════════════════════

  // -- Zeeky originals --
  { title: "Scarface", artist: "Zeeky", cluster: "trap", hit_score: 89,
    tempo: 78, key: "Cm", energy: 85, danceability: 68, bass_presence: 92,
    bass_variation: 45, melody_variation: 65, percussion_variation: 72,
    spectral_variation: 71, chord_progression: 84, rolloff: 60, loudness: 82 },

  { title: "Gold", artist: "Zeeky", cluster: "trap", hit_score: 81,
    tempo: 80, key: "Dm", energy: 78, danceability: 72, bass_presence: 88,
    bass_variation: 48, melody_variation: 60, percussion_variation: 68,
    spectral_variation: 66, chord_progression: 79, rolloff: 58, loudness: 78 },

  { title: "Night Shift", artist: "Zeeky", cluster: "trap", hit_score: 77,
    tempo: 75, key: "Am", energy: 80, danceability: 65, bass_presence: 90,
    bass_variation: 42, melody_variation: 58, percussion_variation: 70,
    spectral_variation: 68, chord_progression: 76, rolloff: 55, loudness: 80 },

  // -- SahBabii --
  { title: "Pull Up Wit Ah Stick", artist: "SahBabii", cluster: "trap", hit_score: 95,
    tempo: 82, key: "Fm", energy: 88, danceability: 85, bass_presence: 94,
    bass_variation: 50, melody_variation: 71, percussion_variation: 78,
    spectral_variation: 75, chord_progression: 79, rolloff: 62, loudness: 86 },

  // -- Future --
  { title: "Patek Water", artist: "Future ft Young Thug", cluster: "trap", hit_score: 88,
    tempo: 82, key: "Gm", energy: 86, danceability: 85, bass_presence: 88,
    bass_variation: 52, melody_variation: 71, percussion_variation: 79,
    spectral_variation: 75, chord_progression: 79, rolloff: 63, loudness: 84 },

  { title: "Mask Off", artist: "Future", cluster: "trap", hit_score: 94,
    tempo: 76, key: "Dm", energy: 84, danceability: 80, bass_presence: 91,
    bass_variation: 44, melody_variation: 68, percussion_variation: 75,
    spectral_variation: 72, chord_progression: 82, rolloff: 59, loudness: 85 },

  { title: "Life Is Good", artist: "Future ft Drake", cluster: "trap", hit_score: 93,
    tempo: 80, key: "Cm", energy: 87, danceability: 78, bass_presence: 90,
    bass_variation: 48, melody_variation: 66, percussion_variation: 74,
    spectral_variation: 70, chord_progression: 81, rolloff: 61, loudness: 84 },

  { title: "March Madness", artist: "Future", cluster: "trap", hit_score: 91,
    tempo: 74, key: "Bbm", energy: 83, danceability: 74, bass_presence: 93,
    bass_variation: 46, melody_variation: 62, percussion_variation: 71,
    spectral_variation: 69, chord_progression: 80, rolloff: 57, loudness: 83 },

  // -- Drake --
  { title: "God's Plan", artist: "Drake", cluster: "trap", hit_score: 95,
    tempo: 77, key: "Ab", energy: 82, danceability: 76, bass_presence: 86,
    bass_variation: 50, melody_variation: 72, percussion_variation: 70,
    spectral_variation: 74, chord_progression: 85, rolloff: 64, loudness: 81 },

  { title: "Sicko Mode", artist: "Travis Scott ft Drake", cluster: "trap", hit_score: 94,
    tempo: 85, key: "Em", energy: 90, danceability: 82, bass_presence: 89,
    bass_variation: 55, melody_variation: 74, percussion_variation: 80,
    spectral_variation: 82, chord_progression: 72, rolloff: 68, loudness: 88 },

  { title: "Nonstop", artist: "Drake", cluster: "trap", hit_score: 87,
    tempo: 81, key: "Cm", energy: 84, danceability: 79, bass_presence: 87,
    bass_variation: 47, melody_variation: 64, percussion_variation: 76,
    spectral_variation: 71, chord_progression: 78, rolloff: 60, loudness: 83 },

  // -- Migos --
  { title: "Having Our Way", artist: "Migos ft Drake", cluster: "trap", hit_score: 88,
    tempo: 83, key: "Fm", energy: 86, danceability: 84, bass_presence: 90,
    bass_variation: 51, melody_variation: 69, percussion_variation: 77,
    spectral_variation: 73, chord_progression: 80, rolloff: 62, loudness: 85 },

  { title: "Bad and Boujee", artist: "Migos ft Lil Uzi Vert", cluster: "trap", hit_score: 95,
    tempo: 84, key: "Dm", energy: 89, danceability: 88, bass_presence: 92,
    bass_variation: 53, melody_variation: 70, percussion_variation: 82,
    spectral_variation: 76, chord_progression: 77, rolloff: 65, loudness: 87 },

  { title: "Walk It Talk It", artist: "Migos ft Drake", cluster: "trap", hit_score: 86,
    tempo: 80, key: "Gm", energy: 85, danceability: 86, bass_presence: 89,
    bass_variation: 49, melody_variation: 66, percussion_variation: 78,
    spectral_variation: 72, chord_progression: 78, rolloff: 61, loudness: 84 },

  // -- Lil Durk --
  { title: "Golden Child", artist: "Lil Durk", cluster: "trap", hit_score: 85,
    tempo: 76, key: "Am", energy: 80, danceability: 70, bass_presence: 88,
    bass_variation: 44, melody_variation: 67, percussion_variation: 72,
    spectral_variation: 69, chord_progression: 83, rolloff: 58, loudness: 81 },

  { title: "What Happened To Virgil", artist: "Lil Durk ft Gunna", cluster: "trap", hit_score: 84,
    tempo: 78, key: "Cm", energy: 81, danceability: 72, bass_presence: 89,
    bass_variation: 46, melody_variation: 65, percussion_variation: 73,
    spectral_variation: 70, chord_progression: 82, rolloff: 59, loudness: 80 },

  { title: "All My Life", artist: "Lil Durk ft J. Cole", cluster: "trap", hit_score: 90,
    tempo: 74, key: "Bbm", energy: 79, danceability: 68, bass_presence: 85,
    bass_variation: 43, melody_variation: 73, percussion_variation: 69,
    spectral_variation: 71, chord_progression: 86, rolloff: 56, loudness: 79 },

  // -- Gunna --
  { title: "Wunna", artist: "Gunna ft Young Thug", cluster: "trap", hit_score: 84,
    tempo: 79, key: "Fm", energy: 83, danceability: 80, bass_presence: 91,
    bass_variation: 48, melody_variation: 68, percussion_variation: 74,
    spectral_variation: 72, chord_progression: 79, rolloff: 60, loudness: 82 },

  { title: "Drip Too Hard", artist: "Lil Baby ft Gunna", cluster: "trap", hit_score: 92,
    tempo: 83, key: "Dm", energy: 87, danceability: 86, bass_presence: 93,
    bass_variation: 52, melody_variation: 67, percussion_variation: 80,
    spectral_variation: 74, chord_progression: 81, rolloff: 64, loudness: 86 },

  { title: "Pushin P", artist: "Gunna ft Future & Young Thug", cluster: "trap", hit_score: 91,
    tempo: 81, key: "Gm", energy: 85, danceability: 83, bass_presence: 90,
    bass_variation: 50, melody_variation: 66, percussion_variation: 77,
    spectral_variation: 73, chord_progression: 80, rolloff: 62, loudness: 84 },

  // -- Moneybagg Yo --
  { title: "Said Sum", artist: "Moneybagg Yo", cluster: "trap", hit_score: 85,
    tempo: 84, key: "Em", energy: 86, danceability: 82, bass_presence: 91,
    bass_variation: 51, melody_variation: 63, percussion_variation: 79,
    spectral_variation: 74, chord_progression: 76, rolloff: 63, loudness: 85 },

  // -- Travis Scott --
  { title: "Goosebumps", artist: "Travis Scott ft Kendrick Lamar", cluster: "trap", hit_score: 93,
    tempo: 85, key: "Cm", energy: 88, danceability: 80, bass_presence: 87,
    bass_variation: 54, melody_variation: 74, percussion_variation: 78,
    spectral_variation: 80, chord_progression: 75, rolloff: 67, loudness: 86 },

  { title: "Highest in the Room", artist: "Travis Scott", cluster: "trap", hit_score: 92,
    tempo: 76, key: "Am", energy: 82, danceability: 75, bass_presence: 88,
    bass_variation: 46, melody_variation: 70, percussion_variation: 72,
    spectral_variation: 76, chord_progression: 78, rolloff: 60, loudness: 82 },

  { title: "FE!N", artist: "Travis Scott ft Playboi Carti", cluster: "trap", hit_score: 90,
    tempo: 88, key: "Dm", energy: 91, danceability: 84, bass_presence: 90,
    bass_variation: 56, melody_variation: 68, percussion_variation: 83,
    spectral_variation: 81, chord_progression: 70, rolloff: 69, loudness: 89 },

  // -- Young Thug --
  { title: "Hot", artist: "Young Thug ft Gunna", cluster: "trap", hit_score: 88,
    tempo: 80, key: "Fm", energy: 84, danceability: 88, bass_presence: 86,
    bass_variation: 49, melody_variation: 68, percussion_variation: 76,
    spectral_variation: 73, chord_progression: 77, rolloff: 61, loudness: 83 },

  { title: "Lifestyle", artist: "Young Thug ft Rich Homie Quan", cluster: "trap", hit_score: 86,
    tempo: 77, key: "Gm", energy: 82, danceability: 78, bass_presence: 89,
    bass_variation: 47, melody_variation: 66, percussion_variation: 74,
    spectral_variation: 71, chord_progression: 80, rolloff: 59, loudness: 81 },

  // -- Lil Baby --
  { title: "Woah", artist: "Lil Baby", cluster: "trap", hit_score: 87,
    tempo: 82, key: "Cm", energy: 85, danceability: 82, bass_presence: 90,
    bass_variation: 50, melody_variation: 64, percussion_variation: 78,
    spectral_variation: 73, chord_progression: 78, rolloff: 62, loudness: 84 },

  { title: "Emotionally Scarred", artist: "Lil Baby", cluster: "trap", hit_score: 86,
    tempo: 72, key: "Am", energy: 78, danceability: 65, bass_presence: 87,
    bass_variation: 42, melody_variation: 72, percussion_variation: 68,
    spectral_variation: 69, chord_progression: 84, rolloff: 55, loudness: 79 },

  // -- 21 Savage / Post Malone --
  { title: "A Lot", artist: "21 Savage ft J. Cole", cluster: "trap", hit_score: 90,
    tempo: 70, key: "Bbm", energy: 76, danceability: 62, bass_presence: 85,
    bass_variation: 40, melody_variation: 70, percussion_variation: 66,
    spectral_variation: 68, chord_progression: 86, rolloff: 54, loudness: 77 },

  { title: "Rockstar", artist: "Post Malone ft 21 Savage", cluster: "trap", hit_score: 95,
    tempo: 79, key: "Dm", energy: 83, danceability: 76, bass_presence: 88,
    bass_variation: 48, melody_variation: 72, percussion_variation: 71,
    spectral_variation: 74, chord_progression: 83, rolloff: 62, loudness: 82 },

  // -- Metro Boomin --
  { title: "Superhero", artist: "Metro Boomin ft Future & Chris Brown", cluster: "trap", hit_score: 89,
    tempo: 84, key: "Fm", energy: 87, danceability: 80, bass_presence: 91,
    bass_variation: 52, melody_variation: 69, percussion_variation: 79,
    spectral_variation: 76, chord_progression: 78, rolloff: 64, loudness: 86 },

  // ═══════════════════════════════════════════════════════════════════
  // POP CLUSTER  (neighbors of "Golden" by Harry Styles)
  // ═══════════════════════════════════════════════════════════════════

  { title: "Golden", artist: "Harry Styles", cluster: "pop", hit_score: 88,
    tempo: 68, key: "D", energy: 72, danceability: 78, bass_presence: 55,
    bass_variation: 40, melody_variation: 82, percussion_variation: 58,
    spectral_variation: 70, chord_progression: 80, rolloff: 72, loudness: 70 },

  { title: "Watermelon Sugar", artist: "Harry Styles", cluster: "pop", hit_score: 94,
    tempo: 72, key: "Eb", energy: 76, danceability: 82, bass_presence: 58,
    bass_variation: 42, melody_variation: 85, percussion_variation: 62,
    spectral_variation: 74, chord_progression: 78, rolloff: 75, loudness: 73 },

  { title: "As It Was", artist: "Harry Styles", cluster: "pop", hit_score: 95,
    tempo: 74, key: "F#m", energy: 78, danceability: 84, bass_presence: 52,
    bass_variation: 38, melody_variation: 88, percussion_variation: 60,
    spectral_variation: 76, chord_progression: 82, rolloff: 78, loudness: 74 },

  { title: "Bad Guy", artist: "Billie Eilish", cluster: "pop", hit_score: 95,
    tempo: 67, key: "Gm", energy: 70, danceability: 80, bass_presence: 62,
    bass_variation: 45, melody_variation: 78, percussion_variation: 55,
    spectral_variation: 68, chord_progression: 75, rolloff: 70, loudness: 68 },

  { title: "Happier Than Ever", artist: "Billie Eilish", cluster: "pop", hit_score: 89,
    tempo: 60, key: "C", energy: 65, danceability: 58, bass_presence: 50,
    bass_variation: 36, melody_variation: 80, percussion_variation: 48,
    spectral_variation: 72, chord_progression: 85, rolloff: 68, loudness: 64 },

  { title: "Lovely", artist: "Billie Eilish ft Khalid", cluster: "pop", hit_score: 91,
    tempo: 58, key: "Em", energy: 62, danceability: 55, bass_presence: 48,
    bass_variation: 34, melody_variation: 84, percussion_variation: 45,
    spectral_variation: 75, chord_progression: 88, rolloff: 66, loudness: 62 },

  { title: "Blinding Lights", artist: "The Weeknd", cluster: "pop", hit_score: 95,
    tempo: 86, key: "Fm", energy: 78, danceability: 88, bass_presence: 60,
    bass_variation: 44, melody_variation: 82, percussion_variation: 65,
    spectral_variation: 76, chord_progression: 79, rolloff: 80, loudness: 76 },

  { title: "Save Your Tears", artist: "The Weeknd", cluster: "pop", hit_score: 93,
    tempo: 74, key: "C#m", energy: 72, danceability: 82, bass_presence: 54,
    bass_variation: 40, melody_variation: 86, percussion_variation: 60,
    spectral_variation: 78, chord_progression: 83, rolloff: 76, loudness: 72 },

  { title: "Levitating", artist: "Dua Lipa", cluster: "pop", hit_score: 94,
    tempo: 78, key: "Bm", energy: 80, danceability: 90, bass_presence: 58,
    bass_variation: 46, melody_variation: 80, percussion_variation: 68,
    spectral_variation: 72, chord_progression: 76, rolloff: 78, loudness: 75 },

  { title: "Don't Start Now", artist: "Dua Lipa", cluster: "pop", hit_score: 92,
    tempo: 76, key: "Gm", energy: 78, danceability: 88, bass_presence: 62,
    bass_variation: 48, melody_variation: 78, percussion_variation: 66,
    spectral_variation: 70, chord_progression: 74, rolloff: 76, loudness: 74 },

  { title: "Peaches", artist: "Justin Bieber ft Daniel Caesar & Giveon", cluster: "pop", hit_score: 91,
    tempo: 62, key: "C", energy: 65, danceability: 75, bass_presence: 56,
    bass_variation: 38, melody_variation: 76, percussion_variation: 52,
    spectral_variation: 66, chord_progression: 82, rolloff: 70, loudness: 66 },

  { title: "Stay", artist: "The Kid LAROI ft Justin Bieber", cluster: "pop", hit_score: 93,
    tempo: 80, key: "C#m", energy: 82, danceability: 85, bass_presence: 55,
    bass_variation: 42, melody_variation: 84, percussion_variation: 64,
    spectral_variation: 74, chord_progression: 78, rolloff: 79, loudness: 76 },

  { title: "Heat Waves", artist: "Glass Animals", cluster: "pop", hit_score: 90,
    tempo: 70, key: "Gm", energy: 68, danceability: 72, bass_presence: 52,
    bass_variation: 36, melody_variation: 82, percussion_variation: 55,
    spectral_variation: 78, chord_progression: 80, rolloff: 74, loudness: 68 },

  // ═══════════════════════════════════════════════════════════════════
  // R&B CLUSTER
  // ═══════════════════════════════════════════════════════════════════

  { title: "Best Part", artist: "Daniel Caesar ft H.E.R.", cluster: "rnb", hit_score: 88,
    tempo: 55, key: "Eb", energy: 52, danceability: 58, bass_presence: 65,
    bass_variation: 35, melody_variation: 85, percussion_variation: 42,
    spectral_variation: 60, chord_progression: 90, rolloff: 55, loudness: 55 },

  { title: "Snooze", artist: "SZA", cluster: "rnb", hit_score: 92,
    tempo: 58, key: "C", energy: 55, danceability: 60, bass_presence: 62,
    bass_variation: 38, melody_variation: 88, percussion_variation: 48,
    spectral_variation: 65, chord_progression: 88, rolloff: 58, loudness: 58 },

  { title: "Kill Bill", artist: "SZA", cluster: "rnb", hit_score: 94,
    tempo: 62, key: "Dm", energy: 60, danceability: 65, bass_presence: 68,
    bass_variation: 40, melody_variation: 82, percussion_variation: 55,
    spectral_variation: 68, chord_progression: 85, rolloff: 62, loudness: 62 },

  { title: "After Hours", artist: "The Weeknd", cluster: "rnb", hit_score: 87,
    tempo: 60, key: "Fm", energy: 58, danceability: 55, bass_presence: 60,
    bass_variation: 36, melody_variation: 86, percussion_variation: 44,
    spectral_variation: 72, chord_progression: 87, rolloff: 56, loudness: 60 },

  { title: "Essence", artist: "Wizkid ft Tems", cluster: "rnb", hit_score: 90,
    tempo: 56, key: "Bbm", energy: 54, danceability: 72, bass_presence: 64,
    bass_variation: 37, melody_variation: 80, percussion_variation: 50,
    spectral_variation: 62, chord_progression: 84, rolloff: 60, loudness: 56 },

  { title: "Boo'd Up", artist: "Ella Mai", cluster: "rnb", hit_score: 89,
    tempo: 54, key: "Ab", energy: 50, danceability: 62, bass_presence: 66,
    bass_variation: 34, melody_variation: 84, percussion_variation: 46,
    spectral_variation: 58, chord_progression: 89, rolloff: 54, loudness: 54 },

  // ═══════════════════════════════════════════════════════════════════
  // ROCK CLUSTER
  // ═══════════════════════════════════════════════════════════════════

  { title: "Bones", artist: "Imagine Dragons", cluster: "rock", hit_score: 85,
    tempo: 82, key: "E", energy: 88, danceability: 72, bass_presence: 70,
    bass_variation: 55, melody_variation: 65, percussion_variation: 80,
    spectral_variation: 82, chord_progression: 60, rolloff: 78, loudness: 88 },

  { title: "Enemy", artist: "Imagine Dragons ft JID", cluster: "rock", hit_score: 91,
    tempo: 86, key: "A", energy: 92, danceability: 78, bass_presence: 72,
    bass_variation: 58, melody_variation: 68, percussion_variation: 84,
    spectral_variation: 85, chord_progression: 62, rolloff: 82, loudness: 90 },

  { title: "Believer", artist: "Imagine Dragons", cluster: "rock", hit_score: 93,
    tempo: 88, key: "G", energy: 94, danceability: 76, bass_presence: 74,
    bass_variation: 60, melody_variation: 70, percussion_variation: 86,
    spectral_variation: 84, chord_progression: 64, rolloff: 80, loudness: 92 },

  { title: "Thunder", artist: "Imagine Dragons", cluster: "rock", hit_score: 92,
    tempo: 84, key: "C", energy: 86, danceability: 80, bass_presence: 68,
    bass_variation: 52, melody_variation: 72, percussion_variation: 78,
    spectral_variation: 80, chord_progression: 66, rolloff: 76, loudness: 86 },

  // ═══════════════════════════════════════════════════════════════════
  // CROSSOVER / BLEND TRACKS
  // ═══════════════════════════════════════════════════════════════════

  { title: "Industry Baby", artist: "Lil Nas X ft Jack Harlow", cluster: "pop-trap", hit_score: 93,
    tempo: 80, key: "Bb", energy: 84, danceability: 86, bass_presence: 78,
    bass_variation: 50, melody_variation: 76, percussion_variation: 72,
    spectral_variation: 74, chord_progression: 75, rolloff: 70, loudness: 80 },

  { title: "Montero", artist: "Lil Nas X", cluster: "pop-trap", hit_score: 94,
    tempo: 78, key: "Am", energy: 82, danceability: 88, bass_presence: 76,
    bass_variation: 48, melody_variation: 80, percussion_variation: 70,
    spectral_variation: 72, chord_progression: 78, rolloff: 72, loudness: 78 },

  // Indie / Alt
  { title: "Soul State", artist: "Biliar", cluster: "indie", hit_score: 77,
    tempo: 66, key: "F", energy: 60, danceability: 62, bass_presence: 48,
    bass_variation: 32, melody_variation: 78, percussion_variation: 50,
    spectral_variation: 74, chord_progression: 82, rolloff: 68, loudness: 60 },
];

// ── vector generation ────────────────────────────────────────────────

const GENERATORS = {
  trap:       (seed) => trapVector(0.03, seed),
  pop:        (seed) => popVector(0.03, seed),
  rnb:        (seed) => rnbVector(0.03, seed),
  rock:       (seed) => rockVector(0.03, seed),
  "pop-trap": (seed) => blendedVector(popVector, trapVector, 0.45, 0.04, seed),
  indie:      (seed) => popVector(0.08, seed),
};

function generateVector(cluster, seed) {
  const gen = GENERATORS[cluster];
  if (!gen) throw new Error(`Unknown cluster: ${cluster}`);
  return gen(seed);
}

// ── main ─────────────────────────────────────────────────────────────

async function main() {
  console.log("=== Zeeky Song Seeder ===\n");
  console.log(`  Supabase URL : ${SUPABASE_URL}`);
  console.log(`  Songs to seed: ${SONGS.length}\n`);

  let songsInserted = 0;
  let dnaInserted = 0;
  let skipped = 0;

  for (let i = 0; i < SONGS.length; i++) {
    const song = SONGS[i];
    const seed = nextSeed();
    const vector = generateVector(song.cluster, seed);

    // ── 1. Insert into `songs` table ────────────────────────────────
    const songPayload = {
      title: song.title,
      artist: song.artist,
      status: "analyzed",
    };

    const { data: songRow, error: songErr } = await supabase
      .from("songs")
      .insert(songPayload)
      .select("id")
      .single();

    if (songErr) {
      if (
        songErr.message?.includes("duplicate") ||
        songErr.code === "23505"
      ) {
        console.log(`  [SKIP] ${song.artist} - ${song.title} (duplicate)`);
        skipped++;
        continue;
      }
      console.error(
        `  [ERR]  ${song.artist} - ${song.title}: ${songErr.message}`
      );
      skipped++;
      continue;
    }

    if (!songRow) {
      console.error(`  [ERR]  ${song.artist} - ${song.title}: no row returned`);
      skipped++;
      continue;
    }

    songsInserted++;
    const songId = songRow.id;

    // ── 2. Insert into `song_dna` table ─────────────────────────────
    const dnaPayload = {
      song_id: songId,
      tempo: song.tempo,
      key: song.key,
      energy: song.energy,
      danceability: song.danceability,
      bass_presence: song.bass_presence,
      bass_variation: song.bass_variation,
      melody_variation: song.melody_variation,
      percussion_variation: song.percussion_variation,
      spectral_variation: song.spectral_variation,
      chord_progression: song.chord_progression,
      rolloff: song.rolloff,
      loudness: song.loudness,
      dna_vector: toPgVector(vector),
      hit_score: song.hit_score,
    };

    const { error: dnaErr } = await supabase.from("song_dna").insert(dnaPayload);

    if (dnaErr) {
      console.error(
        `  [ERR]  DNA for ${song.title}: ${dnaErr.message}`
      );
    } else {
      dnaInserted++;
    }

    // Progress every 10 songs
    if ((i + 1) % 10 === 0 || i === SONGS.length - 1) {
      console.log(`  [PROGRESS] ${i + 1} / ${SONGS.length} processed...`);
    }
  }

  console.log(`\n=== Seed Complete ===`);
  console.log(`  Songs inserted : ${songsInserted}`);
  console.log(`  DNA records    : ${dnaInserted}`);
  console.log(`  Skipped        : ${skipped}`);
  console.log(`  Total processed: ${SONGS.length}`);

  // ── verification ──────────────────────────────────────────────────
  console.log("\n--- Verification ---");

  // Check that Scarface exists
  const { data: scarface } = await supabase
    .from("songs")
    .select("id, title, artist")
    .ilike("title", "%scarface%")
    .limit(1);

  if (scarface && scarface.length > 0) {
    console.log(`  Scarface found: id=${scarface[0].id}, artist=${scarface[0].artist}`);
  } else {
    console.log("  WARNING: Scarface not found in songs table");
  }

  // Check that Golden (Harry Styles) exists
  const { data: golden } = await supabase
    .from("songs")
    .select("id, title, artist")
    .eq("title", "Golden")
    .eq("artist", "Harry Styles")
    .limit(1);

  if (golden && golden.length > 0) {
    console.log(`  Golden (Harry Styles) found: id=${golden[0].id}`);
  } else {
    console.log("  WARNING: Golden (Harry Styles) not found in songs table");
  }

  console.log("\nDone!");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
