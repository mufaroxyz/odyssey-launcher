import { Store } from "tauri-plugin-store-api";
import { ApplicationSettings } from "./types";

type SettingsKeys = keyof ApplicationSettings;
type SettingsTypeAccessor = ApplicationSettings[keyof ApplicationSettings];

export default abstract class KvSettings {
    public store = new Store(".settings.dat");

    async set<T extends SettingsTypeAccessor>(
        key: SettingsKeys,
        value: T
    ) {
        await this.store.set(key, value);
        await this.store.save();
    }

    async get<T extends SettingsTypeAccessor>(
        key: SettingsKeys
    ): Promise<T | null> {
        return await this.store.get(key);
    }
}