-- Add preferred_platform to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_platform TEXT DEFAULT 'apple';

-- Add platform_playlist_ids to playlists (JSON map of platform -> playlist ID)
ALTER TABLE playlists ADD COLUMN IF NOT EXISTS platform_ids JSONB DEFAULT '{}';

-- Track which platform each playlist track was added from
ALTER TABLE playlist_tracks ADD COLUMN IF NOT EXISTS platform TEXT DEFAULT 'apple';
ALTER TABLE playlist_tracks ADD COLUMN IF NOT EXISTS platform_track_id TEXT;

-- Song platform IDs (one song can exist on multiple platforms)
CREATE TABLE IF NOT EXISTS song_platform_ids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  platform_track_id TEXT NOT NULL,
  platform_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(song_id, platform)
);

ALTER TABLE song_platform_ids ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Platform IDs viewable by everyone" ON song_platform_ids FOR SELECT USING (true);

CREATE INDEX IF NOT EXISTS idx_song_platform_ids ON song_platform_ids(song_id, platform);
