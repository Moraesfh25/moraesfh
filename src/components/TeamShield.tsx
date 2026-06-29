import React from "react";

interface TeamShieldProps {
  teamName: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function TeamShield({ teamName, size = "md", className = "" }: TeamShieldProps) {
  if (!teamName) return null;

  const t = teamName.toLowerCase().trim();

  // Helper to generate consistent colors based on team name string hashing
  const getFallbackColors = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue1 = Math.abs(hash % 360);
    const hue2 = (hue1 + 140) % 360;
    return {
      primary: `hsl(${hue1}, 75%, 45%)`,
      secondary: `hsl(${hue2}, 75%, 35%)`,
      border: `hsl(${hue1}, 80%, 65%)`
    };
  };

  const fallback = getFallbackColors(teamName);

  // Default design options
  let primaryColor = fallback.primary;
  let secondaryColor = fallback.secondary;
  let borderColor = fallback.border;
  let styleType: "stripes" | "diagonal" | "halves" | "checkered" | "solid" | "star" | "cross" = "diagonal";
  let initials = teamName.substring(0, 2).toUpperCase();

  // Explicit mappings for major teams
  if (t.includes("arsenal")) {
    primaryColor = "#ef4444"; // Red
    secondaryColor = "#ffffff"; // White
    borderColor = "#fbbf24"; // Gold
    styleType = "halves";
    initials = "ARS";
  } else if (t.includes("liverpool")) {
    primaryColor = "#dc2626"; // Deep Red
    secondaryColor = "#991b1b";
    borderColor = "#0d9488"; // Teal/Gold
    styleType = "solid";
    initials = "LIV";
  } else if (t.includes("flamengo")) {
    primaryColor = "#ef4444"; // Red
    secondaryColor = "#000000"; // Black
    borderColor = "#facc15"; // Gold
    styleType = "stripes";
    initials = "FLA";
  } else if (t.includes("river plate")) {
    primaryColor = "#ffffff"; // White
    secondaryColor = "#dc2626"; // Red
    borderColor = "#111827"; // Dark Charcoal
    styleType = "diagonal";
    initials = "CARP";
  } else if (t.includes("real madrid")) {
    primaryColor = "#ffffff"; // White
    secondaryColor = "#1e3a8a"; // Blue
    borderColor = "#eab308"; // Gold
    styleType = "diagonal";
    initials = "RMA";
  } else if (t.includes("barcelona")) {
    primaryColor = "#1e40af"; // Deep Blue
    secondaryColor = "#991b1b"; // Deep Red
    borderColor = "#eab308"; // Gold
    styleType = "stripes";
    initials = "FCB";
  } else if (t.includes("manchester city")) {
    primaryColor = "#38bdf8"; // Sky Blue
    secondaryColor = "#ffffff";
    borderColor = "#fbbf24"; // Gold
    styleType = "halves";
    initials = "MCI";
  } else if (t.includes("chelsea")) {
    primaryColor = "#1d4ed8"; // Blue
    secondaryColor = "#1e40af";
    borderColor = "#ffffff";
    styleType = "star";
    initials = "CHE";
  } else if (t.includes("bayern")) {
    primaryColor = "#dc2626"; // Red
    secondaryColor = "#1d4ed8"; // Blue
    borderColor = "#ffffff";
    styleType = "checkered";
    initials = "FCB";
  } else if (t.includes("dortmund")) {
    primaryColor = "#eab308"; // Yellow
    secondaryColor = "#000000"; // Black
    borderColor = "#000000";
    styleType = "halves";
    initials = "BVB";
  } else if (t.includes("palmeiras")) {
    primaryColor = "#15803d"; // Green
    secondaryColor = "#ffffff";
    borderColor = "#ffffff";
    styleType = "star";
    initials = "PAL";
  } else if (t.includes("são paulo") || t.includes("sao paulo")) {
    primaryColor = "#ffffff";
    secondaryColor = "#dc2626";
    borderColor = "#000000";
    styleType = "cross";
    initials = "SPFC";
  } else if (t.includes("internazionale") || t.includes("inter milan")) {
    primaryColor = "#000000";
    secondaryColor = "#1d4ed8";
    borderColor = "#fbbf24";
    styleType = "stripes";
    initials = "INT";
  } else if (t.includes("juventus")) {
    primaryColor = "#ffffff";
    secondaryColor = "#000000";
    borderColor = "#fbbf24";
    styleType = "stripes";
    initials = "JUVE";
  } else if (t.includes("sport recife")) {
    primaryColor = "#ef4444";
    secondaryColor = "#000000";
    borderColor = "#eab308";
    styleType = "stripes";
    initials = "SCR";
  } else if (t.includes("santos")) {
    primaryColor = "#ffffff";
    secondaryColor = "#000000";
    borderColor = "#f3f4f6";
    styleType = "solid";
    initials = "SAN";
  } else if (t.includes("saint-germain") || t.includes("psg")) {
    primaryColor = "#1e3a8a";
    secondaryColor = "#dc2626";
    borderColor = "#ffffff";
    styleType = "halves";
    initials = "PSG";
  } else if (t.includes("miami")) {
    primaryColor = "#f472b6"; // Pink
    secondaryColor = "#000000";
    borderColor = "#ffffff";
    styleType = "diagonal";
    initials = "IMCF";
  } else if (t.includes("boca juniors")) {
    primaryColor = "#1e3a8a"; // Blue
    secondaryColor = "#fbbf24"; // Yellow
    borderColor = "#fbbf24";
    styleType = "diagonal";
    initials = "CABJ";
  } else if (t.includes("ajax")) {
    primaryColor = "#ffffff";
    secondaryColor = "#dc2626";
    borderColor = "#dc2626";
    styleType = "cross";
    initials = "AJAX";
  }

