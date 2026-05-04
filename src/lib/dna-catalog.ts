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

export function getTrending(limit = 10): SongResult[] {
  const songs = loadCatalog();
  return songs
    .sort((a, b) => b.dhsScore - a.dhsScore)
    .slice(0, limit)
    .map(songToResult);
}

export function getByGenre(genre: string, limit = 50): SongResult[] {
  const songs = loadCatalog();
  return songs
    .filter((s) => s.genre.toLowerCase().includes(genre.toLowerCase()))
    .sort((a, b) => b.rank - a.rank)
    .slice(0, limit)
    .map(songToResult);
}

export function getArtistPlaylist(artistQuery: string, playlistSize = 50): {
  artist: string;
  artistSongs: SongResult[];
  playlist: SimilarSong[];
} | null {
  const songs = loadCatalog();
  const map = getIdMap();
  const q = artistQuery.toLowerCase().trim();

  // Find all songs by this artist
  const artistSongs = songs
    .filter((s) => s.artist.toLowerCase().includes(q))
    .sort((a, b) => b.rank - a.rank);

  if (artistSongs.length === 0) return null;

  // Get canonical artist name — prefer the shortest (solo) name that matches
  const nameFreq = new Map<string, number>();
  for (const s of artistSongs) {
    const name = s.artist;
    nameFreq.set(name, (nameFreq.get(name) || 0) + 1);
  }
  let artistName = artistSongs[0].artist;
  let bestScore = 0;
  for (const [name, count] of nameFreq) {
    // Prefer names that start with the query, are shorter (solo credits), and appear often
    const startsWithQ = name.toLowerCase().startsWith(q) ? 10 : 0;
    const noFeaturing = name.includes("Featuring") || name.includes(" & ") || name.includes(" ft ") ? 0 : 5;
    const score = count + startsWithQ + noFeaturing;
    if (score > bestScore) {
      bestScore = score;
      artistName = name;
    }
  }

  // Collect artist's own song IDs to exclude from playlist
  const artistIds = new Set(artistSongs.map((s) => s.id));

  // Aggregate DNA neighbors from all artist songs, weighted by rank
  const neighborScores = new Map<number, { totalScore: number; count: number }>();

  for (const song of artistSongs) {
    for (const sim of song.similars) {
      if (artistIds.has(sim.id)) continue; // skip artist's own songs
      const existing = neighborScores.get(sim.id);
      // Weight similarity by the source song's chart rank
      const weighted = sim.similarity * (1 + Math.min(song.rank, 20) * 0.02);
      if (existing) {
        existing.totalScore += weighted;
        existing.count += 1;
      } else {
        neighborScores.set(sim.id, { totalScore: weighted, count: 1 });
      }
    }
  }

  // Rank by combined score (frequency of appearance × avg weighted similarity)
  const ranked = [...neighborScores.entries()]
    .map(([id, { totalScore, count }]) => ({
      id,
      score: (totalScore / count) * (1 + Math.log2(count) * 0.1),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, playlistSize);

  // Normalize scores to 0-100 range
  const maxScore = ranked.length > 0 ? ranked[0].score : 1;

  const playlist: SimilarSong[] = ranked.map((r) => {
    const s = map.get(r.id);
    return {
      id: r.id,
      artist: s?.artist ?? "Unknown",
      title: s?.title ?? "Unknown",
      year: s?.year ?? 0,
      genre: s?.genre ?? "",
      peak: s?.peak ?? 0,
      similarity: Math.round((r.score / maxScore) * 10000) / 100,
      dhsScore: s?.dhsScore ?? 0,
      ...(s?.appleId ? { appleId: s.appleId } : {}),
    };
  });

  return {
    artist: artistName,
    artistSongs: artistSongs.slice(0, 20).map(songToResult),
    playlist,
  };
}
