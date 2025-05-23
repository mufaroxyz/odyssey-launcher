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
  screenshots: Screenshot[];
  packages: Package[];
}

export interface ClearedApplicationData {
  applicationSettings: Pick<ApplicationSettings, keyof ApplicationSettings>;
  localGameManifest: Pick<LocalGameManifest, keyof LocalGameManifest>;
  installationContext: Pick<InstallationContext, keyof InstallationContext>;
  images: Pick<Images, keyof Images>;
  screenshots: Screenshot[];
  packages: Package[];
}

export type ApplicationDataKeys = keyof (ApplicationData & object);
export type ApplicationDataAccessor = ApplicationData[ApplicationDataKeys];

export interface GenshinImpactData {
  path: Path;
  usedPackages: string[];
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
  progressOn: 'installing' | 'unpacking' | 'none';
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

export interface Package {
  name: string;
  display_name: string;
  native: boolean;
  artifact: string;
  description: string;
  repository: string;
}

export interface Screenshot extends string {}
