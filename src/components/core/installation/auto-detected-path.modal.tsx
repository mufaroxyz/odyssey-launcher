import { useEffect, useState } from "react";
import { Button } from "../../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFactualContent,
  DialogFooter,
} from "../../ui/dialog";
import { DialogClose } from "@radix-ui/react-dialog";
import { ModalProps } from "../../../lib/types";
import useApplicationStore from "../../state/application-state";
import { tauriInvoke } from "../../../lib/utils";
import { TauriRoutes } from "../../../lib/ptypes";

export default function AutoDetectedPathModal({
  open,
  onOpenChange,
  setCurrentModal,
}: ModalProps & {
  setCurrentModal: React.Dispatch<React.SetStateAction<string | null>>;
}) {
  const [path, setPath] = useState("");
  const { update } = useApplicationStore((s) => ({ update: s.update }));

  useEffect(() => {
    if (!open) return;

    const get = async () => {
      const path = await tauriInvoke(TauriRoutes.FindInstallationPath).then(
        (r) => r.path
      );
      setPath(path);
    };

    get();
  }, [open]);

  function handleConfirm() {
    update("genshinImpactData", { path });
    onOpenChange(false);
  }

  function freshInstall() {
    setCurrentModal("fresh-install");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[550px]">
        <DialogFactualContent className="text-white">
          <p className="font-normal">
            It seems you have already Genshin Impact installed on this
            directory:
          </p>
          <p className="font-bold text-white py-2">{path}</p>
          <p className="font-normal">
            Do you want to use that installation for that launcher?
          </p>
        </DialogFactualContent>
        <DialogFooter className="!justify-center gap-2">
          <Button variant="accent" onClick={handleConfirm}>
            Confirm
          </Button>

          <Button onClick={freshInstall} variant="filled">
            Fresh Install
          </Button>

          <DialogClose asChild>
            <Button variant="filled">Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
