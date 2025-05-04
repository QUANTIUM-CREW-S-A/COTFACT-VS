import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTheme } from "@/context/theme/ThemeProvider";

const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="relative overflow-hidden"
          >
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{
                opacity: theme === "light" ? 1 : 0,
                y: theme === "light" ? 0 : -30,
                scale: theme === "light" ? 1 : 0.5,
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <Sun className="h-[1.2rem] w-[1.2rem]" />
            </motion.div>

            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{
                opacity: theme === "dark" ? 1 : 0,
                y: theme === "dark" ? 0 : 30,
                scale: theme === "dark" ? 1 : 0.5,
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <Moon className="h-[1.2rem] w-[1.2rem]" />
            </motion.div>

            <span className="sr-only">Cambiar tema</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="text-xs">
            Cambiar a tema {theme === "light" ? "oscuro" : "claro"}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ThemeToggle;