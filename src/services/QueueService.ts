import type { Queue, Track } from "@nuclearplayer/plugin-sdk";

export default class QueueService {
  constructor(private readonly queue: Queue) {}

  public async enqueue(tracks: readonly Track[]): Promise<void> {
    if (tracks.length === 0) {
      return;
    }

    await this.queue.addToQueue([...tracks]);
  }
}
