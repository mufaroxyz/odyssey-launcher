import { Store } from './__STORE';
import { ApplicationSettings } from './types';

export type SettingsKeys = keyof ApplicationSettings;

const store = new Store('odyssey-launcher-1.settings.dat');

export default abstract class KvSettings {
  static async set<T extends ApplicationSettings[SettingsKeys] | null>(key: SettingsKeys, value: T) {
    await store.set(key, value);
    await store.save();
  }

  static async get<T extends SettingsKeys, R extends ApplicationSettings[T] | null>(key: T): Promise<R | null> {
    return (await store.get(key)) as R | null;
  }

  static async getAll(): Promise<ApplicationSettings> {
    const entries = await store.entries<ApplicationSettings>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const settings: any = {};

    for (const [key, value] of entries) {
      settings[key] = value;
    }

    return settings as ApplicationSettings;
  }

  static async createOrGetAll(): Promise<ApplicationSettings> {
    const settings = await KvSettings.getAll();
    if (Object.keys(settings).length === 0) {
      await KvSettings.set('genshinImpactData', {
        path: '',
      });
      await KvSettings.set('playTime', 0);

      await store.save();
    }

    return await KvSettings.getAll();
  }
}
