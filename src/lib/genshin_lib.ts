import { ApplicationSettings } from "./types";
import KvSettings from "./store";
import { TauriResponse, TauriRoutes } from "./ptypes";
import { JSONInvoke } from "./utils";

export async function fetchAllConfig(): Promise<ApplicationSettings> {
  console.log("Fetching all config");
  return await KvSettings.createOrGetAll();
}

export async function isGameInstalled() {
  const path = (await KvSettings.get("genshinImpactData"))?.path;
  if (!path) return false;

  const isValid = await JSONInvoke<
    TauriResponse["TauriRoutes.EnsureInstallationPath"]
  >(TauriRoutes.EnsureInstallationPath, {
    path,
  }).then((res) => {
    return !("error" in res);
  });

  return isValid;
}
