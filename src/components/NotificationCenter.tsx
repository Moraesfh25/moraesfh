import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { 
  Bell, 
  BellOff, 
  X, 
  Check, 
  Activity, 
  TrendingUp, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Trash2, 
  Info,
  Award
} from "lucide-react";

export interface MockNotification {
  id: string;
  title: string;
  message: string;
  type: "goal" | "probability" | "status" | "info";
  timestamp: string;
  read: boolean;
}

interface NotificationCenterProps {
  notifications: MockNotification[];
  isMuted: boolean;
  onClearAll: () => void;
  onToggleMute: () => void;
  onRemoveNotification: (id: string) => void;
  onTestNotification: (type: "goal" | "probability" | "status" | "info") => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  isMuted,
  onClearAll,
  onToggleMute,
  onRemoveNotification,
  onTestNotification,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative" id="notification-center-root">
      {/* Bell Launcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-lg border transition-all ${
          isOpen 
            ? "bg-green-500/10 border-green-500 text-green-400" 
            : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700"
        }`}
        title="Central de Notificações IA"
        id="bell-launcher"
      >
        {isMuted ? (
          <BellOff className="w-5 h-5" />
        ) : (
          <Bell className={`w-5 h-5 ${unreadCount > 0 ? "animate-swing" : ""}`} />
        )}
        
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse border border-neutral-950">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop to close */}
            <div 
              className="fixed inset-0 z-40 cursor-default" 
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-neutral-900/98 border border-neutral-800 rounded-xl shadow-2xl z-50 overflow-hidden backdrop-blur-md"
              id="notification-dropdown"
            >
              {/* Header */}
              <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-green-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Radar de Eventos IA
                  </span>
                </div>
                
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={onToggleMute}
                    className="p-1 rounded text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800 transition-all"
                    title={isMuted ? "Ativar Chime" : "Mutar Chime"}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  {notifications.length > 0 && (
                    <button
                      onClick={onClearAll}
                      className="p-1 rounded text-red-500 hover:text-red-400 hover:bg-neutral-800 transition-all"
                      title="Limpar Histórico"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Test Notification Simulator Controls */}
              <div className="p-3 bg-neutral-950 border-b border-neutral-800/60">
                <p className="text-[10px] text-neutral-400 uppercase font-mono tracking-wider mb-2">
                  Simular Eventos Críticos (Favoritos)
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => onTestNotification("goal")}
                    className="bg-neutral-900 border border-neutral-800 hover:border-green-500/30 text-[10px] text-neutral-300 hover:text-green-400 p-1.5 rounded text-left flex items-center gap-1.5 transition-all"
                  >
                    <Award className="w-3 h-3 text-green-500 shrink-0" />
                    <span>⚽ Gol no Jogo</span>
                  </button>
                  <button
                    onClick={() => onTestNotification("probability")}
                    className="bg-neutral-900 border border-neutral-800 hover:border-blue-500/30 text-[10px] text-neutral-300 hover:text-blue-400 p-1.5 rounded text-left flex items-center gap-1.5 transition-all"
                  >
                    <TrendingUp className="w-3 h-3 text-blue-400 shrink-0" />
                    <span>📈 Probabilidades</span>
                  </button>
                  <button
                    onClick={() => onTestNotification("status")}
                    className="bg-neutral-900 border border-neutral-800 hover:border-amber-500/30 text-[10px] text-neutral-300 hover:text-amber-400 p-1.5 rounded text-left flex items-center gap-1.5 transition-all"
                  >
                    <Activity className="w-3 h-3 text-amber-500 shrink-0" />
                    <span>⏱️ Fim de Jogo</span>
                  </button>
                  <button
                    onClick={() => onTestNotification("info")}
                    className="bg-neutral-900 border border-neutral-800 hover:border-purple-500/30 text-[10px] text-neutral-300 hover:text-purple-400 p-1.5 rounded text-left flex items-center gap-1.5 transition-all"
                  >
                    <Sparkles className="w-3 h-3 text-purple-400 shrink-0" />
                    <span>💡 Oportunidade</span>
                  </button>
                </div>
              </div>

