import React, { useState, useEffect } from "react";
import { X, Award, Check, ShieldCheck, CreditCard, Sparkles, TrendingUp, Zap, Clock, Copy, Landmark } from "lucide-react";

interface PremiumSaaSModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: {
    name: string;
    email: string;
    plan: "Free" | "Pro" | "VIP" | "Enterprise";
    avatar: string;
  } | null;
  onPlanActivated: (newPlan: "Free" | "Pro" | "VIP" | "Enterprise") => void;
  addLog: (action: string, user: string, status: "success" | "warning" | "error") => void;
  addNotification: (title: string, message: string, type: "goal" | "probability" | "status" | "info") => void;
}

export const PremiumSaaSModal: React.FC<PremiumSaaSModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onPlanActivated,
  addLog,
  addNotification
}) => {
  if (!isOpen) return null;

  // Selected plan state
  const [selectedPlan, setSelectedPlan] = useState<"Pro" | "VIP" | "Enterprise">("VIP");
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "semiannual">("monthly");
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "card">("pix");
  
  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; isPercentage: boolean } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

  // Card Form State
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  // PIX State
  const [pixTimeLeft, setPixTimeLeft] = useState(10);
  const [copiedPix, setCopiedPix] = useState(false);

  // Transaction States
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Price plans mapping
  const prices = {
    Pro: { monthly: 29.90, semiannual: 119.40 }, // semiannual saves 33%
    VIP: { monthly: 49.90, semiannual: 199.90 },
    Enterprise: { monthly: 99.90, semiannual: 399.90 }
  };

  const getPrice = () => {
    return prices[selectedPlan][billingPeriod];
  };

  const getDiscountedPrice = () => {
    const base = getPrice();
    if (!appliedCoupon) return base;
    if (appliedCoupon.isPercentage) {
      return Math.max(0, base - (base * appliedCoupon.discount) / 100);
    } else {
      return Math.max(0, base - appliedCoupon.discount);
    }
  };

  // Detect card brand based on starting digit
  const getCardBrand = () => {
    if (cardNumber.startsWith("4")) return "Visa";
    if (cardNumber.startsWith("5")) return "Mastercard";
    if (cardNumber.startsWith("3")) return "Amex";
    if (cardNumber.startsWith("6")) return "Elo";
    return "Unknown";
  };

  const handleApplyCoupon = () => {
    setCouponError("");
    setCouponSuccess("");
    const code = couponCode.trim().toUpperCase();

    if (!code) {
      setCouponError("Informe um cupom válido.");
      return;
    }

    if (code === "VIP100") {
      setAppliedCoupon({ code, discount: 100, isPercentage: true });
      setCouponSuccess("Cupom de 100% de desconto aplicado!");
    } else if (code === "VISION30") {
      setAppliedCoupon({ code, discount: 30, isPercentage: true });
      setCouponSuccess("Cupom de 30% de desconto aplicado!");
    } else if (code === "SAAS50") {
      setAppliedCoupon({ code, discount: 50, isPercentage: true });
      setCouponSuccess("Cupom de 50% de desconto aplicado!");
    } else {
      setCouponError("Cupom inválido ou expirado.");
    }
  };

  // Auto-simulate PIX confirmation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen && paymentMethod === "pix" && isProcessing && !isSuccess) {
      timer = setInterval(() => {
        setPixTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            completePayment();
            return 0;
          }
          return prev - 1;
        });
      }, 300); // Fast simulation
    }
    return () => clearInterval(timer);
  }, [isOpen, paymentMethod, isProcessing, isSuccess]);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Format card number with spaces
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 16) val = val.slice(0, 16);
    const formatted = val.replace(/(\d{4})/g, "$1 ").trim();
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 4) val = val.slice(0, 4);
    if (val.length >= 2) {
      setCardExpiry(val.slice(0, 2) + "/" + val.slice(2));
    } else {
      setCardExpiry(val);
    }
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 4) val = val.slice(0, 4);
    setCardCvc(val);
  };

  const handleStartCheckout = () => {
    if (paymentMethod === "card") {
      if (cardNumber.length < 15 || cardCvc.length < 3 || !cardName || !cardExpiry) {
        alert("Por favor, preencha todos os campos do cartão corretamente.");
        return;
      }
    }

    setIsProcessing(true);
    setPixTimeLeft(10);
    
    if (paymentMethod === "card") {
      setProcessingStep("Contatando operadora do cartão...");
      setTimeout(() => {
        setProcessingStep("Autenticando transação anti-fraude...");
        setTimeout(() => {
          setProcessingStep("Confirmando liquidação...");
          setTimeout(() => {
            completePayment();
          }, 600);
        }, 600);
      }, 600);
    } else {
      setProcessingStep("Gerando Chave de Pagamento PIX Copia e Cola...");
    }
  };

  const completePayment = () => {
    setIsProcessing(false);
    setIsSuccess(true);
    onPlanActivated(selectedPlan);

    // Logs & notifications
    addLog(`ASSINATURA_ATIVA_PLANO_${selectedPlan.toUpperCase()}`, currentUser?.name || "USUARIO", "success");
    addNotification(
      "👑 Assinatura Ativa!",
      `Parabéns! Seu plano ${selectedPlan} foi ativado com sucesso. Aproveite todos os recursos premium liberados!`,
      "info"
    );

    // CSS Confetti trigger simulated
    setTimeout(() => {
      onClose();
      // reset states
      setIsSuccess(false);
      setAppliedCoupon(null);
      setCouponCode("");
      setCardNumber("");
      setCardName("");
      setCardExpiry("");
      setCardCvc("");
    }, 2500);
  };

  const copyPixPayload = () => {
    const payload = `00020101021226870014br.gov.bcb.pix2565betvisionprosascheckout${getPrice().toFixed(2)}5204000053039865405${getPrice().toFixed(2)}5802BR5915BetVisionPro6008SaoPaulo62070503***6304`;
    navigator.clipboard.writeText(payload);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-neutral-950/85 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-4xl w-full flex flex-col md:flex-row overflow-hidden shadow-2xl relative my-8 animate-scale-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 hover:bg-neutral-800 rounded-full text-neutral-400 hover:text-white transition-all z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Panel - Pricing Plans */}
        <div className="w-full md:w-1/2 p-6 md:p-8 bg-neutral-950/40 border-r border-neutral-800 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-xs font-bold font-mono">
              <Sparkles className="w-3.5 h-3.5" /> PLANOS RECORRENTES SAAS
            </div>
            
            <h3 className="text-xl md:text-2xl font-extrabold text-white leading-tight uppercase tracking-tight">
              Faça o Upgrade do seu <span className="text-green-500">BetVision Pro</span>
            </h3>
            
            <p className="text-xs text-neutral-400 leading-relaxed">
              Escolha o plano ideal para alavancar sua taxa de acerto e obter insights de alta probabilidade baseados em inteligência preditiva profunda de futebol.
            </p>

            {/* Billing Period Selector */}
            <div className="flex bg-neutral-900 border border-neutral-800 p-1 rounded-xl">
              <button
                onClick={() => setBillingPeriod("monthly")}
                className={`flex-1 text-center py-2 text-xs font-semibold rounded-lg transition-all ${
                  billingPeriod === "monthly" ? "bg-neutral-800 text-white shadow-md" : "text-neutral-400 hover:text-white"
                }`}
              >
                Cobrança Mensal
              </button>
              <button
                onClick={() => setBillingPeriod("semiannual")}
                className={`flex-1 text-center py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  billingPeriod === "semiannual" ? "bg-green-500 text-black font-bold shadow-md" : "text-neutral-400 hover:text-white"
                }`}
              >
                Semestral <span className="bg-neutral-950 text-green-400 text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase">-33% OFF</span>
              </button>
            </div>

            {/* Plans List Cards */}
            <div className="space-y-3 pt-2">
              {/* Pro Plan Card */}
              <div
                onClick={() => setSelectedPlan("Pro")}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  selectedPlan === "Pro"
                    ? "bg-green-500/5 border-green-500 shadow"
                    : "bg-neutral-900/60 border-neutral-800 hover:border-neutral-700"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-white flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-green-400" /> PLANO PRO
                  </span>
                  <span className="text-sm font-black text-white font-mono">
                    R$ {prices.Pro[billingPeriod].toFixed(2)}
                  </span>
                </div>
                <p className="text-[10px] text-neutral-400">
                  Acesso a todas as ligas, análises matemáticas básicas e gestão de banca Kelly.
                </p>
              </div>

              {/* VIP Plan Card */}
              <div
                onClick={() => setSelectedPlan("VIP")}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all relative overflow-hidden ${
                  selectedPlan === "VIP"
                    ? "bg-amber-500/5 border-amber-500 shadow-md"
                    : "bg-neutral-900/60 border-neutral-800 hover:border-neutral-700"
                }`}
              >
                <div className="absolute top-0 right-0 bg-amber-500 text-black text-[8px] font-extrabold px-3 py-1 rounded-bl-xl uppercase tracking-wider font-mono">
                  Mais Popular
                </div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-amber-400 flex items-center gap-1.5">
                    <Award className="w-4 h-4" /> PLANO VIP GOLD
                  </span>
                  <span className="text-sm font-black text-white font-mono">
                    R$ {prices.VIP[billingPeriod].toFixed(2)}
                  </span>
                </div>
                <p className="text-[10px] text-neutral-400">
                  Previsões avançadas (escanteios, cartões), Super Múltiplas e Chat Pro IA consultivo.
                </p>
              </div>

              {/* Enterprise Plan Card */}
              <div
                onClick={() => setSelectedPlan("Enterprise")}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  selectedPlan === "Enterprise"
                    ? "bg-purple-500/5 border-purple-500 shadow"
                    : "bg-neutral-900/60 border-neutral-800 hover:border-neutral-700"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-purple-400 flex items-center gap-1.5">
                    <Zap className="w-4 h-4" /> ENTERPRISE DEV
                  </span>
                  <span className="text-sm font-black text-white font-mono">
                    R$ {prices.Enterprise[billingPeriod].toFixed(2)}
                  </span>
                </div>
                <p className="text-[10px] text-neutral-400">
                  Chaves de API para desenvolvedores, Sinais automatizados no Telegram/WhatsApp e webhooks.
                </p>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-neutral-500 flex items-center gap-1.5 bg-neutral-950 p-2.5 rounded-xl border border-neutral-850/60 leading-snug">
            <ShieldCheck className="w-5 h-5 text-green-500 shrink-0" />
            <span>Cobrança segura recorrente. Cancele com um clique no painel a qualquer momento.</span>
          </div>
        </div>

        {/* Right Panel - Interactive Checkout */}
        <div className="w-full md:w-1/2 p-6 md:p-8 bg-neutral-900 flex flex-col justify-between space-y-6 relative">
          
          {/* Success Overlay Screen */}
          {isSuccess && (
            <div className="absolute inset-0 bg-neutral-900 z-30 flex flex-col items-center justify-center text-center p-6 space-y-4 animate-fade-in">
              <div className="w-16 h-16 bg-green-500/10 border border-green-500/30 text-green-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <Check className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-white uppercase tracking-wider">Upgrade Confirmado!</h4>
              <p className="text-xs text-neutral-400 leading-relaxed max-w-xs">
                Seu plano **{selectedPlan} {billingPeriod === "semiannual" ? "Semestral" : "Mensal"}** foi ativado na sua conta Felipe Pires com sucesso!
              </p>
              <div className="text-[10px] font-mono text-neutral-500 animate-pulse">
                Sincronizando privilégios IA... Redirecionando...
              </div>
            </div>
          )}

          {/* Processing Steps Loading Overlay */}
          {isProcessing && paymentMethod === "card" && (
            <div className="absolute inset-0 bg-neutral-900/95 backdrop-blur-xs z-20 flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-10 h-10 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin"></div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Processando Gateway de Pagamento</h4>
              <p className="text-[11px] text-neutral-400 font-mono animate-pulse">
                {processingStep}
              </p>
            </div>
          )}

          <div className="space-y-4 flex-1">
            <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider font-mono">
              Resumo da Fatura & Checkout
            </h4>

            {/* Billing breakdown */}
            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-850 text-xs space-y-2">
              <div className="flex justify-between text-neutral-400">
                <span>Plano {selectedPlan} ({billingPeriod === "monthly" ? "Mensal" : "Semestral"})</span>
                <span className="font-mono">R$ {getPrice().toFixed(2)}</span>
              </div>
              
              {appliedCoupon && (
                <div className="flex justify-between text-green-400 font-semibold">
                  <span>Desconto (Cupom: {appliedCoupon.code})</span>
                  <span className="font-mono">
                    -{appliedCoupon.isPercentage ? `${appliedCoupon.discount}%` : `R$ ${appliedCoupon.discount.toFixed(2)}`}
                  </span>
                </div>
              )}

              <div className="border-t border-neutral-800 pt-2 flex justify-between font-bold text-sm text-white">
                <span>TOTAL A PAGAR</span>
                <span className="font-mono text-green-400">R$ {getDiscountedPrice().toFixed(2)}</span>
              </div>
            </div>

            {/* Coupon input field */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider font-mono">Cupom de Desconto</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="EX: VISION30, VIP100"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-700 flex-1 font-semibold uppercase font-mono"
                />
                <button
                  onClick={handleApplyCoupon}
                  className="bg-neutral-800 hover:bg-neutral-700 text-xs font-bold px-3 py-1.5 rounded text-neutral-300 hover:text-white border border-neutral-700 hover:border-neutral-600 transition-all uppercase"
                >
                  Aplicar
                </button>
              </div>
              {couponError && <p className="text-[9px] text-red-400 font-semibold font-mono">{couponError}</p>}
              {couponSuccess && <p className="text-[9px] text-green-400 font-semibold font-mono">{couponSuccess}</p>}
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2 pt-2">
              <label className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider font-mono">Método de Pagamento</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPaymentMethod("pix")}
                  className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    paymentMethod === "pix"
                      ? "bg-green-500/10 border-green-500 text-green-400 shadow-sm"
                      : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white"
                  }`}
                >
                  <Landmark className="w-4 h-4 text-green-500 shrink-0" /> PIX Instantâneo
                </button>
                <button
                  onClick={() => setPaymentMethod("card")}
                  className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    paymentMethod === "card"
                      ? "bg-green-500/10 border-green-500 text-green-400 shadow-sm"
                      : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white"
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-green-500 shrink-0" /> Cartão de Crédito
                </button>
              </div>
            </div>

            {/* Interactive forms depending on method */}
            {paymentMethod === "pix" ? (
              <div className="bg-neutral-950 rounded-xl border border-neutral-850 p-4 flex flex-col items-center justify-center space-y-4 text-center">
                
                {isProcessing ? (
                  <div className="py-2 space-y-3.5 w-full">
                    <div className="relative w-28 h-28 mx-auto bg-white rounded-lg p-2.5 flex items-center justify-center shadow-lg border border-neutral-800 overflow-hidden">
                      {/* Fake pixel QR layout */}
                      <div className="w-full h-full bg-neutral-900/5 grid grid-cols-6 gap-0.5 opacity-80">
                        {Array.from({ length: 36 }).map((_, i) => (
                          <div 
                            key={i} 
                            className={`rounded-xs ${
                              i % 3 === 0 || i < 6 || i > 30 || i % 7 === 1 ? "bg-green-600" : "bg-transparent"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="absolute top-0 left-0 right-0 h-1 bg-green-500 animate-slide-scan"></div>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-[11px] text-white font-bold uppercase tracking-wider font-mono">Chave Dinâmica Gerada!</p>
                      <p className="text-[10px] text-neutral-400 leading-normal max-w-xs mx-auto">
                        Abra o app do seu banco, escaneie o código acima ou copie a chave abaixo para pagar via PIX.
                      </p>
                    </div>

                    <div className="flex bg-neutral-900 border border-neutral-800 rounded p-1.5 w-full max-w-xs mx-auto items-center justify-between text-[10px] font-mono text-neutral-400">
                      <span className="truncate pr-2">00020101021226870014br.gov.bcb.pix2565betvision...</span>
                      <button 
                        onClick={copyPixPayload}
                        className="p-1 hover:bg-neutral-800 rounded text-neutral-300 hover:text-white flex items-center gap-1 shrink-0"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copiedPix ? "Copiado!" : "Copiar"}</span>
                      </button>
                    </div>

                    {/* Simulating progress bar */}
                    <div className="w-full max-w-xs mx-auto space-y-1">
                      <div className="flex justify-between text-[9px] text-neutral-500 font-bold font-mono">
                        <span>CONFIRMAÇÃO AUTOMÁTICA</span>
                        <span>AGUARDANDO BANCO... {pixTimeLeft}s</span>
                      </div>
                      <div className="w-full bg-neutral-900 h-1 rounded-full overflow-hidden">
                        <div 
                          className="bg-green-500 h-full transition-all duration-300"
                          style={{ width: `${(pixTimeLeft / 10) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 space-y-3">
                    <div className="w-12 h-12 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full flex items-center justify-center shadow-md">
                      <Landmark className="w-6 h-6 animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-white uppercase tracking-wider">PIX Copia e Cola Seguro</p>
                      <p className="text-[10px] text-neutral-400 max-w-xs leading-normal">
                        A confirmação é imediata. A inteligência artificial ativa seu acesso premium em até 3 segundos após o pagamento.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* CARD SIMULATOR FORM WITH LIVE MOCK CARD UPDATER */
              <div className="space-y-4">
                {/* Visual Glassmorphism Credit Card Wrapper */}
                <div className="relative w-full h-36 bg-gradient-to-tr from-neutral-950 to-neutral-850 border border-neutral-800 rounded-xl p-4 overflow-hidden shadow-xl flex flex-col justify-between font-mono">
                  {/* Visual Background Glow */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-2xl"></div>
                  
                  {isCardFlipped ? (
                    /* CARD BACK (CVV focused) */
                    <div className="h-full flex flex-col justify-between py-2 text-xs">
                      <div className="bg-neutral-800 h-7 w-full -mx-4"></div>
                      <div className="flex items-center justify-end gap-3 pr-2">
                        <span className="text-[9px] text-neutral-500 uppercase">Assinatura Autorizada</span>
                        <div className="bg-white text-neutral-950 font-bold px-2 py-0.5 rounded text-right tracking-widest italic">
                          {cardCvc || "•••"}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* CARD FRONT (Default) */
                    <>
                      <div className="flex justify-between items-start">
                        <div className="space-y-0.5">
                          <p className="text-[8px] text-neutral-500 uppercase tracking-wider">BetVision Pro SaaS Card</p>
                          <div className="w-8 h-6 bg-amber-500/20 border border-amber-500/35 rounded-md flex items-center justify-center">
                            {/* Chip */}
                            <div className="w-5 h-3.5 bg-amber-500/30 rounded border border-amber-500/10"></div>
                          </div>
                        </div>
                        
                        {/* Dynamic Brand Logo Badge */}
                        <div className="text-[10px] font-black uppercase text-neutral-400 font-sans tracking-wide bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded">
                          {getCardBrand() === "Unknown" ? "CREDIT CARD" : getCardBrand()}
                        </div>
                      </div>

                      <p className="text-sm tracking-widest text-white font-bold">
                        {cardNumber || "•••• •••• •••• ••••"}
                      </p>

                      <div className="flex justify-between text-[9px] text-neutral-400">
                        <div>
                          <p className="text-[7px] text-neutral-500 uppercase font-sans">Titular</p>
                          <p className="font-semibold uppercase truncate max-w-[150px]">{cardName || "Nome do Titular"}</p>
                        </div>
                        <div>
                          <p className="text-[7px] text-neutral-500 uppercase font-sans">Válido Até</p>
                          <p className="font-semibold">{cardExpiry || "MM/YY"}</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Input Fields */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1 col-span-2">
                    <label className="text-neutral-400 font-semibold">Número do Cartão</label>
                    <input
                      type="text"
                      placeholder="4000 1234 5678 9010"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      onFocus={() => setIsCardFlipped(false)}
                      className="bg-neutral-950 border border-neutral-800 rounded py-2 px-3 text-white focus:outline-none focus:border-green-500/40 w-full font-mono"
                    />
                  </div>

                  <div className="space-y-1 col-span-2">
                    <label className="text-neutral-400 font-semibold">Nome Impresso no Cartão</label>
                    <input
                      type="text"
                      placeholder="FELIPE P DE ALMEIDA"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      onFocus={() => setIsCardFlipped(false)}
                      className="bg-neutral-950 border border-neutral-800 rounded py-2 px-3 text-white focus:outline-none focus:border-green-500/40 w-full uppercase"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-neutral-400 font-semibold">Validade (MM/AA)</label>
                    <input
                      type="text"
                      placeholder="12/30"
                      value={cardExpiry}
                      onChange={handleExpiryChange}
                      onFocus={() => setIsCardFlipped(false)}
                      className="bg-neutral-950 border border-neutral-800 rounded py-2 px-3 text-white focus:outline-none focus:border-green-500/40 w-full font-mono text-center"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-neutral-400 font-semibold">CVC / Código</label>
                    <input
                      type="text"
                      placeholder="123"
                      value={cardCvc}
                      onChange={handleCvcChange}
                      onFocus={() => setIsCardFlipped(true)}
                      onBlur={() => setIsCardFlipped(false)}
                      className="bg-neutral-950 border border-neutral-800 rounded py-2 px-3 text-white focus:outline-none focus:border-green-500/40 w-full font-mono text-center"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              onClick={
                isProcessing && paymentMethod === "pix"
                  ? completePayment // Instantly finalize PIX simulation for quick test
                  : handleStartCheckout
              }
              className={`w-full bg-green-500 hover:bg-green-400 text-black font-extrabold py-3 rounded-xl text-xs transition-all tracking-wider shadow-lg uppercase ${
                isProcessing && paymentMethod === "pix" ? "animate-pulse" : ""
              }`}
            >
              {isProcessing && paymentMethod === "pix"
                ? "💸 SIMULAR CONFIRMAÇÃO DO BANCO (PIX)"
                : isProcessing
                ? "PROCESSANDO..."
                : appliedCoupon?.discount === 100
                ? "ATIVAR PREMIUM GRÁTIS"
                : `ASSINAR COM ${paymentMethod === "pix" ? "PIX" : "CARTÃO"} AGORA`}
            </button>
            <div className="text-center text-[9px] text-neutral-500 mt-2">
              Plano de simulação demonstrativo. Não serão efetuadas cobranças reais.
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
