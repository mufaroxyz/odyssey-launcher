import { useState } from "react";
import { Dialog, DialogContent } from "../ui/dialog";
import { open as dialogOpen } from "@tauri-apps/api/dialog";
import { Button } from "../ui/button";
import { invoke } from "@tauri-apps/api/tauri";
import { TauriResponse, TauriRoutes } from "../../lib/ptypes";
import KvSettings from "../../lib/store";

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function MissingGameInstallation({ open, setOpen }: Props) {
  const [selectedGamePath, setSelectedGamePath] = useState("");

  async function handlePathSelection() {
    const newSelectedPath = await dialogOpen({
      multiple: false,
      directory: true,
    });

    if (!newSelectedPath) return;

    setSelectedGamePath(newSelectedPath.toString());
    check(newSelectedPath.toString());
  }

  async function check(gamePath: string = selectedGamePath) {
    const usedPath = gamePath || selectedGamePath;
    if (!usedPath) return;

    const isValid = JSON.parse(
      await invoke(TauriRoutes.EnsureInstallationPath, {
        path: usedPath,
      })
    ) as TauriResponse["TauriRoutes.EnsureInstallationPath"];

    if ("error" in isValid) {
      console.error(isValid.error);
      return;
    }

    await KvSettings.set("genshinImpactData", {
      path: usedPath,
    });

    console.log("NEWDATA", await KvSettings.getAll());

    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <h3>Missing Game Installation</h3>
        <p>
          It looks like you don't have the game installed. Please install the
          game vie official launcher and try again.
        </p>
        <h4>Installing on a custom path?</h4>
        <p>Select the path below and check again.</p>
        <div className="flex justify-between gap-4">
          <input
            onClick={handlePathSelection}
            type="text"
            className="w-full py-2 text-sm"
            style={{
              color: (selectedGamePath && "white") || "",
            }}
            onKeyDown={(e) => {
              e.preventDefault();
            }}
            onChange={(e) => setSelectedGamePath(e.target.value)}
            value={selectedGamePath || ""}
            placeholder={
              selectedGamePath
                ? selectedGamePath
                : "C:\\\\Program Files\\Genshin Impact\\Genshin Impact Game"
            }
          />
          <Button variant="text" onClick={() => check()}>
            Check
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
