"use client";

import { useCallback, useEffect, useId, useRef } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useForestTheme } from "@/contexts/forest-theme";
import { hideMessage, pickMessage, say, useActiveMessage } from "@/lib/creature-messages";

export default function ForestDayToggle({ className }: { className?: string }) {
  const { isDay, toggleDaylight } = useForestTheme();
  const { setTheme } = useTheme();
  const message = useActiveMessage();
  const tooltipId = useId();
  const pointerType = useRef<string>("mouse");
  const myMessage = useRef<number | null>(null);

  const showTooltip = useCallback(
    (forDay: boolean, ms = 0) => {
      // message describes the action the visitor is *about* to take
      const text = pickMessage(forDay ? "toNight" : "toDay");
      myMessage.current = say("toggle", text, ms);
    },
    [],
  );

  const dismiss = useCallback(() => {
    hideMessage(myMessage.current, "toggle");
    myMessage.current = null;
  }, []);

  // never leave a stale tooltip behind if the header unmounts
  useEffect(() => dismiss, [dismiss]);

  const toggle = () => {
    const nextIsDay = !isDay;
    const touch = pointerType.current === "touch";
    dismiss();
    toggleDaylight();
    setTheme(nextIsDay ? "light" : "dark");
    // Touch has no hover: show the line briefly for the action just taken.
    if (touch) {
      myMessage.current = say("toggle", pickMessage(nextIsDay ? "toDay" : "toNight"), 2600);
    }
  };

  const visible = message?.owner === "toggle";

  return (
    <span className="relative inline-flex">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn("relative rounded-full border border-white/15 bg-black/10 text-foreground backdrop-blur-md hover:bg-white/10", className)}
        onClick={toggle}
        onPointerDown={(e) => {
          pointerType.current = e.pointerType;
        }}
        onPointerEnter={(e) => {
          pointerType.current = e.pointerType;
          // Pointers that can hover get the pre-click tooltip.
          if (e.pointerType === "mouse" || e.pointerType === "pen") showTooltip(isDay);
        }}
        onPointerLeave={dismiss}
        onFocus={(e) => {
          // :focus-visible ⇒ keyboard focus; avoids a tooltip on every mouse click.
          if (e.currentTarget.matches(":focus-visible")) showTooltip(isDay);
        }}
        onBlur={dismiss}
        onKeyDown={(e) => {
          if (e.key === "Escape") dismiss();
        }}
        aria-label={isDay ? "Switch forest to night" : "Switch forest to daylight"}
        aria-describedby={visible ? tooltipId : undefined}
      >
        <Sun className={cn("absolute h-5 w-5 transition-all duration-500", isDay ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-50 opacity-0")} />
        <Moon className={cn("absolute h-5 w-5 transition-all duration-500", isDay ? "rotate-90 scale-50 opacity-0" : "rotate-0 scale-100 opacity-100")} />
        <span className="sr-only">{isDay ? "Daylight mode active" : "Night mode active"}</span>
      </Button>
      {/* Sits below the control, right-aligned, never over it. */}
      <span
        id={tooltipId}
        role="tooltip"
        data-visible={visible ? "true" : "false"}
        className="forest-toggle-tip"
      >
        {visible ? message.text : ""}
      </span>
    </span>
  );
}
