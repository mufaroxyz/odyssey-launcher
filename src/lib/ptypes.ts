import { Images, LocalGameManifest } from "./types";

export enum TauriRoutes {
  FindInstallationPath = "find_installation_path",
  EnsureInstallationPath = "ensure_installation_path",
  FetchLocalManifest = "fetch_local_manifest",
  FetchImages = "fetch_images",
  GetInstalledVersion = "get_installed_version",
  GetExecutablePath = "get_executable_path",
  GameInstall = "game_install",
  SendNotification = "send_notification",
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
  [TauriRoutes.SendNotification]: {
    title: string;
    body: string;
  };
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
  [TauriRoutes.SendNotification]: void;
}
