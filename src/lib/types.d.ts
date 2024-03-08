type Path<T> = `file://${T}`

export interface GenshinImpactData {
    path: Path;
    version: string;
}

export interface ApplicationSettings {
    genshinImpactData: GenshinImpactData;
}