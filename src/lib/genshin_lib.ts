import { ApplicationSettings } from './types';
import KvSettings from './store';
import { TauriRoutes } from './ptypes';
import { tauriInvoke } from './utils';

export async function fetchAllConfig(): Promise<ApplicationSettings> {
  console.log('Fetching all config');
  return await KvSettings.createOrGetAll();
}

export async function isGameInstalled() {
  const path = (await KvSettings.get('genshinImpactData'))?.path;
  if (!path) return false;

  const isValid = await tauriInvoke(TauriRoutes.EnsureInstallationPath, {
    path,
  })
    .then(() => true)
    .catch(() => false);

  return isValid;
}
