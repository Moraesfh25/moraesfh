import React, { useState } from "react";
import { TrendingUp, Award, Coins, Percent, ArrowUpRight, BarChart3, Calendar, ShieldCheck, Target, Sparkles, AlertCircle } from "lucide-react";

export default function DashboardIA() {
  const [selectedPeriod, setSelectedPeriod] = useState<"30d" | "90d" | "all">("30d");

  // Dynamic metrics based on period
  const metrics = {
    "30d": { roi: 24.2, accuracy: 84.3, profit: 4120, wins: 142, losses: 26 },
    "90d": { roi: 68.7, accuracy: 81.9, profit: 12450, wins: 410, losses: 91 },
    all: { roi: 148.4, accuracy: 83.1, profit: 34100, wins: 1102, losses: 224 }
  }[selectedPeriod];

  const profitableMarkets = [
    { name: "Over 2.5 Gols", winRate: 88.4, profit: "R$ 1.840,00", popularity: 45 },
    { name: "Vitória Mandante (ML)", winRate: 83.1, profit: "R$ 1.250,00", popularity: 30 },
    { name: "Ambas Marcam (BTTS)", winRate: 81.5, profit: "R$ 1.030,00", popularity: 25 }
  ];

  const profitableLeagues = [
    { name: "Premier League", accuracy: 89.1, roi: "+28.4%", color: "bg-purple-500" },
    { name: "Brasileirão Serie A", accuracy: 85.3, roi: "+25.1%", color: "bg-green-500" },
    { name: "Copa Libertadores", accuracy: 84.0, roi: "+23.7%", color: "bg-amber-500" },
    { name: "La Liga", accuracy: 81.8, roi: "+19.5%", color: "bg-blue-500" }
  ];

  // Utility to render the custom text-based block meter requested by the user: [█████████░]
  const renderTextBlockMeter = (percentage: number, colorClass: string = "text-[#00D26A]") => {
    const filledBlocks = Math.round(percentage / 10);
    const emptyBlocks = 10 - filledBlocks;
    return (
      <span className="font-mono font-bold tracking-wider text-xs flex items-center gap-1">
        <span className={colorClass}>{"█".repeat(filledBlocks)}</span>
        <span className="text-neutral-750">{"░".repeat(emptyBlocks)}</span>
      </span>
    );
  };

  return (
    <div id="dashboard-ia-root" className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto">
      
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-2">
            <Target className="w-5 h-5 text-[#00D26A] animate-pulse" /> Painel Estatístico IA
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Métricas cognitivas auditadas de performance, acertos e rentabilidade em tempo real.
          </p>
        </div>

        <div className="flex bg-[#1b212b] p-1 rounded-lg border border-neutral-800/80 self-start md:self-auto shadow-inner">
          {(["30d", "90d", "all"] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-tight transition-all cursor-pointer ${
                selectedPeriod === period 
                  ? "bg-gradient-to-r from-[#00D26A] to-[#00A94E] text-black shadow-md font-black" 
                  : "text-neutral-450 hover:text-white"
              }`}
            >
              {period === "30d" ? "30 Dias" : period === "90d" ? "90 Dias" : "Geral"}
            </button>
          ))}
        </div>
      </div>

      {/* KEY INDICATOR METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Metric Card 1: ROI */}
        <div className="bg-[#1b212b] p-4.5 rounded-xl border border-neutral-800/85 space-y-2 relative overflow-hidden group shadow-[0_12px_30px_rgba(0,0,0,0.35)]">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full blur-2xl -mr-6 -mt-6 transition-all group-hover:bg-green-500/10"></div>
          <div className="flex justify-between items-center text-xs text-neutral-400 font-semibold">
            <span>Retorno (ROI)</span>
            <TrendingUp className="w-4.5 h-4.5 text-[#00D26A]" />
          </div>
          <div className="space-y-1.5 pt-0.5">
            <div className="flex justify-between items-baseline">
              <span className="text-2xl font-black text-[#00D26A] font-mono">+{metrics.roi}%</span>
              {renderTextBlockMeter(metrics.roi > 100 ? 100 : metrics.roi)}
            </div>
            {/* Visual gradient progress line */}
            <div className="w-full bg-neutral-950 h-1.5 rounded-full overflow-hidden p-0.5 border border-neutral-800/50">
              <div 
                className="bg-gradient-to-r from-[#00D26A] to-[#00A94E] h-full rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(0,210,106,0.4)]" 
                style={{ width: `${Math.min(metrics.roi, 100)}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-neutral-500 font-medium">Lucro ponderado sobre investimento</p>
          </div>
        </div>

        {/* Metric Card 2: Accuracy */}
        <div className="bg-[#1b212b] p-4.5 rounded-xl border border-neutral-800/85 space-y-2 relative overflow-hidden group shadow-[0_12px_30px_rgba(0,0,0,0.35)]">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl -mr-6 -mt-6 transition-all group-hover:bg-blue-500/10"></div>
          <div className="flex justify-between items-center text-xs text-neutral-400 font-semibold">
            <span>Precisão Geral IA</span>
            <Percent className="w-4.5 h-4.5 text-blue-400" />
          </div>
          <div className="space-y-1.5 pt-0.5">
            <div className="flex justify-between items-baseline">
              <span className="text-2xl font-black text-blue-400 font-mono">{metrics.accuracy}%</span>
              {renderTextBlockMeter(metrics.accuracy, "text-blue-400")}
            </div>
            {/* Visual blue progress line */}
            <div className="w-full bg-neutral-950 h-1.5 rounded-full overflow-hidden p-0.5 border border-neutral-800/50">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-400 h-full rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(59,130,246,0.4)]" 
                style={{ width: `${metrics.accuracy}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-neutral-500 font-medium font-sans">Acerto geral em 142 mercados</p>
          </div>
        </div>

        {/* Metric Card 3: Net Profit */}
        <div className="bg-[#1b212b] p-4.5 rounded-xl border border-neutral-800/85 space-y-2 relative overflow-hidden group shadow-[0_12px_30px_rgba(0,0,0,0.35)]">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl -mr-6 -mt-6 transition-all group-hover:bg-emerald-500/10"></div>
          <div className="flex justify-between items-center text-xs text-neutral-400 font-semibold">
            <span>Lucro Líquido</span>
            <Coins className="w-4.5 h-4.5 text-emerald-400" />
          </div>
          <div className="space-y-1 pt-0.5">
            <div className="text-2xl font-black text-white font-mono">R$ {metrics.profit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>
            <p className="text-[10px] text-[#00D26A] flex items-center gap-0.5 font-bold">
              <ArrowUpRight className="w-3.5 h-3.5 text-[#00D26A]" /> +14.2% nesta semana
            </p>
          </div>
        </div>

        {/* Metric Card 4: Wins & Losses */}
        <div className="bg-[#1b212b] p-4.5 rounded-xl border border-neutral-800/85 space-y-2 relative overflow-hidden group shadow-[0_12px_30px_rgba(0,0,0,0.35)]">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl -mr-6 -mt-6 transition-all group-hover:bg-amber-500/10"></div>
          <div className="flex justify-between items-center text-xs text-neutral-400 font-semibold">
            <span>Boletim de Sinais</span>
            <Award className="w-4.5 h-4.5 text-amber-400" />
          </div>
          <div className="space-y-1 pt-0.5">
            <div className="text-2xl font-black text-white font-mono flex items-center">
              <span className="text-[#00D26A]">{metrics.wins}</span>
              <span className="text-neutral-600 mx-1.5 text-lg">/</span>
              <span className="text-red-500">{metrics.losses}</span>
            </div>
            <p className="text-[10px] text-neutral-500 font-semibold uppercase font-mono tracking-wider">Green vs Red acumulados</p>
          </div>
        </div>

      </div>

      {/* CHARTS & LISTS LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart Column (2 cols span) */}
        <div className="bg-[#1b212b] rounded-xl p-5 border border-neutral-800/80 lg:col-span-2 space-y-5 shadow-[0_12px_30px_rgba(0,0,0,0.35)]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 className="w-4.5 h-4.5 text-[#00D26A]" /> Histórico Semanal de Lucro (Banca R$ 500)
            </h3>
            <span className="text-[9px] bg-neutral-900 border border-neutral-800 text-neutral-450 font-bold px-2 py-0.5 rounded flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00D26A]" /> AUDITADO REGULARMENTE
            </span>
          </div>

          {/* Line Chart Component wrapper */}
          <div className="h-56 w-full flex flex-col justify-between pt-4">
            <div className="flex-1 flex items-end justify-between gap-3 px-1 relative">
              {/* Grid Lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-5">
                <div className="border-b border-white w-full h-0"></div>
                <div className="border-b border-white w-full h-0"></div>
                <div className="border-b border-white w-full h-0"></div>
                <div className="border-b border-white w-full h-0"></div>
              </div>

              {/* Weekly Data bar blocks */}
              {[
                { week: "Semana 1", profit: 24, label: "R$ 720" },
                { week: "Semana 2", profit: 45, label: "R$ 1.350" },
                { week: "Semana 3", profit: 32, label: "R$ 960" },
                { week: "Semana 4", profit: 68, label: "R$ 2.040" },
                { week: "Semana 5", profit: 54, label: "R$ 1.620" },
                { week: "Semana 6", profit: 89, label: "R$ 2.670" },
                { week: "Semana 7", profit: 94, label: "R$ 2.820" }
              ].map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2.5 group relative">
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full mb-2 bg-neutral-950 text-white text-[10px] px-2 py-1 rounded border border-neutral-800 opacity-0 group-hover:opacity-100 transition-all duration-150 pointer-events-none z-10 font-mono font-bold shadow-lg">
                    {item.label}
                  </div>
                  <div className="w-full bg-neutral-900/40 rounded-t-lg h-36 flex items-end overflow-hidden border border-neutral-850">
                    <div
                      className="w-full bg-gradient-to-t from-green-600/80 to-[#00D26A] group-hover:from-[#00D26A] group-hover:to-emerald-300 transition-all rounded-t-lg cursor-pointer shadow-[0_0_10px_rgba(0,210,106,0.15)]"
                      style={{ height: `${item.profit}%` }}
                    ></div>
                  </div>
                  <span className="text-[9px] text-neutral-500 font-black uppercase font-mono">{item.week}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Breakdown of Most Profitable Markets */}
        <div className="bg-[#1b212b] rounded-xl p-5 border border-neutral-800/80 space-y-4.5 shadow-[0_12px_30px_rgba(0,0,0,0.35)]">
          <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-green-400" /> Mercados + Lucrativos
          </h3>
          <div className="space-y-4">
            {profitableMarkets.map((market, idx) => (
              <div key={idx} className="space-y-2 bg-neutral-900/30 p-2.5 rounded-lg border border-neutral-850/60">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-200 font-bold">{market.name}</span>
                  <span className="text-[#00D26A] font-mono font-extrabold">{market.profit}</span>
                </div>
                <div className="relative w-full h-2 bg-neutral-950 rounded-full overflow-hidden p-0.5 border border-neutral-850">
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-600 to-[#00D26A] rounded-full shadow-[0_0_8px_rgba(0,210,106,0.3)]"
                    style={{ width: `${market.winRate}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center text-[9px] font-mono font-semibold uppercase tracking-wider text-neutral-500">
                  <span className="flex items-center gap-1">
                    Assertividade: {renderTextBlockMeter(market.winRate)} {market.winRate}%
                  </span>
                  <span>Popularidade: {market.popularity}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* CHAMPIONSHIPS EFFICIENCY ROWS */}
      <div className="bg-[#1b212b] rounded-xl p-5 border border-neutral-800/80 space-y-4.5 shadow-[0_12px_30px_rgba(0,0,0,0.35)]">
        <h3 className="text-xs font-black text-white uppercase tracking-widest">
          Performance por Campeonato (Rede Neural)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {profitableLeagues.map((league, idx) => (
            <div key={idx} className="bg-neutral-950 p-3 rounded-xl border border-neutral-850 flex items-center gap-3.5">
              <div className={`w-1.5 h-10 rounded ${league.color} shrink-0`}></div>
              <div className="space-y-1 flex-1">
                <div className="text-xs font-black text-white leading-tight">{league.name}</div>
                <div className="flex flex-col space-y-0.5 text-[9px] text-neutral-400">
                  <div className="flex items-center justify-between">
                    <span>Precisão:</span>
                    <strong className="text-green-400 font-mono">{league.accuracy}%</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Filtro de ROI:</span>
                    <strong className="text-white font-mono font-bold">{league.roi}</strong>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
