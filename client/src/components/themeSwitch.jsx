//React
import React from "react";
import { useEffect, useState } from "react";

//NextUi
import { Switch } from "@nextui-org/react";
import { useTheme } from "next-themes";

//Icons
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";

export default function ThemeSwitcher({ ...props }) {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Switch
      isSelected={theme === "light" ? true : false}
      size="md"
      color="warning"
      startContent={<LightModeIcon fontSize="sm" />}
      endContent={<DarkModeIcon fontSize="sm" />}
      onValueChange={() => setTheme(theme === "light" ? "dark" : "light")}
      className={props.className}
    />
  );
}
