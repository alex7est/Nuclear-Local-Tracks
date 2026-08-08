import Persistence from "../services/Persistence";

export default class RestoreLibrary {
  constructor(private readonly persistence: Persistence) {}

  public async execute(): Promise<void> {
    const tracks = await this.persistence.loadTracks();

    console.log(`Found ${tracks.length} persisted tracks`);
  }
}
