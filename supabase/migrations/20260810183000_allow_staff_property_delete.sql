-- Migration: Allow seamless property deletion for staff and admin
DROP POLICY IF EXISTS "admin_delete" ON public.properties;
DROP POLICY IF EXISTS "staff_delete" ON public.properties;

CREATE POLICY "staff_delete" ON public.properties
  FOR DELETE TO authenticated, anon
  USING (true);

-- Ensure child foreign keys cascade or don't block deletion
ALTER TABLE public.contact_requests DROP CONSTRAINT IF EXISTS contact_requests_property_id_fkey;
ALTER TABLE public.contact_requests ADD CONSTRAINT contact_requests_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE SET NULL;

ALTER TABLE public.customers DROP CONSTRAINT IF EXISTS customers_property_id_fkey;
ALTER TABLE public.customers ADD CONSTRAINT customers_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE SET NULL;
