//React
import { useEffect, useState } from "react";

//NextUi
import { Switch } from "@nextui-org/react";

//Icons
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";

export default function ThemeSwitcher({ ...props }) {
  const currentTheme = JSON.parse(localStorage.getItem("currentTheme"));
  if (!currentTheme) {
    localStorage.setItem("currentTheme", JSON.stringify("light"));
  }

  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState(currentTheme);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("currentTheme", JSON.stringify("dark"));
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("currentTheme", JSON.stringify("light"));
    }
  }, [theme]);

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
      onValueChange={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={props.className}
      alt="Theme switcher"
    />
  );
}
