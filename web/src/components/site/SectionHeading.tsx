import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow: string;
  eyebrowClassName?: string;
  heading: React.ReactNode;
  h2ClassName?: string;
  sub?: React.ReactNode;
  className?: string;
}

export default function SectionHeading({
  eyebrow,
  eyebrowClassName,
  heading,
  h2ClassName,
  sub,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "mx-auto max-w-[680px] text-center mb-[52px]",
        className,
      )}
    >
      <span
        className={cn(
          "text-green uppercase tracking-[0.08em] text-[13px] font-bold",
          eyebrowClassName,
        )}
      >
        {eyebrow}
      </span>
      <h2
        className={cn(
          "text-3xl md:text-[42px] font-semibold mt-[14px]",
          h2ClassName,
        )}
      >
        {heading}
      </h2>
      {sub && (
        <p className="text-[17px] text-brandmuted mt-4">{sub}</p>
      )}
    </div>
  );
}
