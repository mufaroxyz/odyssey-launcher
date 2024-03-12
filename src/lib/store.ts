import { Store } from "./__STORE";
import { ApplicationSettings } from "./types";

type SettingsKeys = keyof ApplicationSettings;
type SettingsTypeAccessor = ApplicationSettings[keyof ApplicationSettings];

const store = new Store(".settings.dat");

export default abstract class KvSettings {
  static async set<T extends SettingsTypeAccessor>(
    key: SettingsKeys,
    value: T
  ) {
    await store.set(key, value);
    await store.save();
  }

  static async get<T extends SettingsTypeAccessor>(
    key: SettingsKeys
  ): Promise<T | null> {
    return await store.get(key);
  }

  static async getAll(): Promise<ApplicationSettings> {
    const entries = await store.entries();
    const settings: ApplicationSettings = {} as ApplicationSettings;
    for (const [key, value] of entries) {
      settings[key as SettingsKeys] = value as SettingsTypeAccessor;
    }

    return settings;
  }

  static async createOrGetAll(): Promise<ApplicationSettings> {
    const settings = await store.entries();
    if (settings.length === 0) {
      await KvSettings.set("genshinImpactData", {
        path: "",
      });

      await store.save();
    }

    return await KvSettings.getAll();
  }
}
