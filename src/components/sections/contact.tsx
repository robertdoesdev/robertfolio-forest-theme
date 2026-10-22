"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ContactForm from "../ContactForm";
import { config } from "@/data/config";
import { SectionHeader } from "./section-header";
import SectionWrapper from "../ui/section-wrapper";
import Link from "next/link";
import { SiLinkedin, SiWhatsapp, SiGithub } from "react-icons/si";

const ContactSection = () => {
  return (
    <SectionWrapper id="contact" className="min-h-screen max-w-7xl mx-auto ">
      <SectionHeader id='contact-heading' className="relative mb-14" title={
        <>
          LET&apos;S WORK <br />
          TOGETHER
        </>} />
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[1.05fr_.95fr] z-[9999] mx-4">
        <div className="mt-10 flex flex-col justify-center gap-6 md:mt-20">
          <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">Have a product idea, a design problem, or a team that needs another builder? Reach out and tell me what you have in mind.</p>
          <div className="flex flex-wrap gap-3">
            <Link href="https://wa.me/2348138836551" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-4 py-3 text-sm transition hover:-translate-y-0.5 hover:border-foreground/50"><SiWhatsapp size={18} /> WhatsApp</Link>
            <Link href={config.social.linkedin} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-4 py-3 text-sm transition hover:-translate-y-0.5 hover:border-foreground/50"><SiLinkedin size={18} /> LinkedIn</Link>
            <Link href={config.social.github} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-4 py-3 text-sm transition hover:-translate-y-0.5 hover:border-foreground/50"><SiGithub size={18} /> GitHub</Link>
          </div>
        </div>
        <Card className="min-w-0 bg-white/70 dark:bg-black/70 backdrop-blur-sm rounded-xl mt-10 md:mt-20">
          <CardHeader>
            <CardTitle className="text-4xl">Contact Form</CardTitle>
            <CardDescription>
              Send a message below. The form needs the site owner to configure email delivery before submissions can be received.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ContactForm />
          </CardContent>
        </Card>
      </div>
    </SectionWrapper>
  );
};
export default ContactSection;
