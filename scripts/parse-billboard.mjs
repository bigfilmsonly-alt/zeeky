// Parses the MySQL dump and outputs PostgreSQL INSERT statements
// Usage: node scripts/parse-billboard.mjs > /tmp/billboard-inserts.sql

import { readFileSync, writeFileSync } from "fs";

function hexToFloat64Array(hex) {
  const bytes = Buffer.from(hex, "hex");
  const count = Math.floor(bytes.length / 8);
  const values = [];
  for (let i = 0; i < count && i < 84; i++) {
    values.push(bytes.readDoubleBE(i * 8));
  }
  while (values.length < 84) values.push(0);
  return values;
}

const sql = readFileSync("/tmp/zeeky-db/2_5_billboard_hot_202309071054.sql", "utf8");

const insertRegex = /INSERT INTO SUMMARY VALUES\s*\n([\s\S]*?)(?=\n--|\nINSERT INTO (?!SUMMARY))/g;
let allRows = [];
let match;

while ((match = insertRegex.exec(sql)) !== null) {
  const block = match[1];
  const rowRegex = /\((\d+),\s*'((?:[^']|'')*)',\s*'((?:[^']|'')*)',\s*(\d+|NULL),\s*'((?:[^']|'')*)',\s*'[^']*',\s*'[^']*',\s*(\d+|NULL),\s*(\d+),\s*[\d.]+,\s*\d+,\s*[\d.]+,\s*x'([0-9A-Fa-f]+)'\)/g;
  let rowMatch;
  while ((rowMatch = rowRegex.exec(block)) !== null) {
    allRows.push({
      artist: rowMatch[2].replace(/''/g, "'"),
      title: rowMatch[3].replace(/''/g, "'"),
      year: rowMatch[4] === "NULL" ? null : parseInt(rowMatch[4]),
      genre: rowMatch[5].replace(/''/g, "'"),
      peak: rowMatch[6] === "NULL" ? null : parseInt(rowMatch[6]),
      hex: rowMatch[8],
    });
  }
}

console.error(`Parsed ${allRows.length} rows`);

// Output as JSON for batch processing
const output = allRows.map((r) => ({
  title: r.title.substring(0, 255),
  artist: r.artist.substring(0, 255),
  year: r.year,
  peak_position: r.peak,
  genre: r.genre.substring(0, 255),
  vector: hexToFloat64Array(r.hex),
}));

writeFileSync("/tmp/billboard-parsed.json", JSON.stringify(output));
console.error("Wrote /tmp/billboard-parsed.json");
