import type { PlatformId, StreamingPlatform } from "./types";

const platforms = new Map<PlatformId, StreamingPlatform>();

export function registerPlatform(platform: StreamingPlatform) {
  platforms.set(platform.id, platform);
}

export function getPlatform(id: PlatformId): StreamingPlatform | undefined {
  return platforms.get(id);
}

export function getAllPlatforms(): StreamingPlatform[] {
  return Array.from(platforms.values());
}

export function getAvailablePlatforms(): StreamingPlatform[] {
  return getAllPlatforms().filter((p) => p.isAvailable);
}
