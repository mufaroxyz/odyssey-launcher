import { useShallow } from "zustand/react/shallow";
import useApplicationStore from "../../state/application-state";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFactualContent,
  DialogFooter,
  DialogTrigger,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { tauriInvoke } from "../../../lib/utils";
import { TauriRoutes } from "../../../lib/ptypes";
import { useState } from "react";

export default function UninstallModal({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isUninstalling, setIsUninstalling] = useState(false);
  const [uninstalled, setUninstalled] = useState(false);
  const { path } = useApplicationStore(
    useShallow((s) => ({
      path: s.applicationSettings.genshinImpactData.path.replace(/\\/g, "/"),
    }))
  );

  async function uninstallGame() {
    setIsUninstalling(true);

    const result = await tauriInvoke(TauriRoutes.UninstallGame, {
      path,
    })
      .then((r) => r.status)
      .catch((e) => e);

    if (result === "success") {
      setUninstalled(true);
    }

    setIsUninstalling(false);
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogFactualContent className="text-white">
          {isUninstalling ? (
            <>
              <p className="text-3xl font-bold">Uninstalling...</p>
              <p className="mt-2">
                Please wait while Genshin Impact is uninstalled
              </p>
            </>
          ) : uninstalled ? (
            <>
              <p className="text-3xl font-bold">Uninstalled!</p>
              <p className="mt-2">
                Genshin Impact has been uninstalled from <br />
                <code>{path}</code>
              </p>
            </>
          ) : (
            <>
              <p className="text-3xl font-bold">Uninstall Genshin Impact</p>
              <p className="mt-2">
                Are you sure you want to uninstall Genshin Impact from <br />
                <code>{path}</code>
              </p>
            </>
          )}
        </DialogFactualContent>
        <DialogFooter>
          <Button
            variant="accent"
            onClick={() => {
              uninstallGame();
            }}
            disabled={isUninstalling}
          >
            Uninstall
          </Button>
          <DialogClose>
            <Button disabled={isUninstalling} variant="filled">
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
