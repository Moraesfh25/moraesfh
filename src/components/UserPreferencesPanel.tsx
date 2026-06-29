import React from "react";
import {
  Palette,
  Sliders,
  Globe,
  DollarSign,
  Calendar,
  Bell,
  Sparkles,
  RefreshCw,
  Layout,
  Sun,
  Moon,
  Monitor,
  Check,
  Eye,
  SlidersHorizontal,
  FileText
} from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import { themeTokens } from "../styles/themes";

export const UserPreferencesPanel: React.FC = () => {
  const {
    preferences,
    resolvedTheme,
    setTheme,
    setAccentColor,
    setGlassIntensity,
    setInterfaceScale,
    setInterfaceDensity,
    setAnimationsEnabled,
    setLanguage,
    setCurrency,
    setDateFormat,
    setNotificationsEnabled,
    resetToDefaults,
  } = useTheme();

  // Helper translations for preview
  const translations = {
    pt: {
      title: "Preferências do Sistema",
      subtitle: "Personalize sua experiência no BetVision Pro",
      theme: "Tema de Cores",
      accent: "Cor de Destaque (Accent Color)",
      glass: "Transparência & Efeito Glass",
      scale: "Escala da Interface",
      density: "Densidade de Espaçamento",
      animations: "Animações do Sistema",
      locale: "Idioma & Regional",
      currency: "Moeda Base",
      dateFormat: "Formato de Data",
      notifications: "Notificações em Tempo Real",
      preview: "Visualização em Tempo Real",
      reset: "Restaurar Padrões",
      saveMsg: "Todas as alterações são salvas automaticamente no seu perfil.",
      sampleCard: "Card de Exemplo Premium",
      sampleDesc: "Veja como os elementos mudam dinamicamente conforme suas preferências.",
      compact: "Compacto",
      standard: "Padrão",
      active: "Ativado",
      disabled: "Desativado"
    },
    en: {
      title: "System Preferences",
      subtitle: "Customize your BetVision Pro experience",
      theme: "Color Theme",
      accent: "Accent Color",
      glass: "Transparency & Glass Effect",
      scale: "Interface Scale",
      density: "Interface Density",
      animations: "System Animations",
      locale: "Language & Regional",
      currency: "Base Currency",
      dateFormat: "Date Format",
      notifications: "Real-time Notifications",
      preview: "Real-time Preview",
      reset: "Restore Defaults",
      saveMsg: "All changes are automatically saved to your profile.",
      sampleCard: "Premium Sample Card",
      sampleDesc: "See how elements change dynamically based on your settings.",
      compact: "Compact",
      standard: "Standard",
      active: "Enabled",
      disabled: "Disabled"
    },
    es: {
      title: "Preferencias del Sistema",
      subtitle: "Personalice su experiencia en BetVision Pro",
      theme: "Tema de Colores",
      accent: "Color de Acento",
      glass: "Transparencia y Efecto Glass",
      scale: "Escala de la Interfaz",
      density: "Densidad de la Interfaz",
      animations: "Animaciones del Sistema",
      locale: "Idioma y Regional",
      currency: "Moneda Base",
      dateFormat: "Formato de Fecha",
      notifications: "Notificaciones en Tiempo Real",
      preview: "Vista Previa en Tiempo Real",
      reset: "Restaurar Valores por Defecto",
      saveMsg: "Todos los cambios se guardan automáticamente en su perfil.",
      sampleCard: "Tarjeta de Muestra Premium",
      sampleDesc: "Vea cómo cambian los elementos dinámicamente según sus preferencias.",
      compact: "Compacto",
      standard: "Estándar",
      active: "Activado",
      disabled: "Desactivado"
    }
  };

  const t = translations[preferences.language] || translations.pt;

  const accentOptions = [
    { value: "green" as const, name: "Verde", hex: "#16A34A", hover: "#22C55E" },
    { value: "blue" as const, name: "Azul", hex: "#2563EB", hover: "#3B82F6" },
    { value: "purple" as const, name: "Roxo", hex: "#7C3AED", hover: "#8B5CF6" },
    { value: "red" as const, name: "Vermelho", hex: "#DC2626", hover: "#EF4444" },
    { value: "gold" as const, name: "Dourado", hex: "#D97706", hover: "#F59E0B" },
  ];

  const handleReset = () => {
    if (confirm("Deseja realmente restaurar todas as configurações para os padrões de fábrica?")) {
      resetToDefaults();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-1 sm:p-4 text-left">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-neutral-850">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-white tracking-tight flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-[var(--accent-primary)]" />
            {t.title}
          </h1>
          <p className="text-xs text-neutral-400 mt-1">{t.subtitle}</p>
        </div>
        
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 hover:border-neutral-700 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          {t.reset}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: VISUAL SETUP */}
        <div className="md:col-span-2 space-y-6">
          
          {/* SECTION 1: VISUAL THEME */}
          <div className="bg-neutral-900 border border-neutral-850 rounded-xl p-4 sm:p-5 space-y-4 shadow-sm">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sun className="w-4 h-4 text-[var(--accent-primary)]" />
              {t.theme}
            </h3>
            
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "light" as const, label: "Claro", icon: Sun, desc: "Light Mode", bg: "bg-white text-neutral-950 border-neutral-300" },
                { value: "dark" as const, label: "Escuro", icon: Moon, desc: "Dark Mode", bg: "bg-neutral-950 text-white border-neutral-800" },
                { value: "system" as const, label: "Automático", icon: Monitor, desc: "Auto System", bg: "bg-neutral-900 text-neutral-300 border-neutral-800" },
              ].map((opt) => {
                const Icon = opt.icon;
                const isActive = preferences.theme === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setTheme(opt.value)}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-xl border-2 transition-all cursor-pointer relative ${
                      isActive 
                        ? "border-[var(--accent-primary)] bg-[var(--accent-bg)] shadow-md" 
                        : "border-neutral-850 bg-neutral-950 hover:border-neutral-700"
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-1.5 ${isActive ? "text-[var(--accent-primary)]" : "text-neutral-400"}`} />
                    <span className="text-xs font-bold text-white">{opt.label}</span>
                    <span className="text-[9px] text-neutral-500 mt-0.5">{opt.desc}</span>
                    
                    {isActive && (
                      <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: "var(--accent-primary)" }}>
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: ACCENT COLOR */}
          <div className="bg-neutral-900 border border-neutral-850 rounded-xl p-4 sm:p-5 space-y-4 shadow-sm">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Palette className="w-4 h-4 text-[var(--accent-primary)]" />
              {t.accent}
            </h3>
            
            <div className="grid grid-cols-5 gap-2.5">
              {accentOptions.map((opt) => {
                const isActive = preferences.accentColor === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setAccentColor(opt.value)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all cursor-pointer relative ${
                      isActive 
                        ? "border-[var(--accent-primary)] bg-neutral-950 shadow-sm" 
                        : "border-neutral-850 bg-neutral-950 hover:border-neutral-700"
                    }`}
                  >
                    {/* Circle Color Preview */}
                    <span 
                      className="w-7 h-7 rounded-full flex items-center justify-center shadow-inner relative"
                      style={{ backgroundColor: opt.hex }}
                    >
                      {isActive && <Check className="w-4 h-4 text-white drop-shadow-md" />}
                    </span>
                    <span className="text-[10px] text-neutral-300 font-semibold mt-1.5">{opt.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 3: TRANSPARENCY & GLASS INTENSITY */}
          <div className="bg-neutral-900 border border-neutral-850 rounded-xl p-4 sm:p-5 space-y-4 shadow-sm">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[var(--accent-primary)]" />
                {t.glass}
              </h3>
              <span className="text-xs font-mono font-bold text-[var(--accent-primary)] bg-[var(--accent-bg)] px-2 py-0.5 rounded border border-[var(--accent-border)]">
                {preferences.glassIntensity}% Opacity
              </span>
            </div>
            
            <p className="text-[11px] text-neutral-400">
              Ajuste o nível de transparência e desfoque de fundo (Blur/Glassmorphism) aplicados em cabeçalhos, barras laterais e modais.
            </p>

            <div className="flex items-center gap-4 py-2">
              <span className="text-[11px] text-neutral-500 font-mono">0%</span>
              <input
                type="range"
                min="0"
                max="100"
                value={preferences.glassIntensity}
                onChange={(e) => setGlassIntensity(parseInt(e.target.value, 10))}
                className="flex-1 accent-[var(--accent-primary)] h-1.5 bg-neutral-950 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-[11px] text-neutral-500 font-mono">100%</span>
            </div>

            {/* Live Blurred Preview Card */}
            <div className="relative rounded-xl overflow-hidden p-6 border border-neutral-850 h-28 flex items-center justify-center bg-gradient-to-r from-neutral-950 to-neutral-900">
              {/* Dynamic abstract decorative elements inside background */}
              <div className="absolute top-1/4 left-1/4 w-12 h-12 rounded-full bg-[var(--accent-primary)] blur-md opacity-40"></div>
              <div className="absolute bottom-1/4 right-1/4 w-16 h-16 rounded-full bg-amber-500 blur-lg opacity-30"></div>
              
              {/* Overlay Glass Card reflecting state */}
              <div 
                className="absolute inset-x-6 inset-y-4 border rounded-xl flex flex-col justify-center items-center p-3 text-center transition-all z-10"
                style={{
                  backgroundColor: `rgba(${resolvedTheme === "dark" ? "21, 26, 33" : "255, 255, 255"}, var(--glass-bg-opacity))`,
                  backdropFilter: `blur(var(--glass-blur-radius))`,
                  WebkitBackdropFilter: `blur(var(--glass-blur-radius))`,
                  borderColor: resolvedTheme === "dark" ? "rgba(42, 47, 58, 0.4)" : "rgba(203, 213, 225, 0.5)"
                }}
              >
                <span className="text-xs font-bold text-white drop-shadow-sm font-display" style={{ color: resolvedTheme === "dark" ? "#FFFFFF" : "#0F172A" }}>
                  Efeito Glass Real-Time
                </span>
                <span className="text-[10px] text-neutral-400 font-mono mt-0.5" style={{ color: resolvedTheme === "dark" ? "#A1A1AA" : "#475569" }}>
                  Blur: { (preferences.glassIntensity * 0.15).toFixed(1) }px
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 4: SCALE & DENSITY */}
          <div className="bg-neutral-900 border border-neutral-850 rounded-xl p-4 sm:p-5 space-y-4 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Scale Sub-section */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Layout className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                  {t.scale}
                </h4>
                <p className="text-[10px] text-neutral-400">Aumenta ou reduz o tamanho relativo de todos os textos e componentes.</p>
                <div className="flex gap-1.5 bg-neutral-950 p-1 rounded-lg border border-neutral-850">
                  {["90%", "100%", "110%"].map((scale) => (
                    <button
                      key={scale}
                      onClick={() => setInterfaceScale(scale as any)}
                      className={`flex-1 py-1.5 px-2.5 rounded text-xs font-bold transition-all cursor-pointer bg-transparent border-none ${
                        preferences.interfaceScale === scale
                          ? "bg-[var(--accent-primary)] text-white shadow-sm"
                          : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      {scale}
                    </button>
                  ))}
                </div>
              </div>

              {/* Density Sub-section */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Sliders className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                  {t.density}
                </h4>
                <p className="text-[10px] text-neutral-400">Ajusta o espaçamento (padding e gaps) entre elementos da interface.</p>
                <div className="flex gap-1.5 bg-neutral-950 p-1 rounded-lg border border-neutral-850">
                  {[
                    { value: "compact" as const, label: t.compact },
                    { value: "standard" as const, label: t.standard }
                  ].map((density) => (
                    <button
                      key={density.value}
                      onClick={() => setInterfaceDensity(density.value)}
                      className={`flex-1 py-1.5 px-2.5 rounded text-xs font-bold transition-all cursor-pointer bg-transparent border-none ${
                        preferences.interfaceDensity === density.value
                          ? "bg-[var(--accent-primary)] text-white shadow-sm"
                          : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      {density.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: REGIONAL SETTINGS & PREVIEW */}
        <div className="space-y-6">
          
          {/* REGIONAL / LOCALIZATION */}
          <div className="bg-neutral-900 border border-neutral-850 rounded-xl p-4 sm:p-5 space-y-4 shadow-sm">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4 text-[var(--accent-primary)]" />
              {t.locale}
            </h3>

            {/* Language Selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">Idioma do Sistema</label>
              <select
                value={preferences.language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="w-full bg-neutral-950 border border-neutral-850 text-xs py-2 px-2.5 rounded-lg focus:outline-none focus:border-[var(--accent-primary)] text-white font-medium"
              >
                <option value="pt">🇧🇷 Português (Brasil)</option>
                <option value="en">🇺🇸 English (US)</option>
                <option value="es">🇪🇸 Español</option>
              </select>
            </div>

            {/* Base Currency Selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">{t.currency}</label>
              <select
                value={preferences.currency}
                onChange={(e) => setCurrency(e.target.value as any)}
                className="w-full bg-neutral-950 border border-neutral-850 text-xs py-2 px-2.5 rounded-lg focus:outline-none focus:border-[var(--accent-primary)] text-white font-medium"
              >
                <option value="BRL">R$ - Real Brasileiro (BRL)</option>
                <option value="USD">$ - Dólar Americano (USD)</option>
                <option value="EUR">€ - Euro (EUR)</option>
              </select>
            </div>

            {/* Date Format Selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">{t.dateFormat}</label>
              <select
                value={preferences.dateFormat}
                onChange={(e) => setDateFormat(e.target.value as any)}
                className="w-full bg-neutral-950 border border-neutral-850 text-xs py-2 px-2.5 rounded-lg focus:outline-none focus:border-[var(--accent-primary)] text-white font-medium"
              >
                <option value="DD/MM/YYYY">DD/MM/AAAA (ex: 29/06/2026)</option>
                <option value="MM/DD/YYYY">MM/DD/AAAA (ex: 06/29/2026)</option>
              </select>
            </div>
          </div>

          {/* TOGGLE PARAMETERS (ANIMATIONS, NOTIFICATIONS) */}
          <div className="bg-neutral-900 border border-neutral-850 rounded-xl p-4 sm:p-5 space-y-4 shadow-sm">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Bell className="w-4 h-4 text-[var(--accent-primary)]" />
              Notificações & Sistemas
            </h3>

            {/* Animations Toggle */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-850">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-white">{t.animations}</span>
                <p className="text-[10px] text-neutral-500">Transições fluidas de 250ms</p>
              </div>
              <button
                onClick={() => setAnimationsEnabled(!preferences.animationsEnabled)}
                className={`w-11 h-6 rounded-full p-1 transition-colors relative cursor-pointer border-none ${
                  preferences.animationsEnabled ? "bg-[var(--accent-primary)]" : "bg-neutral-950"
                }`}
              >
                <span 
                  className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                    preferences.animationsEnabled ? "translate-x-5" : "translate-x-0"
                  }`} 
                />
              </button>
            </div>

            {/* Push Notifications Toggle */}
            <div className="flex items-center justify-between pt-1">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-white">{t.notifications}</span>
                <p className="text-[10px] text-neutral-500">Alertas de Greens e Gols</p>
              </div>
              <button
                onClick={() => setNotificationsEnabled(!preferences.notificationsEnabled)}
                className={`w-11 h-6 rounded-full p-1 transition-colors relative cursor-pointer border-none ${
                  preferences.notificationsEnabled ? "bg-[var(--accent-primary)]" : "bg-neutral-950"
                }`}
              >
                <span 
                  className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                    preferences.notificationsEnabled ? "translate-x-5" : "translate-x-0"
                  }`} 
                />
              </button>
            </div>
          </div>

          {/* LIVE ACCENT PREVIEW CARD */}
          <div className="bg-neutral-900 border border-neutral-850 rounded-xl p-4 space-y-3.5 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-[var(--accent-primary)] to-transparent opacity-10 rounded-bl-full"></div>
            
            <h4 className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
              {t.preview}
            </h4>

            <div className="bg-neutral-950 rounded-lg p-3 border border-neutral-850 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-white">{t.sampleCard}</span>
                <span className="text-[9px] font-mono font-bold text-[var(--accent-primary)] bg-[var(--accent-bg)] px-1.5 py-0.5 rounded border border-[var(--accent-border)]">
                  Active Badge
                </span>
              </div>
              <p className="text-[10px] text-neutral-400">{t.sampleDesc}</p>
              
              <div className="grid grid-cols-2 gap-2 pt-1.5">
                <button className="w-full py-1 bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white text-[10px] font-bold rounded-md transition-all shadow-sm border-none cursor-pointer">
                  Primary Button
                </button>
                <button className="w-full py-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-[10px] font-bold rounded-md border border-neutral-800 hover:border-neutral-700 cursor-pointer">
                  Secondary
                </button>
              </div>
            </div>
            
            <p className="text-[9px] text-neutral-500 italic text-center mt-1">
              {t.saveMsg}
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
