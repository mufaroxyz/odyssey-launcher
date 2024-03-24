import { AnimatePresence } from "framer-motion";
import { Outlet } from "react-router-dom";

export default function AnimationLayout() {
  return (
    <AnimatePresence>
      <Outlet />
    </AnimatePresence>
  );
}
