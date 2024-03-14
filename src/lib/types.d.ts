type Path = string;

type FilterDeepNonObjects = {
  [K in keyof T]: T[K] extends object ? never : K;
};

export interface ApplicationData {
  applicationSettings: ApplicationSettings;
  localGameManifest: LocalGameManifest;
}

export interface ClearedApplicationData {
  applicationSettings: Pick<ApplicationSettings, keyof ApplicationSettings>;
  localGameManifest: Pick<LocalGameManifest, keyof LocalGameManifest>;
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
