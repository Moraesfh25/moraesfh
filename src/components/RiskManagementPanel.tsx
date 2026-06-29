import React, { useState } from "react";
import { 
  ShieldAlert, 
  Settings, 
  Sliders, 
  CheckCircle, 
  AlertTriangle, 
  HelpCircle, 
  X, 
  AlertCircle, 
  Info,
  ChevronRight,
  UserCheck,
  Percent,
  TrendingDown,
  RefreshCw,
  Clock
} from "lucide-react";

export interface RiskLimits {
  daily: number;
  weekly: number;
  monthly: number;
  enabledDaily: boolean;
  enabledWeekly: boolean;
  enabledMonthly: boolean;
}

export interface RiskLosses {
  daily: number;
  weekly: number;
  monthly: number;
}

interface RiskManagementPanelProps {
  limits: RiskLimits;
  onChangeLimits: (newLimits: RiskLimits) => void;
  losses: RiskLosses;
  onSimulateLoss: (amount: number, period: "daily" | "weekly" | "monthly") => void;
  onResetSimulatedLosses: () => void;
  onClose: () => void;
}

export const RiskManagementPanel: React.FC<RiskManagementPanelProps> = ({
  limits,
  onChangeLimits,
  losses,
  onSimulateLoss,
  onResetSimulatedLosses,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<"limits" | "responsible" | "history">("limits");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleToggle = (field: "enabledDaily" | "enabledWeekly" | "enabledMonthly") => {
    const updated = { ...limits, [field]: !limits[field] };
    onChangeLimits(updated);
    showTempSuccess("✓ Configuração de limite atualizada com sucesso!");
  };

  const handleLimitChange = (field: "daily" | "weekly" | "monthly", value: number) => {
    const cleanVal = Math.max(0, isNaN(value) ? 0 : value);
    const updated = { ...limits, [field]: cleanVal };
    onChangeLimits(updated);
  };

  const showTempSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // Helper to compute stats
  const getProgressInfo = (loss: number, limit: number, enabled: boolean) => {
    if (!enabled) return { percent: 0, status: "disabled", colorClass: "bg-neutral-800", textClass: "text-neutral-500" };
    if (limit <= 0) return { percent: 0, status: "none", colorClass: "bg-neutral-800", textClass: "text-neutral-500" };
    
    const percent = Math.min(100, Math.round((loss / limit) * 100));
    
    if (loss >= limit) {
      return { percent, status: "exceeded", colorClass: "bg-red-500", textClass: "text-red-400 font-bold" };
    }
    if (loss >= limit * 0.8) {
      return { percent, status: "warning", colorClass: "bg-amber-500 animate-pulse", textClass: "text-amber-400 font-semibold" };
    }
    return { percent, status: "safe", colorClass: "bg-green-500", textClass: "text-green-400" };
  };

  const dailyInfo = getProgressInfo(losses.daily, limits.daily, limits.enabledDaily);
  const weeklyInfo = getProgressInfo(losses.weekly, limits.weekly, limits.enabledWeekly);
  const monthlyInfo = getProgressInfo(losses.monthly, limits.monthly, limits.enabledMonthly);

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-lg w-full overflow-hidden shadow-2xl animate-scale-up flex flex-col max-h-[90vh]" id="risk-management-modal">
      
      {/* HEADER */}
      <div className="p-4 md:p-5 border-b border-neutral-800 bg-neutral-950 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">
              Gestão de Risco e Perdas
            </h3>
            <p className="text-[10px] text-neutral-400">
              Configure limites para proteger sua banca com inteligência e responsabilidade
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* INNER TABS */}
      <div className="flex bg-neutral-950 px-4 border-b border-neutral-850 shrink-0 text-xs">
        <button
          onClick={() => setActiveTab("limits")}
          className={`py-2.5 px-3 border-b-2 font-medium transition-all ${
            activeTab === "limits" 
              ? "border-green-500 text-green-400 font-semibold" 
              : "border-transparent text-neutral-400 hover:text-neutral-200"
          }`}
        >
          Limites de Perda
        </button>
        <button
          onClick={() => setActiveTab("responsible")}
          className={`py-2.5 px-3 border-b-2 font-medium transition-all ${
            activeTab === "responsible" 
              ? "border-green-500 text-green-400 font-semibold" 
              : "border-transparent text-neutral-400 hover:text-neutral-200"
          }`}
        >
          Jogo Responsável
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`py-2.5 px-3 border-b-2 font-medium transition-all ${
            activeTab === "history" 
              ? "border-green-500 text-green-400 font-semibold" 
              : "border-transparent text-neutral-400 hover:text-neutral-200"
          }`}
        >
          Simular Perdas de Teste
        </button>
      </div>

      {/* MAIN CONTAINER SCROLLABLE */}
      <div className="p-4 md:p-5 overflow-y-auto space-y-4 flex-1">
        
        {successMsg && (
          <div className="bg-green-500/10 border border-green-500/20 rounded p-2 text-[11px] text-green-400 flex items-center gap-1.5 animate-fade-in">
            <CheckCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* 1. LIMITS VIEW */}
        {activeTab === "limits" && (
          <div className="space-y-4">
            
            <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-3 text-[11px] text-neutral-400 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong className="text-white">Regra de Segurança Ativa:</strong> O sistema monitora suas perdas em tempo real. Ao atingir <span className="text-amber-400 font-bold">80% do limite</span>, você receberá um alerta imediato de contenção. Ao atingir <span className="text-red-400 font-bold">100%</span>, novas apostas são bloqueadas temporariamente.
              </div>
            </div>

            {/* DAILY LIMIT */}
            <div className="bg-neutral-950/40 border border-neutral-850 rounded-lg p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-xs font-bold text-white uppercase font-mono">Limite Diário de Perdas</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={limits.enabledDaily} 
                    onChange={() => handleToggle("enabledDaily")} 
                    className="sr-only peer"
                  />
                  <div className="w-7 h-4 bg-neutral-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-neutral-400 after:border-neutral-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-green-500 peer-checked:after:bg-neutral-950 peer-checked:after:border-transparent"></div>
                </label>
              </div>

              {limits.enabledDaily ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[11px] text-neutral-400">Definir Limite máximo:</span>
                    <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded px-2 py-1 max-w-[140px]">
                      <span className="text-[10px] text-neutral-500 font-bold mr-1">R$</span>
                      <input 
                        type="number" 
                        value={limits.daily} 
                        onChange={(e) => handleLimitChange("daily", parseFloat(e.target.value))}
                        className="bg-transparent text-xs font-bold text-white font-mono w-full focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Progress Gauge */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono">
                      <span className="text-neutral-400">
                        Perda atual: <strong className="text-white">R$ {losses.daily.toFixed(2)}</strong>
                      </span>
                      <span className={dailyInfo.textClass}>
                        {dailyInfo.percent}% {dailyInfo.status === "exceeded" ? "(EXCEDIDO)" : dailyInfo.status === "warning" ? "(80% ALERTA!)" : ""}
                      </span>
                    </div>
                    <div className="w-full bg-neutral-900 rounded-full h-2 overflow-hidden border border-neutral-800">
                      <div 
                        className={`h-full transition-all duration-350 ${dailyInfo.colorClass}`}
                        style={{ width: `${dailyInfo.percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-neutral-500 italic">Limite diário desativado. Você opera sem teto diário de perdas.</p>
              )}
            </div>

            {/* WEEKLY LIMIT */}
            <div className="bg-neutral-950/40 border border-neutral-850 rounded-lg p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-xs font-bold text-white uppercase font-mono">Limite Semanal de Perdas</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={limits.enabledWeekly} 
                    onChange={() => handleToggle("enabledWeekly")} 
                    className="sr-only peer"
                  />
                  <div className="w-7 h-4 bg-neutral-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-neutral-400 after:border-neutral-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-green-500 peer-checked:after:bg-neutral-950 peer-checked:after:border-transparent"></div>
                </label>
              </div>

              {limits.enabledWeekly ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[11px] text-neutral-400">Definir Limite máximo:</span>
                    <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded px-2 py-1 max-w-[140px]">
                      <span className="text-[10px] text-neutral-500 font-bold mr-1">R$</span>
                      <input 
                        type="number" 
                        value={limits.weekly} 
                        onChange={(e) => handleLimitChange("weekly", parseFloat(e.target.value))}
                        className="bg-transparent text-xs font-bold text-white font-mono w-full focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Progress Gauge */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono">
                      <span className="text-neutral-400">
                        Perda atual: <strong className="text-white">R$ {losses.weekly.toFixed(2)}</strong>
                      </span>
                      <span className={weeklyInfo.textClass}>
                        {weeklyInfo.percent}% {weeklyInfo.status === "exceeded" ? "(EXCEDIDO)" : weeklyInfo.status === "warning" ? "(80% ALERTA!)" : ""}
                      </span>
                    </div>
                    <div className="w-full bg-neutral-900 rounded-full h-2 overflow-hidden border border-neutral-800">
                      <div 
                        className={`h-full transition-all duration-350 ${weeklyInfo.colorClass}`}
                        style={{ width: `${weeklyInfo.percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-neutral-500 italic">Limite semanal desativado.</p>
              )}
            </div>

            {/* MONTHLY LIMIT */}
            <div className="bg-neutral-950/40 border border-neutral-850 rounded-lg p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-xs font-bold text-white uppercase font-mono">Limite Mensal de Perdas</span>
                </div>
                <label className="relative inline-flex inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={limits.enabledMonthly} 
                    onChange={() => handleToggle("enabledMonthly")} 
                    className="sr-only peer"
                  />
                  <div className="w-7 h-4 bg-neutral-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-neutral-400 after:border-neutral-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-green-500 peer-checked:after:bg-neutral-950 peer-checked:after:border-transparent"></div>
                </label>
              </div>

              {limits.enabledMonthly ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[11px] text-neutral-400">Definir Limite máximo:</span>
                    <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded px-2 py-1 max-w-[140px]">
                      <span className="text-[10px] text-neutral-500 font-bold mr-1">R$</span>
                      <input 
                        type="number" 
                        value={limits.monthly} 
                        onChange={(e) => handleLimitChange("monthly", parseFloat(e.target.value))}
                        className="bg-transparent text-xs font-bold text-white font-mono w-full focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Progress Gauge */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono">
                      <span className="text-neutral-400">
                        Perda atual: <strong className="text-white">R$ {losses.monthly.toFixed(2)}</strong>
                      </span>
                      <span className={monthlyInfo.textClass}>
                        {monthlyInfo.percent}% {monthlyInfo.status === "exceeded" ? "(EXCEDIDO)" : monthlyInfo.status === "warning" ? "(80% ALERTA!)" : ""}
                      </span>
                    </div>
                    <div className="w-full bg-neutral-900 rounded-full h-2 overflow-hidden border border-neutral-800">
                      <div 
                        className={`h-full transition-all duration-350 ${monthlyInfo.colorClass}`}
                        style={{ width: `${monthlyInfo.percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-neutral-500 italic">Limite mensal desativado.</p>
              )}
            </div>

          </div>
        )}

        {/* 2. RESPONSIBLE GAMING TIPS */}
        {activeTab === "responsible" && (
          <div className="space-y-3.5 text-xs text-neutral-300 leading-relaxed">
            <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-800 space-y-2.5">
              <h4 className="font-bold text-white flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
                <UserCheck className="w-4 h-4 text-green-400" /> Filosofia Jogo Responsável BetVision
              </h4>
              <p className="text-neutral-400 text-[11px]">
                Acreditamos que a inteligência artificial deve apoiar decisões racionais e matemáticas. A gestão estrita de banca e perdas é o pilar mais importante para garantir lucros sustentáveis a longo prazo e afastar impulsos emocionais.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-neutral-950/40 border border-neutral-850 rounded-lg p-3 space-y-1">
                <span className="text-[10px] font-mono font-bold text-green-400 block">DICA 01</span>
                <span className="font-semibold text-white block">Nunca persiga perdas</span>
                <span className="text-[10px] text-neutral-400 block">Se atingiu o seu limite estabelecido para o dia, encerre as operações. O mercado de amanhã sempre trará novas oportunidades bem analisadas.</span>
              </div>
              <div className="bg-neutral-950/40 border border-neutral-850 rounded-lg p-3 space-y-1">
                <span className="text-[10px] font-mono font-bold text-green-400 block">DICA 02</span>
                <span className="font-semibold text-white block">Use a Kelly da IA</span>
                <span className="text-[10px] text-neutral-400 block">Aplique sempre a recomendação de Stake calculada automaticamente pela nossa Gestão de Banca em seus bilhetes de apostas.</span>
              </div>
            </div>

            <div className="bg-neutral-950/40 p-3 rounded-lg border border-neutral-850 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-[10px] text-neutral-400">
                Precisa de uma pausa total? Você pode ativar o <strong className="text-white">Auto-Exclusão</strong> ou limitar temporariamente o depósito entrando em contato com a equipe de suporte simulado do applet.
              </span>
            </div>
          </div>
        )}

        {/* 3. SIMULATOR OF LOSSES (TEST THE TRIGGER OR RESET) */}
        {activeTab === "history" && (
          <div className="space-y-4">
            <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-800 space-y-3">
              <h4 className="font-bold text-white uppercase text-[10px] tracking-wider font-mono">
                Simulador de Teste Rápido
              </h4>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Use os botões de ação rápida abaixo para simular perdas e ver os alertas de segurança do motor BetVision em ação instantaneamente.
              </p>

              <div className="grid grid-cols-3 gap-2 pt-1">
                <button
                  onClick={() => {
                    onSimulateLoss(50, "daily");
                    showTempSuccess("✓ Simulação: Incorreu em perda de R$ 50 diários");
                  }}
                  className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 font-mono text-[10px] py-1.5 rounded active:scale-95 transition-all"
                >
                  + R$ 50 Diário
                </button>
                <button
                  onClick={() => {
                    onSimulateLoss(150, "daily");
                    showTempSuccess("✓ Simulação: Incorreu em perda de R$ 150 diários");
                  }}
                  className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 font-mono text-[10px] py-1.5 rounded active:scale-95 transition-all"
                >
                  + R$ 150 Diário
                </button>
                <button
                  onClick={() => {
                    onSimulateLoss(500, "daily");
                    showTempSuccess("✓ Simulação: Incorreu em perda de R$ 500 diários");
                  }}
                  className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 font-mono text-[10px] py-1.5 rounded active:scale-95 transition-all"
                >
                  + R$ 500 Diário
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1 border-t border-neutral-850 pt-3">
                <div className="space-y-1">
                  <span className="text-[9px] text-neutral-500 block">Outros períodos</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        onSimulateLoss(200, "weekly");
                        showTempSuccess("✓ Simulação: Incorreu em perda de R$ 200 semanais");
                      }}
                      className="flex-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 font-mono text-[9px] py-1 rounded"
                    >
                      + R$ 200 Semanal
                    </button>
                    <button
                      onClick={() => {
                        onSimulateLoss(500, "monthly");
                        showTempSuccess("✓ Simulação: Incorreu em perda de R$ 500 mensais");
                      }}
                      className="flex-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 font-mono text-[9px] py-1 rounded"
                    >
                      + R$ 500 Mensal
                    </button>
                  </div>
                </div>

                <div className="space-y-1 flex flex-col justify-end">
                  <button
                    onClick={() => {
                      onResetSimulatedLosses();
                      showTempSuccess("✓ Todas as perdas simuladas foram zeradas!");
                    }}
                    className="w-full bg-red-950/40 hover:bg-red-900/40 border border-red-900/30 hover:border-red-500/30 text-red-400 font-bold font-mono text-[10px] py-1.5 rounded flex items-center justify-center gap-1 mt-auto"
                  >
                    <RefreshCw className="w-3 h-3" /> Zerar Simulação
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-neutral-950/40 p-3 rounded-lg border border-neutral-850 text-[10px] text-neutral-400 space-y-1 leading-relaxed">
              <span className="font-bold text-white block">Como testar:</span>
              <p>1. Ative o Limite Diário de Perdas com o valor padrão de R$ 500,00.</p>
              <p>2. Clique em "+ R$ 150 Diário" algumas vezes para subir o acumulado.</p>
              <p>3. Ao passar de <strong className="text-amber-400">R$ 400,00 (80%)</strong>, um alerta de notificação instantâneo surgirá na tela e no centro de notificações!</p>
              <p>4. Ao passar de <strong className="text-red-400">R$ 500,00 (100%)</strong>, o alerta de bloqueio será disparado e a emissão de bilhetes ficará inacessível.</p>
            </div>
          </div>
        )}

      </div>

      {/* FOOTER */}
      <div className="p-4 bg-neutral-950 border-t border-neutral-850 shrink-0 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1.5 text-neutral-400">
          <ShieldAlert className="w-4 h-4 text-green-500" />
          <span>Autogestão de Risco v1.0</span>
        </div>
        <button
          onClick={onClose}
          className="bg-green-500 hover:bg-green-400 text-black font-bold px-4 py-1.5 rounded transition-all active:scale-95"
        >
          Confirmar e Salvar
        </button>
      </div>

    </div>
  );
};
