-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Songs table (the 20K+ song database)
CREATE TABLE IF NOT EXISTS songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  album TEXT,
  genre TEXT,
  year INT,
  audio_url TEXT,
  artwork_url TEXT,
  apple_music_id TEXT,
  duration_ms INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Song DNA vectors (84 attributes per song)
CREATE TABLE IF NOT EXISTS song_dna (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
  tempo FLOAT, key TEXT, energy FLOAT, danceability FLOAT,
  loudness FLOAT, speechiness FLOAT, acousticness FLOAT,
  instrumentalness FLOAT, liveness FLOAT, valence FLOAT,
  dna_vector vector(84),
  hit_score INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(song_id)
);

-- User profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'listener',
  plan TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User playlists
CREATE TABLE IF NOT EXISTS playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Discovered by Zeeky',
  description TEXT,
  is_public BOOLEAN DEFAULT true,
  apple_music_playlist_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Playlist tracks (ordered)
CREATE TABLE IF NOT EXISTS playlist_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
  song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
  position INT NOT NULL,
  added_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(playlist_id, song_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_songs_title ON songs USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_songs_artist ON songs USING gin(to_tsvector('english', artist));
CREATE INDEX IF NOT EXISTS idx_song_dna_vector ON song_dna USING ivfflat (dna_vector vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_playlist_tracks_playlist ON playlist_tracks(playlist_id);

-- Similarity search function: find N nearest songs
CREATE OR REPLACE FUNCTION find_similar_songs(
  target_song_id UUID,
  match_count INT DEFAULT 50
)
RETURNS TABLE(
  song_id UUID,
  title TEXT,
  artist TEXT,
  album TEXT,
  genre TEXT,
  year INT,
  audio_url TEXT,
  artwork_url TEXT,
  apple_music_id TEXT,
  similarity FLOAT,
  hit_score INT
)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id AS song_id,
    s.title,
    s.artist,
    s.album,
    s.genre,
    s.year,
    s.audio_url,
    s.artwork_url,
    s.apple_music_id,
    (1 - (sd.dna_vector <=> target.dna_vector))::FLOAT AS similarity,
    sd.hit_score
  FROM song_dna sd
  JOIN songs s ON s.id = sd.song_id
  CROSS JOIN (SELECT dna_vector FROM song_dna WHERE song_id = target_song_id) target
  WHERE sd.song_id != target_song_id
  ORDER BY sd.dna_vector <=> target.dna_vector
  LIMIT match_count;
END;
$$;

-- Search songs by text
CREATE OR REPLACE FUNCTION search_songs(
  query TEXT,
  match_count INT DEFAULT 20
)
RETURNS TABLE(
  song_id UUID,
  title TEXT,
  artist TEXT,
  album TEXT,
  genre TEXT,
  year INT,
  audio_url TEXT,
  artwork_url TEXT,
  apple_music_id TEXT,
  hit_score INT,
  rank REAL
)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id AS song_id,
    s.title,
    s.artist,
    s.album,
    s.genre,
    s.year,
    s.audio_url,
    s.artwork_url,
    s.apple_music_id,
    COALESCE(sd.hit_score, 0) AS hit_score,
    ts_rank(
      to_tsvector('english', s.title || ' ' || s.artist),
      plainto_tsquery('english', query)
    ) AS rank
  FROM songs s
  LEFT JOIN song_dna sd ON sd.song_id = s.id
  WHERE to_tsvector('english', s.title || ' ' || s.artist) @@ plainto_tsquery('english', query)
  ORDER BY rank DESC
  LIMIT match_count;
END;
$$;

-- RLS policies
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Songs are viewable by everyone" ON songs FOR SELECT USING (true);

ALTER TABLE song_dna ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Song DNA is viewable by everyone" ON song_dna FOR SELECT USING (true);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public playlists viewable by everyone" ON playlists FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users can manage own playlists" ON playlists FOR ALL USING (auth.uid() = user_id);

ALTER TABLE playlist_tracks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Playlist tracks viewable if playlist is" ON playlist_tracks FOR SELECT USING (
  EXISTS (SELECT 1 FROM playlists p WHERE p.id = playlist_id AND (p.is_public = true OR p.user_id = auth.uid()))
);
CREATE POLICY "Users can manage own playlist tracks" ON playlist_tracks FOR ALL USING (
  EXISTS (SELECT 1 FROM playlists p WHERE p.id = playlist_id AND p.user_id = auth.uid())
);
