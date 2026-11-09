import { config } from "@/data/config";

export default function Footer() {
  return (
    <footer className="flex w-full shrink-0 items-center justify-between gap-4 border-t border-border px-4 py-5 md:px-8">
      <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} {config.author}.</p>
      <p className="text-[10px] uppercase tracking-[.15em] text-muted-foreground/70">Designed and Built by Robert with Inspiration from Naresh.</p>
    </footer>
  );
}
