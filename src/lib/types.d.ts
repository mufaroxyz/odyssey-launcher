type Path = string;

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
