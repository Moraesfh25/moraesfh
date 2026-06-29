import React, { useState } from "react";
import { TrendingUp, Award, Coins, Percent, ArrowUpRight, BarChart3, Calendar, ShieldCheck, Target } from "lucide-react";

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

  return (
    <div id="dashboard-ia-root" className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto">
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-900 pb-5">
        <div>
          <h2 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Target className="w-5 h-5 text-green-500 animate-pulse" /> Dashboard Estatístico IA
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Estatísticas auditadas de performance, acertos e rentabilidade do motor cognitivo.
          </p>
        </div>

        <div className="flex bg-neutral-900 p-1 rounded-lg border border-neutral-800 self-start md:self-auto">
          {(["30d", "90d", "all"] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-tight transition-all ${
                selectedPeriod === period ? "bg-green-500 text-black shadow-md font-bold" : "text-neutral-400 hover:text-white"
              }`}
            >
              {period === "30d" ? "Últimos 30 Dias" : period === "90d" ? "Últimos 90 Dias" : "Geral"}
            </button>
          ))}
        </div>
      </div>

      {/* KEY INDICATOR METRICS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 space-y-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full blur-2xl -mr-6 -mt-6 transition-all group-hover:bg-green-500/10"></div>
          <div className="flex justify-between items-center text-xs text-neutral-400">
            <span>Retorno de Investimento</span>
            <TrendingUp className="w-4 h-4 text-green-400" />
          </div>
          <div className="space-y-0.5">
            <div className="text-2xl font-black text-green-400 font-mono">+{metrics.roi}%</div>
            <p className="text-[10px] text-neutral-500">Média ponderada do período</p>
          </div>
        </div>

        <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 space-y-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl -mr-6 -mt-6 transition-all group-hover:bg-blue-500/10"></div>
          <div className="flex justify-between items-center text-xs text-neutral-400">
            <span>Precisão Geral IA</span>
            <Percent className="w-4 h-4 text-blue-400" />
          </div>
          <div className="space-y-0.5">
            <div className="text-2xl font-black text-blue-400 font-mono">{metrics.accuracy}%</div>
            <p className="text-[10px] text-neutral-500">Acerto em todos os mercados</p>
          </div>
        </div>

        <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 space-y-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl -mr-6 -mt-6 transition-all group-hover:bg-emerald-500/10"></div>
          <div className="flex justify-between items-center text-xs text-neutral-400">
            <span>Lucro Líquido</span>
            <Coins className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="space-y-0.5">
            <div className="text-2xl font-black text-white font-mono">R$ {metrics.profit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>
            <p className="text-[10px] text-green-500 flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" /> +14.2% esta semana
            </p>
          </div>
        </div>

        <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 space-y-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl -mr-6 -mt-6 transition-all group-hover:bg-amber-500/10"></div>
          <div className="flex justify-between items-center text-xs text-neutral-400">
            <span>Resultados de Sinais</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="space-y-0.5">
            <div className="text-2xl font-black text-white font-mono">
              <span className="text-green-400">{metrics.wins}</span>
              <span className="text-neutral-600 mx-1">/</span>
              <span className="text-red-500">{metrics.losses}</span>
            </div>
            <p className="text-[10px] text-neutral-500">Green vs Red acumulados</p>
          </div>
        </div>
      </div>

      {/* CHARTS & LISTS LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual Chart Card */}
        <div className="bg-neutral-900 rounded-xl p-5 border border-neutral-800 lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-green-500" /> Histórico Semanal de Lucratividade
            </h3>
            <span className="text-[10px] text-neutral-500 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-green-500" /> Auditado pela blockchain de simulação
            </span>
          </div>

          {/* Custom Pure SVG/CSS Sleek Line Chart */}
          <div className="h-56 w-full flex flex-col justify-between pt-4">
            <div className="flex-1 flex items-end justify-between gap-2 px-1 relative">
              {/* Grid Lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
                <div className="border-b border-white w-full h-0"></div>
                <div className="border-b border-white w-full h-0"></div>
                <div className="border-b border-white w-full h-0"></div>
                <div className="border-b border-white w-full h-0"></div>
              </div>

              {/* Data Columns */}
              {[
                { week: "Semana 1", profit: 24, label: "R$ 720" },
                { week: "Semana 2", profit: 45, label: "R$ 1.350" },
                { week: "Semana 3", profit: 32, label: "R$ 960" },
                { week: "Semana 4", profit: 68, label: "R$ 2.040" },
                { week: "Semana 5", profit: 54, label: "R$ 1.620" },
                { week: "Semana 6", profit: 89, label: "R$ 2.670" },
                { week: "Semana 7", profit: 94, label: "R$ 2.820" }
              ].map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full mb-2 bg-neutral-950 text-white text-[10px] px-2 py-1 rounded border border-neutral-800 opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-10 font-mono">
                    {item.label}
                  </div>
                  <div className="w-full bg-neutral-800/60 rounded-t h-40 flex items-end overflow-hidden">
                    <div
                      className="w-full bg-gradient-to-t from-green-600/80 to-green-400 group-hover:from-green-500 group-hover:to-emerald-300 transition-all rounded-t cursor-pointer"
                      style={{ height: `${item.profit}%` }}
                    ></div>
                  </div>
                  <span className="text-[9px] text-neutral-500 font-semibold uppercase">{item.week}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Most Profitable Markets Breakdown */}
        <div className="bg-neutral-900 rounded-xl p-5 border border-neutral-800 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Mercados Mais Lucrativos
          </h3>
          <div className="space-y-4">
            {profitableMarkets.map((market, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-300 font-bold">{market.name}</span>
                  <span className="text-green-400 font-mono font-bold">Rendimento: {market.profit}</span>
                </div>
                <div className="relative w-full h-2 bg-neutral-950 rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full"
                    style={{ width: `${market.winRate}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center text-[9px] text-neutral-500 font-semibold uppercase">
                  <span>Assertividade: {market.winRate}%</span>
                  <span>Popularidade: {market.popularity}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CHAMPIONSHIPS EFFICIENCY ROWS */}
      <div className="bg-neutral-900 rounded-xl p-5 border border-neutral-800 space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
          Performance do Algoritmo por Campeonato
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {profitableLeagues.map((league, idx) => (
            <div key={idx} className="bg-neutral-950 p-3 rounded-lg border border-neutral-850 flex items-center gap-3">
              <div className={`w-2.5 h-10 rounded ${league.color} shrink-0`}></div>
              <div className="space-y-1">
                <div className="text-xs font-bold text-white leading-tight">{league.name}</div>
                <div className="flex items-center gap-2 text-[10px] text-neutral-400">
                  <span>Precisão: <strong className="text-green-400">{league.accuracy}%</strong></span>
                  <span>•</span>
                  <span>ROI: <strong className="text-white font-mono">{league.roi}</strong></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
