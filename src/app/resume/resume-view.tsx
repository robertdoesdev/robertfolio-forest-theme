"use client";

import Link from "next/link";
import { ArrowLeft, Download, ExternalLink } from "lucide-react";
import { config } from "@/data/config";

const skills = ["JavaScript", "TypeScript", "HTML", "CSS", "React", "Next.js", "Tailwind CSS", "Node.js", "PostgreSQL", "MongoDB", "Git", "GitHub", "npm"];

export default function ResumeView() {
  return (
    <main className="resume-page mx-auto min-h-screen w-full max-w-4xl px-5 py-10 md:px-10 md:py-16">
      <div className="resume-actions mb-10 flex flex-wrap items-center justify-between gap-3">
        <Link href="/#hero" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft size={16} /> Back to portfolio</Link>
        <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 border-2 border-foreground px-4 py-2 text-sm shadow-[3px_3px_0_rgba(0,0,0,.18)] transition hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_rgba(0,0,0,.18)]"><Download size={16} /> Save as PDF</button>
      </div>
      <header className="border-b border-border pb-8">
        <p className="mb-3 text-xs uppercase tracking-[.24em] text-muted-foreground">Résumé · Designer & Web Developer</p>
        <h1 className="font-display text-4xl font-semibold tracking-tight md:text-6xl">Robert Ocran</h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">I design and build digital experiences, combining visual design, frontend development and product thinking.</p>
        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <a href="https://github.com/robertdoesdev" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline underline-offset-4">GitHub <ExternalLink size={12} /></a>
          <a href={config.social.linkedin} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline underline-offset-4">LinkedIn <ExternalLink size={12} /></a>
          <a href="https://wa.me/2348138836551" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline underline-offset-4">WhatsApp <ExternalLink size={12} /></a>
        </div>
      </header>
      <section className="resume-section">
        <h2>Experience</h2>
        <article><div className="resume-role"><h3>Product Builder</h3><span>2026 — Present</span></div><p className="resume-company">SideQuest · OnTrack</p><ul><li>Building SideQuest, a challenge-discovery product designed to turn boredom into real-world action.</li><li>Developing OnTrack, a habit and progress tool centred on daily priorities.</li><li>Iterating on product flows, visual systems and cross-device usability.</li></ul></article>
        <article><div className="resume-role"><h3>Independent Developer & Designer</h3><span>2025 — Present</span></div><p className="resume-company">Independent work</p><ul><li>Designing and building web products from concept through implementation.</li><li>Exploring interaction design, visual storytelling and responsive interfaces.</li><li>Strengthening frontend fundamentals, product thinking and debugging through project work.</li></ul></article>
      </section>
      <section className="resume-section">
        <h2>Selected Projects</h2>
        <article><div className="resume-role"><h3>Robertfolio</h3><a href="https://robertfolio.lovable.app" target="_blank" rel="noreferrer">Live portfolio</a></div><p>Personal portfolio combining visual design, web development and an interactive forest-inspired experience.</p></article>
        <article><div className="resume-role"><h3>SideQuest</h3><a href="https://sidequest-world.vercel.app" target="_blank" rel="noreferrer">Live project</a></div><p>A challenge-discovery product that turns idle time into real-world activities and creative missions.</p></article>
        <article><div className="resume-role"><h3>OnTrack</h3><a href="https://onn-track.vercel.app" target="_blank" rel="noreferrer">Live project</a></div><p>A personal progress and habit-building product that helps users focus on what matters today.</p></article>
        <article><div className="resume-role"><h3>Stash</h3><span>Details in progress</span></div><p>Project details and public links will be added when ready.</p></article>
      </section>
      <section className="resume-section">
        <h2>Technical Skills</h2>
        <div className="resume-skills">{skills.map((item) => <span key={item}>{item}</span>)}</div>
      </section>
      <section className="resume-section">
        <h2>Contact</h2>
        <p>For collaborations and opportunities, contact me on WhatsApp or LinkedIn.</p>
        <p className="mt-2"><a href="https://wa.me/2348138836551">wa.me/2348138836551</a> · <a href={config.social.linkedin}>LinkedIn profile</a></p>
      </section>
      <p className="mt-12 border-t border-border pt-4 text-xs text-muted-foreground">This résumé is a working version. Add verified dates, education details and any formal employment before using it for applications.</p>
    </main>
  );
}
