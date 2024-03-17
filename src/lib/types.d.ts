type Path = string;

type FilterDeepNonObjects = {
  [K in keyof T]: T[K] extends object ? never : K;
};

export interface ApplicationData {
  applicationSettings: ApplicationSettings;
  localGameManifest: LocalGameManifest;
  images: Images;
}

export interface ClearedApplicationData {
  applicationSettings: Pick<ApplicationSettings, keyof ApplicationSettings>;
  localGameManifest: Pick<LocalGameManifest, keyof LocalGameManifest>;
  images: Pick<Images, keyof Images>;
}

export interface GenshinImpactData {
  path: Path;
}

export interface ApplicationSettings {
  genshinImpactData: GenshinImpactData;
}

export interface LocalGameManifest {
  channel: string;
  cps: string;
  game_version: string;
  plugin_7_version: string;
  sub_channel: string;
  uapc: string;
}

export interface Advertisement {
  splash: string;
  icon: string;
  icon_url: string;
}

export interface Banner {
  img: string;
  img_url: string;
}

export interface Images {
  advertisement: Advertisement;
  banners: Banner[];
}
