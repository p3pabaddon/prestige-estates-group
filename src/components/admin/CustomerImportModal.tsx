import { useState } from "react";
import Papa from "papaparse";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Stage, STAGES } from "@/lib/crm";
import { toast } from "sonner";
import { X, UploadCloud, FileSpreadsheet, Download, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface CustomerImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  staffList?: { id: string; full_name: string | null; email: string | null }[];
}

interface ParsedCustomerRow {
  full_name: string;
  phone?: string;
  email?: string;
  budget_min?: number | null;
  budget_max?: number | null;
  interested_district?: string;
  interested_type?: string;
  source?: string;
  stage?: Stage;
  notes?: string;
}

export default function CustomerImportModal({ isOpen, onClose, onSuccess, staffList = [] }: CustomerImportModalProps) {
  const { user, role } = useAuth();
  const [selectedAgent, setSelectedAgent] = useState<string>(user?.id || "");
  const [parsedRows, setParsedRows] = useState<ParsedCustomerRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");

  if (!isOpen) return null;

  // Download Sample CSV template with UTF-8 BOM for Excel
  const downloadSampleTemplate = () => {
    const csvContent =
      "\uFEFF" +
      "Ad Soyad;Telefon;E-Posta;Bütçe Min;Bütçe Max;Bölge;İlgilendiği Tip;Kaynak;Aşama;Notlar\n" +
      "Ahmet Yılmaz;05321112233;ahmet@ornek.com;3000000;4500000;Beylikdüzü;3+1 Daire;Sahibinden;gorusme;Deniz manzaralı daire arıyor\n" +
      "Mehmet Demir;05423334455;mehmet@ornek.com;6000000;8000000;Yakuplu;Villa;Referans;teklif;Geniş bahçeli müstakil ev\n" +
      "Ayşe Kaya;05556667788;;;2500000;Esenyurt;2+1 Daire;Web Sitesi;yeni;Yatırımlık uygun fiyatlı";

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "sarraf34_musteri_sablonu.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase(),
      complete: (results) => {
        const rows: ParsedCustomerRow[] = [];

        results.data.forEach((row: any) => {
          // Normalize column lookups
          const fullName =
            row["ad soyad"] ||
            row["ad_soyad"] ||
            row["isim"] ||
            row["adı"] ||
            row["name"] ||
            row["full name"] ||
            row["müşteri"];

          if (!fullName || !String(fullName).trim()) return;

          const phone =
            row["telefon"] ||
            row["tel"] ||
            row["gsm"] ||
            row["phone"] ||
            row["cep"];

          const email =
            row["e-posta"] ||
            row["eposta"] ||
            row["email"] ||
            row["mail"];

          const bMin = row["bütçe min"] || row["bütçe (min)"] || row["min bütçe"] || row["budget_min"];
          const bMax = row["bütçe max"] || row["bütçe (max)"] || row["bütçe"] || row["max bütçe"] || row["budget_max"];

          const district =
            row["bölge"] ||
            row["ilçe"] ||
            row["şehir"] ||
            row["konum"] ||
            row["district"];

          const propType =
            row["ilgilendiği tip"] ||
            row["tip"] ||
            row["konut tipi"] ||
            row["property_type"];

          const source =
            row["kaynak"] ||
            row["source"] ||
            "Excel İçe Aktarım";

          let stageVal: Stage = "yeni";
          const rawStage = (row["aşama"] || row["durum"] || row["stage"] || "").toLowerCase().trim();
          if (rawStage.includes("görüş") || rawStage.includes("ilet")) stageVal = "gorusme";
          else if (rawStage.includes("sunum") || rawStage.includes("yer")) stageVal = "sunum";
          else if (rawStage.includes("teklif") || rawStage.includes("pazar")) stageVal = "teklif";
          else if (rawStage.includes("satış") || rawStage.includes("satis") || rawStage.includes("kapan")) stageVal = "satis";
          else if (rawStage.includes("olumsuz") || rawStage.includes("iptal")) stageVal = "kayip";

          const notes =
            row["notlar"] ||
            row["not"] ||
            row["açıklama"] ||
            row["notes"];

          rows.push({
            full_name: String(fullName).trim(),
            phone: phone ? String(phone).trim() : undefined,
            email: email ? String(email).trim() : undefined,
            budget_min: bMin ? Number(String(bMin).replace(/[^0-9]/g, "")) || null : null,
            budget_max: bMax ? Number(String(bMax).replace(/[^0-9]/g, "")) || null : null,
            interested_district: district ? String(district).trim() : undefined,
            interested_type: propType ? String(propType).trim() : undefined,
            source: String(source).trim(),
            stage: stageVal,
            notes: notes ? String(notes).trim() : undefined,
          });
        });

        if (rows.length === 0) {
          toast.error("Dosyada geçerli müşteri satırı bulunamadı. Lütfen şablonu kontrol edin.");
        } else {
          setParsedRows(rows);
          toast.success(`${rows.length} müşteri kaydı başarıyla okundu.`);
        }
      },
      error: (err) => {
        toast.error(`Dosya okuma hatası: ${err.message}`);
      },
    });
  };

  const handleImportSubmit = async () => {
    if (parsedRows.length === 0) return toast.error("İçe aktarılacak müşteri yok.");
    setLoading(true);

    const assignedTo = role === "admin" ? selectedAgent || user?.id : user?.id;

    try {
      const recordsToInsert = parsedRows.map((r) => ({
        full_name: r.full_name,
        phone: r.phone || null,
        email: r.email || null,
        budget_min: r.budget_min || null,
        budget_max: r.budget_max || null,
        interested_district: r.interested_district || null,
        interested_type: r.interested_type || null,
        source: r.source || "Excel İçe Aktarım",
        stage: r.stage || "yeni",
        notes: r.notes || null,
        created_by: user?.id,
        assigned_to: assignedTo,
      }));

      const { data, error } = await supabase.from("customers").insert(recordsToInsert).select("id");
      if (error) throw error;

      // Create activity records in bulk
      if (data && data.length > 0) {
        const activities = data.map((item) => ({
          customer_id: item.id,
          activity_type: "Not",
          stage: "yeni" as Stage,
          note: `Excel/CSV ile toplu içe aktarıldı (${fileName})`,
          created_by: user?.id,
        }));
        await supabase.from("customer_activities").insert(activities);
      }

      toast.success(`${parsedRows.length} müşteri CRM'e başarıyla aktarıldı!`);
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(`Aktarım hatası: ${err.message || "Bilinmeyen hata"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="luxury-card max-w-2xl w-full p-6 md:p-8 space-y-6 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold text-foreground">
                Excel / CSV ile Müşteri İçe Aktar
              </h2>
              <p className="font-body text-xs text-muted-foreground">
                Toplu müşteri ve portföy listenizi saniyeler içinde CRM'e aktarın.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={20} />
          </button>
        </div>

        {/* Action: Download Template */}
        <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-sm border border-border">
          <div>
            <p className="text-xs font-semibold text-foreground font-body">Örnek Format Şablonu</p>
            <p className="text-[11px] text-muted-foreground font-body">
              Doğru kolon başlıkları içeren örnek CSV şablonunu indirin.
            </p>
          </div>
          <button
            type="button"
            onClick={downloadSampleTemplate}
            className="inline-flex items-center gap-2 px-3 py-2 bg-card hover:bg-secondary border border-border text-foreground font-body text-xs rounded-sm transition-colors"
          >
            <Download size={13} className="text-primary" /> Şablon İndir
          </button>
        </div>

        {/* Staff Assignment (Admin Only) */}
        {role === "admin" && staffList.length > 0 && (
          <div>
            <label className="block text-[10px] uppercase font-body tracking-wider text-muted-foreground mb-1.5 font-semibold">
              Müşterilerin Atanacağı Danışman
            </label>
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="w-full bg-secondary border border-border px-3 py-2.5 text-foreground font-body text-sm rounded-sm focus:outline-none focus:border-primary"
            >
              {staffList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name || s.email} {s.id === user?.id ? "(Siz)" : ""}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* File Dropzone */}
        <div className="border-2 border-dashed border-border hover:border-primary/60 rounded-sm p-6 text-center transition-colors relative cursor-pointer bg-secondary/20">
          <input
            type="file"
            accept=".csv, .txt, .tsv"
            onChange={handleFileUpload}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
          <UploadCloud size={32} className="mx-auto text-primary mb-2" />
          <p className="text-xs font-semibold text-foreground font-body">
            CSV veya Excel (CSV formatında) dosyasını buraya sürükleyin veya tıklayın
          </p>
          <p className="text-[11px] text-muted-foreground font-body mt-1">
            Desteklenen format: .csv, .txt (Noktalı virgül veya virgül ayraçlı)
          </p>
        </div>

        {/* Parsed Preview Table */}
        {parsedRows.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground font-body flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-500" />
                Okunan Müşteriler ({parsedRows.length} Kişi)
              </span>
              <span className="text-[11px] text-muted-foreground font-body">{fileName}</span>
            </div>

            <div className="max-h-48 overflow-y-auto border border-border rounded-sm bg-secondary/30">
              <table className="w-full text-left text-xs font-body">
                <thead>
                  <tr className="border-b border-border bg-secondary text-muted-foreground text-[10px] uppercase">
                    <th className="py-2 px-3">Ad Soyad</th>
                    <th className="py-2 px-3">Telefon</th>
                    <th className="py-2 px-3">Bölge</th>
                    <th className="py-2 px-3">Aşama</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedRows.slice(0, 10).map((r, i) => (
                    <tr key={i} className="border-b border-border last:border-0">
                      <td className="py-2 px-3 font-medium text-foreground">{r.full_name}</td>
                      <td className="py-2 px-3 text-muted-foreground">{r.phone || "—"}</td>
                      <td className="py-2 px-3 text-muted-foreground">{r.interested_district || "—"}</td>
                      <td className="py-2 px-3">
                        <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] uppercase font-semibold">
                          {r.stage}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsedRows.length > 10 && (
                <div className="p-2 text-center text-[11px] text-muted-foreground bg-secondary/60">
                  ve {parsedRows.length - 10} müşteri daha...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal Buttons */}
        <div className="flex gap-3 pt-2 border-t border-border">
          <button
            type="button"
            onClick={handleImportSubmit}
            disabled={parsedRows.length === 0 || loading}
            className="flex-1 gradient-gold text-primary-foreground py-3 text-xs tracking-wider uppercase font-body font-semibold flex items-center justify-center gap-2 rounded-sm disabled:opacity-50"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {parsedRows.length > 0 ? `${parsedRows.length} Müşteriyi CRM'e Aktar` : "İçe Aktar"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 border border-border text-xs tracking-wider uppercase font-body text-muted-foreground hover:text-foreground rounded-sm"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
