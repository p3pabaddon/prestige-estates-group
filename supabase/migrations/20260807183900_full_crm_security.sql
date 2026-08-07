-- ╔══════════════════════════════════════════════════════════════════════════════╗
-- ║  PRESTIGE ESTATES & CRM – TEK PARÇA (STANDALONE) VERİTABANI VE GÜVENLİK     ║
-- ║  Bu SQL dosyasını Supabase SQL Editörüne yapıştırıp doğrudan ÇALIŞTIRIN.    ║
-- ║  (Sıfırdan tüm tabloları, RLS kurallarını ve fonksiyonları kurar)           ║
-- ╚══════════════════════════════════════════════════════════════════════════════╝

-- ═══════════════════════════════════════════════════════════════
-- 1. ENUM TİPLERİ (YOKSA OLUŞTUR)
-- ═══════════════════════════════════════════════════════════════
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'agent');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'customer_stage') THEN
    CREATE TYPE public.customer_stage AS ENUM (
      'yeni', 'iletisim', 'ilgileniyor', 'randevu',
      'ofis_ziyareti', 'pazarlik', 'satis', 'kaybedildi'
    );
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════
-- 2. TEMEL YARDIMCI FONKSİYONLAR
-- ═══════════════════════════════════════════════════════════════

-- Updated_at güncelleyici
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Created_by otomatik atayıcı
CREATE OR REPLACE FUNCTION public.set_created_by()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.created_by IS NULL THEN
    NEW.created_by = auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

-- ═══════════════════════════════════════════════════════════════
-- 3. TABLOLAR (CREATE TABLE IF NOT EXISTS)
-- ═══════════════════════════════════════════════════════════════

-- 3a. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3b. USER_ROLES
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Rol kontrol fonksiyonu
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- 3c. PROPERTIES (İLANLAR - TÜM KOLONLAR DAHİL)
CREATE TABLE IF NOT EXISTS public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  neighborhood TEXT,
  district TEXT,
  city TEXT DEFAULT 'İstanbul',
  address TEXT,
  price NUMERIC,
  currency TEXT NOT NULL DEFAULT 'TRY',
  property_type TEXT NOT NULL DEFAULT 'Daire',
  listing_type TEXT NOT NULL DEFAULT 'satilik',
  rooms TEXT,
  bathrooms INT,
  gross_m2 INT,
  net_m2 INT,
  floor TEXT,
  total_floors INT,
  building_age TEXT,
  heating TEXT,
  furnished BOOLEAN NOT NULL DEFAULT false,
  credit_eligible BOOLEAN NOT NULL DEFAULT true,
  swap_eligible BOOLEAN NOT NULL DEFAULT false,
  balcony BOOLEAN NOT NULL DEFAULT false,
  elevator BOOLEAN,
  parking TEXT,
  site_adi TEXT,
  tapu_durumu TEXT,
  ilan_no TEXT,
  status TEXT NOT NULL DEFAULT 'aktif',
  tag TEXT,
  images TEXT[] NOT NULL DEFAULT '{}',
  video_url TEXT,
  virtual_tour_url TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  featured BOOLEAN NOT NULL DEFAULT false,
  published BOOLEAN NOT NULL DEFAULT true,
  external_url TEXT,
  source_portal TEXT,
  view_count INT NOT NULL DEFAULT 0,
  inquiry_count INT NOT NULL DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Eğer tablo zaten varsa eksik kolonları ekle
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS source_portal TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS neighborhood TEXT,
  ADD COLUMN IF NOT EXISTS dues NUMERIC,
  ADD COLUMN IF NOT EXISTS deposit NUMERIC,
  ADD COLUMN IF NOT EXISTS swap_eligible BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS balcony BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS parking TEXT,
  ADD COLUMN IF NOT EXISTS elevator BOOLEAN,
  ADD COLUMN IF NOT EXISTS site_adi TEXT,
  ADD COLUMN IF NOT EXISTS tapu_durumu TEXT,
  ADD COLUMN IF NOT EXISTS ilan_no TEXT,
  ADD COLUMN IF NOT EXISTS video_url TEXT,
  ADD COLUMN IF NOT EXISTS virtual_tour_url TEXT,
  ADD COLUMN IF NOT EXISTS view_count INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS inquiry_count INT NOT NULL DEFAULT 0;

