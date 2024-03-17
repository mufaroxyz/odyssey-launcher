import { ErrorBoundary } from "react-error-boundary";
import LoadingScreen from "../components/core/loading-screen";
import useApplicationStore from "../components/state/application-state";
import { invoke } from "@tauri-apps/api";
import { Button } from "../components/ui/button";
import { Download, SettingsIcon } from "lucide-react";
import RoutePage from "../components/core/wrappers/route-page";
import DebugOverlay from "../components/core/wrappers/debug-overlay";
import ScrollingBanners from "../components/core/game-announcements/banners";

function App() {
  const { applicationSettings, localGameManifest, images } =
    useApplicationStore();

  const applicationData = {
    applicationSettings,
    localGameManifest,
    images,
  };

  async function startGame() {
    console.log("Starting game...");
    await invoke("start_game", {
      path: applicationSettings.genshinImpactData.path,
    });
  }

  return (
    <ErrorBoundary
      fallback={
        <div className="w-full h-full grid place-items-center">
          <div className="flex flex-col items-center">
            <img src="/qiqi_fallen.png" alt="Error" className="w-1/4 h-1/4" />
            <h2>Something went wrong.</h2>
            <p>Check the console for more details.</p>
          </div>
        </div>
      }
    >
      <LoadingScreen />
      <RoutePage
        backgroundImage={applicationData.images.advertisement.splash}
        className="flex-row"
      >
        <div className="flex-1 flex flex-col">
          <ScrollingBanners />
        </div>
        {/* {applicationData && (
          <DebugOverlay
            objectData={{
              gamePath:
                applicationData.applicationSettings.genshinImpactData.path,
              gameVersion: applicationData.localGameManifest.game_version,
              pluginVersion: applicationData.localGameManifest.plugin_7_version,
              channel: applicationData.localGameManifest.channel,
            }}
          />
        )} */}
        <div className={"p-4 flex gap-2 self-end"}>
          <Button
            variant="dark"
            label="Greet"
            className={"!w-fit"}
            acrylic
            icon={<SettingsIcon size={20} />}
          >
            Configure
          </Button>
          <Button
            onClick={startGame}
            variant="accent"
            label="Greet"
            icon={<Download size={20} />}
            className={"!w-fit"}
          >
            Download Game
          </Button>
        </div>
      </RoutePage>
    </ErrorBoundary>
  );
}

export default App;
