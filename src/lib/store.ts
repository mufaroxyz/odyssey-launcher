import { defaultApplicationSettings } from '../components/state/application-state.default';
import { Store } from './__STORE';
import { ApplicationSettings } from './types';

export type SettingsKeys = keyof ApplicationSettings;

const storeFileName =
  process.env.NODE_ENV === 'development' ? `odyssey-launcher-dev.settings.dat` : 'odyssey-launcher.settings.dat';

const store = new Store(storeFileName);

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
      await KvSettings.set('genshinImpactData', defaultApplicationSettings.genshinImpactData);
      await KvSettings.set('playTime', 0);

      await store.save();
    }

    return await KvSettings.getAll();
  }

  static async fillMissing() {
    const defaultSettings = defaultApplicationSettings;
    const currentSettings = await KvSettings.getAll();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function fillMissingSettings(defaultSettings: any, currentSettings: any): any {
      for (const key in defaultSettings) {
        if (!Object.prototype.hasOwnProperty.call(currentSettings, key)) {
          currentSettings[key] = defaultSettings[key];
        } else if (typeof defaultSettings[key] === 'object' && defaultSettings[key] !== null) {
          currentSettings[key] = fillMissingSettings(defaultSettings[key], currentSettings[key]);
        }
      }
      return currentSettings;
    }

    const filledSettings = fillMissingSettings(defaultSettings, currentSettings);

    await KvSettings.saveAll(filledSettings);
  }

  static async saveAll(settings: ApplicationSettings) {
    for (const key in settings) {
      await KvSettings.set(key as SettingsKeys, settings[key as SettingsKeys]);
    }
  }
}
