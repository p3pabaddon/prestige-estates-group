import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ReminderRow {
  id: string;
  title: string;
  note: string | null;
  remind_at: string;
  done: boolean;
  notified: boolean;
  customer_id: string | null;
  customers?: { full_name: string } | null;
}

const LEAD_MINUTES = 15;

export const useReminderNotifications = (enabled: boolean) => {
  const [reminders, setReminders] = useState<ReminderRow[]>([]);
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== "undefined" ? Notification.permission : "denied",
  );
  const firedRef = useRef<Set<string>>(new Set());

  const requestPermission = useCallback(async () => {
    if (typeof Notification === "undefined") return;
    const p = await Notification.requestPermission();
    setPermission(p);
  }, []);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("reminders")
      .select("id,title,note,remind_at,done,notified,customer_id,customers(full_name)")
      .eq("done", false)
      .order("remind_at", { ascending: true })
      .limit(100);
    setReminders((data as ReminderRow[]) ?? []);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    load();
    const i = setInterval(load, 60_000);
    return () => clearInterval(i);
  }, [enabled, load]);

  useEffect(() => {
    if (!enabled) return;
    const check = () => {
      const now = Date.now();
      reminders.forEach((r) => {
        if (r.done || firedRef.current.has(r.id)) return;
        const t = new Date(r.remind_at).getTime();
        const diff = t - now;
        if (diff <= LEAD_MINUTES * 60_000 && diff > -60 * 60_000) {
          firedRef.current.add(r.id);
          const who = r.customers?.full_name ? `${r.customers.full_name} — ` : "";
          const when = new Date(r.remind_at).toLocaleTimeString("tr-TR", {
            hour: "2-digit",
            minute: "2-digit",
          });
          const body = `${who}${r.title} (${when})`;
          if (typeof Notification !== "undefined" && Notification.permission === "granted") {
            try {
              new Notification("Sarraf 34 — Hatırlatma", { body, tag: r.id });
            } catch {
              /* notification blocked */
            }
          }
          toast.warning("Yaklaşan hatırlatma", { description: body, duration: 12000 });
          supabase.from("reminders").update({ notified: true }).eq("id", r.id).then(() => {});
        }
      });
    };
    check();
    const i = setInterval(check, 30_000);
    return () => clearInterval(i);
  }, [reminders, enabled]);

  return { reminders, reload: load, permission, requestPermission };
};