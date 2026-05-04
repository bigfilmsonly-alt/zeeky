/**
 * seed-songs.mjs
 *
 * Comprehensive seed script for the Zeeky music database.
 * Inserts 50+ real songs into the `songs` and `song_dna` tables with
 * realistic 84-dimensional DNA vectors grouped by genre cluster so that
 * pgvector cosine similarity returns meaningful neighbors.
 *
 * Usage:
 *   node scripts/seed-songs.mjs
 *
 * Requires:
 *   - NEXT_PUBLIC_SUPABASE_URL  and  NEXT_PUBLIC_SUPABASE_ANON_KEY
 *     (read from .env.local or environment)
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
// Each entry: { title, artist, album, genre, year, cluster, hit_score, seed }
// `cluster` controls which vector generator is used.
// `seed` ensures reproducible vectors and keeps "similar" songs close.

let seedCounter = 1000;
function nextSeed() {
  return seedCounter++;
}

const SONGS = [
  // ═══════════════════════════════════════════════════════════════════
  // TRAP / HIP-HOP CLUSTER  (will be neighbors of "Scarface")
  // ═══════════════════════════════════════════════════════════════════

  // -- Zeeky originals --
  { title: "Scarface", artist: "Zeeky", album: "Zeeky Vol. 1", genre: "Trap", year: 2024, cluster: "trap", hit_score: 89 },
  { title: "Gold", artist: "Zeeky", album: "Zeeky Vol. 1", genre: "Hip Hop", year: 2024, cluster: "trap", hit_score: 81 },
  { title: "Night Shift", artist: "Zeeky", album: "Zeeky Vol. 1", genre: "Trap", year: 2024, cluster: "trap", hit_score: 77 },

  // -- SahBabii --
  { title: "Pull Up Wit Ah Stick", artist: "SahBabii", album: "S.A.N.D.A.S.", genre: "Trap", year: 2017, cluster: "trap", hit_score: 95 },

  // -- Future --
  { title: "Patek Water", artist: "Future ft Young Thug", album: "Super Slimey", genre: "Trap", year: 2017, cluster: "trap", hit_score: 88 },
  { title: "Mask Off", artist: "Future", album: "Future", genre: "Trap", year: 2017, cluster: "trap", hit_score: 94 },
  { title: "Life Is Good", artist: "Future ft Drake", album: "High Off Life", genre: "Hip Hop", year: 2020, cluster: "trap", hit_score: 93 },
  { title: "March Madness", artist: "Future", album: "56 Nights", genre: "Trap", year: 2015, cluster: "trap", hit_score: 91 },

  // -- Drake --
  { title: "God's Plan", artist: "Drake", album: "Scorpion", genre: "Hip Hop", year: 2018, cluster: "trap", hit_score: 95 },
  { title: "Sicko Mode", artist: "Travis Scott ft Drake", album: "Astroworld", genre: "Trap", year: 2018, cluster: "trap", hit_score: 94 },
  { title: "Nonstop", artist: "Drake", album: "Scorpion", genre: "Trap", year: 2018, cluster: "trap", hit_score: 87 },

  // -- Migos --
  { title: "Having Our Way", artist: "Migos ft Drake", album: "Culture III", genre: "Hip Hop", year: 2021, cluster: "trap", hit_score: 88 },
  { title: "Bad and Boujee", artist: "Migos ft Lil Uzi Vert", album: "Culture", genre: "Trap", year: 2017, cluster: "trap", hit_score: 95 },
  { title: "Walk It Talk It", artist: "Migos ft Drake", album: "Culture II", genre: "Trap", year: 2018, cluster: "trap", hit_score: 86 },

  // -- Lil Durk --
  { title: "Golden Child", artist: "Lil Durk", album: "The Voice", genre: "Hip Hop", year: 2020, cluster: "trap", hit_score: 85 },
  { title: "What Happened To Virgil", artist: "Lil Durk ft Gunna", album: "7220", genre: "Hip Hop", year: 2022, cluster: "trap", hit_score: 84 },
  { title: "All My Life", artist: "Lil Durk ft J. Cole", album: "Almost Healed", genre: "Hip Hop", year: 2023, cluster: "trap", hit_score: 90 },

  // -- Gunna --
  { title: "Wunna", artist: "Gunna ft Young Thug", album: "Wunna", genre: "Trap", year: 2020, cluster: "trap", hit_score: 84 },
  { title: "Drip Too Hard", artist: "Lil Baby ft Gunna", album: "Drip Harder", genre: "Trap", year: 2018, cluster: "trap", hit_score: 92 },
  { title: "Pushin P", artist: "Gunna ft Future & Young Thug", album: "DS4EVER", genre: "Trap", year: 2022, cluster: "trap", hit_score: 91 },

  // -- Moneybagg Yo --
  { title: "Said Sum", artist: "Moneybagg Yo", album: "Time Served", genre: "Trap", year: 2020, cluster: "trap", hit_score: 85 },

  // -- Travis Scott --
  { title: "Goosebumps", artist: "Travis Scott ft Kendrick Lamar", album: "Birds in the Trap", genre: "Trap", year: 2016, cluster: "trap", hit_score: 93 },
  { title: "Highest in the Room", artist: "Travis Scott", album: "Jackboys", genre: "Trap", year: 2019, cluster: "trap", hit_score: 92 },
  { title: "FE!N", artist: "Travis Scott ft Playboi Carti", album: "Utopia", genre: "Trap", year: 2023, cluster: "trap", hit_score: 90 },

  // -- Young Thug --
  { title: "Hot", artist: "Young Thug ft Gunna", album: "So Much Fun", genre: "Trap", year: 2019, cluster: "trap", hit_score: 88 },
  { title: "Lifestyle", artist: "Young Thug ft Rich Homie Quan", album: "Barter 6", genre: "Trap", year: 2015, cluster: "trap", hit_score: 86 },

  // -- Lil Baby --
  { title: "Woah", artist: "Lil Baby", album: "My Turn", genre: "Trap", year: 2020, cluster: "trap", hit_score: 87 },
  { title: "Emotionally Scarred", artist: "Lil Baby", album: "My Turn", genre: "Hip Hop", year: 2020, cluster: "trap", hit_score: 86 },

  // -- 21 Savage --
  { title: "A Lot", artist: "21 Savage ft J. Cole", album: "I Am > I Was", genre: "Hip Hop", year: 2018, cluster: "trap", hit_score: 90 },
  { title: "Rockstar", artist: "Post Malone ft 21 Savage", album: "Beerbongs & Bentleys", genre: "Hip Hop", year: 2017, cluster: "trap", hit_score: 95 },

  // -- Metro Boomin --
  { title: "Superhero", artist: "Metro Boomin ft Future & Chris Brown", album: "Heroes & Villains", genre: "Trap", year: 2022, cluster: "trap", hit_score: 89 },

  // ═══════════════════════════════════════════════════════════════════
  // POP CLUSTER  (will be neighbors of "Golden" by Harry Styles)
  // ═══════════════════════════════════════════════════════════════════

  { title: "Golden", artist: "Harry Styles", album: "Fine Line", genre: "Pop", year: 2019, cluster: "pop", hit_score: 88 },
  { title: "Watermelon Sugar", artist: "Harry Styles", album: "Fine Line", genre: "Pop", year: 2019, cluster: "pop", hit_score: 94 },
  { title: "As It Was", artist: "Harry Styles", album: "Harry's House", genre: "Pop", year: 2022, cluster: "pop", hit_score: 95 },

  { title: "Bad Guy", artist: "Billie Eilish", album: "When We All Fall Asleep", genre: "Pop", year: 2019, cluster: "pop", hit_score: 95 },
  { title: "Happier Than Ever", artist: "Billie Eilish", album: "Happier Than Ever", genre: "Pop", year: 2021, cluster: "pop", hit_score: 89 },
  { title: "Lovely", artist: "Billie Eilish ft Khalid", album: "When We All Fall Asleep", genre: "Pop", year: 2018, cluster: "pop", hit_score: 91 },

  { title: "Blinding Lights", artist: "The Weeknd", album: "After Hours", genre: "Pop", year: 2020, cluster: "pop", hit_score: 95 },
  { title: "Save Your Tears", artist: "The Weeknd", album: "After Hours", genre: "Pop", year: 2020, cluster: "pop", hit_score: 93 },

  { title: "Levitating", artist: "Dua Lipa", album: "Future Nostalgia", genre: "Pop", year: 2020, cluster: "pop", hit_score: 94 },
  { title: "Don't Start Now", artist: "Dua Lipa", album: "Future Nostalgia", genre: "Pop", year: 2019, cluster: "pop", hit_score: 92 },

  { title: "Peaches", artist: "Justin Bieber ft Daniel Caesar & Giveon", album: "Justice", genre: "Pop", year: 2021, cluster: "pop", hit_score: 91 },
  { title: "Stay", artist: "The Kid LAROI ft Justin Bieber", album: "F*ck Love 3", genre: "Pop", year: 2021, cluster: "pop", hit_score: 93 },

  { title: "Heat Waves", artist: "Glass Animals", album: "Dreamland", genre: "Pop", year: 2020, cluster: "pop", hit_score: 90 },

  // ═══════════════════════════════════════════════════════════════════
  // R&B CLUSTER
  // ═══════════════════════════════════════════════════════════════════

  { title: "Best Part", artist: "Daniel Caesar ft H.E.R.", album: "Freudian", genre: "R&B", year: 2017, cluster: "rnb", hit_score: 88 },
  { title: "Snooze", artist: "SZA", album: "SOS", genre: "R&B", year: 2022, cluster: "rnb", hit_score: 92 },
  { title: "Kill Bill", artist: "SZA", album: "SOS", genre: "R&B", year: 2022, cluster: "rnb", hit_score: 94 },
  { title: "After Hours", artist: "The Weeknd", album: "After Hours", genre: "R&B", year: 2020, cluster: "rnb", hit_score: 87 },
  { title: "Essence", artist: "Wizkid ft Tems", album: "Made in Lagos", genre: "R&B", year: 2020, cluster: "rnb", hit_score: 90 },
  { title: "Boo'd Up", artist: "Ella Mai", album: "Ella Mai", genre: "R&B", year: 2018, cluster: "rnb", hit_score: 89 },

  // ═══════════════════════════════════════════════════════════════════
  // ROCK CLUSTER
  // ═══════════════════════════════════════════════════════════════════

  { title: "Bones", artist: "Imagine Dragons", album: "Mercury Act 2", genre: "Rock", year: 2022, cluster: "rock", hit_score: 85 },
  { title: "Enemy", artist: "Imagine Dragons ft JID", album: "Mercury Act 1", genre: "Rock", year: 2021, cluster: "rock", hit_score: 91 },
  { title: "Believer", artist: "Imagine Dragons", album: "Evolve", genre: "Rock", year: 2017, cluster: "rock", hit_score: 93 },
  { title: "Thunder", artist: "Imagine Dragons", album: "Evolve", genre: "Rock", year: 2017, cluster: "rock", hit_score: 92 },

  // ═══════════════════════════════════════════════════════════════════
  // CROSSOVER / BLEND TRACKS
  // ═══════════════════════════════════════════════════════════════════

  // Pop-Rap blend
  { title: "Industry Baby", artist: "Lil Nas X ft Jack Harlow", album: "Montero", genre: "Hip Hop", year: 2021, cluster: "pop-trap", hit_score: 93 },
  { title: "Montero", artist: "Lil Nas X", album: "Montero", genre: "Hip Hop", year: 2021, cluster: "pop-trap", hit_score: 94 },

  // Indie / Alt (uses pop with more noise for distance)
  { title: "Soul State", artist: "Biliar", album: "Aura", genre: "Indie", year: 2023, cluster: "indie", hit_score: 77 },
];

// ── vector generation ────────────────────────────────────────────────

const GENERATORS = {
  trap:     (seed) => trapVector(0.03, seed),
  pop:      (seed) => popVector(0.03, seed),
  rnb:      (seed) => rnbVector(0.03, seed),
  rock:     (seed) => rockVector(0.03, seed),
  "pop-trap": (seed) => blendedVector(popVector, trapVector, 0.45, 0.04, seed),
  indie:    (seed) => popVector(0.08, seed),    // pop-ish but noisier
};

function generateVector(cluster, seed) {
  const gen = GENERATORS[cluster];
  if (!gen) throw new Error(`Unknown cluster: ${cluster}`);
  return gen(seed);
}

// ── main ─────────────────────────────────────────────────────────────

async function main() {
  console.log("=== Zeeky Song Seeder ===\n");
  console.log(`  Supabase URL: ${SUPABASE_URL}`);
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
      album: song.album,
      genre: song.genre,
      year: song.year,
    };

    const { data: songRow, error: songErr } = await supabase
      .from("songs")
      .upsert(songPayload, { onConflict: "title,artist" })
      .select("id")
      .single();

    if (songErr) {
      // If upsert fails (table might not have unique constraint), try insert
      const { data: fallbackRow, error: fallbackErr } = await supabase
        .from("songs")
        .insert(songPayload)
        .select("id")
        .single();

      if (fallbackErr) {
        if (
          fallbackErr.message?.includes("duplicate") ||
          fallbackErr.code === "23505"
        ) {
          console.log(`  [SKIP] ${song.artist} - ${song.title} (already exists)`);
          skipped++;
          continue;
        }
        console.error(
          `  [ERR]  ${song.artist} - ${song.title}: ${fallbackErr.message}`
        );
        skipped++;
        continue;
      }

      if (!fallbackRow) {
        console.error(`  [ERR]  ${song.artist} - ${song.title}: no row returned`);
        skipped++;
        continue;
      }

      songsInserted++;
      const songId = fallbackRow.id;

      // ── 2. Insert into `song_dna` table ─────────────────────────────
      const dnaPayload = {
        song_id: songId,
        hit_score: song.hit_score,
        dna_vector: toPgVector(vector),
      };

      const { error: dnaErr } = await supabase.from("song_dna").insert(dnaPayload);

      if (dnaErr) {
        if (
          dnaErr.message?.includes("duplicate") ||
          dnaErr.code === "23505"
        ) {
          console.log(`  [SKIP] DNA for ${song.title} (already exists)`);
        } else {
          console.error(
            `  [ERR]  DNA for ${song.title}: ${dnaErr.message}`
          );
        }
      } else {
        dnaInserted++;
      }

      if ((i + 1) % 10 === 0) {
        console.log(`  [PROGRESS] ${i + 1} / ${SONGS.length} processed...`);
      }
      continue;
    }

    // upsert succeeded
    songsInserted++;
    const songId = songRow.id;

    // ── 2. Insert into `song_dna` table ─────────────────────────────
    const dnaPayload = {
      song_id: songId,
      hit_score: song.hit_score,
      dna_vector: toPgVector(vector),
    };

    const { error: dnaErr } = await supabase
      .from("song_dna")
      .upsert(dnaPayload, { onConflict: "song_id" });

    if (dnaErr) {
      // Fallback: plain insert
      const { error: dnaFallbackErr } = await supabase
        .from("song_dna")
        .insert(dnaPayload);

      if (dnaFallbackErr) {
        if (
          dnaFallbackErr.message?.includes("duplicate") ||
          dnaFallbackErr.code === "23505"
        ) {
          console.log(`  [SKIP] DNA for ${song.title} (already exists)`);
        } else {
          console.error(
            `  [ERR]  DNA for ${song.title}: ${dnaFallbackErr.message}`
          );
        }
      } else {
        dnaInserted++;
      }
    } else {
      dnaInserted++;
    }

    if ((i + 1) % 10 === 0) {
      console.log(`  [PROGRESS] ${i + 1} / ${SONGS.length} processed...`);
    }
  }

  console.log(`\n=== Seed Complete ===`);
  console.log(`  Songs inserted/updated: ${songsInserted}`);
  console.log(`  DNA records inserted:   ${dnaInserted}`);
  console.log(`  Skipped (duplicates):   ${skipped}`);
  console.log(`  Total processed:        ${SONGS.length}`);

  // ── verification ──────────────────────────────────────────────────
  console.log("\n--- Verification ---");

  const { data: songCount } = await supabase
    .from("songs")
    .select("id", { count: "exact", head: true });

  const { data: dnaCount } = await supabase
    .from("song_dna")
    .select("song_id", { count: "exact", head: true });

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
