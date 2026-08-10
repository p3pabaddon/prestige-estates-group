-- ═══════════════════════════════════════════════════════════════
-- RLS GÜVENLİK SERTLEŞTİRME MİGRASYONU
-- Tarih: 2026-08-10
-- Amaç: Supabase Database Linter Critical/Warning bulgularını düzeltir
-- ═══════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────
-- 1. PROFILES: Kullanıcılar sadece kendi profilini okuyabilir,
--    staff (admin/agent) tüm profilleri görebilir.
-- ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "profiles readable by authenticated" ON public.profiles;
CREATE POLICY "profiles_read_own_or_staff" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    auth.uid() = id
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'agent')
  );

-- ─────────────────────────────────────────────────────────────
-- 2. USER_ROLES: Kullanıcı sadece kendi rolünü görebilir,
--    admin tüm rolleri yönetir.
-- ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "roles readable by authenticated" ON public.user_roles;
CREATE POLICY "roles_read_own_or_admin" ON public.user_roles
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR public.has_role(auth.uid(), 'admin')
  );

-- ─────────────────────────────────────────────────────────────
-- 3. PROPERTIES: Authenticated ama staff olmayan kullanıcılar
--    sadece yayındaki ilanları görebilir (anon ile aynı).
--    Mevcut staff_read_all politikası zaten has_role kontrolü var,
--    authenticated non-staff için published read ekliyoruz.
-- ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "staff_read_all" ON public.properties;

-- Staff tüm ilanları görür
CREATE POLICY "staff_read_all" ON public.properties
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'agent')
  );

-- Non-staff authenticated kullanıcılar sadece yayındakileri görür
DROP POLICY IF EXISTS "authenticated_read_published" ON public.properties;
CREATE POLICY "authenticated_read_published" ON public.properties
  FOR SELECT TO authenticated
  USING (
    published = true AND status = 'aktif'
  );

-- INSERT/UPDATE/DELETE zaten has_role ile korumalı (staff_insert, staff_update, admin_delete)
-- Kontrol: Mevcut politikalar doğru, değişiklik gerekmez.

-- ─────────────────────────────────────────────────────────────
-- 4. CUSTOMERS: Mevcut politikalar doğru has_role kontrolü içeriyor.
--    Supabase linter eski cache'den uyarı veriyor olabilir.
--    Güvenlik için politikaları yeniden oluşturuyoruz.
-- ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "staff_read_customers" ON public.customers;
DROP POLICY IF EXISTS "staff manage customers" ON public.customers;
DROP POLICY IF EXISTS "staff_insert_customers" ON public.customers;
DROP POLICY IF EXISTS "staff_update_customers" ON public.customers;
DROP POLICY IF EXISTS "admin_delete_customers" ON public.customers;

CREATE POLICY "staff_read_customers" ON public.customers
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'agent')
  );
CREATE POLICY "staff_insert_customers" ON public.customers
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'agent')
  );
CREATE POLICY "staff_update_customers" ON public.customers
  FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'agent')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'agent')
  );
CREATE POLICY "admin_delete_customers" ON public.customers
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ─────────────────────────────────────────────────────────────
-- 5. CUSTOMER_ACTIVITIES: Aynı sertleştirme
-- ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "staff_read_activities" ON public.customer_activities;
DROP POLICY IF EXISTS "staff manage activities" ON public.customer_activities;
DROP POLICY IF EXISTS "staff_insert_activities" ON public.customer_activities;
DROP POLICY IF EXISTS "staff_update_activities" ON public.customer_activities;
DROP POLICY IF EXISTS "admin_delete_activities" ON public.customer_activities;

CREATE POLICY "staff_read_activities" ON public.customer_activities
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'agent')
  );
CREATE POLICY "staff_insert_activities" ON public.customer_activities
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'agent')
  );
CREATE POLICY "staff_update_activities" ON public.customer_activities
  FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'agent')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'agent')
  );
CREATE POLICY "admin_delete_activities" ON public.customer_activities
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ─────────────────────────────────────────────────────────────
-- 6. REMINDERS: Aynı sertleştirme
-- ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "staff_read_reminders" ON public.reminders;
DROP POLICY IF EXISTS "staff manage reminders" ON public.reminders;
DROP POLICY IF EXISTS "staff_insert_reminders" ON public.reminders;
DROP POLICY IF EXISTS "staff_update_reminders" ON public.reminders;
DROP POLICY IF EXISTS "admin_delete_reminders" ON public.reminders;

CREATE POLICY "staff_read_reminders" ON public.reminders
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'agent')
  );
CREATE POLICY "staff_insert_reminders" ON public.reminders
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'agent')
  );
CREATE POLICY "staff_update_reminders" ON public.reminders
  FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'agent')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'agent')
  );
CREATE POLICY "admin_delete_reminders" ON public.reminders
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ─────────────────────────────────────────────────────────────
-- 7. SECURITY DEFINER fonksiyonlarını INVOKER'a çevir
--    (set_updated_at, set_created_by: hassas veri yok, INVOKER güvenli)
--    handle_new_user ve audit_trigger_fn: auth.users erişimi gerektiği
--    için SECURITY DEFINER kalmalı, ama EXECUTE yetkisi sınırlandırılmalı.
-- ─────────────────────────────────────────────────────────────

-- set_updated_at: basit timestamp güncelleme, INVOKER olabilir
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY INVOKER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- set_created_by: auth.uid() okur, INVOKER olabilir
CREATE OR REPLACE FUNCTION public.set_created_by()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY INVOKER AS $$
BEGIN
  IF NEW.created_by IS NULL THEN
    NEW.created_by = auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

-- handle_new_user: auth.users tablosundan tetiklenir, SECURITY DEFINER KALMALI
-- Ama EXECUTE yetkisini kısıtlayalım
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- audit_trigger_fn: audit_log'a yazar, SECURITY DEFINER KALMALI
-- Ama EXECUTE yetkisini kısıtlayalım
REVOKE ALL ON FUNCTION public.audit_trigger_fn() FROM PUBLIC, anon, authenticated;

-- check_contact_rate_limit: contact_requests okur, SECURITY DEFINER KALMALI
REVOKE ALL ON FUNCTION public.check_contact_rate_limit() FROM PUBLIC, anon, authenticated;

-- has_role: Sadece authenticated kullanabilir
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
