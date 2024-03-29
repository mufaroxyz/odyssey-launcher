import { useEffect, useState } from 'react';
import Draggable from 'react-draggable';

function DrawFPS() {
  const [fps, setFps] = useState(0);
  useEffect(() => {
    let lastFrameTime = performance.now();
    let frameCount = 0;
    const updateFps = () => {
      const now = performance.now();
      frameCount++;
      if (now - lastFrameTime >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastFrameTime = now;
      }
      requestAnimationFrame(updateFps);
    };
    updateFps();
  }, []);
  return <div className="font-mono">{fps} fps</div>;
}

export default function DebugOverlay({ objectData }: { objectData?: object }) {
  return (
    <Draggable>
      <div className="fixed  text-white text-xs bg-black bg-opacity-50 z-50 rounded-md">
        <div className="cursor-move select-none bg-sky-800 bg-opacity-70 h-4 w-full font-mono">Debug Overlay</div>
        <div className="p-2 ">
          <DrawFPS />
          {objectData && (
            <div>
              <pre>{JSON.stringify(objectData, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </Draggable>
  );
}
