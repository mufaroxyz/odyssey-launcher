import { invoke } from "@tauri-apps/api/tauri";
import KvSettings, {
  SettingsKeys,
  SettingsTypeAccessor,
} from "../../lib/store";
import { TauriResponse, TauriRoutes } from "../../lib/ptypes";
import { ClearedApplicationData } from "../../lib/types";
import { create } from "zustand";
import { StateStorage, createJSONStorage, persist } from "zustand/middleware";

const customStorage: StateStorage = {
  // @ts-ignore
  getItem: async <T extends SettingsTypeAccessor>(
    name: SettingsKeys
  ): Promise<T | null> => {
    return "" as unknown as T;
  },

  // @ts-ignore
  setItem: async <T extends SettingsTypeAccessor>(
    name: SettingsKeys,
    value: T
  ): Promise<void> => {
    await KvSettings.set(name, value);
  },
};

async function fetchData(initial: boolean = false) {
  let applicationSettings;
  if (initial) {
    applicationSettings = await KvSettings.createOrGetAll();
  } else {
    applicationSettings = await KvSettings.getAll();
  }
  let localGameManifest = await invoke<
    TauriResponse["TauriRoutes.FetchLocalManifest"]
  >(TauriRoutes.FetchLocalManifest, {
    path: applicationSettings.genshinImpactData.path,
  }).catch((err) => {
    console.error(err);
    return {
      manifest: {
        channel: "",
        cps: "",
        game_version: "",
        plugin_7_version: "",
        sub_channel: "",
        uapc: "",
      },
      error: "Failed to fetch local manifest.",
    };
  });

  console.log("[FETCH_DATA] : ", {
    applicationSettings,
    localGameManifest: localGameManifest,
  });

  return {
    applicationSettings,
    localGameManifest: localGameManifest.manifest,
  };
}

interface ApplicationState extends ClearedApplicationData {
  REQUEST_STORE_UPDATE: () => Promise<void>;
  isLoaded: boolean;
  _REQUEST_INITIAL_STORE_LOAD: () => Promise<void>;
}

const useApplicationStore = create<ApplicationState>()((set, get) => ({
  applicationSettings: {
    genshinImpactData: {
      path: "",
    },
  },
  localGameManifest: {
    channel: "",
    cps: "",
    game_version: "",
    plugin_7_version: "",
    sub_channel: "",
    uapc: "",
  },
  isLoaded: false,
  _REQUEST_INITIAL_STORE_LOAD: async () => {
    console.log("[REQUEST_INITIAL_STORE_LOAD] : Requesting store load.");
    if (get().isLoaded) {
      console.warn(
        "[REQUEST_INITAL_STORE_LOAD] : Store is already loaded. Defaulting to REQUEST_STORE_UPDATE."
      );
      await get().REQUEST_STORE_UPDATE();
      return;
    }
    try {
      const data = await fetchData(true);
      // @ts-ignore
      set({ ...data, isLoaded: true });
    } catch (error) {
      console.error(error);
    }
  },
  REQUEST_STORE_UPDATE: async () => {
    try {
      const data = await fetchData();
      // @ts-ignore
      set({ ...data });
    } catch (error) {
      console.error(error);
    }
  },
}));

export default useApplicationStore;
