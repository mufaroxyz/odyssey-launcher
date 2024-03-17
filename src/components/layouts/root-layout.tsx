import { Outlet } from "react-router-dom";
import WindowDecorations from "../core/window/decorations";
import Sidebar from "../core/window/sidebar";

export default function RootLayout() {
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
