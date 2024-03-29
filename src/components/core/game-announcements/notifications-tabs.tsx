import { useState } from 'react';
import { cn } from '../../../lib/utils';
import { motion } from 'framer-motion';

export type Tab = {
  title: string;
  value: string;
  content: React.ReactNode;
};

export const NotificationsTabs = ({
  tabs: propTabs,
  containerClassName,
  activeTabClassName,
  tabClassName,
}: {
  tabs: Tab[];
  containerClassName?: string;
  activeTabClassName?: string;
  tabClassName?: string;
}) => {
  const [active, setActive] = useState<Tab>(propTabs[0]);

  const moveSelectedTabToTop = (idx: number) => {
    const newTabs = [...propTabs];
    const selectedTab = newTabs.splice(idx, 1);
    newTabs.unshift(selectedTab[0]);
    setActive(newTabs[0]);
  };

  return (
    <>
      <div
        className={cn(
          'flex flex-row gap-1 items-center justify-start [perspective:1000px] relative overflow-auto sm:overflow-visible no-visible-scrollbar max-w-full w-full',
          containerClassName,
        )}
      >
        {propTabs.map((tab, idx) => (
          <>
            <button
              key={tab.value}
              onClick={() => {
                moveSelectedTabToTop(idx);
              }}
              className={cn('relative w-[95%] h-8 rounded-md', tabClassName)}
              style={{
                transformStyle: 'preserve-3d',
              }}
            >
              {active.value === tab.value && (
                <motion.div
                  layoutId="notificationsTab"
                  transition={{ type: 'spring', bounce: 0.3, duration: 0.6 }}
                  className={cn(
                    'absolute inset-0 rounded-md before:w-[40px] before:-translate-x-[50%] before:rounded-xl before:h-[1.5px] before:-bottom-[1px] before:absolute before:bg-accent ',
                    activeTabClassName,
                  )}
                />
              )}

              <span className="relative w-fit block text-white">{tab.title}</span>
            </button>
          </>
        ))}
      </div>
      <div className="w-[400px] h-[200px] p-2 space-y-2 overflow-hidden">
        {propTabs.find((tab) => tab.value === active.value)?.content}
      </div>
    </>
  );
};
