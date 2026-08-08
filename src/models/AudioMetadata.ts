export interface AudioMetadata {
  title: string;

  artist: string;

  album?: string;

  durationMs?: number;

  trackNumber?: number;

  disc?: string;

  artwork?: Uint8Array;

  fingerprint: string;
}
