export const defaultLocalGameManifest = {
  version: '',
};

export const defaultScreenshots = [];

export const defaultImages = {
  adv: {
    background: '',
    icon: '',
    url: '',
  },
  banner: [],
  post: [],
};

export const defaultApplicationSettings = {
  genshinImpactData: {
    path: '',
  },
  playTime: 0,
  lastInstallationStep: 0,
};

export const defaultInstallationContext = {
  isInstalling: false,
  currentStep: 0,
  progressPercentage: 0,
  progressOn: 'none' as const,
  progress: {
    total: 0,
    current: 0,
  },
  folders: {
    game: '',
    temp: '',
  },
};

export const defaultApplicationData = {
  applicationSettings: defaultApplicationSettings,
  localGameManifest: defaultLocalGameManifest,
  installationContext: defaultInstallationContext,
  images: defaultImages,
  screenshots: defaultScreenshots,
};
