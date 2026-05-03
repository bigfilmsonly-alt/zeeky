import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://vennmvbaygscebmvqoww.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_KEY) {
  console.error("Set SUPABASE_SERVICE_KEY env var (get from Supabase dashboard > Settings > API > service_role key)");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Parse hex blob into array of 84 float64 values
function hexToFloat64Array(hex) {
  const bytes = Buffer.from(hex, "hex");
  const count = Math.floor(bytes.length / 8);
  const values = [];
  for (let i = 0; i < count && i < 84; i++) {
    values.push(bytes.readDoubleBE(i * 8));
  }
  // Pad to 84 if needed
  while (values.length < 84) values.push(0);
  return values;
}

// Parse pgvector format: [0.1, 0.2, ...]
function toPgVector(arr) {
  return `[${arr.join(",")}]`;
}

async function main() {
  console.log("Reading SQL dump...");
  const sql = readFileSync("/tmp/zeeky-db/2_5_billboard_hot_202309071054.sql", "utf8");

  // Extract all INSERT INTO SUMMARY VALUES blocks
  const insertRegex = /INSERT INTO SUMMARY VALUES\s*\n([\s\S]*?)(?=\n--|\nINSERT INTO (?!SUMMARY))/g;
  let allRows = [];
  let match;

  while ((match = insertRegex.exec(sql)) !== null) {
    const block = match[1];
    // Parse each row: (id, 'artist', 'title', year, 'genre', 'url', 'cover', peak, weeks, rank, energy_total, energy_normalized, x'HEX')
    const rowRegex = /\((\d+),\s*'((?:[^']|'')*)',\s*'((?:[^']|'')*)',\s*(\d+|NULL),\s*'((?:[^']|'')*)',\s*'((?:[^']|'')*)',\s*'((?:[^']|'')*)',\s*(\d+|NULL),\s*(\d+),\s*[\d.]+,\s*\d+,\s*[\d.]+,\s*x'([0-9A-Fa-f]+)'\)/g;
    let rowMatch;
    while ((rowMatch = rowRegex.exec(block)) !== null) {
      allRows.push({
        title: rowMatch[3].replace(/''/g, "'"),
        artist: rowMatch[2].replace(/''/g, "'"),
        year: rowMatch[4] === "NULL" ? null : parseInt(rowMatch[4]),
        genre: rowMatch[5].replace(/''/g, "'"),
        peak_position: rowMatch[8] === "NULL" ? null : parseInt(rowMatch[8]),
        dna_hex: rowMatch[10],
      });
    }
  }

  console.log(`Parsed ${allRows.length} songs from SQL dump`);

  if (allRows.length === 0) {
    console.error("No rows parsed. Check regex.");
    process.exit(1);
  }

  // Insert in batches of 500
  const BATCH_SIZE = 500;
  let inserted = 0;

  for (let i = 0; i < allRows.length; i += BATCH_SIZE) {
    const batch = allRows.slice(i, i + BATCH_SIZE).map((row) => {
      const vector = hexToFloat64Array(row.dna_hex);
      return {
        title: row.title.substring(0, 255),
        artist: row.artist.substring(0, 255),
        year: row.year,
        peak_position: row.peak_position,
        genre: row.genre.substring(0, 255),
        dna_vector: toPgVector(vector),
      };
    });

    const { error } = await supabase.from("billboard_songs").insert(batch);

    if (error) {
      console.error(`Error at batch ${i}:`, error.message);
      // Try individual inserts for this batch
      for (const row of batch) {
        const { error: singleError } = await supabase.from("billboard_songs").insert(row);
        if (singleError) {
          console.error(`  Skip: ${row.artist} - ${row.title}: ${singleError.message}`);
        } else {
          inserted++;
        }
      }
    } else {
      inserted += batch.length;
    }

    if ((i + BATCH_SIZE) % 5000 < BATCH_SIZE) {
      console.log(`  ${inserted} / ${allRows.length} inserted...`);
    }
  }

  console.log(`\nDone! ${inserted} Billboard songs loaded into Supabase.`);
}

main().catch(console.error);
