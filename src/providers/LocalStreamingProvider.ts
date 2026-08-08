import type {
  Stream,
  StreamCandidate,
  StreamingProvider,
} from "@nuclearplayer/plugin-sdk";

import LocalTrackStore from "../services/LocalTrackStore";

export const PROVIDER_ID = "local-files-streaming";

export default class LocalStreamingProvider implements StreamingProvider {
  public readonly id = PROVIDER_ID;

  public readonly kind = "streaming" as const;

  public readonly name = "Local Audio Files";

  public readonly supportsLocalFiles = true;

  constructor(private readonly store: LocalTrackStore) {}

  public async searchForTrack(
    artist: string,
    title: string,
    album?: string,
  ): Promise<StreamCandidate[]> {
    const normalizedArtist = artist.trim().toLowerCase();
    const normalizedTitle = title.trim().toLowerCase();
    const normalizedAlbum = album?.trim().toLowerCase();

    const candidates: StreamCandidate[] = [];

    for (const localTrack of this.store.getAll()) {
      const track = localTrack.track;

      if (track.title.toLowerCase() !== normalizedTitle) {
        continue;
      }

      const hasArtist = track.artists.some(
        (a) => a.name.toLowerCase() === normalizedArtist,
      );

      if (!hasArtist) {
        continue;
      }

      if (
        normalizedAlbum &&
        track.album &&
        track.album.title.toLowerCase() !== normalizedAlbum
      ) {
        continue;
      }

      candidates.push(localTrack.candidate);
    }

    return candidates;
  }

  public async getStreamUrl(candidateId: string): Promise<Stream> {
    const localTrack = this.store.getByCandidate(candidateId);

    if (!localTrack) {
      throw new Error(`Local track '${candidateId}' not found`);
    }

    return localTrack.stream;
  }
}
