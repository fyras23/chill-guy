CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE,
  pin_hash text NOT NULL,
  failed_attempts integer NOT NULL DEFAULT 0 CHECK (failed_attempts BETWEEN 0 AND 5),
  locked_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.admin_users FROM PUBLIC, anon, authenticated;
GRANT SELECT, UPDATE ON TABLE public.admin_users TO service_role;

INSERT INTO public.admin_users (username, pin_hash)
VALUES (
  'admin',
  'scrypt$32768$8$1$8ad33a8dfc8447a0faa319684d498f0d$3d4356c0362e11b62e2e863611a518078fe9cc063908436b601f04b65794f144437a4b81ad945f9a350836f57a3dc072e8ebf063d8a13d6ecfdd33fdd81f0d95'
)
ON CONFLICT (username) DO NOTHING;

CREATE OR REPLACE FUNCTION public.reserve_admin_pin_attempt()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_failed_attempts integer;
  v_locked_until timestamptz;
  v_next_attempt integer;
BEGIN
  SELECT failed_attempts, locked_until
  INTO v_failed_attempts, v_locked_until
  FROM public.admin_users
  WHERE username = 'admin'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Admin PIN account is not configured';
  END IF;

  IF v_locked_until IS NOT NULL AND v_locked_until > pg_catalog.now() THEN
    RETURN false;
  END IF;

  IF v_locked_until IS NOT NULL AND v_locked_until <= pg_catalog.now() THEN
    v_failed_attempts := 0;
  END IF;

  IF v_failed_attempts >= 5 THEN
    UPDATE public.admin_users
    SET failed_attempts = 5,
        locked_until = pg_catalog.now() + interval '15 minutes'
    WHERE username = 'admin';
    RETURN false;
  END IF;

  v_next_attempt := v_failed_attempts + 1;

  UPDATE public.admin_users
  SET failed_attempts = v_next_attempt,
      locked_until = NULL
  WHERE username = 'admin';

  RETURN true;
END;
$function$;

REVOKE ALL ON FUNCTION public.reserve_admin_pin_attempt() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_admin_pin_attempt() TO service_role;
