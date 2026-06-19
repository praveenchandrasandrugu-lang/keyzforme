import { cn } from "@/lib/utils";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

export default function Container({ children, className }: ContainerProps) {
  return (
    <div className={cn("mx-auto max-w-[1140px] px-7", className)}>
      {children}
    </div>
  );
}