-- 3d. PROPERTY_IMAGES (AYRI GÖRSEL TABLOSU)
CREATE TABLE IF NOT EXISTS public.property_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  storage_path TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  alt_text TEXT,
  is_cover BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3e. PROPERTY_FEATURES (İLAN ÖZELLİKLERİ)
CREATE TABLE IF NOT EXISTS public.property_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  feature TEXT NOT NULL,
  category TEXT DEFAULT 'genel'
);

-- 3f. CUSTOMERS (MÜŞTERİLER / CRM)
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  source TEXT,
  stage public.customer_stage NOT NULL DEFAULT 'yeni',
  budget_min NUMERIC,
  budget_max NUMERIC,
  interested_type TEXT,
  interested_district TEXT,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  notes TEXT,
  assigned_to UUID,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3g. CUSTOMER_ACTIVITIES (MÜŞTERİ HAREKETLERİ / NOTLAR)
CREATE TABLE IF NOT EXISTS public.customer_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL DEFAULT 'not',
  stage public.customer_stage,
  note TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3h. REMINDERS (HATIRLATICILAR / GÖREVLER)
CREATE TABLE IF NOT EXISTS public.reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  note TEXT,
  remind_at TIMESTAMPTZ NOT NULL,
  done BOOLEAN NOT NULL DEFAULT false,
  notified BOOLEAN NOT NULL DEFAULT false,
  assigned_to UUID,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3i. SHOWINGS (MÜLK GÖSTERİM RANDEVULARI)
CREATE TABLE IF NOT EXISTS public.showings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_min INT DEFAULT 30,
  status TEXT NOT NULL DEFAULT 'planlandı',
  feedback TEXT,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3j. OFFERS (TEKLİF & PAZARLIK YÖNETİMİ)
CREATE TABLE IF NOT EXISTS public.offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'TRY',
  status TEXT NOT NULL DEFAULT 'beklemede',
  counter_amount NUMERIC,
  notes TEXT,
  offered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  responded_at TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3k. DOCUMENTS (SÖZLEŞME & EVRAKLAR)
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  storage_path TEXT,
  file_type TEXT,
  file_size_bytes BIGINT,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  uploaded_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3l. CONTACT_REQUESTS (WEB SİTESİ İLETİŞİM FORMLARI)
CREATE TABLE IF NOT EXISTS public.contact_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  message TEXT,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  source TEXT DEFAULT 'website',
  status TEXT NOT NULL DEFAULT 'yeni',
  assigned_to UUID,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3m. AUDIT_LOG (GÜVENLİK DENETİM LOGU)
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3n. SETTINGS (SİSTEM AYARLARI)
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL DEFAULT '{}',
  updated_by UUID,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════
-- 4. İNDEKSLEME (PERFORMANS)
-- ═══════════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_properties_listing_type ON public.properties(listing_type);
CREATE INDEX IF NOT EXISTS idx_properties_city ON public.properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_district ON public.properties(district);
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_price ON public.properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_published ON public.properties(published);
CREATE INDEX IF NOT EXISTS idx_properties_featured ON public.properties(featured);

CREATE INDEX IF NOT EXISTS idx_property_images_prop ON public.property_images(property_id);
CREATE INDEX IF NOT EXISTS idx_property_features_prop ON public.property_features(property_id);

CREATE INDEX IF NOT EXISTS idx_customers_stage ON public.customers(stage);
CREATE INDEX IF NOT EXISTS idx_activities_customer ON public.customer_activities(customer_id);
CREATE INDEX IF NOT EXISTS idx_reminders_remind_at ON public.reminders(remind_at);
CREATE INDEX IF NOT EXISTS idx_showings_property ON public.showings(property_id);
CREATE INDEX IF NOT EXISTS idx_showings_customer ON public.showings(customer_id);
CREATE INDEX IF NOT EXISTS idx_showings_scheduled ON public.showings(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_offers_property ON public.offers(property_id);
CREATE INDEX IF NOT EXISTS idx_offers_customer ON public.offers(customer_id);
CREATE INDEX IF NOT EXISTS idx_contact_req_status ON public.contact_requests(status);
CREATE INDEX IF NOT EXISTS idx_audit_table ON public.audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_user ON public.audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON public.audit_log(created_at);

-- ═══════════════════════════════════════════════════════════════
-- 5. TRİGGERLAR (GÜNCELLENME VE OTO-ATAMA)
-- ═══════════════════════════════════════════════════════════════

-- Updated_at tetikleyicileri
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'properties_updated_at') THEN
    CREATE TRIGGER properties_updated_at BEFORE UPDATE ON public.properties
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'customers_updated_at') THEN
    CREATE TRIGGER customers_updated_at BEFORE UPDATE ON public.customers
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'showings_updated_at') THEN
    CREATE TRIGGER showings_updated_at BEFORE UPDATE ON public.showings
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'offers_updated_at') THEN
    CREATE TRIGGER offers_updated_at BEFORE UPDATE ON public.offers
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

