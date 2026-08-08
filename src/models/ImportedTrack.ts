import type { Track } from "@nuclearplayer/plugin-sdk";

export interface ImportedTrack {
  track: Omit<Track, "source" | "streamCandidates" | "localFile">;

  fingerprint: string;

  artwork?: Uint8Array;
}
