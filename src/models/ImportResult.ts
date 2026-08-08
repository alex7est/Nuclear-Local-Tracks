import type { Track } from "@nuclearplayer/plugin-sdk";

export interface ImportResult {
  imported: number;
  duplicates: number;
  failed: number;

  tracks: Track[];

  errors: {
    file: File;
    error: unknown;
  }[];
}
