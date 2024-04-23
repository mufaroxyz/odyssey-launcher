import { AnimatePresence } from 'framer-motion';
import { Outlet } from 'react-router-dom';

export default function AnimationLayout() {
  return (
    <AnimatePresence mode="wait">
      <Outlet />
    </AnimatePresence>
  );
}
