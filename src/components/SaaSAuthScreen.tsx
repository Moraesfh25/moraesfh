import React, { useState } from "react";
import { ShieldCheck, Mail, Lock, User, Github, Sparkles, AlertTriangle, ArrowRight } from "lucide-react";

interface SaaSAuthScreenProps {
  onLoginSuccess: (user: {
    name: string;
    email: string;
    plan: "Free" | "Pro" | "VIP" | "Enterprise";
    avatar: string;
  }) => void;
  addLog: (action: string, user: string, status: "success" | "warning" | "error") => void;
}

export const SaaSAuthScreen: React.FC<SaaSAuthScreenProps> = ({ onLoginSuccess, addLog }) => {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [acceptedLgpd, setAcceptedLgpd] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  
  // Loading animations
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [recoverySent, setRecoverySent] = useState(false);

  const handleOAuthLogin = (provider: "google" | "github") => {
    setIsLoading(true);
    setLoadingMsg(`Conectando com o ${provider === "google" ? "Google" : "GitHub"} OAuth...`);
    
    setTimeout(() => {
      setLoadingMsg("Autenticando token JWT seguro...");
      setTimeout(() => {
        const dummyUser = {
          name: provider === "google" ? "Felipe Pires" : "felipe-moraes-dev",
          email: "fjosemoraescx@gmail.com",
          plan: "Free" as const,
          avatar: provider === "google" 
            ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop"
            : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop"
        };
        addLog(`LOGIN_OAUTH_${provider.toUpperCase()}_SUCCESS`, dummyUser.email, "success");
        onLoginSuccess(dummyUser);
        setIsLoading(false);
      }, 1000);
    }, 1000);
  };

  const handleMagicLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      alert("Informe seu e-mail para receber o link.");
      return;
    }
    setIsLoading(true);
    setLoadingMsg("Gerando Token Magic Link de sessão única...");
    
    setTimeout(() => {
      setLoadingMsg(`Link criptografado enviado para ${email}!`);
      setTimeout(() => {
        const dummyUser = {
          name: "Felipe Pires",
          email: email,
          plan: "Free" as const,
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop"
        };
        addLog("LOGIN_MAGIC_LINK_TOKEN_EXCHANGED", email, "success");
        onLoginSuccess(dummyUser);
        setIsLoading(false);
      }, 1500);
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedLgpd) {
      alert("Para continuar, você precisa aceitar os Termos e Política de Privacidade conforme a LGPD.");
      return;
    }

    setIsLoading(true);
    setLoadingMsg("Verificando credenciais de acesso...");
    
    setTimeout(() => {
      if (activeTab === "login") {
        const dummyUser = {
          name: "Felipe Pires",
          email: email || "fjosemoraescx@gmail.com",
          plan: "Free" as const,
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop"
        };
        addLog("LOGIN_EMAIL_PASSWORD_SUCCESS", dummyUser.email, "success");
        onLoginSuccess(dummyUser);
      } else {
        const dummyUser = {
          name: name || "Novo Assinante",
          email: email,
          plan: "Free" as const,
          avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop"
        };
        addLog("REGISTRATION_EMAIL_PASSWORD_SUCCESS", email, "success");
        onLoginSuccess(dummyUser);
      }
      setIsLoading(false);
    }, 1500);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      alert("Por favor, preencha o campo de e-mail.");
      return;
    }
    setIsLoading(true);
    setLoadingMsg("Buscando usuário no banco de dados...");
    setTimeout(() => {
      setLoadingMsg("Enviando token de redefinição...");
      setTimeout(() => {
        setIsLoading(false);
        setRecoverySent(true);
        addLog("PASSWORD_RECOVERY_EMAIL_SENT", email, "warning");
      }, 1000);
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full bg-neutral-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Immersive background glow elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main card */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl max-w-md w-full p-6 md:p-8 space-y-6 shadow-2xl relative backdrop-blur-md animate-scale-up">
        
        {/* Loading Overlay Screen */}
        {isLoading && (
          <div className="absolute inset-0 bg-neutral-900/98 z-30 flex flex-col items-center justify-center text-center p-6 space-y-4 rounded-2xl animate-fade-in">
            <div className="w-10 h-10 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin"></div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Autenticação Segura SSL</h4>
            <p className="text-[11px] text-neutral-400 font-mono animate-pulse max-w-xs leading-relaxed">
              {loadingMsg}
            </p>
          </div>
        )}

        {/* Brand logo details */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-green-500 text-black font-extrabold text-lg shadow-md mb-2">
            BV
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight uppercase">
            BETVISION<span className="text-green-500">PRO</span>
          </h2>
          <p className="text-xs text-neutral-400 max-w-xs mx-auto">
            Acesso ao motor cognitivo preditivo de maior precisão matemática do futebol brasileiro e mundial.
          </p>
        </div>

        {isForgotPassword ? (
          /* PASSWORD RECOVERY SCREEN */
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Recuperação de Senha</h3>
            {recoverySent ? (
              <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-850 text-center space-y-3">
                <div className="w-10 h-10 bg-green-500/10 border border-green-500/25 text-green-400 rounded-full flex items-center justify-center mx-auto">
                  <Mail className="w-5 h-5" />
                </div>
                <p className="text-xs text-neutral-300">Link de redefinição enviado com sucesso para <strong className="text-white">{email}</strong>.</p>
                <p className="text-[10px] text-neutral-500 leading-normal">
                  Verifique sua caixa de entrada, spam ou lixo eletrônico. O link é válido por 15 minutos.
                </p>
                <button
                  onClick={() => {
                    setIsForgotPassword(false);
                    setRecoverySent(false);
                  }}
                  className="w-full bg-neutral-800 hover:bg-neutral-750 text-white text-xs font-bold py-2 rounded-lg transition-all border border-neutral-700"
                >
                  Voltar para o Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4 text-xs">
                <p className="text-[11px] text-neutral-400 leading-normal">
                  Informe o endereço de e-mail associado à sua conta. Enviaremos um link seguro para cadastrar uma nova senha.
                </p>
                <div className="space-y-1">
                  <label className="text-neutral-400 font-semibold">Seu E-mail</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-600" />
                    <input
                      type="email"
                      required
                      placeholder="exemplo@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-neutral-950 border border-neutral-800 rounded py-2 px-3 pl-9 text-white focus:outline-none focus:border-green-500/40 w-full"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-green-500 hover:bg-green-400 text-black font-extrabold py-2.5 rounded-lg text-xs transition-all uppercase tracking-wider"
                >
                  Enviar Link de Recuperação
                </button>
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(false)}
                  className="w-full text-center text-neutral-400 hover:text-white transition-all text-[11px] font-semibold underline"
                >
                  Cancelar e Voltar
                </button>
              </form>
            )}
          </div>
        ) : (
          /* STANDARD LOGIN / REGISTER SCREEN */
          <div className="space-y-5">
            {/* Sliding Tabs */}
            <div className="flex bg-neutral-950 border border-neutral-850 p-1 rounded-xl">
              <button
                onClick={() => { setActiveTab("login"); }}
                className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all uppercase ${
                  activeTab === "login" ? "bg-neutral-800 text-white shadow-md" : "text-neutral-400 hover:text-white"
                }`}
              >
                Login
              </button>
              <button
                onClick={() => { setActiveTab("register"); }}
                className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all uppercase ${
                  activeTab === "register" ? "bg-neutral-800 text-white shadow-md" : "text-neutral-400 hover:text-white"
                }`}
              >
                Criar Conta
              </button>
            </div>

            {/* Standard Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {activeTab === "register" && (
                <div className="space-y-1">
                  <label className="text-neutral-400 font-semibold">Nome Completo</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-600" />
                    <input
                      type="text"
                      required
                      placeholder="Ex: Felipe Pires"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-neutral-950 border border-neutral-800 rounded py-2.5 px-3 pl-9 text-white focus:outline-none focus:border-green-500/40 w-full font-semibold"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-neutral-400 font-semibold">E-mail Corporativo ou Pessoal</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-600" />
                  <input
                    type="email"
                    required
                    placeholder="fjosemoraescx@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-neutral-950 border border-neutral-800 rounded py-2.5 px-3 pl-9 text-white focus:outline-none focus:border-green-500/40 w-full font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-neutral-400 font-semibold">Senha Secreta</label>
                  {activeTab === "login" && (
                    <button
                      type="button"
                      onClick={() => setIsForgotPassword(true)}
                      className="text-[10px] text-green-500 hover:text-green-400 underline font-semibold"
                    >
                      Esqueci a Senha
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-600" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-neutral-950 border border-neutral-800 rounded py-2.5 px-3 pl-9 text-white focus:outline-none focus:border-green-500/40 w-full font-mono"
                  />
                </div>
              </div>

              {/* LGPD Consent */}
              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="lgpd-consent"
                  checked={acceptedLgpd}
                  onChange={(e) => setAcceptedLgpd(e.checked ?? e.target.checked)}
                  className="mt-0.5 rounded border-neutral-800 bg-neutral-950 text-green-500 focus:ring-green-500"
                />
                <label htmlFor="lgpd-consent" className="text-[10px] text-neutral-500 leading-normal cursor-pointer select-none">
                  Declaro que concordo com os <strong className="text-neutral-400 underline hover:text-white transition-all">Termos de Uso</strong> e <strong className="text-neutral-400 underline hover:text-white transition-all">Políticas de Privacidade</strong> em total conformidade com a LGPD (Lei Geral de Proteção de Dados).
                </label>
              </div>

              {/* Submit triggers */}
              <div className="space-y-2 pt-2">
                <button
                  type="submit"
                  className="w-full bg-green-500 hover:bg-green-400 text-black font-extrabold py-3 rounded-xl text-xs transition-all tracking-wider shadow-lg uppercase flex items-center justify-center gap-1.5"
                >
                  <span>{activeTab === "login" ? "Entrar na Minha Conta" : "Cadastrar Minha Conta"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleMagicLink}
                  className="w-full bg-neutral-950 border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/60 text-neutral-300 font-bold py-2.5 rounded-lg text-xs transition-all uppercase tracking-wide flex items-center justify-center gap-1.5"
                >
                  <Mail className="w-4 h-4 text-green-400" />
                  <span>Entrar com Magic Link</span>
                </button>
              </div>
            </form>

            {/* Separator */}
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-neutral-800"></div>
              <span className="flex-shrink mx-3 text-[10px] text-neutral-500 uppercase tracking-widest font-mono">Ou entre com</span>
              <div className="flex-grow border-t border-neutral-800"></div>
            </div>

            {/* Third Party OAuth */}
            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <button
                onClick={() => handleOAuthLogin("google")}
                className="bg-neutral-950 border border-neutral-800 hover:border-neutral-750 hover:bg-neutral-900/60 text-neutral-300 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all"
              >
                {/* Simulated Google Brand Logo icon */}
                <span className="w-3.5 h-3.5 flex items-center justify-center font-bold text-red-500 bg-white rounded-full text-[9px] select-none font-sans leading-none shrink-0 border border-neutral-200">G</span>
                <span>Google</span>
              </button>
              <button
                onClick={() => handleOAuthLogin("github")}
                className="bg-neutral-950 border border-neutral-800 hover:border-neutral-750 hover:bg-neutral-900/60 text-neutral-300 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all"
              >
                <Github className="w-4 h-4 text-white shrink-0" />
                <span>GitHub</span>
              </button>
            </div>
          </div>
        )}

        <div className="text-center text-[9px] text-neutral-500 flex items-center justify-center gap-1 bg-neutral-950/40 p-2 rounded-lg border border-neutral-850/30">
          <ShieldCheck className="w-4 h-4 text-green-500" />
          <span>Sua sessão é protegida por criptografia de ponta a ponta.</span>
        </div>

      </div>
    </div>
  );
};
