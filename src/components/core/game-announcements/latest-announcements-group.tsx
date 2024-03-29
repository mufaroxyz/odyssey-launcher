import ScrollingBanners from './banners';
import Notifications from './notifications';
import { motion } from 'framer-motion';

export default function LatestAnnouncementsGroup() {
  return (
    <motion.div
      initial={{ x: -20 }}
      animate={{ x: 0 }}
      transition={{
        type: 'spring',
      }}
      className="absolute bottom-10 left-10 w-[400px] overflow-hidden"
    >
      <ScrollingBanners />
      <Notifications />
    </motion.div>
  );
}
