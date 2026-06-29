import React, { useState, useRef, useEffect } from "react";
import { Sun, Moon, Monitor, Check } from "lucide-react";
import { useTheme } from "../hooks/useTheme";

interface ThemeToggleProps {
  align?: "left" | "right" | "center";
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ align = "right" }) => {
  const { preferences, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const themeOptions = [
    { value: "light" as const, label: "Claro", icon: Sun, desc: "Aparência clara e limpa" },
    { value: "dark" as const, label: "Escuro", icon: Moon, desc: "Foco e conforto visual" },
    { value: "system" as const, label: "Automático", icon: Monitor, desc: "Segue o sistema operacional" },
  ];

  const getActiveIcon = () => {
    switch (preferences.theme) {
      case "light":
        return <Sun className="w-4 h-4 text-amber-500" />;
      case "dark":
        return <Moon className="w-4 h-4 text-sky-400" />;
      default:
        return <Monitor className="w-4 h-4 text-neutral-400" />;
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* TRIGGER BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-9 h-9 rounded-lg bg-neutral-900 border border-neutral-850 hover:bg-neutral-800 hover:border-neutral-700 hover:scale-105 active:scale-95 text-neutral-400 hover:text-white transition-all cursor-pointer shadow-sm relative group"
        title="Mudar aparência"
        aria-label="Selecionar tema visual"
      >
        <span className="sr-only">Mudar aparência</span>
        {getActiveIcon()}

        {/* TOOLTIP ON HOVER */}
        <span className="pointer-events-none absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-neutral-950 text-neutral-100 text-[10px] py-1 px-2.5 rounded shadow-lg border border-neutral-800 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
          Mudar aparência
        </span>
      </button>

      {/* DROPDOWN MENU */}
      {isOpen && (
        <div
          className={`absolute ${
            align === "right" ? "right-0" : align === "left" ? "left-0" : "left-1/2 -translate-x-1/2"
          } mt-2 w-56 rounded-xl bg-neutral-900 border border-neutral-800 shadow-2xl z-50 p-1.5 animate-fade-in backdrop-blur-md`}
        >
          <div className="px-2.5 py-1.5 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
            Aparência
          </div>
          
          <div className="space-y-0.5">
            {themeOptions.map((opt) => {
              const Icon = opt.icon;
              const isActive = preferences.theme === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => {
                    setTheme(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left flex items-center justify-between px-2.5 py-2 rounded-lg transition-colors cursor-pointer group bg-transparent border-none ${
                    isActive
                      ? "bg-green-500/10 text-green-400 font-medium"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-800/60"
                  }`}
                  style={
                    isActive
                      ? {
                          color: "var(--accent-primary)",
                          backgroundColor: "var(--accent-bg)",
                        }
                      : {}
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive ? "text-[var(--accent-primary)]" : "text-neutral-500 group-hover:text-neutral-300"
                    }`} />
                    <div className="flex flex-col">
                      <span className="text-xs leading-none">{opt.label}</span>
                      <span className="text-[9px] text-neutral-500 group-hover:text-neutral-400 mt-0.5">
                        {opt.desc}
                      </span>
                    </div>
                  </div>
                  {isActive && (
                    <Check
                      className="w-3.5 h-3.5"
                      style={{ color: "var(--accent-primary)" }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
