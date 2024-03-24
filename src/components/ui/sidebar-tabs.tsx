import { useState } from "react";
import { cn } from "../../lib/utils";
import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";

export type Tab = {
  icon: React.ReactNode;
  value: string;
  to: string;
};

export const Tabs = ({
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
          "flex flex-col gap-1 items-center justify-start [perspective:1000px] relative overflow-auto sm:overflow-visible no-visible-scrollbar max-w-full w-full",
          containerClassName
        )}
      >
        {propTabs.map((tab, idx) => (
          <NavLink
            to={tab.to}
            key={tab.value}
            onClick={() => {
              moveSelectedTabToTop(idx);
            }}
            className={cn("relative w-full h-8 rounded-md", tabClassName)}
            style={{
              transformStyle: "preserve-3d",
            }}
          >
            {active.value === tab.value && (
              <motion.div
                layoutId="clickedbutton"
                transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                className={cn(
                  "absolute inset-0 bg-button-hover rounded-md before:w-[3px] before:translate-y-[50%] before:rounded-xl before:h-4 before:-left-[1px] before:absolute before:bg-accent ",
                  activeTabClassName
                )}
              />
            )}

            <span className="relative block text-white">{tab.icon}</span>
          </NavLink>
        ))}
      </div>
    </>
  );
};
