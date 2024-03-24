import { ErrorBoundary } from "react-error-boundary";
import LoadingScreen from "../components/core/loading-screen";
import useApplicationStore from "../components/state/application-state";
import { Button } from "../components/ui/button";
import { Download, Play, SettingsIcon } from "lucide-react";
import RoutePage from "../components/core/wrappers/route-page";
import LatestAnnouncementsGroup from "../components/core/game-announcements/latest-announcements-group";
import { motion } from "framer-motion";
import AutoDetectedPathModal from "../components/core/installation/auto-detected-path.modal";
import { useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      delayChildren: 0.1,
    },
  },
};

const item = {
  hidden: { y: 60 },
  show: { y: 0 },
};

function App() {
  const [currentModal, setCurrentModal] = useState<string | null>(null);

  const { applicationSettings, localGameManifest, images } =
    useApplicationStore();

  const applicationData = {
    applicationSettings,
    localGameManifest,
    images,
  };

  async function startGame() {
    if (!applicationData.applicationSettings.genshinImpactData.path) {
      setCurrentModal("auto-detected-path");
    }

    console.log("Starting game...");
    await invoke("start_game", {
      path: applicationData.applicationSettings.genshinImpactData.path,
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
      <AutoDetectedPathModal
        open={currentModal === "auto-detected-path"}
        onOpenChange={(open) => {
          if (!open) {
            setCurrentModal(null);
          }
        }}
      />
      <RoutePage
        backgroundImage={applicationData.images.advertisement.splash}
        className="flex-row"
      >
        <div className="flex-1 flex flex-col">
          <LatestAnnouncementsGroup />
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
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className={"p-4 flex gap-2 self-end"}
        >
          <motion.div variants={item}>
            <Button
              variant="dark"
              label="Greet"
              className={"!w-fit"}
              acrylic
              icon={<SettingsIcon size={20} />}
            >
              Configure
            </Button>
          </motion.div>
          <motion.div variants={item}>
            <Button
              onClick={startGame}
              variant="accent"
              label="Greet"
              icon={
                applicationData.applicationSettings.genshinImpactData.path ? (
                  <Play size={20} />
                ) : (
                  <Download size={20} />
                )
              }
              className={"!w-fit"}
            >
              {applicationData.applicationSettings.genshinImpactData.path
                ? "Launch"
                : "Install Game"}
            </Button>
          </motion.div>
        </motion.div>
      </RoutePage>
    </ErrorBoundary>
  );
}

export default App;
