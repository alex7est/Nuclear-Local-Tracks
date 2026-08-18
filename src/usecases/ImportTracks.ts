import type { Track } from "@nuclearplayer/plugin-sdk";

import MetadataService from "../services/MetadataService";
import LocalTrackStore from "../services/LocalTrackStore";
import Persistence from "../services/Persistence";
import QueueService from "../services/QueueService";
import PersistedTrackMapper from "../mappers/PersistedTrackMapper";
import SdkTrackFactory from "../factories/SdkTrackFactory";
import { PROVIDER_ID } from "../constants";

import type { ImportResult } from "../models/ImportResult";

export default class ImportTracks {
  constructor(
    private readonly metadata: MetadataService,
    private readonly store: LocalTrackStore,
    private readonly queue: QueueService,
    private readonly persistence: Persistence,
  ) {}

  public async execute(files: readonly File[]): Promise<ImportResult> {
    const importedTracks: Track[] = [];

    let imported = 0;
    let duplicates = 0;
    let failed = 0;

    const errors: ImportResult["errors"] = [];

    for (const file of files) {
      try {
        const metadata = await this.metadata.read(file);

        if (this.store.hasFingerprint(metadata.fingerprint)) {
          duplicates++;
          continue;
        }

        const importedTrack = SdkTrackFactory.create(
          metadata.fingerprint,
          PROVIDER_ID,
          metadata,
        );

        const localTrack = this.store.importTrack(file, importedTrack);

        importedTracks.push(localTrack.track);

        await this.persistence.saveTrack(
          PersistedTrackMapper.toPersisted(localTrack),
        );

        imported++;
      } catch (error) {
        failed++;

        errors.push({
          file,
          error,
        });
      }
    }

    await this.queue.enqueue(importedTracks);

    return {
      imported,
      duplicates,
      failed,
      tracks: importedTracks,
      errors,
    };
  }
}
