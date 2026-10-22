import { motion } from "motion/react";
import Link from "next/link";
import styles from "./style.module.scss";
import { blur, translate } from "../../anim";
import { Link as LinkType } from "@/types";
import { cn } from "@/lib/utils";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface SelectedLink {
  isActive: boolean;
  index: number;
}

interface BodyProps {
  links: LinkType[];
  selectedLink: SelectedLink;
  setSelectedLink: (selectedLink: SelectedLink) => void;
  setIsActive: (isActive: boolean) => void;
}

export default function Body({
  links,
  selectedLink,
  setSelectedLink,
  setIsActive,
}: BodyProps) {
  const params = useParams();
  const [currentHref, setCurrentHref] = useState("/");
  useEffect(() => {
    if (typeof window === "undefined") return;
    const { pathname, hash } = window.location;
    setCurrentHref(pathname + hash);
  }, [params]);

  const getChars = (word: string) => {
    let chars: React.JSX.Element[] = [];
    word.split("").forEach((char, i) => {
      chars.push(
        <motion.span
          className="pointer-events-none"
          custom={[i * 0.02, (word.length - i) * 0.01]}
          variants={translate}
          initial="initial"
          animate="enter"
          exit="exit"
          key={char + i}
        >
          {char}
        </motion.span>
      );
    });
    return chars;
  };

  return (
    <div className={cn(styles.body, "flex flex-col items-end md:flex-row")}>
      {links.map((link, index) => {
        const { title, href, target, disabled, badge } = link;

        // Unavailable destinations are plain text: no link, no tab stop, no
        // click/hover behaviour, and they never drive the preview image.
        if (disabled) {
          return (
            <div
              key={`l_${index}`}
              aria-disabled="true"
              className="forest-nav-soon cursor-default select-none rounded-lg"
            >
              <p className="font-display rounded-lg text-muted-foreground/40">
                {getChars(title)}
                <span className="forest-nav-soon-badge" aria-label="coming soon">
                  {badge ?? "SOON"}
                </span>
              </p>
            </div>
          );
        }

        return (
          <Link
            key={`l_${index}`}
            href={href}
            target={target}
            className="cursor-can-hover rounded-lg"
          >
            <motion.p
              className={cn(
                "font-display rounded-lg",
                currentHref !== href ? "text-muted-foreground" : "underline"
              )}
              onClick={() => {
                if (title === "Web Projects") window.dispatchEvent(new CustomEvent("portfolio:show-web"));
                setIsActive(false);
              }}
              onMouseOver={() => setSelectedLink({ isActive: true, index })}
              onMouseLeave={() => setSelectedLink({ isActive: false, index })}
              variants={blur}
              animate={
                selectedLink.isActive && selectedLink.index !== index
                  ? "open"
                  : "closed"
              }
            >
              {getChars(title)}
            </motion.p>
          </Link>
        );
      })}
    </div>
  );
}
