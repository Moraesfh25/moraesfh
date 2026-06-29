import React, { useState, useEffect } from "react";
import { Users, Shield, Plus, RotateCcw, Play, CheckCircle, Database, AlertTriangle, Send, Sliders, ToggleLeft, ToggleRight, RefreshCw, Trash2 } from "lucide-react";
import { Match, AdminLog } from "../types";
import { SportsService } from "../services/sportsService";
import { AIService } from "../services/aiService";

interface PainelAdminProps {
  onRefreshMatches: () => void;
  matches: Match[];
}

export default function PainelAdmin({ onRefreshMatches, matches }: PainelAdminProps) {
  // Navigation internal tabs: "usuarios" | "jogos" | "logs"
  const [internalTab, setInternalTab] = useState<"usuarios" | "jogos" | "logs">("jogos");

  // User list state
  const [users, setUsers] = useState([
    { id: "usr_102", name: "Felipe Pires (Você)", email: "fjosemoraescx@gmail.com", role: "admin", status: "VIP Ativo", signupDate: "12/05/2026" },
    { id: "usr_582", name: "Gabriel Menezes", email: "gabriel.menezes@bol.com.br", role: "user", status: "Free Tier", signupDate: "18/06/2026" },
    { id: "usr_941", name: "Ana Carolina Santos", email: "carol.santos@gmail.com", role: "user", status: "VIP Ativo", signupDate: "22/06/2026" },
    { id: "usr_112", name: "Rodrigo Almeida", email: "rodrigo.almeida@yahoo.com", role: "user", status: "Free Tier", signupDate: "27/06/2026" }
  ]);

  // Form for custom Match Addition
  const [newMatchHome, setNewMatchHome] = useState("");
  const [newMatchAway, setNewMatchAway] = useState("");
  const [newMatchLeague, setNewMatchLeague] = useState("Premier League");
  const [newMatchTime, setNewMatchTime] = useState("16:00");
  const [newMatchIsVIP, setNewMatchIsVIP] = useState(false);
  const [newMatchIsLive, setNewMatchIsLive] = useState(false);
  const [newMatchOddHome, setNewMatchOddHome] = useState("1.85");
  const [newMatchOddDraw, setNewMatchOddDraw] = useState("3.40");
  const [newMatchOddAway, setNewMatchOddAway] = useState("4.20");

  // Administrative Logs State
  const [logs, setLogs] = useState<AdminLog[]>([
    { id: "log_1", action: "CACHE_HIT_LOCAL_STORAGE", user: "SYSTEM", timestamp: "19:42:01", status: "success" },
    { id: "log_2", action: "API_FOOTBALL_CREDENTIALS_VALID", user: "SYSTEM", timestamp: "19:42:04", status: "success" },
    { id: "log_3", action: "SYNCHRONIZED_CLASSIFICATION_STANDINGS", user: "SYSTEM", timestamp: "19:42:05", status: "success" },
    { id: "log_4", action: "AI_MODEL_REASONING_RESPONSE_OK", user: "gemini-3.5-flash", timestamp: "19:43:10", status: "success" },
    { id: "log_5", action: "LOCAL_USER_SESSION_VERIFIED_JWT", user: "Felipe Pires", timestamp: "19:45:12", status: "success" }
  ]);

  const addLog = (action: string, user: string, status: "success" | "warning" | "error" = "success") => {
    const time = new Date().toLocaleTimeString("pt-BR");
    setLogs((prev) => [
      {
        id: "log_" + Math.floor(Math.random() * 90000 + 10000),
        action,
        user,
        timestamp: time,
        status
      },
      ...prev
    ]);
  };

  // Toggle user subscription level
  const toggleUserStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((user) => {
        if (user.id === userId) {
          const nextStatus = user.status === "VIP Ativo" ? "Free Tier" : "VIP Ativo";
          addLog(`ALTERACAO_ASSINATURA_USUARIO_PARA_${nextStatus.replace(" ", "_").toUpperCase()}`, user.name, "warning");
          return { ...user, status: nextStatus };
        }
        return user;
      })
    );
  };

  // Handles adding new games directly through the panel
  const handleCreateMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMatchHome || !newMatchAway) {
      alert("Por favor, informe os nomes dos times.");
      return;
    }

    const currentMatches = SportsService.getMatches();
    
    // Automatically calculate probabilities using AIService based on custom inputs
    const calculated = AIService.calculateMatchProbabilities({
      homeTeam: newMatchHome,
      awayTeam: newMatchAway,
      league: newMatchLeague,
      odds: { home: parseFloat(newMatchOddHome), draw: parseFloat(newMatchOddDraw), away: parseFloat(newMatchOddAway) },
      attackingStrength: { home: 85, away: 80 },
      defendingStrength: { home: 82, away: 80 },
      formGuide: { home: ["W", "D", "W"], away: ["D", "L", "W"] }
    });

    const addedMatch: Match = {
      id: "m_admin_" + Math.floor(Math.random() * 90000 + 10000),
      homeTeam: newMatchHome,
      awayTeam: newMatchAway,
      league: newMatchLeague,
      time: newMatchIsLive ? "1'" : newMatchTime,
      date: "Hoje",
      isVIP: newMatchIsVIP,
      isLive: newMatchIsLive,
      liveMinute: newMatchIsLive ? 1 : undefined,
      liveScore: newMatchIsLive ? [0, 0] : undefined,
      iaConfidence: calculated.confidence,
      iaStars: calculated.stars,
      odds: { home: parseFloat(newMatchOddHome), draw: parseFloat(newMatchOddDraw), away: parseFloat(newMatchOddAway) },
      probabilities: { home: calculated.home, draw: calculated.draw, away: calculated.away },
      iaMarketSuggestion: calculated.marketSuggestion,
      iaAnalysis: calculated.explanation,
      attackingStrength: { home: 85, away: 80 },
      defendingStrength: { home: 82, away: 80 },
      recentH2H: "Nenhum confronto registrado recentemente.",
      formGuide: { home: ["W", "D", "W", "L", "W"], away: ["L", "W", "D", "W", "L"] }
    };

    const updated = [addedMatch, ...currentMatches];
    SportsService.saveMatches(updated);
    onRefreshMatches();

    addLog(`NOVO_CONFRONTO_CRIADO_${newMatchHome.replace(" ", "_")}_X_${newMatchAway.replace(" ", "_")}`, "ADMINISTRADOR", "success");

    // Clear inputs
    setNewMatchHome("");
    setNewMatchAway("");
    alert(`✓ Confronto ${newMatchHome} x ${newMatchAway} criado com sucesso e analisado pela IA!`);
  };

  // Handles triggers for goals and minutes in real-time games for presentation/testing
  const triggerGoal = (matchId: string, side: "home" | "away") => {
    const current = SportsService.getMatches();
    const updated = current.map((m) => {
      if (m.id === matchId) {
        const score = m.liveScore || [0, 0];
        const nextScore: [number, number] = side === "home" ? [score[0] + 1, score[1]] : [score[0], score[1] + 1];
        addLog(`GOL_SIMULADO_${side.toUpperCase()}_EM_${m.homeTeam.replace(" ", "_")}_X_${m.awayTeam.replace(" ", "_")}`, "ADMINISTRADOR", "success");
        return {
          ...m,
          liveScore: nextScore
        };
      }
      return m;
    });
    SportsService.saveMatches(updated);
    onRefreshMatches();
  };

  // Deletes specific match from simulation state
  const deleteMatch = (matchId: string) => {
    const current = SportsService.getMatches();
    const updated = current.filter((m) => m.id !== matchId);
    SportsService.saveMatches(updated);
    onRefreshMatches();
    addLog(`CONFRONTO_EXCLUIDO_ID_${matchId}`, "ADMINISTRADOR", "warning");
  };

  return (
    <div id="painel-admin-root" className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto">
      {/* Admin Title Block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-900 pb-5">
        <div>
          <h2 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-500" /> Painel de Controle Administrativo
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Console de depuração técnica, gerenciamento de assinantes, simulação de gol e controle das odds IA.
          </p>
        </div>

        <div className="flex bg-neutral-900 p-1 rounded-lg border border-neutral-800 self-start md:self-auto">
          <button
            onClick={() => setInternalTab("jogos")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-tight transition-all flex items-center gap-1.5 ${
              internalTab === "jogos" ? "bg-red-500 text-white shadow-md font-bold" : "text-neutral-400 hover:text-white"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" /> Jogos & Odds
          </button>
          <button
            onClick={() => setInternalTab("usuarios")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-tight transition-all flex items-center gap-1.5 ${
              internalTab === "usuarios" ? "bg-red-500 text-white shadow-md font-bold" : "text-neutral-400 hover:text-white"
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Assinantes
          </button>
          <button
            onClick={() => setInternalTab("logs")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-tight transition-all flex items-center gap-1.5 ${
              internalTab === "logs" ? "bg-red-500 text-white shadow-md font-bold" : "text-neutral-400 hover:text-white"
            }`}
          >
            <Database className="w-3.5 h-3.5" /> Logs API
          </button>
        </div>
      </div>

      {/* RENDER INTERNAL TABS */}
      {internalTab === "usuarios" && (
        <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-red-400" /> Gerenciamento de Usuários
            </h3>
            <span className="text-[10px] text-neutral-500 font-bold uppercase">4 registros encontrados</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-400 font-semibold uppercase text-[10px]">
                  <th className="py-2.5 px-3">Nome</th>
                  <th className="py-2.5 px-3">E-mail</th>
                  <th className="py-2.5 px-3">Cargo</th>
                  <th className="py-2.5 px-3">Plano Atual</th>
                  <th className="py-2.5 px-3">Data Cadastro</th>
                  <th className="py-2.5 px-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-850">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-neutral-850/30 transition-all text-neutral-300">
                    <td className="py-3 px-3 font-semibold text-white">{user.name}</td>
                    <td className="py-3 px-3 font-mono">{user.email}</td>
                    <td className="py-3 px-3 uppercase text-[10px] tracking-tight">{user.role}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        user.status === "VIP Ativo" ? "bg-amber-500/10 text-amber-400 border border-amber-500/25" : "bg-neutral-800 text-neutral-400"
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-neutral-500">{user.signupDate}</td>
                    <td className="py-3 px-3 text-right">
                      {user.role !== "admin" ? (
                        <button
                          onClick={() => toggleUserStatus(user.id)}
                          className="text-[10px] py-1 px-2.5 bg-neutral-800 hover:bg-neutral-750 text-white border border-neutral-700 hover:border-neutral-600 rounded transition-all font-bold"
                        >
                          {user.status === "VIP Ativo" ? "Remover VIP" : "Dar VIP Grátis"}
                        </button>
                      ) : (
                        <span className="text-[9px] text-neutral-500 font-bold uppercase">Admin Principal</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {internalTab === "jogos" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Match Form */}
          <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-5 space-y-4 lg:col-span-1">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-green-500" /> Cadastrar Novo Confronto
            </h3>

            <form onSubmit={handleCreateMatch} className="space-y-3.5 text-xs text-neutral-300">
              <div className="space-y-1">
                <label className="text-neutral-400 font-semibold">Time Mandante (Home)</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Manchester United"
                  value={newMatchHome}
                  onChange={(e) => setNewMatchHome(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-red-500/50 rounded py-2 px-3 text-white focus:outline-none transition-all font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-neutral-400 font-semibold">Time Visitante (Away)</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Newcastle"
                  value={newMatchAway}
                  onChange={(e) => setNewMatchAway(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-red-500/50 rounded py-2 px-3 text-white focus:outline-none transition-all font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-neutral-400 font-semibold">Campeonato</label>
                  <select
                    value={newMatchLeague}
                    onChange={(e) => setNewMatchLeague(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded py-2 px-2 text-white font-semibold focus:outline-none"
                  >
                    <option value="Premier League">Premier League</option>
                    <option value="La Liga">La Liga</option>
                    <option value="Libertadores">Libertadores</option>
                    <option value="Brasileirão">Brasileirão</option>
                    <option value="Serie A">Serie A</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-neutral-400 font-semibold">Horário / Minuto</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 16:00"
                    value={newMatchTime}
                    onChange={(e) => setNewMatchTime(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded py-2 px-3 text-white focus:outline-none text-center font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] text-neutral-400 font-semibold block text-center">Odd Home</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="1.85"
                    value={newMatchOddHome}
                    onChange={(e) => setNewMatchOddHome(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded py-1.5 px-1.5 text-white text-center font-mono focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-neutral-400 font-semibold block text-center">Odd Draw</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="3.40"
                    value={newMatchOddDraw}
                    onChange={(e) => setNewMatchOddDraw(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded py-1.5 px-1.5 text-white text-center font-mono focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-neutral-400 font-semibold block text-center">Odd Away</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="4.20"
                    value={newMatchOddAway}
                    onChange={(e) => setNewMatchOddAway(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded py-1.5 px-1.5 text-white text-center font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-4 items-center justify-between py-2 border-t border-b border-neutral-850 my-1">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_vip_check"
                    checked={newMatchIsVIP}
                    onChange={(e) => setNewMatchIsVIP(e.target.checked)}
                    className="accent-amber-500 cursor-pointer w-4 h-4"
                  />
                  <label htmlFor="is_vip_check" className="text-[11px] font-bold text-amber-400 cursor-pointer uppercase tracking-tight">Conteúdo VIP</label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_live_check"
                    checked={newMatchIsLive}
                    onChange={(e) => setNewMatchIsLive(e.target.checked)}
                    className="accent-red-500 cursor-pointer w-4 h-4"
                  />
                  <label htmlFor="is_live_check" className="text-[11px] font-bold text-red-500 cursor-pointer uppercase tracking-tight">Iniciar Ao Vivo</label>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-red-500 hover:bg-red-400 text-white font-bold py-2.5 rounded shadow-lg transition-colors flex items-center justify-center gap-1.5 tracking-wide"
              >
                <Send className="w-3.5 h-3.5" /> AGENDAR E ANALISAR POR IA
              </button>
            </form>
          </div>

          {/* Active Matches management list */}
          <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-5 space-y-4 lg:col-span-2">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Database className="w-4 h-4 text-red-400" /> Banco de Jogos Ativos ({matches.length})
              </h3>
              <button
                onClick={() => {
                  SportsService.saveMatches([]);
                  onRefreshMatches();
                  alert("✓ Banco de jogos limpo! Recarregue a página para re-gerar os jogos iniciais.");
                }}
                className="text-[9px] py-1 px-2.5 bg-neutral-950 hover:bg-neutral-850 text-neutral-400 hover:text-red-400 border border-neutral-850 rounded transition-all font-bold uppercase tracking-wider"
              >
                Limpar Banco
              </button>
            </div>

            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {matches.map((match) => (
                <div key={match.id} className="bg-neutral-950 rounded-lg p-3 border border-neutral-850 flex justify-between items-center text-xs gap-4 hover:border-neutral-800 transition-all">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] uppercase tracking-widest bg-neutral-900 text-neutral-400 border border-neutral-800 px-1.5 py-0.5 rounded font-bold font-mono">
                        {match.league}
                      </span>
                      {match.isVIP && (
                        <span className="text-[8px] bg-amber-500/15 text-amber-400 border border-amber-500/25 px-1 rounded font-black font-mono">VIP</span>
                      )}
                      {match.isLive && (
                        <span className="text-[8px] bg-red-500/10 text-red-500 border border-red-500/20 px-1 rounded font-black font-mono animate-pulse uppercase">Live</span>
                      )}
                    </div>
                    <div className="font-bold text-white text-sm">
                      {match.homeTeam} x {match.awayTeam}
                    </div>
                    <div className="text-[10px] text-neutral-500 flex items-center gap-2">
                      <span>Confiança: <strong>{match.iaConfidence}%</strong></span>
                      <span>•</span>
                      <span>Mercado: <strong>{match.iaMarketSuggestion}</strong></span>
                      {match.isLive && (
                        <>
                          <span>•</span>
                          <span className="text-red-400 font-mono font-bold">Placar: {match.liveScore ? `${match.liveScore[0]} - ${match.liveScore[1]}` : "0 - 0"}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Simulations and Trigger Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {match.isLive ? (
                      <div className="flex gap-1">
                        <button
                          onClick={() => triggerGoal(match.id, "home")}
                          title={`Gol do ${match.homeTeam}`}
                          className="bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 py-1 px-2 rounded font-bold text-green-400 text-[10px]"
                        >
                          + G Mandante
                        </button>
                        <button
                          onClick={() => triggerGoal(match.id, "away")}
                          title={`Gol do ${match.awayTeam}`}
                          className="bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 py-1 px-2 rounded font-bold text-green-400 text-[10px]"
                        >
                          + G Visitante
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] text-neutral-500 font-mono italic">Sem simulação</span>
                    )}

                    <button
                      onClick={() => deleteMatch(match.id)}
                      title="Excluir confronto"
                      className="p-1.5 hover:bg-red-500/10 text-neutral-500 hover:text-red-400 border border-neutral-850 hover:border-red-500/20 rounded transition-all shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {internalTab === "logs" && (
        <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Database className="w-4 h-4 text-red-400" /> Depurador de Eventos de Rede & Cache
            </h3>
            <button
              onClick={() => {
                setLogs([]);
                addLog("LOGS_DIAGNOSTICOS_LIMPOS", "ADMINISTRADOR", "success");
              }}
              className="text-[10px] text-neutral-400 hover:text-white font-bold"
            >
              Limpar Logs
            </button>
          </div>

          <div className="bg-neutral-950 rounded-lg p-3 font-mono text-[10.5px] text-green-400 space-y-1.5 max-h-[400px] overflow-y-auto border border-neutral-850">
            {logs.length === 0 ? (
              <p className="text-neutral-600 italic">Nenhum evento registrado no buffer local.</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="flex items-start gap-3">
                  <span className="text-neutral-600 shrink-0">[{log.timestamp}]</span>
                  <span className={`font-bold shrink-0 ${
                    log.status === "error" ? "text-red-500" : log.status === "warning" ? "text-amber-500" : "text-green-500"
                  }`}>
                    [{log.status.toUpperCase()}]
                  </span>
                  <span className="text-neutral-300 flex-1">{log.action}</span>
                  <span className="text-neutral-500 shrink-0">user:{log.user}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
