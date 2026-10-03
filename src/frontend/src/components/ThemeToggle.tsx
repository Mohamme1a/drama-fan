import { useThemeContext } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

/** Icon button that toggles between dark and light mode. */
export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeContext();
  const isDark = theme === "dark";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={
        isDark ? "التبديل إلى الوضع الفاتح" : "التبديل إلى الوضع الداكن"
      }
      data-ocid="theme.toggle"
      className="size-10 rounded-full text-muted-foreground hover:text-foreground"
    >
      {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </Button>
  );
}