-- Created_by tetikleyicileri
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_created_by_properties') THEN
    CREATE TRIGGER set_created_by_properties BEFORE INSERT ON public.properties
      FOR EACH ROW EXECUTE FUNCTION public.set_created_by();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_created_by_customers') THEN
    CREATE TRIGGER set_created_by_customers BEFORE INSERT ON public.customers
      FOR EACH ROW EXECUTE FUNCTION public.set_created_by();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_created_by_activities') THEN
    CREATE TRIGGER set_created_by_activities BEFORE INSERT ON public.customer_activities
      FOR EACH ROW EXECUTE FUNCTION public.set_created_by();
  END IF;
END $$;

-- Yeni kayıt olan kullanıcıya profil ve rol atama
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)), NEW.email)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, CASE WHEN (SELECT count(*) FROM public.user_roles) = 0 THEN 'admin'::public.app_role ELSE 'agent'::public.app_role END)
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
    CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;

-- Audit Log tetikleyici fonksiyonu
CREATE OR REPLACE FUNCTION public.audit_trigger_fn()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_log(user_id, action, table_name, record_id, new_data)
    VALUES (auth.uid(), 'INSERT', TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_log(user_id, action, table_name, record_id, old_data, new_data)
    VALUES (auth.uid(), 'UPDATE', TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_log(user_id, action, table_name, record_id, old_data)
    VALUES (auth.uid(), 'DELETE', TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_properties') THEN
    CREATE TRIGGER audit_properties AFTER INSERT OR UPDATE OR DELETE ON public.properties
      FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_fn();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_customers') THEN
    CREATE TRIGGER audit_customers AFTER INSERT OR UPDATE OR DELETE ON public.customers
      FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_fn();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_offers') THEN
    CREATE TRIGGER audit_offers AFTER INSERT OR UPDATE OR DELETE ON public.offers
      FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_fn();
  END IF;
END $$;

-- İletişim formu spam koruması (Rate Limit)
CREATE OR REPLACE FUNCTION public.check_contact_rate_limit()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  recent_count INT;
BEGIN
  SELECT count(*) INTO recent_count
  FROM public.contact_requests
  WHERE ip_address = NEW.ip_address
    AND created_at > now() - interval '1 hour';
  IF recent_count >= 5 THEN
    RAISE EXCEPTION 'Çok fazla istek gönderdiniz. Lütfen daha sonra tekrar deneyin.';
  END IF;
  RETURN NEW;
END;
$$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'contact_rate_limit') THEN
    CREATE TRIGGER contact_rate_limit BEFORE INSERT ON public.contact_requests
      FOR EACH ROW EXECUTE FUNCTION public.check_contact_rate_limit();
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════
-- 6. ROW LEVEL SECURITY (RLS) POLİTİKALARI & ERİŞİM KONTROLLERİ
-- ═══════════════════════════════════════════════════════════════

-- RLS'i tüm tablolarda aktifleştir
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.showings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- 6a. PROFILES POLICIES
DROP POLICY IF EXISTS "profiles readable by authenticated" ON public.profiles;
DROP POLICY IF EXISTS "own profile insert" ON public.profiles;
DROP POLICY IF EXISTS "own profile update" ON public.profiles;
CREATE POLICY "profiles readable by authenticated" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- 6b. USER_ROLES POLICIES
DROP POLICY IF EXISTS "roles readable by authenticated" ON public.user_roles;
DROP POLICY IF EXISTS "admins manage roles" ON public.user_roles;
CREATE POLICY "roles readable by authenticated" ON public.user_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "admins manage roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- 6c. PROPERTIES POLICIES (Ziyaretçiler sadece yayındaki ilanları görür, CRM personeli yönetir)
DROP POLICY IF EXISTS "anon_read_published" ON public.properties;
DROP POLICY IF EXISTS "public can read published properties" ON public.properties;
DROP POLICY IF EXISTS "staff_read_all" ON public.properties;
DROP POLICY IF EXISTS "staff read all properties" ON public.properties;
DROP POLICY IF EXISTS "staff_insert" ON public.properties;
DROP POLICY IF EXISTS "staff insert properties" ON public.properties;
DROP POLICY IF EXISTS "staff_update" ON public.properties;
DROP POLICY IF EXISTS "staff update properties" ON public.properties;
DROP POLICY IF EXISTS "admin_delete" ON public.properties;
DROP POLICY IF EXISTS "staff delete properties" ON public.properties;

CREATE POLICY "anon_read_published" ON public.properties
  FOR SELECT TO anon USING (published = true AND status = 'aktif');

CREATE POLICY "staff_read_all" ON public.properties
  FOR SELECT TO authenticated USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'agent')
  );

