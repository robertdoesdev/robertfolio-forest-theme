import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { TypographyP } from "@/components/ui/typography";

export type Skill = {
  title: string;
  bg: string;
  fg: string;
  icon: ReactNode;
};

const skill = (title: string, mark: string, bg = "#202923"): Skill => ({
  title,
  bg,
  fg: "#f3f1e8",
  icon: <span className="text-[10px] font-semibold tracking-tight">{mark}</span>,
});

const TECH = {
  html: skill("HTML", "HTML", "#9c452d"),
  css: skill("CSS", "CSS", "#285f9e"),
  js: skill("JavaScript", "JS", "#8a7423"),
  ts: skill("TypeScript", "TS", "#285f9e"),
  react: skill("React", "R", "#216e80"),
  next: skill("Next.js", "N", "#303030"),
  tailwind: skill("Tailwind CSS", "TW", "#286e7c"),
  node: skill("Node.js", "Node", "#416b3c"),
  postgres: skill("PostgreSQL", "PG", "#365e7e"),
};

const ProjectLinks = ({ live, repo }: { live?: string; repo?: string }) => (
  <div className="my-3 mb-8 flex flex-wrap items-center gap-3">
    {live && live !== "#" && <Link href={live} target="_blank" rel="noreferrer"><Button size="sm">Visit website <ArrowUpRight className="ml-2 size-4" /></Button></Link>}
    {repo && repo !== "#" && <Link href={repo} target="_blank" rel="noreferrer"><Button size="sm" variant="outline">View source <ArrowUpRight className="ml-2 size-4" /></Button></Link>}
    {(!live || live === "#") && (!repo || repo === "#") && <span className="text-sm text-muted-foreground">Project details will be added soon.</span>}
  </div>
);

export type Project = {
  id: string;
  category: string;
  title: string;
  src: string;
  screenshots: string[];
  skills: { frontend: Skill[]; backend: Skill[] };
  content: React.ReactNode;
  github?: string;
  live: string;
};

const projects: Project[] = [
  {
    id: "portfolio",
    category: "Personal portfolio · Web experience",
    title: "Robertfolio",
    src: "/assets/projects-screenshots/portfolio/forest-preview.svg",
    screenshots: ["portfolio.png"],
    skills: { frontend: [TECH.ts, TECH.react, TECH.next, TECH.tailwind], backend: [] },
    live: "https://robertfolio.lovable.app",
    content: (
      <div className="space-y-5">
        <TypographyP className="text-center font-mono text-2xl">A portfolio with a world of its own.</TypographyP>
        <TypographyP className="font-mono">Robertfolio brings design and web development together in a cinematic forest setting. The experience pairs a clear portfolio structure with an optional interactive map, so the environment adds character without getting between visitors and the work.</TypographyP>
        <ProjectLinks live="https://robertfolio.lovable.app" />
      </div>
    ),
  },
  {
    id: "sidequest",
    category: "Social discovery · Web app",
    title: "SideQuest",
    src: "/assets/projects-screenshots/sidequest/landing.svg",
    screenshots: ["sidequest.jpg"],
    skills: { frontend: [TECH.html, TECH.css, TECH.js], backend: [TECH.node, TECH.postgres] },
    live: "https://sidequest-world.vercel.app",
    github: "https://github.com/robertdoesdev/Sidequest",
    content: (
      <div className="space-y-5">
        <TypographyP className="text-center font-mono text-2xl">Do something with your boredom.</TypographyP>
        <TypographyP className="font-mono">SideQuest turns idle time into real-world challenges: creative, social, adventurous, skill-building and delightfully unexpected missions. It is designed around quick discovery, progress tracking and a mobile-first experience.</TypographyP>
        <ProjectLinks live="https://sidequest-world.vercel.app" repo="https://github.com/robertdoesdev/Sidequest" />
      </div>
    ),
  },
  {
    id: "ontrack",
    category: "Productivity · Web app",
    title: "OnTrack",
    src: "/assets/projects-screenshots/ontrack/landing.svg",
    screenshots: ["landing.svg"],
    skills: { frontend: [TECH.html, TECH.css, TECH.js], backend: [] },
    live: "https://onn-track.vercel.app",
    github: "https://github.com/robertdoesdev/OnTrack",
    content: (
      <div className="space-y-5">
        <TypographyP className="text-center font-mono text-2xl">A calmer way to keep moving.</TypographyP>
        <TypographyP className="font-mono">OnTrack is a personal progress and habit-building product designed to help people focus on what matters today, build skills consistently and see progress over time without turning self-improvement into another source of pressure.</TypographyP>
        <ProjectLinks live="https://onn-track.vercel.app" repo="https://github.com/robertdoesdev/OnTrack" />
      </div>
    ),
  },
  {
    id: "stash",
    category: "Web project · Details coming soon",
    title: "Stash",
    src: "/assets/projects-screenshots/stash/placeholder.svg",
    screenshots: ["stash.jpg"],
    skills: { frontend: [], backend: [] },
    live: "#",
    content: (
      <div className="space-y-5">
        <TypographyP className="text-center font-mono text-2xl">Stash</TypographyP>
        <TypographyP className="font-mono">This project is being prepared for its portfolio feature. A proper description, screenshots and live link will be added when the details are ready.</TypographyP>
      </div>
    ),
  },
];

export default projects;