              {/* Body / Notification List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-neutral-800/50">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-neutral-500">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    <p className="text-xs">Nenhum evento registrado no radar.</p>
                    <p className="text-[10px] text-neutral-600 mt-1">
                      Favorite partidas para monitorar gols, oscilações de probabilidade e status em tempo real.
                    </p>
                  </div>
                ) : (
                  notifications.map((notif) => {
                    let typeColor = "text-green-400 bg-green-500/10 border-green-500/20";
                    let Icon = Award;
                    if (notif.type === "probability") {
                      typeColor = "text-blue-400 bg-blue-500/10 border-blue-500/20";
                      Icon = TrendingUp;
                    } else if (notif.type === "status") {
                      typeColor = "text-amber-400 bg-amber-500/10 border-amber-500/20";
                      Icon = Activity;
                    } else if (notif.type === "info") {
                      typeColor = "text-purple-400 bg-purple-500/10 border-purple-500/20";
                      Icon = Sparkles;
                    }

                    return (
                      <div 
                        key={notif.id} 
                        className={`p-3.5 hover:bg-neutral-850/30 transition-all relative flex gap-3 ${
                          !notif.read ? "bg-green-500/3 border-l-2 border-green-500" : ""
                        }`}
                      >
                        {/* Event icon indicator */}
                        <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${typeColor}`}>
                          <Icon className="w-4 h-4" />
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <h4 className="text-xs font-bold text-neutral-200 truncate pr-4">
                              {notif.title}
                            </h4>
                            <span className="text-[9px] text-neutral-500 font-mono shrink-0">
                              {notif.timestamp}
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-400 leading-relaxed">
                            {notif.message}
                          </p>
                        </div>

                        {/* Individual clear */}
                        <button
                          onClick={() => onRemoveNotification(notif.id)}
                          className="text-neutral-600 hover:text-neutral-400 p-0.5 shrink-0 hover:bg-neutral-800 rounded self-start"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="p-2.5 text-center bg-neutral-950/60 border-t border-neutral-800 text-[10px] text-neutral-500 font-mono">
                Monitorando {notifications.length} eventos ativos
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- MOCK PUSH NOTIFICATION TOAST WRAPPER ---
export interface ActiveToast {
  id: string;
  title: string;
  message: string;
  type: "goal" | "probability" | "status" | "info";
  timestamp: string;
}

interface ToastContainerProps {
  toasts: ActiveToast[];
  onClose: (id: string) => void;
}

export const PushNotificationToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  return (
    <div className="fixed top-4 right-4 z-50 pointer-events-none flex flex-col gap-2.5 w-96 max-w-[calc(100vw-2rem)]">
      <AnimatePresence>
        {toasts.map((toast) => {
          let badgeColor = "bg-green-500 text-black";
          let borderColor = "border-green-500/40 shadow-green-950/25";
          let Icon = Award;
          
          if (toast.type === "probability") {
            badgeColor = "bg-blue-500 text-white";
            borderColor = "border-blue-500/40 shadow-blue-950/25";
            Icon = TrendingUp;
          } else if (toast.type === "status") {
            badgeColor = "bg-amber-500 text-black";
            borderColor = "border-amber-500/40 shadow-amber-950/25";
            Icon = Activity;
          } else if (toast.type === "info") {
            badgeColor = "bg-purple-500 text-white";
            borderColor = "border-purple-500/40 shadow-purple-950/25";
            Icon = Sparkles;
          }

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className={`pointer-events-auto bg-neutral-900/98 border ${borderColor} rounded-xl shadow-2xl p-4 flex gap-3 relative overflow-hidden backdrop-blur-md`}
              id={`push-toast-${toast.id}`}
            >
              {/* Chrome/OS mock notification style banner */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-neutral-800">
                {/* Visual indicator bar */}
                <motion.div 
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 5.0, ease: "linear" }}
                  className={`h-full ${badgeColor.split(" ")[0]}`}
                />
              </div>

              {/* Icon badge */}
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${badgeColor}`}>
                <Icon className="w-5 h-5" />
              </div>

              {/* Text content */}
              <div className="flex-1 min-w-0 pr-4 mt-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[9px] bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-400 font-mono tracking-wider font-bold">
                    BETVISION PRO
                  </span>
                  <span className="text-[9px] text-neutral-500 font-mono">
                    agora
                  </span>
                </div>
                <h3 className="text-xs font-bold text-white mb-0.5 leading-snug">
                  {toast.title}
                </h3>
                <p className="text-[11px] text-neutral-300 leading-relaxed font-sans">
                  {toast.message}
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={() => onClose(toast.id)}
                className="absolute top-2.5 right-2.5 text-neutral-500 hover:text-white hover:bg-neutral-800 p-1 rounded-md transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
