import { appWindow } from '@tauri-apps/api/window';
import { X } from 'lucide-react';
import { tauriInvoke } from '../../../lib/utils';
import { TauriRoutes } from '../../../lib/ptypes';

export default function WindowDecorations() {
  return (
    <div
      data-tauri-drag-region
      className="h-[30px] bg-sidebar-bg-color select-none justify-between flex items-center top-0 right-0 left-0"
    >
      <div className="w-12 mt-1 flex justify-center">
        <img src="/icons/icon.png" className="w-6 h-6 mt-2" />
      </div>
      <p data-tauri-drag-region className="text-sm text-white font-semibold">
        Odyssey Launcher
      </p>
      <div className="flex justify-end">
        <button
          onClick={async () => {
            tauriInvoke(TauriRoutes.SendNotification, {
              title: 'Odyssey Launcher',
              body: 'Minimized the application to the tray menu.',
            });
            appWindow.hide();
          }}
          className="inline-flex justify-center rounded-none items-center w-[30px] h-[30px] hover:bg-red-500 hover:bg-opacity-50 transition-colors duration-150 ease-in-out"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}
