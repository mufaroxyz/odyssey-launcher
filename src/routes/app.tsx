import { useEffect, useState } from "react";
import { isGameInstalled } from "../lib/genshin_lib";
import KvSettings from "../lib/store";
import MissingGameInstallation from "../components/core/missing-game-installation";
import AppRest from "../components/core/app-rest";
import { scrapeBanner } from "../lib/utils";

function App() {
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
      }
    };

    if (!dialogOpened.missingGameInstallation) {
      makeSureGameIsInstalled();
    }
  }, [dialogOpened.missingGameInstallation]);

  return (
    <>
      <MissingGameInstallation
        open={dialogOpened.missingGameInstallation}
        setOpen={() => {
          setDialogOpened({
            missingGameInstallation: !dialogOpened.missingGameInstallation,
          });
        }}
      />
      {!dialogOpened.missingGameInstallation && <AppRest />}
    </>
  );
}

export default App;
