import { useShallow } from "zustand/react/shallow";
import useApplicationStore from "../state/application-state";
import Spinner from "../ui/spinner";

export default function LoadingScreen() {
  const { isLoaded } = useApplicationStore(
    useShallow((state) => ({ isLoaded: state.isLoaded }))
  );

  if (isLoaded) {
    return null;
  }

  return (
    <div className="fixed z-10 flex bg-bg-color h-full items-center justify-center">
      <Spinner />
    </div>
  );
}
