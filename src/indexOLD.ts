import type { NuclearPluginAPI, Track } from "@nuclearplayer/plugin-sdk";

// Let's define the provider locally to ensure smooth TS compilation
type StreamingProvider = {
  id: string;
  kind: "streaming";
  name: string;
  searchForTrack(track: Track): Promise<any[]>;
  getStreamUrl(streamId: string): Promise<string>;
};

// We store the selected local files in memory mapped by their names
const localFilesMap = new Map<string, File>();
let importButton: HTMLButtonElement | null = null;
const PROVIDER_ID = "local-files-streaming";

export default {
  async onEnable(api: NuclearPluginAPI) {
    // 1. Register a StreamingProvider to handle our local files
    const provider: StreamingProvider = {
      id: PROVIDER_ID,
      kind: "streaming",
      name: "Local Audio Files",

      async searchForTrack(track: Track) {
        // Track.artists is an array. Check if 'Local Audio' is one of them.
        const isLocal = track.artists?.some(
          (a: any) => a.name === "Local Audio",
        );

        if (isLocal && localFilesMap.has(track.title)) {
          return [
            {
              id: track.title, // Using the file name as the streamId
              source: "Local",
              title: track.title,
            },
          ];
        }
        return [];
      },

      async getStreamUrl(streamId: string) {
        const file = localFilesMap.get(streamId);
        if (file) {
          // Generates a local browser blob URL that Nuclear's audio engine can play natively
          return URL.createObjectURL(file);
        }
        return "";
      },
    };

    // Cast to any to bypass strict provider signature matching
    (api.Providers as any).register(provider);

    // 2. Inject a Floating UI Button to select files
    importButton = document.createElement("button");
    importButton.innerText = "📁 Add Local Tracks";
    Object.assign(importButton.style, {
      position: "fixed",
      bottom: "100px", // Safely above the playback bar
      right: "25px",
      zIndex: "99999",
      padding: "12px 18px",
      borderRadius: "8px",
      border: "none",
      backgroundColor: "#2ecc71",
      color: "white",
      fontWeight: "bold",
      cursor: "pointer",
      boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
      transition: "transform 0.2s",
    });

    importButton.onmouseenter = () =>
      (importButton!.style.transform = "scale(1.05)");
    importButton.onmouseleave = () =>
      (importButton!.style.transform = "scale(1)");

    importButton.onclick = () => {
      const input = document.createElement("input");
      input.type = "file";
      input.multiple = true;
      input.accept = "audio/*"; // Accept standard formats

      input.onchange = async (e) => {
        const files = Array.from((e.target as HTMLInputElement).files || []);
        if (!files.length) return;

        const newTracks: Track[] = [];

        for (const file of files) {
          const trackName = file.name.replace(/\.[^/.]+$/, ""); // Strip file extension
          localFilesMap.set(trackName, file);

          // Construct the track to strictly match Nuclear's format
          newTracks.push({
            id: `local-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            title: trackName,
            artists: [{ name: "Local Audio" }],
            source: "Local",
          } as unknown as Track); // Cast through unknown to satisfy missing optional properties
        }

        api.Logger.info(`Imported ${newTracks.length} local files.`);

        // 3. Add files to Nuclear's queue dynamically
        try {
          const queueAny = api.Queue as any;

          if (typeof queueAny.addTracks === "function") {
            await queueAny.addTracks(newTracks);
          } else if (typeof queueAny.addTrack === "function") {
            for (const track of newTracks) {
              await queueAny.addTrack(track);
            }
          } else {
            alert(
              `Couldn't add directly to queue. Your Nuclear version might not support it yet.`,
            );
            return;
          }
          alert(`Added ${newTracks.length} local tracks to your queue!`);
        } catch (err) {
          // Flatten the error into a single string for the Logger
          const errorMsg = err instanceof Error ? err.message : String(err);
          api.Logger.error(`Failed to add local tracks to queue: ${errorMsg}`);
        }
      };

      input.click();
    };

    document.body.appendChild(importButton);
  },

  async onDisable(api: NuclearPluginAPI) {
    // Teardown the UI and clean up the Provider
    if (importButton && importButton.parentNode) {
      importButton.parentNode.removeChild(importButton);
    }
    (api.Providers as any).unregister(PROVIDER_ID);
    localFilesMap.clear();
  },

  async onUnload(api: NuclearPluginAPI) {
    api.Logger.info("Local tracks plugin unloaded");
  },
};
