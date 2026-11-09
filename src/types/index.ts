export interface Link {
  title: string;
  href: string;
  thumbnail: string;
  target?: string;
  /** Not available yet: rendered as plain, non-interactive text with a badge. */
  disabled?: boolean;
  badge?: string;
}
