import { Outlet } from 'react-router-dom';
import WindowDecorations from '../core/window/decorations';
import Sidebar from '../core/window/sidebar';
import { useEffect } from 'react';
import useApplicationStore from '../state/application-state';
import { listen } from '@tauri-apps/api/event';

export default function RootLayout() {
  const { update, getValue } = useApplicationStore();

  useEffect(() => {
    const listener = listen(
      'play-time',
      (event: {
        payload: {
          elapsed: number;
        };
      }) => {
        const applicationSettings = getValue('applicationSettings');

        console.log(
          '[PLAYTIME] : ',
          event.payload.elapsed,
          'NEW PLAYTIME: ',
          applicationSettings.playTime + event.payload.elapsed,
        );
        update('playTime', applicationSettings.playTime + event.payload.elapsed);
      },
    );

    return () => {
      listener.then((l) => l());
    };
  }, []);

  return (
    <div className="h-full flex flex-col">
      <WindowDecorations />
      <div className="flex-auto flex">
        <Sidebar />
        <div className="flex-auto flex flex-col">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
