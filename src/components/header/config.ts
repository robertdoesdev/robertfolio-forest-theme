import { Link } from "@/types";

const links: Link[] = [
  {
    title: 'Home',
    href: '/',
    thumbnail: '/assets/projects-screenshots/portfolio/forest-preview.svg'
  },
  {
    title: 'Experience',
    href: '/#experience',
    thumbnail: '/assets/projects-screenshots/stash/placeholder.svg'
  },
  {
    title: 'Skills & Stack',
    href: '/#skills',
    thumbnail: '/assets/projects-screenshots/portfolio/forest-preview.svg'
  },
  {
    title: 'Design Studio',
    href: '/#projects',
    thumbnail: '/assets/projects-screenshots/portfolio/forest-preview.svg',
    disabled: true,
    badge: 'SOON'
  },
  {
    title: 'Web Projects',
    href: '/#projects',
    thumbnail: '/assets/projects-screenshots/sidequest/landing.svg'
  },
  // {
  //   title: 'Skills',
  //   href: '/skills',
  //   thumbnail: '/assets/projects-screenshots/portfolio/forest-preview.svg'
  // },
  // {
  //   title: 'Testimonials',
  //   href: '/testimonials',
  //   thumbnail: '/assets/nav-link-previews/testimonials.png'
  // },
  {
    title: 'Contact',
    href: '/#contact',
    thumbnail: '/assets/projects-screenshots/ontrack/landing.svg'
  }
];

export { links };
