import { useShallow } from 'zustand/react/shallow';
import RoutePage from '../components/core/wrappers/route-page';
import useApplicationStore from '../components/state/application-state';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import { startDrag } from '@crabnebula/tauri-plugin-drag';

export default function Screenshots() {
  const { screenshots } = useApplicationStore(useShallow((s) => ({ screenshots: s.screenshots })));

  return (
    <RoutePage className="p-6">
      <div>
        <div className="flex flex-col gap-2 text-white">
          <p className="text-4xl font-bold">Screenshots</p>
        </div>
        <div className="grid grid-cols-1 gap-4 py-4 px-2">
          {screenshots.map((screenshot, index) => (
            <div key={index} className="flex flex-col items-center gap-2">
              <img
                onDragStart={async (e) => {
                  e.preventDefault();

                  await startDrag({ item: [screenshot as string], icon: '' }, (e) => {
                    console.log('dragging', e);
                  });
                }}
                draggable
                src={convertFileSrc(screenshot as string)}
                className="rounded-lg w-[250px] h-[141px]"
              />
              <p className="text-white select-none">{(screenshot as string).split('\\').at(-1)}</p>
            </div>
          ))}
        </div>
      </div>
    </RoutePage>
  );
}
