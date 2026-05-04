import { supabase } from "./supabase";

export async function searchSongs(query: string, limit = 20) {
  const { data, error } = await supabase.rpc("search_songs", {
    query,
    match_count: limit,
  });
  if (error) throw error;
  return data;
}

export async function findSimilarSongs(songId: string, limit = 50) {
  const { data, error } = await supabase.rpc("find_similar_songs", {
    target_song_id: songId,
    match_count: limit,
  });
  if (error) throw error;
  return data;
}

export async function getSong(id: string) {
  const { data, error } = await supabase
    .from("songs")
    .select("*, song_dna(*)")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function getTopSongs(limit = 10) {
  const { data, error } = await supabase
    .from("songs")
    .select("*, song_dna(hit_score)")
    .order("song_dna(hit_score)", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function getUserPlaylists(userId: string) {
  const { data, error } = await supabase
    .from("playlists")
    .select("*, playlist_tracks(count)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getOrCreateDiscoveredPlaylist(userId: string) {
  // Check if "Discovered by Zeeky" playlist exists
  const { data: existing } = await supabase
    .from("playlists")
    .select("*")
    .eq("user_id", userId)
    .eq("name", "Discovered by Zeeky")
    .single();

  if (existing) return existing;

  // Create it
  const { data, error } = await supabase
    .from("playlists")
    .insert({
      user_id: userId,
      name: "Discovered by Zeeky",
      description: "Songs discovered through Zeeky AI",
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function addToPlaylist(playlistId: string, songId: string) {
  // Get next position
  const { count } = await supabase
    .from("playlist_tracks")
    .select("*", { count: "exact", head: true })
    .eq("playlist_id", playlistId);

  const { data, error } = await supabase
    .from("playlist_tracks")
    .upsert({
      playlist_id: playlistId,
      song_id: songId,
      position: (count || 0) + 1,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateUserPlatform(userId: string, platform: string) {
  const { error } = await supabase
    .from("profiles")
    .update({ preferred_platform: platform })
    .eq("id", userId);
  if (error) throw error;
}

export async function getSongPlatformId(songId: string, platform: string) {
  const { data, error } = await supabase
    .from("song_platform_ids")
    .select("*")
    .eq("song_id", songId)
    .eq("platform", platform)
    .single();
  if (error && error.code !== "PGRST116") throw error;
  return data;
}

export async function saveSongPlatformId(
  songId: string,
  platform: string,
  platformTrackId: string,
  platformUrl?: string
) {
  const { data, error } = await supabase
    .from("song_platform_ids")
    .upsert({
      song_id: songId,
      platform,
      platform_track_id: platformTrackId,
      platform_url: platformUrl,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}
