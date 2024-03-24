import { useEffect, useState } from "react";
import { Button } from "../../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFactualContent,
  DialogFooter,
} from "../../ui/dialog";
import { invoke } from "@tauri-apps/api/tauri";
import { DialogClose } from "@radix-ui/react-dialog";
import { ModalProps } from "../../../lib/types";
import useApplicationStore from "../../state/application-state";

export default function AutoDetectedPathModal({
  open,
  onOpenChange,
}: ModalProps) {
  const [path, setPath] = useState("");
  const { update } = useApplicationStore((s) => ({ update: s.update }));

  useEffect(() => {
    if (!open) return;

    const get = async () => {
      const path = await invoke("find_installation_path", {}).then((res) => {
        return (res as { path: string }).path;
      });
      console.log(path);
      setPath(path);
    };

    get();
  });

  function handleConfirm() {
    update("genshinImpactData", { path });
    onOpenChange(false);
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

          <Button disabled variant="filled">
            Choose another directory
          </Button>

          <DialogClose asChild>
            <Button variant="filled">Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
