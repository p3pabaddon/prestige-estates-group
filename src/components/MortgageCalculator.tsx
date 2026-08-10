import { useState, useMemo } from "react";
import { Calculator, Coins, FileText, CheckCircle2, MessageCircle, Phone, ArrowRight, Info, Percent } from "lucide-react";
import { formatTRY } from "@/lib/crm";

interface MortgageCalculatorProps {
  initialPrice?: number;
  propertyTitle?: string;
  propertyLocation?: string;
  ilanNo?: string;
}

export default function MortgageCalculator({
  initialPrice = 5000000,
  propertyTitle,
  propertyLocation,
  ilanNo,
}: MortgageCalculatorProps) {
  const [activeTab, setActiveTab] = useState<"kredi" | "masraflar">("kredi");

  // Form State
  const [price, setPrice] = useState<number>(initialPrice || 5000000);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(25); // %25
  const [interestRate, setInterestRate] = useState<number>(2.89); // %2.89 aylık faiz
  const [termMonths, setTermMonths] = useState<number>(120); // 10 yıl (120 ay)

  // Calculations
  const downPaymentAmount = useMemo(() => {
    return Math.round((price * downPaymentPercent) / 100);
  }, [price, downPaymentPercent]);

  const loanAmount = useMemo(() => {
    return Math.max(0, price - downPaymentAmount);
  }, [price, downPaymentAmount]);

  // Turkish Mortgage Compound Formula: A = P * [r(1+r)^n] / [(1+r)^n - 1]
  const { monthlyPayment, totalRepayment, totalInterest } = useMemo(() => {
    if (loanAmount <= 0 || interestRate <= 0 || termMonths <= 0) {
      return { monthlyPayment: 0, totalRepayment: 0, totalInterest: 0 };
    }
    const r = interestRate / 100;
    const n = termMonths;
    const factor = Math.pow(1 + r, n);
    const monthly = (loanAmount * (r * factor)) / (factor - 1);
    const total = monthly * n;
    const interest = total - loanAmount;

    return {
      monthlyPayment: Math.round(monthly),
      totalRepayment: Math.round(total),
      totalInterest: Math.round(interest),
    };
  }, [loanAmount, interestRate, termMonths]);

  // Tapu & Devir Masrafları Hesaplamaları
  const deedTaxTotal = useMemo(() => Math.round(price * 0.04), [price]); // %4 Tapu Harcı
  const buyerDeedTax = useMemo(() => Math.round(price * 0.02), [price]); // %2 Alıcı Payı
  const sellerDeedTax = useMemo(() => Math.round(price * 0.02), [price]); // %2 Satıcı Payı
  const revolvingFundFee = 2850; // Döner Sermaye Harcı (Ortalama İstanbul)
  const agentCommission = useMemo(() => Math.round(price * 0.02 * 1.2), [price]); // %2 + %20 KDV
  const appraisalAndInsurance = 9500; // Ekspertiz & DASK tahmini

  const totalFirstExpenses = useMemo(() => {
    return downPaymentAmount + buyerDeedTax + revolvingFundFee + agentCommission + appraisalAndInsurance;
  }, [downPaymentAmount, buyerDeedTax, revolvingFundFee, agentCommission, appraisalAndInsurance]);

  const quickTerms = [
    { label: "1 Yıl (12 Ay)", value: 12 },
    { label: "3 Yıl (36 Ay)", value: 36 },
    { label: "5 Yıl (60 Ay)", value: 60 },
    { label: "10 Yıl (120 Ay)", value: 120 },
  ];

  const quickDownPayments = [15, 20, 25, 35, 50];

  return (
    <div className="bg-card border border-border rounded-lg shadow-xl overflow-hidden">
      {/* Header & Tabs */}
      <div className="border-b border-border bg-secondary/40 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-primary/10 border border-primary/20 text-primary text-xs font-body font-semibold uppercase tracking-wider mb-2">
              <Calculator size={13} /> Finansman & Masraf Rehberi
            </div>
            <h3 className="font-display text-xl sm:text-2xl text-foreground font-semibold">
              Konut Kredisi & Tapu Masrafı Hesaplayıcı
            </h3>
            <p className="text-xs text-muted-foreground font-body mt-1">
              Peşinat, güncel banka faiz oranları ve yasal tapu harçlarını anlık hesaplayın.
            </p>
          </div>

          <div className="flex items-center bg-secondary p-1 rounded-md border border-border self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab("kredi")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-body font-medium rounded transition-all ${
                activeTab === "kredi"
                  ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Coins size={13} /> Kredi Taksiti
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("masraflar")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-body font-medium rounded transition-all ${
                activeTab === "masraflar"
                  ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileText size={13} /> Tapu & Masraflar
            </button>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-8">
        {activeTab === "kredi" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Input Controls */}
            <div className="lg:col-span-7 space-y-6">
              {/* Property Price */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-body uppercase tracking-wider text-muted-foreground font-semibold">
                    Gayrimenkul Fiyatı
                  </label>
                  <span className="font-display text-base font-bold text-foreground">
                    {formatTRY(price)}
                  </span>
                </div>
                <input
                  type="range"
                  min={500000}
                  max={50000000}
                  step={100000}
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              {/* Down Payment (Peşinat) */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-body uppercase tracking-wider text-muted-foreground font-semibold">
                    Peşinat Oranı & Tutarı
                  </label>
                  <span className="font-display text-sm font-bold text-primary">
                    %{downPaymentPercent} ({formatTRY(downPaymentAmount)})
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  {quickDownPayments.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setDownPaymentPercent(p)}
                      className={`px-3 py-1 text-xs font-body rounded transition-colors ${
                        downPaymentPercent === p
                          ? "bg-primary text-primary-foreground font-bold"
                          : "bg-secondary hover:bg-secondary/80 text-muted-foreground border border-border"
                      }`}
                    >
                      %{p} Peşinat
                    </button>
                  ))}
                </div>
                <input
                  type="range"
                  min={10}
                  max={80}
                  step={5}
                  value={downPaymentPercent}
                  onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                  className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              {/* Interest Rate & Term */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-body uppercase tracking-wider text-muted-foreground font-semibold">
                      Aylık Faiz Oranı
                    </label>
                    <span className="text-sm font-bold text-foreground font-mono">
                      %{interestRate.toFixed(2)}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="1.00"
                      max="6.00"
                      value={interestRate}
                      onChange={(e) => setInterestRate(Number(e.target.value))}
                      className="w-full bg-secondary border border-border px-3 py-2.5 text-foreground font-body text-sm rounded focus:outline-none focus:border-primary font-mono"
                    />
                    <Percent size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  </div>
                  <p className="text-[11px] text-muted-foreground font-body mt-1">
                    *Ortalama güncel banka faiz aralığı: %2.79 - %3.20
                  </p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-body uppercase tracking-wider text-muted-foreground font-semibold">
                      Kredi Vadesi
                    </label>
                    <span className="text-sm font-bold text-foreground">
                      {termMonths} Ay ({Math.floor(termMonths / 12)} Yıl)
                    </span>
                  </div>
                  <select
                    value={termMonths}
                    onChange={(e) => setTermMonths(Number(e.target.value))}
                    className="w-full bg-secondary border border-border px-3 py-2.5 text-foreground font-body text-sm rounded focus:outline-none focus:border-primary"
                  >
                    {quickTerms.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Results Card */}
            <div className="lg:col-span-5 bg-secondary/50 border border-primary/20 rounded-lg p-6 space-y-6">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-body font-semibold">
                  Aylık Tahmini Taksit
                </p>
                <p className="font-display text-3xl sm:text-4xl font-bold text-primary tracking-tight mt-1">
                  {formatTRY(monthlyPayment)} <span className="text-xs font-normal text-muted-foreground">/ ay</span>
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-border/80 text-xs font-body">
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Kullanılacak Kredi:</span>
                  <span className="font-semibold text-foreground">{formatTRY(loanAmount)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Ödenecek Peşinat:</span>
                  <span className="font-semibold text-foreground">{formatTRY(downPaymentAmount)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Toplam Faiz Tutarı:</span>
                  <span className="font-semibold text-amber-500">{formatTRY(totalInterest)}</span>
                </div>
                <div className="flex justify-between py-1 pt-2 border-t border-border font-medium">
                  <span className="text-foreground">Toplam Geri Ödeme:</span>
                  <span className="font-bold text-foreground">{formatTRY(totalRepayment)}</span>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={`https://wa.me/905302503252?text=${encodeURIComponent(
                    `Merhaba, "${propertyTitle || "İlan"}" için ${formatTRY(price)} tutarlı gayrimenkule ${termMonths} ay vadeli konut kredisi başvurusu ve anlaşmalı banka oranları hakkında bilgi almak istiyorum.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-body text-xs font-bold uppercase tracking-wider transition-colors shadow-md"
                >
                  <MessageCircle size={15} /> Anlaşmalı Banka Oranlarını Sor
                </a>
              </div>
            </div>
          </div>
        ) : (
          /* Tapu ve Ek Masraflar Sekmesi */
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-secondary/60 border border-border rounded-md">
                <p className="text-[11px] text-muted-foreground font-body uppercase tracking-wider">
                  Alıcı Tapu Harcı (%2)
                </p>
                <p className="font-display text-xl font-bold text-foreground mt-1">
                  {formatTRY(buyerDeedTax)}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1 font-body">Tapu devrinde devlete ödenir</p>
              </div>

              <div className="p-4 bg-secondary/60 border border-border rounded-md">
                <p className="text-[11px] text-muted-foreground font-body uppercase tracking-wider">
                  Emlak Danışmanlık Bedeli
                </p>
                <p className="font-display text-xl font-bold text-foreground mt-1">
                  {formatTRY(agentCommission)}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1 font-body">%2 Hizmet Bedeli + %20 KDV</p>
              </div>

              <div className="p-4 bg-secondary/60 border border-border rounded-md">
                <p className="text-[11px] text-muted-foreground font-body uppercase tracking-wider">
                  Döner Sermaye Harcı
                </p>
                <p className="font-display text-xl font-bold text-foreground mt-1">
                  {formatTRY(revolvingFundFee)}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1 font-body">İstanbul Tapu Müdürlüğü tarifesi</p>
              </div>

              <div className="p-4 bg-secondary/60 border border-border rounded-md">
                <p className="text-[11px] text-muted-foreground font-body uppercase tracking-wider">
                  Ekspertiz & Sigorta
                </p>
                <p className="font-display text-xl font-bold text-foreground mt-1">
                  {formatTRY(appraisalAndInsurance)}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1 font-body">Zorunlu DASK & Banka Ekspertizi</p>
              </div>
            </div>

            {/* Total Cash Summary Banner */}
            <div className="p-6 bg-gradient-to-r from-secondary via-secondary to-primary/10 border border-primary/30 rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase tracking-widest text-primary font-bold font-body">
                  Anahtar Teslim Toplam Nakit İhtiyacı
                </span>
                <h4 className="font-display text-2xl sm:text-3xl font-bold text-foreground mt-0.5">
                  {formatTRY(totalFirstExpenses)}
                </h4>
                <p className="text-xs text-muted-foreground font-body mt-1">
                  (Peşinat: {formatTRY(downPaymentAmount)} + Toplam Yasal Harç ve Masraflar: {formatTRY(totalFirstExpenses - downPaymentAmount)})
                </p>
              </div>

              <a
                href={`https://wa.me/905302503252?text=${encodeURIComponent(
                  `Merhaba, tapu devir masrafları ve alım-satım prosedürleri hakkında Sarraf 34 uzmanlarından ücretsiz danışmanlık talep ediyorum.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded gradient-gold text-primary-foreground font-body text-xs font-bold uppercase tracking-wider shadow-lg hover:opacity-90 transition-opacity"
              >
                <MessageCircle size={15} /> Tapu Süreci İçin Danışın
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
