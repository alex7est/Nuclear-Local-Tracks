import { openDB, DBSchema } from "idb";

import type { PersistedTrack } from "../models/PersistedTrack";

interface LocalLibraryDB extends DBSchema {
  tracks: {
    key: string;

    value: PersistedTrack;
  };
}

export default class Persistence {
  private readonly dbPromise = openDB<LocalLibraryDB>(
    "nuclear-local-library",
    1,
    {
      upgrade(db) {
        db.createObjectStore("tracks");
      },
    },
  );

  public async saveTrack(track: PersistedTrack): Promise<void> {
    const db = await this.dbPromise;

    await db.put("tracks", track, track.id);
  }

  public async removeTrack(id: string): Promise<void> {
    const db = await this.dbPromise;

    await db.delete("tracks", id);
  }

  public async loadTracks(): Promise<PersistedTrack[]> {
    const db = await this.dbPromise;

    return db.getAll("tracks");
  }

  public async clear(): Promise<void> {
    const db = await this.dbPromise;

    await db.clear("tracks");
  }
}
