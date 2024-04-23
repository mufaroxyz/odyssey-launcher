import KvSettings, { SettingsKeys } from '../../lib/store';
import { TauriRoutes } from '../../lib/ptypes';
import {
  ApplicationDataAccessor,
  ApplicationDataKeys,
  ApplicationSettings,
  ClearedApplicationData,
} from '../../lib/types';
import { create } from 'zustand';
import { tauriInvoke } from '../../lib/utils';
import { defaultApplicationData, defaultImages, defaultLocalGameManifest } from './application-state.default';

async function fetchData(initial: boolean = false) {
  let applicationSettings;
  if (initial) {
    applicationSettings = await KvSettings.createOrGetAll();
  } else {
    applicationSettings = await KvSettings.getAll();
  }

  const localGameManifest = await tauriInvoke(TauriRoutes.GetInstalledVersion).catch((err) => {
    console.error(err);
    return {
      ...defaultLocalGameManifest,
      error: 'Failed to fetch local manifest.',
    };
  });

  const images = await tauriInvoke(TauriRoutes.FetchImages).catch((err) => {
    console.error(err);
    return {
      ...defaultImages,
      error: 'Failed to fetch images.',
    };
  });

  let screenshots;
  if (applicationSettings.genshinImpactData.path) {
    screenshots = await tauriInvoke(TauriRoutes.ReadScreenshots, {
      path: applicationSettings.genshinImpactData.path,
    }).catch((err) => {
      console.error(err);
      return [];
    });
  } else {
    screenshots = [];
  }

  const packages = await tauriInvoke(TauriRoutes.GetPackagesList).catch((err) => {
    console.error(err);
    return [];
  });

  return {
    applicationSettings,
    localGameManifest: localGameManifest,
    images,
    screenshots,
    packages,
  };
}

interface ApplicationState extends ClearedApplicationData {
  update: <T extends ApplicationSettings[SettingsKeys] | null>(key: SettingsKeys, value: T) => Promise<void>;
  updateGlobal: <T extends ApplicationDataAccessor>(key: ApplicationDataKeys, value: T) => Promise<void>;
  getValue: <T extends ApplicationDataKeys>(key: T) => ClearedApplicationData[T];
  isLoaded: boolean;
  REQUEST_STORE_UPDATE: () => Promise<void>;
  _REQUEST_INITIAL_STORE_LOAD: () => Promise<void>;
}

const useApplicationStore = create<ApplicationState>()((set, get) => ({
  ...defaultApplicationData,
  isLoaded: false,
  update: async <T extends ApplicationSettings[SettingsKeys] | null>(key: SettingsKeys, value: T) => {
    console.log('[SET] : ', key, value);

    await KvSettings.set(key, value);

    set((state: ApplicationState) => ({
      applicationSettings: {
        ...state.applicationSettings,
        [key]: value,
      },
    }));
  },
  // Basically an update function but for global application state without saving to disk.
  updateGlobal: async <T extends ApplicationDataAccessor>(key: ApplicationDataKeys, value: T) =>
    set(() => ({
      [key]: value,
    })),

  getValue: <T extends ApplicationDataKeys>(key: T) => get()[key],

  _REQUEST_INITIAL_STORE_LOAD: async () => {
    console.log('[REQUEST_INITIAL_STORE_LOAD] : Requesting store load.');
    if (get().isLoaded) {
      console.warn('[REQUEST_INITAL_STORE_LOAD] : Store is already loaded. Defaulting to REQUEST_STORE_UPDATE.');
      await get().REQUEST_STORE_UPDATE();
      return;
    }
    try {
      await KvSettings.fillMissing();
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
