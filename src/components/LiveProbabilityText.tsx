import React, { useEffect, useRef, useState } from "react";

interface LiveProbabilityTextProps {
  value: number;
  label: string;
  className?: string;
}

export function LiveProbabilityText({ value, label, className = "" }: LiveProbabilityTextProps) {
  const prevValueRef = useRef<number>(value);
  const [pulseColor, setPulseColor] = useState<"green" | "red" | null>(null);

  useEffect(() => {
    const prev = prevValueRef.current;
    if (prev !== value) {
      if (value > prev) {
        setPulseColor("green");
      } else if (value < prev) {
        setPulseColor("red");
      }
      prevValueRef.current = value;

      const timer = setTimeout(() => {
        setPulseColor(null);
      }, 1500); // Pulse stays active for 1.5s
      return () => clearTimeout(timer);
    }
  }, [value]);

  const animationClass = pulseColor === "green" 
    ? "text-emerald-400 bg-emerald-500/10 font-bold border border-emerald-500/20 px-1.5 py-0.5 rounded animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.15)] transition-all duration-300"
    : pulseColor === "red"
    ? "text-rose-400 bg-rose-500/10 font-bold border border-rose-500/20 px-1.5 py-0.5 rounded animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.15)] transition-all duration-300"
    : "text-neutral-400 px-1.5 py-0.5";

  return (
    <span className={`inline-flex items-center transition-colors duration-500 ${animationClass} ${className}`}>
      {label} ({value}%)
    </span>
  );
}
