import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { ApplicationSettings, LocalGameManifest } from "../../lib/types";
import KvSettings from "../../lib/store";
import { TauriResponse, TauriRoutes } from "../../lib/ptypes";
import { invoke } from "@tauri-apps/api/tauri";

async function fetchData() {
  const applicationSettings = await KvSettings.getAll();
  const localGameManifest = await invoke<
    TauriResponse["TauriRoutes.FetchLocalManifest"]
  >(TauriRoutes.FetchLocalManifest, {
    path: applicationSettings.genshinImpactData.path,
  });

  if ("error" in localGameManifest) {
    throw new Error(localGameManifest.error);
  }

  return {
    applicationSettings,
    localGameManifest: localGameManifest.manifest,
  };
}

export default function AppRest() {
  const [applicationData, setApplicationData] = useState<{
    applicationSettings: ApplicationSettings;
    localGameManifest: LocalGameManifest;
  } | null>(null);

  useEffect(() => {
    fetchData().then((data) => {
      setApplicationData(data);
    });
  }, []);

  return (
    <div className={"flex flex-col h-full justify-between"}>
      <div className={"flex-1 p-2"}>
        <h3 className="bg-none text-white">
          Genshin Impact <span className="text-accent">Loader</span>
        </h3>
        {applicationData && (
          <div>
            <div>
              <h4>Game Path</h4>
              <p>
                {applicationData.applicationSettings.genshinImpactData.path}
              </p>
            </div>
            <div>
              <h4>Game Version</h4>
              <p>{applicationData.localGameManifest?.game_version}</p>
            </div>
            <div>
              <h4>Game Build</h4>
              <p>{applicationData.localGameManifest?.uapc}</p>
            </div>
            <div>
              <h4>Game Channel</h4>
              <p>{applicationData.localGameManifest?.channel}</p>
            </div>
          </div>
        )}
      </div>
      <div className={"p-4 flex gap-2 self-end"}>
        <Button variant="tonal" label="Greet" className={"!w-fit"}>
          Configure
        </Button>
        <Button variant="filled" label="Greet" className={"!w-fit"}>
          Launch Game
        </Button>
      </div>
    </div>
  );
}
