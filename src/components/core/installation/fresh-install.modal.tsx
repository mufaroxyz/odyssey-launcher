import { useEffect, useState } from "react";
import { ModalProps } from "../../../lib/types";
import { Button } from "../../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFactualContent,
  DialogFooter,
} from "../../ui/dialog";
import { tauriInvoke } from "../../../lib/utils";
import { TauriRoutes } from "../../../lib/ptypes";
import { open as tauriOpen } from "@tauri-apps/api/dialog";
import useApplicationStore from "../../state/application-state";
import { useShallow } from "zustand/react/shallow";
import { defaultInstallationContext } from "../../state/application-state.default";

export default function FreshInstallModal({
  open,
  onOpenChange,
  setCurrentModal,
}: ModalProps & {
  setCurrentModal: React.Dispatch<React.SetStateAction<string | null>>;
}) {
  const { updateGlobal, getValue } = useApplicationStore(
    useShallow((s) => ({
      updateGlobal: s.updateGlobal,
      update: s.update,
      getValue: s.getValue,
    }))
  );
  const [installationPath, setInstallationPath] = useState("");
  const [tempPath, setTempPath] = useState<null | string>(null);

  useEffect(() => {
    if (!open) return;

    const fetchData = async () => {
      const installationPaths = JSON.parse(
        localStorage.getItem("installationPaths") ?? "{}"
      );

      if (installationPaths.installationPath && installationPaths.tempPath) {
        setInstallationPath(installationPaths.installationPath);
        setTempPath(installationPaths.tempPath);
        return;
      }

      const path = await tauriInvoke(TauriRoutes.GetExecutablePath)
        .then((r) => r.path)
        .catch((_) => "");

      setInstallationPath(path + "/Genshin Impact");
      setTempPath(path + "/temp");
    };

    fetchData();
  }, [open]);

  async function changeInstallationPath() {
    const selected = await tauriOpen({
      multiple: false,
      directory: true,
      recursive: false,
      title: "Select Genshin Impact installation path",
    });

    if (!selected) return;
    setInstallationPath((selected as string) + "/Genshin Impact");
  }

  async function changeTempPath() {
    const selected = await tauriOpen({
      multiple: false,
      directory: true,
      recursive: false,
      title: "Select Genshin Impact temporary files path",
    });

    if (!selected) return;
    setTempPath(selected as string);
  }

  async function handleConfirm() {
    const currentValue = getValue("installationContext");

    if (currentValue.isInstalling)
      return updateGlobal("installationContext", {
        ...currentValue,
        isInstalling: true,
      });

    console.log("Installation path:", installationPath);
    console.log("Temporary path:", tempPath);
    setCurrentModal(null);

    localStorage.setItem(
      "installationPaths",
      JSON.stringify({ installationPath, tempPath })
    );
    updateGlobal("installationContext", {
      ...defaultInstallationContext,
      isInstalling: true,
      folders: {
        game: installationPath,
        temp: tempPath ?? "",
      },
    });

    await tauriInvoke(TauriRoutes.GameInstall, {
      installationPath,
      tempPath,
    }).catch((e) => {
      console.error("Error while installing game:", e);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[700px]">
        <DialogFactualContent className="text-white space-y-6">
          <div>
            <p className="text-lg">Installation path:</p>
            <input
              type="text"
              onClick={changeInstallationPath}
              value={installationPath.replace(/\\/g, "/")}
              className="cursor-pointer select-none bg-input-hover border-solid border-[1px] border-input-border text-white outline-none focus:outline-none w-full rounded-md p-2 mt-2"
              readOnly
            />
          </div>
          <div>
            <p className="text-lg">Custom temporary files path:</p>
            <p className="py-1 text-grey-five">
              These will be used to store game segments during the installation.
            </p>
            <input
              type="text"
              onClick={changeTempPath}
              value={tempPath?.replace(/\\/g, "/") ?? "System default"}
              className="cursor-pointer select-none bg-input-hover border-solid border-[1px] border-input-border text-white outline-none focus:outline-none w-full rounded-md p-2 mt-2"
              readOnly
            />
          </div>
        </DialogFactualContent>
        <DialogFooter>
          <Button
            onClick={handleConfirm}
            variant="accent"
            label="Greet"
            className={"!w-fit"}
          >
            Install
          </Button>
          <DialogClose asChild>
            <Button variant="dark" label="Greet" className={"!w-fit"}>
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
