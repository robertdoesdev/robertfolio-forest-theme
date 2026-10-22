export enum SkillNames {
  JS = "js",
  TS = "ts",
  HTML = "html",
  CSS = "css",
  REACT = "react",
  NEXTJS = "nextjs",
  TAILWIND = "tailwind",
  NODEJS = "nodejs",
  POSTGRES = "postgres",
  MONGODB = "mongodb",
  GIT = "git",
  GITHUB = "github",
  NPM = "npm",
}

export type Skill = {
  id: number;
  name: string;
  label: string;
  shortDescription: string;
  color: string;
  icon: string;
  keyboardIcon?: string;
  keyboardColor?: string;
  shortcut?: string;
};

const devicon = (name: string) => `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${name}/${name}-original.svg`;

export const SKILLS: Record<SkillNames, Skill> = {
  [SkillNames.JS]: { id: 1, name: "js", label: "JavaScript", shortDescription: "Interactive web experiences and application logic.", color: "#f0db4f", icon: devicon("javascript"), keyboardColor: "#f0db4f" },
  [SkillNames.TS]: { id: 2, name: "ts", label: "TypeScript", shortDescription: "Typed JavaScript for more maintainable applications.", color: "#3178c6", icon: devicon("typescript"), keyboardColor: "#3178c6" },
  [SkillNames.HTML]: { id: 3, name: "html", label: "HTML", shortDescription: "Semantic structure and accessible page content.", color: "#e34f26", icon: devicon("html5"), keyboardColor: "#e34f26" },
  [SkillNames.CSS]: { id: 4, name: "css", label: "CSS", shortDescription: "Responsive layouts, visual systems and interaction states.", color: "#1572b6", icon: devicon("css3"), keyboardColor: "#1572b6" },
  [SkillNames.REACT]: { id: 5, name: "react", label: "React", shortDescription: "Reusable components and interactive interfaces.", color: "#61dafb", icon: devicon("react"), keyboardColor: "#61dafb" },
  [SkillNames.NEXTJS]: { id: 6, name: "nextjs", label: "Next.js", shortDescription: "React applications with routing and server capabilities.", color: "#a5a5a5", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg", keyboardColor: "#303030" },
  [SkillNames.TAILWIND]: { id: 7, name: "tailwind", label: "Tailwind CSS", shortDescription: "Utility-first styling for consistent responsive interfaces.", color: "#38bdf8", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-plain.svg", keyboardColor: "#38bdf8" },
  [SkillNames.NODEJS]: { id: 8, name: "nodejs", label: "Node.js", shortDescription: "JavaScript runtime for backend logic and APIs.", color: "#6cc24a", icon: devicon("nodejs"), keyboardColor: "#6cc24a" },
  [SkillNames.POSTGRES]: { id: 9, name: "postgres", label: "PostgreSQL", shortDescription: "Relational data modelling and SQL databases.", color: "#336791", icon: devicon("postgresql"), keyboardColor: "#336791" },
  [SkillNames.MONGODB]: { id: 10, name: "mongodb", label: "MongoDB", shortDescription: "Document-oriented data storage.", color: "#47a248", icon: devicon("mongodb"), keyboardColor: "#47a248" },
  [SkillNames.GIT]: { id: 11, name: "git", label: "Git", shortDescription: "Version control and incremental project development.", color: "#f1502f", icon: devicon("git"), keyboardColor: "#f1502f" },
  [SkillNames.GITHUB]: { id: 12, name: "github", label: "GitHub", shortDescription: "Repositories, collaboration and project delivery.", color: "#9ca3af", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg", keyboardColor: "#303030" },
  [SkillNames.NPM]: { id: 13, name: "npm", label: "npm", shortDescription: "Managing JavaScript dependencies and project scripts.", color: "#cb3837", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/npm/npm-original-wordmark.svg", keyboardColor: "#cb3837" },
};

export type Experience = {
  id: number;
  startDate: string;
  endDate: string;
  title: string;
  company: string;
  description: string[];
  skills: SkillNames[];
};

// Kept grounded in the experience notes already present in this project folder.
export const EXPERIENCE: Experience[] = [
  {
    id: 1,
    startDate: "2025",
    endDate: "Present",
    title: "Independent Developer & Designer",
    company: "Independent work",
    description: [
      "Designing and building web products from concept through implementation.",
      "Exploring interaction design, visual storytelling, and polished responsive interfaces.",
      "Using real projects to strengthen frontend fundamentals, product thinking, and debugging skills.",
    ],
    skills: [SkillNames.HTML, SkillNames.CSS, SkillNames.JS, SkillNames.GIT, SkillNames.GITHUB],
  },
  {
    id: 2,
    startDate: "2026",
    endDate: "Present",
    title: "Product Builder",
    company: "SideQuest · OnTrack",
    description: [
      "Building SideQuest, a challenge-discovery product designed to turn boredom into real-world action.",
      "Developing OnTrack, a focused habit and progress tool that keeps daily priorities at the centre.",
      "Iterating on product flows, visual systems, and cross-device usability.",
    ],
    skills: [SkillNames.JS, SkillNames.HTML, SkillNames.CSS, SkillNames.NODEJS, SkillNames.POSTGRES],
  },
];

export const themeDisclaimers = {
  light: ["Daylight settles over the forest."],
  dark: ["Night returns to the forest."],
};
