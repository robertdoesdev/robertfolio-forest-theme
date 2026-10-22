const config = {
  title: "Robert Ocran | Designer & Web Developer",
  description: {
    long: "The portfolio of Robert Ocran — a designer and web developer building thoughtful digital experiences, interactive interfaces, and products with purpose.",
    short: "Robert Ocran is a designer and web developer focused on thoughtful interfaces and interactive digital experiences.",
  },
  keywords: [
    "Robert Ocran", "portfolio", "web designer", "graphic designer",
    "web developer", "UI design", "UX design", "frontend development",
    "interactive websites", "SideQuest", "OnTrack", "Stash", "Robertfolio",
  ],
  author: "Robert Ocran",
  // Replace this address with the inbox you want the contact form to deliver to.
  email: "",
  site: "https://robertfolio.lovable.app",
  githubUsername: "robertdoesdev",
  githubRepo: "Sidequest",
  get ogImg() { return this.site + "/assets/seo/og-image.png"; },
  social: {
    twitter: "",
    linkedin: "https://www.linkedin.com/in/atoabou-robert-o-161358391/",
    instagram: "",
    facebook: "",
    github: "https://github.com/robertdoesdev",
  },
};
export { config };
