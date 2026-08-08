import type { LocalTrack } from "../models/LocalTrack";
import type { ImportedTrack } from "../models/ImportedTrack";
import LocalTrackFactory from "../factories/LocalTrackFactory";

export default class LocalTrackStore {
  constructor(private readonly factory: LocalTrackFactory) {}
  private readonly candidateIndex = new Map<string, string>();
  private readonly tracks = new Map<string, LocalTrack>();

  private readonly fingerprintIndex = new Map<string, string>();

  public importTrack(file: File, imported: ImportedTrack): LocalTrack {
    const duplicate = this.fingerprintIndex.get(imported.fingerprint);

    if (duplicate) {
      return this.tracks.get(duplicate)!;
    }

    const track = this.factory.build(file, imported);

    this.tracks.set(track.id, track);

    this.fingerprintIndex.set(track.fingerprint, track.id);

    this.candidateIndex.set(track.candidate.id, track.id);

    return track;
  }

  public get(id: string): LocalTrack | undefined {
    return this.tracks.get(id);
  }

  public getByCandidate(candidateId: string): LocalTrack | undefined {
    const id = this.candidateIndex.get(candidateId);

    if (!id) {
      return undefined;
    }

    return this.tracks.get(id);
  }

  public getAll(): LocalTrack[] {
    return [...this.tracks.values()];
  }

  public has(id: string): boolean {
    return this.tracks.has(id);
  }

  public remove(id: string): boolean {
    const track = this.tracks.get(id);

    if (!track) {
      return false;
    }

    this.factory.dispose(track);

    this.fingerprintIndex.delete(track.fingerprint);

    this.candidateIndex.delete(track.candidate.id);

    return this.tracks.delete(id);
  }

  public clear(): void {
    for (const track of this.tracks.values()) {
      this.factory.dispose(track);
    }

    this.tracks.clear();

    this.fingerprintIndex.clear();

    this.candidateIndex.clear();
  }

  public get size(): number {
    return this.tracks.size;
  }

  public hasFingerprint(fingerprint: string): boolean {
    return this.fingerprintIndex.has(fingerprint);
  }
}
