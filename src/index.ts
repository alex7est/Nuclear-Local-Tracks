import type { NuclearPluginAPI } from "@nuclearplayer/plugin-sdk";

import Plugin from "./Plugin";

const plugin = new Plugin();

export default {
  async onEnable(api: NuclearPluginAPI) {
    await plugin.enable(api);
  },

  async onDisable() {
    await plugin.disable();
  },
};
