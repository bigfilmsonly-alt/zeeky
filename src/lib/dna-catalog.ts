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
  similars: { id: number; similarity: number }[];
}

export interface SimilarSong {
  id: number;
  artist: string;
  title: string;
  year: number;
  genre: string;
  peak: number;
  similarity: number;
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

export function searchSongs(query: string, limit = 20): Omit<Song, "similars">[] {
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

    // Boost by Billboard rank
    score += Math.min(song.rank, 10) * 0.1;
    results.push({ song, score });
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit).map(({ song }) => ({
    id: song.id,
    artist: song.artist,
    title: song.title,
    year: song.year,
    genre: song.genre,
    peak: song.peak,
    weeks: song.weeks,
    rank: song.rank,
  }));
}

export function getSimilars(songId: number): {
  song: Omit<Song, "similars">;
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
    };
  });

  return {
    song: {
      id: song.id,
      artist: song.artist,
      title: song.title,
      year: song.year,
      genre: song.genre,
      peak: song.peak,
      weeks: song.weeks,
      rank: song.rank,
    },
    similars,
  };
}
