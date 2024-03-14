import { Outlet } from "react-router-dom";
import useApplicationStore from "../state/application-state";
import { useShallow } from "zustand/react/shallow";
import { useEffect } from "react";
import Spinner from "../ui/spinner";

export default function LoadingOverlay() {
  const { load, isLoaded } = useApplicationStore(
    useShallow((state) => ({
      load: state._REQUEST_INITIAL_STORE_LOAD,
      isLoaded: state.isLoaded,
    }))
  );

  console.log("LoadingOverlay: ", isLoaded);

  useEffect(() => {
    console.log("LoadingOverlay: ", isLoaded);
    if (!isLoaded) load();
  }, []);

  if (isLoaded) {
    return <Outlet />;
  }

  return (
    <div className="fixed z-10 flex bg-bg-color h-full items-center justify-center">
      <Spinner />
    </div>
  );
}
