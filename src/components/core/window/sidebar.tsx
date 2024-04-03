import { Box, Camera, Home } from 'lucide-react';
import { Tab, Tabs } from '../../ui/sidebar-tabs';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';

export default function Sidebar() {
  const items: Tab[] = [
    {
      icon: <Home size={20} />,
      value: 'home',
      to: '/',
    },
    {
      icon: <Box size={20} />,
      value: 'packages',
      to: '/packages',
    },
    {
      icon: <Camera size={20} />,
      value: 'screenshots',
      to: '/screenshots',
    },
  ];

  return (
    <motion.div className={cn('w-12 px-1 mt-4 h-full inline')}>
      <Tabs tabs={items} />
    </motion.div>
  );
}
