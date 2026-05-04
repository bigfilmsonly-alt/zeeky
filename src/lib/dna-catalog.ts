import { readFileSync } from "fs";
import { join } from "path";

export interface Song {
  id: number;
  artist: string;
  title: string;
  year: number;
  genre: string;
  peak: number;
  weeks: number;
  rank: number;
  dhsScore: number;
  energyTotal: number;
  energyNorm: number;
  appleId?: number;
  similars: { id: number; similarity: number }[];
}

export interface SongResult {
  id: number;
  artist: string;
  title: string;
  year: number;
  genre: string;
  peak: number;
  weeks: number;
  rank: number;
  dhsScore: number;
  energyTotal: number;
  energyNorm: number;
  appleId?: number;
}

export interface SimilarSong {
  id: number;
  artist: string;
  title: string;
  year: number;
  genre: string;
  peak: number;
  similarity: number;
  dhsScore: number;
  appleId?: number;
}

let catalog: Song[] | null = null;
let idMap: Map<number, Song> | null = null;

function loadCatalog(): Song[] {
  if (catalog) return catalog;
  const filePath = join(process.cwd(), "src/data/dna_catalog.json");
  catalog = JSON.parse(readFileSync(filePath, "utf-8"));
  return catalog!;
}

function getIdMap(): Map<number, Song> {
  if (idMap) return idMap;
  const songs = loadCatalog();
  idMap = new Map(songs.map((s) => [s.id, s]));
  return idMap;
}

function songToResult(song: Song): SongResult {
  return {
    id: song.id,
    artist: song.artist,
    title: song.title,
    year: song.year,
    genre: song.genre,
    peak: song.peak,
    weeks: song.weeks,
    rank: song.rank,
    dhsScore: song.dhsScore,
    energyTotal: song.energyTotal,
    energyNorm: song.energyNorm,
    ...(song.appleId ? { appleId: song.appleId } : {}),
  };
}

export function searchSongs(query: string, limit = 20): SongResult[] {
  const songs = loadCatalog();
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const results: { song: Song; score: number }[] = [];

  for (const song of songs) {
    const artist = song.artist.toLowerCase();
    const title = song.title.toLowerCase();
    const combined = `${artist} ${title}`;

    let score = 0;
    if (title === q) score = 100;
    else if (artist === q) score = 90;
    else if (title.startsWith(q)) score = 80;
    else if (artist.startsWith(q)) score = 70;
    else if (combined.includes(q)) score = 50;
    else continue;

    score += Math.min(song.rank, 10) * 0.1;
    results.push({ song, score });
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit).map(({ song }) => songToResult(song));
}

export function getSimilars(songId: number): {
  song: SongResult;
  similars: SimilarSong[];
} | null {
  const map = getIdMap();
  const song = map.get(songId);
  if (!song) return null;

  const similars: SimilarSong[] = song.similars.map((sim) => {
    const s = map.get(sim.id);
    return {
      id: sim.id,
      artist: s?.artist ?? "Unknown",
      title: s?.title ?? "Unknown",
      year: s?.year ?? 0,
      genre: s?.genre ?? "",
      peak: s?.peak ?? 0,
      similarity: sim.similarity,
      dhsScore: s?.dhsScore ?? 0,
      ...(s?.appleId ? { appleId: s.appleId } : {}),
    };
  });

  return { song: songToResult(song), similars };
}

export function getGenres(): { genre: string; count: number }[] {
  const songs = loadCatalog();
  const counts: Record<string, number> = {};
  for (const s of songs) {
    for (const g of s.genre.split(",")) {
      const genre = g.trim();
      if (genre && genre !== "Music") {
        counts[genre] = (counts[genre] || 0) + 1;
      }
    }
  }
  return Object.entries(counts)
    .map(([genre, count]) => ({ genre, count }))
    .sort((a, b) => b.count - a.count);
}

export function getByGenre(genre: string, limit = 50): SongResult[] {
  const songs = loadCatalog();
  return songs
    .filter((s) => s.genre.toLowerCase().includes(genre.toLowerCase()))
    .sort((a, b) => b.rank - a.rank)
    .slice(0, limit)
    .map(songToResult);
}
