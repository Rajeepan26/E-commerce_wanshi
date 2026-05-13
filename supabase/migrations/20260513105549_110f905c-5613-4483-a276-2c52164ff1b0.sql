
-- set_updated_at: ensure search_path is set
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public
AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

-- Revoke execute from public/anon/authenticated on internal SECURITY DEFINER funcs
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
-- has_role still needs to be callable by authenticated context (RLS uses it via SECURITY DEFINER bypass)
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
