import type { PersistedTrack } from "../models/PersistedTrack";
import type { LocalTrack } from "../models/LocalTrack";

export default class PersistedTrackMapper {
  public static toPersisted(track: LocalTrack): PersistedTrack {
    return {
      id: track.id,

      fingerprint: track.fingerprint,

      fileName: track.file.name,

      fileSize: track.file.size,

      lastModified: track.file.lastModified,

      mimeType: track.file.type,

      title: track.track.title,

      artist: track.track.artists[0]?.name ?? "Unknown Artist",

      album: track.track.album?.title,

      durationMs: track.track.durationMs,

      trackNumber: track.track.trackNumber,

      disc: track.track.disc,

      importedAt: track.importedAt,
    };
  }
}
