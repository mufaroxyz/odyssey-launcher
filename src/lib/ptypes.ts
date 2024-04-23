import { Images, LocalGameManifest, Package, Screenshot } from './types';

export enum TauriRoutes {
  FindInstallationPath = 'find_installation_path',
  EnsureInstallationPath = 'ensure_installation_path',
  FetchLocalManifest = 'fetch_local_manifest',
  FetchImages = 'fetch_images',
  GetInstalledVersion = 'get_installed_version',
  GetExecutablePath = 'get_executable_path',
  GameInstall = 'game_install',
  UninstallGame = 'uninstall_game',
  SendNotification = 'send_notification',
  ReadScreenshots = 'read_screenshots',
  GetPackagesList = 'get_packages_list',
}

export type GlobalResponseError = {
  error: string;
};

export interface TauriPayload {
  [TauriRoutes.FindInstallationPath]: void;
  [TauriRoutes.EnsureInstallationPath]: {
    path: string;
  };
  [TauriRoutes.FetchLocalManifest]: {
    path: string;
  };
  [TauriRoutes.FetchImages]: {
    path: string;
  };
  [TauriRoutes.GetInstalledVersion]: void;
  [TauriRoutes.GetExecutablePath]: void;
  [TauriRoutes.GameInstall]: {
    installationPath: string;
    tempPath?: string;
  };
  [TauriRoutes.UninstallGame]: {
    path: string;
  };
  [TauriRoutes.SendNotification]: {
    title: string;
    body: string;
  };
  [TauriRoutes.ReadScreenshots]: {
    path: string;
  };
  [TauriRoutes.GetPackagesList]: void;
}

export interface TauriResponse {
  [TauriRoutes.FindInstallationPath]: {
    path: string;
  };
  [TauriRoutes.EnsureInstallationPath]: {
    path: string;
  };
  [TauriRoutes.FetchLocalManifest]: {
    path: string;
    manifest: LocalGameManifest;
  };
  [TauriRoutes.FetchImages]: {
    path: string;
    images: Images;
  };
  [TauriRoutes.GetInstalledVersion]: {
    version: string;
  };
  [TauriRoutes.GetExecutablePath]: {
    path: string;
  };
  [TauriRoutes.GameInstall]: void;
  [TauriRoutes.UninstallGame]: {
    status: string;
  };
  [TauriRoutes.SendNotification]: void;
  [TauriRoutes.ReadScreenshots]: {
    screenshots: Array<Screenshot>;
  };
  [TauriRoutes.GetPackagesList]: Array<Package>;
}