  // Define sizing classes
  const sizeClasses = {
    sm: "w-8 h-8 text-[9px]",
    md: "w-12 h-12 text-xs",
    lg: "w-16 h-16 text-sm"
  };

  const selectedSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div className={`relative flex flex-col items-center justify-center shrink-0 ${className}`}>
      {/* SVG Shield shape */}
      <svg
        className={`${selectedSize} transition-transform hover:scale-110 filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.4)]`}
        viewBox="0 0 100 115"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <clipPath id={`shield-clip-${teamName.replace(/\s+/g, "-")}`}>
            <path d="M 50,5 C 80,5 95,15 95,45 C 95,85 50,113 50,113 C 50,113 5,85 5,45 C 5,15 20,5 50,5 Z" />
          </clipPath>
          <linearGradient id={`bg-grad-${teamName.replace(/\s+/g, "-")}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={primaryColor} />
            <stop offset="100%" stopColor={secondaryColor} />
          </linearGradient>
        </defs>

        {/* Shield Border shadow/glow */}
        <path
          d="M 50,5 C 80,5 95,15 95,45 C 95,85 50,113 50,113 C 50,113 5,85 5,45 C 5,15 20,5 50,5 Z"
          fill="rgba(0, 0, 0, 0.4)"
          transform="translate(0, 2)"
        />

        {/* Main Shield Background */}
        <path
          d="M 50,5 C 80,5 95,15 95,45 C 95,85 50,113 50,113 C 50,113 5,85 5,45 C 5,15 20,5 50,5 Z"
          fill={`url(#bg-grad-${teamName.replace(/\s+/g, "-")})`}
        />

        {/* Interior styled patterns inside clipPath */}
        <g clipPath={`url(#shield-clip-${teamName.replace(/\s+/g, "-")})`}>
          {styleType === "stripes" && (
            <g opacity="0.35">
              <rect x="15" y="0" width="12" height="120" fill={secondaryColor} />
              <rect x="44" y="0" width="12" height="120" fill={secondaryColor} />
              <rect x="73" y="0" width="12" height="120" fill={secondaryColor} />
            </g>
          )}

          {styleType === "diagonal" && (
            <path
              d="M -10,20 L 110,95 L 110,120 L -10,45 Z"
              fill={secondaryColor}
              opacity="0.5"
            />
          )}

          {styleType === "halves" && (
            <path
              d="M 50,0 L 100,0 L 100,120 L 50,120 Z"
              fill={secondaryColor}
              opacity="0.3"
            />
          )}

          {styleType === "checkered" && (
            <g opacity="0.25">
              <rect x="50" y="5" width="45" height="40" fill={secondaryColor} />
              <rect x="5" y="45" width="45" height="40" fill={secondaryColor} />
            </g>
          )}

          {styleType === "star" && (
            <polygon
              points="50,18 58,40 82,40 62,54 70,78 50,62 30,78 38,54 18,40 42,40"
              fill={secondaryColor}
              opacity="0.25"
            />
          )}

          {styleType === "cross" && (
            <g opacity="0.3">
              <rect x="44" y="5" width="12" height="110" fill={secondaryColor} />
              <rect x="5" y="44" width="90" height="12" fill={secondaryColor} />
            </g>
          )}
        </g>

        {/* Shield Outline border */}
        <path
          d="M 50,5 C 80,5 95,15 95,45 C 95,85 50,113 50,113 C 50,113 5,85 5,45 C 5,15 20,5 50,5 Z"
          fill="none"
          stroke={borderColor}
          strokeWidth="4"
        />

        {/* Inner Gold accent outline for Elite appearance */}
        <path
          d="M 50,10 C 76,10 90,19 90,45 C 90,81 50,106 50,106 C 50,106 10,81 10,45 C 10,19 24,10 50,10 Z"
          fill="none"
          stroke={styleType === "diagonal" ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.25)"}
          strokeWidth="1.5"
        />

        {/* Centered stylized football or star icon background */}
        <circle cx="50" cy="55" r="22" fill="rgba(0,0,0,0.45)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

        {/* Monogram initials text inside shield */}
        <text
          x="50"
          y="60"
          fill="#ffffff"
          fontSize="13"
          fontWeight="bold"
          fontFamily="sans-serif"
          textAnchor="middle"
          letterSpacing="0.5"
          className="select-none pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
        >
          {initials}
        </text>
      </svg>
    </div>
  );
}
