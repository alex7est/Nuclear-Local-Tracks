import type { NuclearPluginAPI } from "@nuclearplayer/plugin-sdk";

import { PROVIDER_ID } from "./constants";

import MetadataService from "./services/MetadataService";
import Persistence from "./services/Persistence";
import QueueService from "./services/QueueService";

import LocalTrackFactory from "./factories/LocalTrackFactory";
import LocalTrackStore from "./services/LocalTrackStore";

import ImportTracks from "./usecases/ImportTracks";
import RestoreLibrary from "./usecases/RestoreLibrary";

import LocalStreamingProvider from "./providers/LocalStreamingProvider";

export default class Plugin {
  private api?: NuclearPluginAPI;

  private localTrackStore?: LocalTrackStore;

  private registeredProviderId?: string;

  private importTracks?: ImportTracks;

  public async enable(api: NuclearPluginAPI): Promise<void> {
    this.api = api;

    const metadataService = new MetadataService();
    const persistence = new Persistence();
    const queueService = new QueueService(api.Queue);

    const localTrackFactory = new LocalTrackFactory(PROVIDER_ID);
    const localTrackStore = new LocalTrackStore(localTrackFactory);

    this.localTrackStore = localTrackStore;

    const provider = new LocalStreamingProvider(localTrackStore);

    this.registeredProviderId = api.Providers.register(provider);

    this.importTracks = new ImportTracks(
      metadataService,
      localTrackStore,
      queueService,
      persistence,
    );

    const restoreLibrary = new RestoreLibrary(persistence);

    await restoreLibrary.execute();

    api.Logger.info("Local Tracks plugin enabled.");

    // TODO: once ui/ImportButton.ts exists, construct it here with
    // `this.importTracks` and mount it, e.g.:
    //   this.importButton = new ImportButton(this.importTracks);
    // and call `this.importButton.dispose()` in disable() below.
  }

  public async disable(): Promise<void> {
    if (this.registeredProviderId && this.api) {
      this.api.Providers.unregister(this.registeredProviderId);
    }

    // Disposes every LocalTrack (revokes Blob URLs) and clears the
    // in-memory store. This does not touch IndexedDB - persisted
    // metadata survives; only runtime resources are released.
    this.localTrackStore?.clear();

    this.api = undefined;
    this.localTrackStore = undefined;
    this.registeredProviderId = undefined;
    this.importTracks = undefined;
  }
}
