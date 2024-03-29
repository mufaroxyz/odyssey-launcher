type Path = string;

export interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type FilterDeepNonObjects = {
  [K in keyof T]: T[K] extends object ? never : K;
};

export interface ApplicationData {
  applicationSettings: ApplicationSettings;
  localGameManifest: LocalGameManifest;
  installationContext: InstallationContext;
  images: Images;
}

export interface ClearedApplicationData {
  applicationSettings: Pick<ApplicationSettings, keyof ApplicationSettings>;
  localGameManifest: Pick<LocalGameManifest, keyof LocalGameManifest>;
  installationContext: Pick<InstallationContext, keyof InstallationContext>;
  images: Pick<Images, keyof Images>;
}

export type ApplicationDataKeys = keyof (Omit<
  ApplicationData,
  "applicationSettings"
> & {});
export type ApplicationDataAccessor = ApplicationData[ApplicationDataKeys];

export interface GenshinImpactData {
  path: Path;
}

export type ApplicationSettings = {
  genshinImpactData: GenshinImpactData;
  playTime: number;
  lastInstallationStep: number;
};

export interface LocalGameManifest {
  // channel: string;
  // cps: string;
  // game_version: string;
  // plugin_7_version: string;
  // sub_channel: string;
  // uapc: string;
  version: string;
}

export interface InstallationContext {
  isInstalling: boolean;
  currentStep: number;
  progressPercentage: number;
  progressOn: "installing" | "unpacking" | "none";
  progress: {
    total: number;
    current: number;
  };
  folders: {
    game: string;
    temp: string;
  };
}

export interface Advertisement {
  background: string;
  icon: string;
  url: string;
}

export interface Banner {
  banner_id: string;
  img: string;
  url: string;
}

export interface Post {
  type: string;
  title: string;
  url: string;
  show_time: string;
}

export interface Images {
  adv: Advertisement;
  banner: Banner[];
  post: Post[];
}
