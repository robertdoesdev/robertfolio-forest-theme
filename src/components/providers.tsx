import Preloader from "./preloader";
import { ThemeProvider } from "./theme-provider";
import { Toaster } from "./ui/toaster";

import { TooltipProvider } from "./ui/tooltip";

import MotionPreferences from "./motion-preferences";
import { ForestThemeProvider } from "@/contexts/forest-theme";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return <ThemeProvider
    attribute="class"
    defaultTheme="dark"
    disableTransitionOnChange
  >
    <ForestThemeProvider>
      <MotionPreferences>
        <Preloader>
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster />
        </Preloader>
      </MotionPreferences>
    </ForestThemeProvider>
  </ThemeProvider>;
};