CREATE POLICY "staff_insert" ON public.properties
  FOR INSERT TO authenticated WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'agent')
  );

CREATE POLICY "staff_update" ON public.properties
  FOR UPDATE TO authenticated USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'agent')
  ) WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'agent')
  );

CREATE POLICY "admin_delete" ON public.properties
  FOR DELETE TO authenticated USING (
    public.has_role(auth.uid(), 'admin')
  );

-- 6d. PROPERTY_IMAGES & FEATURES
DROP POLICY IF EXISTS "anon_read_images" ON public.property_images;
DROP POLICY IF EXISTS "staff_manage_images" ON public.property_images;
CREATE POLICY "anon_read_images" ON public.property_images
  FOR SELECT TO anon USING (
    EXISTS (SELECT 1 FROM public.properties p WHERE p.id = property_id AND p.published = true)
  );
CREATE POLICY "staff_manage_images" ON public.property_images
  FOR ALL TO authenticated USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'agent')
  ) WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'agent')
  );

DROP POLICY IF EXISTS "anon_read_features" ON public.property_features;
DROP POLICY IF EXISTS "staff_manage_features" ON public.property_features;
CREATE POLICY "anon_read_features" ON public.property_features
  FOR SELECT TO anon USING (
    EXISTS (SELECT 1 FROM public.properties p WHERE p.id = property_id AND p.published = true)
  );
CREATE POLICY "staff_manage_features" ON public.property_features
  FOR ALL TO authenticated USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'agent')
  ) WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'agent')
  );

-- 6e. CUSTOMERS (DIŞARIYA TAMAMEN KAPALI - SADECE AUTHENTICATED STAFF)
DROP POLICY IF EXISTS "staff_read_customers" ON public.customers;
DROP POLICY IF EXISTS "staff manage customers" ON public.customers;
DROP POLICY IF EXISTS "staff_insert_customers" ON public.customers;
DROP POLICY IF EXISTS "staff_update_customers" ON public.customers;
DROP POLICY IF EXISTS "admin_delete_customers" ON public.customers;

CREATE POLICY "staff_read_customers" ON public.customers
  FOR SELECT TO authenticated USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'agent')
  );

CREATE POLICY "staff_insert_customers" ON public.customers
  FOR INSERT TO authenticated WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'agent')
  );

CREATE POLICY "staff_update_customers" ON public.customers
  FOR UPDATE TO authenticated USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'agent')
  ) WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'agent')
  );

CREATE POLICY "admin_delete_customers" ON public.customers
  FOR DELETE TO authenticated USING (
    public.has_role(auth.uid(), 'admin')
  );

-- 6f. CUSTOMER_ACTIVITIES
DROP POLICY IF EXISTS "staff_read_activities" ON public.customer_activities;
DROP POLICY IF EXISTS "staff manage activities" ON public.customer_activities;
DROP POLICY IF EXISTS "staff_insert_activities" ON public.customer_activities;
DROP POLICY IF EXISTS "staff_update_activities" ON public.customer_activities;
DROP POLICY IF EXISTS "admin_delete_activities" ON public.customer_activities;

CREATE POLICY "staff_read_activities" ON public.customer_activities
  FOR SELECT TO authenticated USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'agent')
  );
CREATE POLICY "staff_insert_activities" ON public.customer_activities
  FOR INSERT TO authenticated WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'agent')
  );
CREATE POLICY "staff_update_activities" ON public.customer_activities
  FOR UPDATE TO authenticated USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'agent')
  ) WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'agent')
  );
CREATE POLICY "admin_delete_activities" ON public.customer_activities
  FOR DELETE TO authenticated USING (
    public.has_role(auth.uid(), 'admin')
  );

