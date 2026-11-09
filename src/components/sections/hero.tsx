import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "../ui/button";
import { ArrowDownRight } from "lucide-react";
import { usePreloader } from "../preloader";
import { BlurIn, BoxReveal } from "../reveal-animations";
import ScrollDownIcon from "../scroll-down-icon";
import { SiGithub, SiLinkedin, SiWhatsapp } from "react-icons/si";
import { config } from "@/data/config";

import SectionWrapper from "../ui/section-wrapper";

const nameClass = cn(
  "-ml-[6px] leading-none text-transparent text-slate-800 text-left",
  "font-bold text-7xl md:text-7xl lg:text-8xl xl:text-9xl",
  "cursor-default text-edge-outline font-display "
);
const nameLines = config.author.split(" ").slice(0, 2);

const HeroSection = () => {
  const { isLoading } = usePreloader();

  return (
    <SectionWrapper id="hero" className={cn("relative w-full h-screen")}>
      <div className="grid md:grid-cols-2">
        <div
          className={cn(
            "h-[calc(100dvh-3rem)] md:h-[calc(100dvh-4rem)] z-[2]",
            "col-span-1",
            "flex flex-col justify-start md:justify-center items-center md:items-start",
            "pt-28 sm:pb-16 md:p-20 lg:p-24 xl:p-28"
          )}
        >
          {!isLoading && (
            <div className="flex flex-col">
              <div>
                <BlurIn delay={0.7}>
                  <p
                    className={cn(
                      "md:self-start mt-4 font-medium text-md text-slate-500 dark:text-zinc-400",
                      "cursor-default sm:text-xl md:text-xl whitespace-nowrap bg-clip-text "
                    )}
                  >
                    Hi, I am
                    <br className="md:hidden" />
                  </p>
                </BlurIn>

                <BlurIn delay={1}>
                  {/* Stage = reliable target for the creature. The <h1> below is untouched
                      (real text, SEO, accessibility); the aria-hidden overlay is a purely
                      visual copy used for squash/bite effects and is only shown while one runs. */}
                  <div className="name-stage relative" data-name-stage>
                    <h1
                      className={cn(nameClass, "name-h1")}
                    >
                      {config.author.split(" ")[0]}
                      <br className="md:block hiidden" />
                      {config.author.split(" ")[1]}
                    </h1>
                    <div
                      aria-hidden="true"
                      data-name-fx
                      className={cn(nameClass, "name-fx pointer-events-none absolute inset-x-0 top-0 select-none")}
                    >
                      {nameLines.map((line, lineIndex) => (
                        <span key={lineIndex} className="block">
                          {line.split("").map((char, i) => (
                            <span key={i} className="name-letter" data-name-letter data-line={lineIndex} data-index={i}>
                              {char}
                            </span>
                          ))}
                        </span>
                      ))}
                    </div>
                  </div>
                </BlurIn>
                {/* <div className="md:block hidden bg-gradient-to-r from-zinc-300/0 via-zinc-300/50 to-zinc-300/0 w-screen h-px animate-fade-right animate-glow" /> */}
                <BlurIn delay={1.2}>
                  <p
                    className={cn(
                      "md:self-start md:mt-4 font-medium text-md text-slate-500 dark:text-zinc-400",
                      "cursor-default sm:text-xl md:text-xl whitespace-nowrap bg-clip-text "
                    )}
                  >
                    Designer &amp; Web Developer
                  </p>
                </BlurIn>
              </div>
              <div className="mt-8 flex flex-col gap-3 w-fit">
                <Link href="#projects" className="flex-1">
                  <BoxReveal delay={2} width="100%">
                    <Button className="flex items-center gap-2 w-full">
                      <ArrowDownRight size={22} />
                      <p>Explore my work</p>
                    </Button>
                  </BoxReveal>
                </Link>
                <div className="md:self-start flex gap-3">
                  <Link href="/resume"><Button variant="outline" className="h-10">Résumé</Button></Link>
                  <div className="flex items-center h-full gap-2">
                    <Link href={config.social.github} target="_blank" rel="noreferrer" className="cursor-can-hover">
                      <Button variant="outline" aria-label="GitHub" title="GitHub"><SiGithub size={20} /></Button>
                    </Link>
                    <Link href={config.social.linkedin} target="_blank" rel="noreferrer" className="cursor-can-hover">
                      <Button variant="outline" aria-label="LinkedIn" title="LinkedIn"><SiLinkedin size={20} /></Button>
                    </Link>
                    <Link href="https://wa.me/2348138836551" target="_blank" rel="noreferrer" className="cursor-can-hover">
                      <Button variant="outline" aria-label="WhatsApp" title="WhatsApp"><SiWhatsapp size={20} /></Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="grid col-span-1"></div>
      </div>
      <div className="absolute bottom-10 left-[50%] translate-x-[-50%]">
        <ScrollDownIcon />
      </div>
    </SectionWrapper>
  );
};

export default HeroSection;
