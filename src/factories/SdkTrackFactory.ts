import type {
  AlbumRef,
  ArtistCredit,
  ArtworkSet,
  ProviderRef,
} from "@nuclearplayer/plugin-sdk";
import type { ImportedTrack } from "../models/ImportedTrack";

import type { AudioMetadata } from "../models/AudioMetadata";

export interface TrackFactoryOptions {
  id: string;

  provider: string;

  title: string;

  artist: string;

  album?: string;

  durationMs?: number;

  artwork?: ArtworkSet;

  trackNumber?: number;

  disc?: string;
}

export default class SdkTrackFactory {
  public static create(
    id: string,
    provider: string,
    metadata: AudioMetadata,
  ): ImportedTrack {
    const source: ProviderRef = {
      provider: provider,

      id: id,
    };

    const artists: ArtistCredit[] = [
      {
        name: metadata.artist,

        roles: ["primary"],

        source,
      },
    ];

    let album: AlbumRef | undefined;

    if (metadata.album) {
      album = {
        title: metadata.album,

        artists: [
          {
            name: metadata.artist,

            source,
          },
        ],

        source,
      };
    }

    return {
      fingerprint: metadata.fingerprint,

      artwork: metadata.artwork,

      track: {
        title: metadata.title,

        artists,

        album,

        durationMs: metadata.durationMs,

        artwork: undefined,

        trackNumber: metadata.trackNumber,

        disc: metadata.disc,
      },
    };
  }
}
