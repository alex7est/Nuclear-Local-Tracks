import type { Stream, StreamCandidate, Track } from "@nuclearplayer/plugin-sdk";

export interface LocalTrack {
  id: string;

  file: File;

  fingerprint: string;

  importedAt: string;

  track: Track;

  candidate: StreamCandidate;

  stream: Stream;
}