-- 6g. REMINDERS
DROP POLICY IF EXISTS "staff_read_reminders" ON public.reminders;
DROP POLICY IF EXISTS "staff manage reminders" ON public.reminders;
DROP POLICY IF EXISTS "staff_insert_reminders" ON public.reminders;
DROP POLICY IF EXISTS "staff_update_reminders" ON public.reminders;
DROP POLICY IF EXISTS "admin_delete_reminders" ON public.reminders;

CREATE POLICY "staff_read_reminders" ON public.reminders
  FOR SELECT TO authenticated USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'agent')
  );
CREATE POLICY "staff_insert_reminders" ON public.reminders
  FOR INSERT TO authenticated WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'agent')
  );
CREATE POLICY "staff_update_reminders" ON public.reminders
  FOR UPDATE TO authenticated USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'agent')
  ) WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'agent')
  );
CREATE POLICY "admin_delete_reminders" ON public.reminders
  FOR DELETE TO authenticated USING (
    public.has_role(auth.uid(), 'admin')
  );

-- 6h. SHOWINGS, OFFERS, DOCUMENTS
DROP POLICY IF EXISTS "staff_manage_showings" ON public.showings;
CREATE POLICY "staff_manage_showings" ON public.showings
  FOR ALL TO authenticated USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'agent')
  ) WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'agent')
  );

DROP POLICY IF EXISTS "staff_manage_offers" ON public.offers;
CREATE POLICY "staff_manage_offers" ON public.offers
  FOR ALL TO authenticated USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'agent')
  ) WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'agent')
  );

DROP POLICY IF EXISTS "staff_manage_documents" ON public.documents;
CREATE POLICY "staff_manage_documents" ON public.documents
  FOR ALL TO authenticated USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'agent')
  );

-- 6i. CONTACT REQUESTS (Ziyaretçi form doldurabilir, CRM personeli görür)
DROP POLICY IF EXISTS "anon_insert_contact" ON public.contact_requests;
DROP POLICY IF EXISTS "staff_manage_contacts" ON public.contact_requests;
CREATE POLICY "anon_insert_contact" ON public.contact_requests
  FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "staff_manage_contacts" ON public.contact_requests
  FOR ALL TO authenticated USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'agent')
  ) WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'agent')
  );

-- 6j. AUDIT LOG & SETTINGS
DROP POLICY IF EXISTS "admin_read_audit" ON public.audit_log;
DROP POLICY IF EXISTS "staff_insert_audit" ON public.audit_log;
CREATE POLICY "admin_read_audit" ON public.audit_log
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "staff_insert_audit" ON public.audit_log
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_read_settings" ON public.settings;
DROP POLICY IF EXISTS "admin_manage_settings" ON public.settings;
CREATE POLICY "anon_read_settings" ON public.settings FOR SELECT TO anon USING (true);
CREATE POLICY "admin_manage_settings" ON public.settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ═══════════════════════════════════════════════════════════════
-- 7. İZİNLER (GRANTS) VE ANON ERİŞİM ENGELLEMELERİ
-- ═══════════════════════════════════════════════════════════════

-- Service role tam yetkili
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO service_role;

-- Authenticated (giriş yapmış kullanıcılar)
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.properties TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.property_images TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.property_features TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_activities TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reminders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.showings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.offers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.documents TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contact_requests TO authenticated;
GRANT SELECT, INSERT ON public.audit_log TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.settings TO authenticated;

-- Anon (Ziyaretçiler) Sadece izin verilen kısımlar:
GRANT SELECT ON public.properties TO anon;
GRANT SELECT ON public.property_images TO anon;
GRANT SELECT ON public.property_features TO anon;
GRANT INSERT ON public.contact_requests TO anon;
GRANT SELECT ON public.settings TO anon;

-- CRM VE GİZLİ VERİLER ANON İÇİN TAMAMEN YASAKLANDI
REVOKE ALL ON public.customers FROM anon;
REVOKE ALL ON public.customer_activities FROM anon;
REVOKE ALL ON public.reminders FROM anon;
REVOKE ALL ON public.showings FROM anon;
REVOKE ALL ON public.offers FROM anon;
REVOKE ALL ON public.documents FROM anon;
REVOKE ALL ON public.audit_log FROM anon;
REVOKE ALL ON public.user_roles FROM anon;

-- Fonksiyon güvenlikleri
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_created_by() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.audit_trigger_fn() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.check_contact_rate_limit() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
