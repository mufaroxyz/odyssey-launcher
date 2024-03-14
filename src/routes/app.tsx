import { useEffect, useState } from "react";
import { isGameInstalled } from "../lib/genshin_lib";
import KvSettings from "../lib/store";
import MissingGameInstallation from "../components/core/missing-game-installation";
import AppRest from "../components/core/app-rest";
import { ErrorBoundary } from "react-error-boundary";
import useApplicationStore from "../components/state/application-state";
import { useShallow } from "zustand/react/shallow";

function App() {
  const { load } = useApplicationStore(
    useShallow((state) => ({ load: state.REQUEST_STORE_UPDATE }))
  );
  const [dialogOpened, setDialogOpened] = useState({
    missingGameInstallation: false,
  });

  useEffect(() => {
    const makeSureGameIsInstalled = async () => {
      const isInstalled = await isGameInstalled();

      if (!isInstalled) {
        await KvSettings.set("genshinImpactData", {
          path: "",
        });
        setDialogOpened({
          missingGameInstallation: true,
        });
        return;
      }

      load();
    };

    if (!dialogOpened.missingGameInstallation) {
      makeSureGameIsInstalled();
    }
  }, [dialogOpened.missingGameInstallation]);

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
      <MissingGameInstallation
        open={dialogOpened.missingGameInstallation}
        setOpen={() => {
          setDialogOpened({
            missingGameInstallation: !dialogOpened.missingGameInstallation,
          });
        }}
      />
      {!dialogOpened.missingGameInstallation && <AppRest />}
    </ErrorBoundary>
  );
}

export default App;
