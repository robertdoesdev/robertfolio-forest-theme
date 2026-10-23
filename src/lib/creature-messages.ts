/**
 * Personality for the forest creature and the day/night toggle.
 *
 * - A tiny external store guarantees only ONE message is visible at a time
 *   (toggle tooltip and creature bubble share it).
 * - `pickMessage` rotates through a shuffled bag so the same line is not
 *   repeated until the whole category has been used.
 */
import { useSyncExternalStore } from "react";

export type MessageCategory =
  | "toDay"
  | "toNight"
  | "caught"
  | "onName"
  | "nibble";

export const MESSAGES: Record<MessageCategory, string[]> = {
  toDay: [
    "Are you seriously turning on the lights? Some of us are nocturnal.",
    "Morning already? I haven't finished my crimes.",
    "will daylight make you hire me?",
  ],
  toNight: [
    "Going dark? Don't blame me if something eats your portfolio.",
    "We all know night is epic",
    "You didn't see anything in these woods.",
  ],
  caught: [
    "YOU SAW NOTHING.",
    "That was part of the ecosystem.",
    "I was inspecting the typography.",
    "This forest has a very reasonable tax policy.",
  ],
  onName: ["Nice mattress.", "hire me, dear human."],
  nibble: ["Quality control.", "Just a tiny snack.", "Your name looked delicious."],
};

const bags = new Map<MessageCategory, string[]>();
const lastShown = new Map<MessageCategory, string>();

export function pickMessage(category: MessageCategory): string {
  let bag = bags.get(category);
  if (!bag || bag.length === 0) {
    bag = [...MESSAGES[category]];
    for (let i = bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [bag[i], bag[j]] = [bag[j], bag[i]];
    }
    // never open a new bag with the line that closed the previous one
    if (bag.length > 1 && bag[bag.length - 1] === lastShown.get(category)) {
      [bag[0], bag[bag.length - 1]] = [bag[bag.length - 1], bag[0]];
    }
    bags.set(category, bag);
  }
  const next = bag.pop() as string;
  lastShown.set(category, next);
  return next;
}

/* ------------------------------------------------------------------ */
/* Single-slot message store                                           */
/* ------------------------------------------------------------------ */

export type MessageOwner = "toggle" | "creature";
export type ActiveMessage = { id: number; owner: MessageOwner; text: string } | null;

let active: ActiveMessage = null;
let counter = 0;
let clearTimer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

/**
 * Show a message. The toggle outranks the creature: a creature line never
 * replaces a toggle tooltip, while a toggle tooltip replaces anything.
 * Returns the message id (or null if it was suppressed).
 */
export function say(owner: MessageOwner, text: string, ms = 2800): number | null {
  if (active && active.owner === "toggle" && owner === "creature") return null;
  if (clearTimer) clearTimeout(clearTimer);
  const id = ++counter;
  active = { id, owner, text };
  emit();
  if (ms > 0) {
    clearTimer = setTimeout(() => hideMessage(id), ms);
  }
  return id;
}

export function hideMessage(id?: number | null, owner?: MessageOwner) {
  if (!active) return;
  if (id != null && active.id !== id) return;
  if (owner && active.owner !== owner) return;
  if (clearTimer) clearTimeout(clearTimer);
  clearTimer = null;
  active = null;
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useActiveMessage(): ActiveMessage {
  return useSyncExternalStore(subscribe, () => active, () => null);
}
