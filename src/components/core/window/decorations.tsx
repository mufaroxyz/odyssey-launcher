import { appWindow } from "@tauri-apps/api/window";
import { X } from "lucide-react";

export default function WindowDecorations() {
  return (
    <div
      data-tauri-drag-region
      className="h-[30px] bg-sidebar-bg-color select-none justify-between flex items-center top-0 right-0 left-0"
    >
      <div className="w-11 flex justify-center">
        <img src="/icons/icon.png" className="w-6 h-6 mt-2" />
      </div>
      <span className="text-sm text-white font-semibold">Genshin Loader</span>
      <div className="flex justify-end">
        <button
          onClick={() => appWindow.close()}
          className=" inline-flex justify-center items-center w-[30px] h-[30px]"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}
