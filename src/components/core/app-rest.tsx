import { Button } from "../ui/button";
import useApplicationStore from "../state/application-state";
import LoadingScreen from "./loading-screen";
import { invoke } from "@tauri-apps/api/tauri";

export default function AppRest() {
  const { applicationSettings, localGameManifest } = useApplicationStore();

  const applicationData = {
    applicationSettings,
    localGameManifest,
  };

  async function startGame() {
    console.log("Starting game...");
    await invoke("start_game", {
      path: applicationSettings.genshinImpactData.path,
    });
  }

  return (
    <>
      <LoadingScreen />
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
          <Button
            onClick={startGame}
            variant="filled"
            label="Greet"
            className={"!w-fit"}
          >
            Launch Game
          </Button>
        </div>
      </div>
    </>
  );
}
