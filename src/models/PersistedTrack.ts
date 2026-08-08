export interface PersistedTrack {
  id: string;

  fingerprint: string;

  fileName: string;

  fileSize: number;

  lastModified: number;

  title: string;

  artist: string;

  album?: string;

  durationMs?: number;

  trackNumber?: number;

  disc?: string;

  artworkMimeType?: string;

  artwork?: Uint8Array;

  mimeType: string;

  importedAt: string;
}
