// Reads parsed JSON and inserts into Supabase via SQL batches
import { readFileSync } from "fs";

const data = JSON.parse(readFileSync("/tmp/billboard-parsed.json", "utf8"));

function escapeStr(s) {
  return s.replace(/'/g, "''").replace(/\\/g, "\\\\");
}

// Generate SQL INSERT statements in batches of 50
const BATCH = 50;
for (let i = 0; i < data.length; i += BATCH) {
  const batch = data.slice(i, i + BATCH);
  const values = batch.map((r) => {
    const vec = `'[${r.vector.join(",")}]'::vector(84)`;
    const year = r.year ? r.year : "NULL";
    const peak = r.peak_position ? r.peak_position : "NULL";
    return `(gen_random_uuid(), '${escapeStr(r.title)}', '${escapeStr(r.artist)}', ${year}, ${peak}, '${escapeStr(r.genre)}', ${vec})`;
  }).join(",\n");

  const sql = `INSERT INTO billboard_songs (id, title, artist, year, peak_position, genre, dna_vector) VALUES\n${values};`;

  // Write each batch to a separate file
  const batchNum = Math.floor(i / BATCH);
  const fs = await import("fs");
  fs.writeFileSync(`/tmp/billboard-batch-${String(batchNum).padStart(4, "0")}.sql`, sql);
}

console.log(`Generated ${Math.ceil(data.length / BATCH)} batch files`);
