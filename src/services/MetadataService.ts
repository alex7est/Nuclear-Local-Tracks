import { parseBlob } from "music-metadata";
import type { AudioMetadata } from "../models/AudioMetadata";

export default class MetadataService {
  public async read(file: File): Promise<AudioMetadata> {
    const metadata = await parseBlob(file);

    const common = metadata.common;

    const fingerprint = await this.computeFingerprint(file);

    return {
      title: common.title ?? file.name.replace(/\.[^.]+$/, ""),

      artist: common.artist ?? "Unknown Artist",

      album: common.album,

      durationMs: metadata.format.duration
        ? Math.round(metadata.format.duration * 1000)
        : undefined,

      trackNumber: common.track.no ?? undefined,

      disc: common.disk.no ? common.disk.no.toString() : undefined,

      artwork: common.picture?.[0]?.data,

      fingerprint,
    };
  }

  private async computeFingerprint(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();

    const hash = await crypto.subtle.digest("SHA-256", buffer);

    const bytes = new Uint8Array(hash);

    return [...bytes].map((x) => x.toString(16).padStart(2, "0")).join("");
  }
}
