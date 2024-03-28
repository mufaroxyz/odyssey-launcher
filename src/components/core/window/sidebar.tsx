import { Box, Home } from "lucide-react";
import { Tab, Tabs } from "../../ui/sidebar-tabs";
import { motion } from "framer-motion";
import useApplicationStore from "../../state/application-state";
import { useShallow } from "zustand/react/shallow";
import { cn } from "../../../lib/utils";

export default function Sidebar() {
  const { isInstalling } = useApplicationStore(
    useShallow((s) => ({
      isInstalling: s.installationContext.isInstalling,
    }))
  );

  const items: Tab[] = [
    {
      icon: <Home size={20} />,
      value: "home",
      to: "/",
    },
    {
      icon: <Box size={20} />,
      value: "packages",
      to: "/packages",
    },
  ];

  return (
    <motion.div
      initial={{ x: 0 }}
      animate={{
        x: isInstalling ? -100 : 0,
        width: isInstalling ? 0 : "3rem",
        transition: { duration: 0.3 },
      }}
      className={cn("px-1 mt-4 h-full inline")}
    >
      <Tabs tabs={items} />
    </motion.div>
  );
}
