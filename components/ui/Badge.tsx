import { HTMLAttributes } from "react";

type Tone = "neutral" | "active" | "warning" | "complete";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-slate/10 text-slate",
  active: "bg-teal-light text-teal-dark",
  warning: "bg-amber/10 text-amber",
  complete: "bg-teal text-white",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function Badge({ tone = "neutral", className = "", ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${toneClasses[tone]} ${className}`}
      {...props}
    />
  );
}
