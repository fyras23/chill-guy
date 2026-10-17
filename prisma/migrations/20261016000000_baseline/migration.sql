CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE public.scenes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  url text NOT NULL,
  file_key text NOT NULL UNIQUE,
  width integer,
  height integer,
  size_bytes bigint,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz(6) NOT NULL DEFAULT now()
);

CREATE INDEX scenes_active_order_idx ON public.scenes (is_active, sort_order);

ALTER TABLE public.scenes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public can read active scenes"
  ON public.scenes
  FOR SELECT
  USING (is_active = true);
