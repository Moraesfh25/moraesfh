import React from "react";
import { useTheme } from "../hooks/useTheme";
import { Trophy, Flame, Globe, Zap, Star } from "lucide-react";

interface LeagueBadgeProps {
  league: string;
  isLive?: boolean;
}

export function LeagueBadge({ league, isLive }: LeagueBadgeProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Normalize name for easy matching
  const l = league.toLowerCase();

  // Determine design configurations based on league category
  let badgeStyles = {
    bg: isDark ? "bg-neutral-800/40" : "bg-neutral-100/80",
    border: isDark ? "border-neutral-700/50" : "border-neutral-200/60",
    text: isDark ? "text-neutral-300" : "text-neutral-700",
    glow: "",
    icon: <Globe className="w-3 h-3 text-neutral-400" />,
    popularity: "standard"
  };

  if (l.includes("premier league")) {
    badgeStyles = {
      bg: isDark ? "bg-purple-950/20" : "bg-purple-50",
      border: isDark ? "border-purple-500/30" : "border-purple-200",
      text: isDark ? "text-purple-400" : "text-purple-700",
      glow: isDark ? "shadow-[0_0_10px_rgba(168,85,247,0.15)]" : "shadow-[0_0_8px_rgba(168,85,247,0.08)]",
      icon: <Trophy className={`w-3 h-3 ${isDark ? "text-purple-400" : "text-purple-600"}`} />,
      popularity: "elite"
    };
  } else if (l.includes("champions league")) {
    badgeStyles = {
      bg: isDark ? "bg-amber-950/20" : "bg-amber-50",
      border: isDark ? "border-amber-500/30" : "border-amber-200",
      text: isDark ? "text-amber-400" : "text-amber-700",
      glow: isDark ? "shadow-[0_0_12px_rgba(245,158,11,0.2)]" : "shadow-[0_0_8px_rgba(245,158,11,0.1)]",
      icon: <Star className={`w-3 h-3 ${isDark ? "text-amber-400" : "text-amber-600"} animate-pulse`} />,
      popularity: "elite"
    };
  } else if (l.includes("brasileirão") || l.includes("brasileirao")) {
    badgeStyles = {
      bg: isDark ? "bg-emerald-950/20" : "bg-emerald-50",
      border: isDark ? "border-emerald-500/30" : "border-emerald-200",
      text: isDark ? "text-emerald-400" : "text-emerald-700",
      glow: isDark ? "shadow-[0_0_10px_rgba(16,185,129,0.15)]" : "shadow-[0_0_8px_rgba(16,185,129,0.08)]",
      icon: <Flame className={`w-3 h-3 ${isDark ? "text-emerald-400" : "text-emerald-600"}`} />,
      popularity: "high"
    };
  } else if (l.includes("la liga") || l.includes("laliga")) {
    badgeStyles = {
      bg: isDark ? "bg-rose-950/20" : "bg-rose-50",
      border: isDark ? "border-rose-500/30" : "border-rose-200",
      text: isDark ? "text-rose-400" : "text-rose-700",
      glow: isDark ? "shadow-[0_0_10px_rgba(244,63,94,0.15)]" : "shadow-[0_0_8px_rgba(244,63,94,0.08)]",
      icon: <Trophy className={`w-3 h-3 ${isDark ? "text-rose-400" : "text-rose-600"}`} />,
      popularity: "high"
    };
  } else if (l.includes("libertadores")) {
    badgeStyles = {
      bg: isDark ? "bg-yellow-950/20" : "bg-yellow-50",
      border: isDark ? "border-yellow-500/30" : "border-yellow-200",
      text: isDark ? "text-yellow-400" : "text-yellow-700",
      glow: isDark ? "shadow-[0_0_12px_rgba(234,179,8,0.18)]" : "shadow-[0_0_8px_rgba(234,179,8,0.1)]",
      icon: <Zap className={`w-3 h-3 ${isDark ? "text-yellow-400" : "text-yellow-600"}`} />,
      popularity: "elite"
    };
  } else if (l.includes("bundesliga")) {
    badgeStyles = {
      bg: isDark ? "bg-red-950/20" : "bg-red-50",
      border: isDark ? "border-red-500/30" : "border-red-200",
      text: isDark ? "text-red-400" : "text-red-700",
      glow: isDark ? "shadow-[0_0_10px_rgba(239,68,68,0.15)]" : "shadow-[0_0_8px_rgba(239,68,68,0.08)]",
      icon: <Trophy className={`w-3 h-3 ${isDark ? "text-red-400" : "text-red-600"}`} />,
      popularity: "high"
    };
  } else if (l.includes("serie a") || l.includes("serie_a")) {
    badgeStyles = {
      bg: isDark ? "bg-blue-950/20" : "bg-blue-50",
      border: isDark ? "border-blue-500/30" : "border-blue-200",
      text: isDark ? "text-blue-400" : "text-blue-700",
      glow: isDark ? "shadow-[0_0_10px_rgba(59,130,246,0.15)]" : "shadow-[0_0_8px_rgba(59,130,246,0.08)]",
      icon: <Globe className={`w-3 h-3 ${isDark ? "text-blue-400" : "text-blue-600"}`} />,
      popularity: "high"
    };
  } else if (l.includes("ligue 1") || l.includes("mls") || l.includes("eredivisie") || l.includes("primeira liga")) {
    badgeStyles = {
      bg: isDark ? "bg-cyan-950/20" : "bg-cyan-50",
      border: isDark ? "border-cyan-500/20" : "border-cyan-200",
      text: isDark ? "text-cyan-400" : "text-cyan-700",
      glow: "",
      icon: <Globe className={`w-3 h-3 ${isDark ? "text-cyan-400" : "text-cyan-600"}`} />,
      popularity: "medium"
    };
  }

  // Live overlays override borders and glow animations
  const livePulseClass = isLive 
    ? "animate-pulse border-red-500/50 shadow-[0_0_12px_rgba(239,68,68,0.3)] bg-red-500/10 text-red-500 font-bold" 
    : "";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-tight border transition-all ${
        isLive 
          ? livePulseClass 
          : `${badgeStyles.bg} ${badgeStyles.border} ${badgeStyles.text} ${badgeStyles.glow}`
      }`}
    >
      {isLive ? (
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
        </span>
      ) : (
        badgeStyles.icon
      )}
      <span>{league}</span>
    </span>
  );
}
