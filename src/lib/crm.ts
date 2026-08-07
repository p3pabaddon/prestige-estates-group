export type Stage =
  | "yeni"
  | "iletisim"
  | "ilgileniyor"
  | "randevu"
  | "ofis_ziyareti"
  | "pazarlik"
  | "satis"
  | "kaybedildi";

export const STAGES: { value: Stage; label: string; tone: string }[] = [
  { value: "yeni", label: "Yeni Müşteri", tone: "bg-muted text-muted-foreground" },
  { value: "iletisim", label: "İletişim Kuruldu", tone: "bg-primary/10 text-primary" },
  { value: "ilgileniyor", label: "İlgileniyor", tone: "bg-primary/15 text-primary" },
  { value: "randevu", label: "Randevu Oluşturuldu", tone: "bg-primary/20 text-primary" },
  { value: "ofis_ziyareti", label: "Ofisi Ziyaret Etti", tone: "bg-primary/25 text-primary" },
  { value: "pazarlik", label: "Pazarlık Aşamasında", tone: "bg-primary/30 text-primary" },
  { value: "satis", label: "Satış Yapıldı", tone: "bg-emerald-500/15 text-emerald-500" },
  { value: "kaybedildi", label: "Kaybedildi", tone: "bg-destructive/15 text-destructive" },
];

export const stageLabel = (s?: string | null) =>
  STAGES.find((x) => x.value === s)?.label ?? "—";

export const stageTone = (s?: string | null) =>
  STAGES.find((x) => x.value === s)?.tone ?? "bg-muted text-muted-foreground";

export const ACTIVITY_TYPES = [
  "Not",
  "Telefon Görüşmesi",
  "WhatsApp",
  "E-posta",
  "Randevu",
  "Ofis Ziyareti",
  "Mülk Gösterimi",
  "Teklif / Pazarlık",
  "Sözleşme",
];

export const formatTRY = (v?: number | null, currency = "TRY") => {
  if (v === null || v === undefined) return "—";
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(v));
};

export const formatDateTime = (v?: string | null) =>
  v ? new Date(v).toLocaleString("tr-TR", { dateStyle: "medium", timeStyle: "short" }) : "—";