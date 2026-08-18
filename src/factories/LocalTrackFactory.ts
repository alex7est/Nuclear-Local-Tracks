import type { Stream, StreamCandidate, Track } from "@nuclearplayer/plugin-sdk";

import type { ImportedTrack } from "../models/ImportedTrack";
import type { LocalTrack } from "../models/LocalTrack";

export default class LocalTrackFactory {
  constructor(private readonly providerId: string) {}

  public build(file: File, imported: ImportedTrack): LocalTrack {
    const id = imported.fingerprint; // was: crypto.randomUUID()

    const importedAt = new Date().toISOString();

    const blobUrl = URL.createObjectURL(file);

    const source = {
      provider: this.providerId,
      id,
    };

    const candidate: StreamCandidate = {
      id,

      title: imported.track.title,

      failed: false,

      source,
    };

    const stream: Stream = {
      url: blobUrl,

      protocol: "file",

      mimeType: file.type,

      contentLengthBytes: file.size,

      source,
    };

    const track: Track = {
      ...imported.track,

      source,

      streamCandidates: [candidate],

      localFile: {
        fileUri: stream.url,

        fileSize: file.size,

        format: file.type,

        scannedAtIso: importedAt,
      },
    };

    const localTrack: LocalTrack = {
      id,

      file,

      stream: stream,

      fingerprint: imported.fingerprint,

      importedAt,

      track,

      candidate,
    };

    return localTrack;
  }

  public dispose(track: LocalTrack): void {
    URL.revokeObjectURL(track.stream.url);
  }
}
