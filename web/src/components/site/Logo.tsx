import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  /** When provided, wraps the logo in a Next.js Link */
  href?: string;
  className?: string;
  "aria-label"?: string;
}

export default function Logo({ href, className, "aria-label": ariaLabel }: LogoProps) {
  const inner = (
    <span className={cn("font-serif font-bold text-[25px] text-navy tracking-[-0.5px]", className)}>
      Key<span className="text-sage">z</span>
    </span>
  );

  if (href) {
    return (
      <Link href={href} aria-label={ariaLabel}>
        {inner}
      </Link>
    );
  }

  return inner;
}
