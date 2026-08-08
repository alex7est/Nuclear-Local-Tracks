import type { NuclearPluginAPI } from "@nuclearplayer/plugin-sdk";

export default class Plugin {
  public async enable(api: NuclearPluginAPI): Promise<void> {
    // Composition root
  }

  public async disable(): Promise<void> {}
}
