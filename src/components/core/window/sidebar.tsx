import { Box, Home } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { Tab, Tabs } from "../../ui/sidebar-tabs";

export default function Sidebar() {
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
    <div className="w-12 mt-4 px-1 h-full">
      <Tabs tabs={items} />
    </div>
  );
}
