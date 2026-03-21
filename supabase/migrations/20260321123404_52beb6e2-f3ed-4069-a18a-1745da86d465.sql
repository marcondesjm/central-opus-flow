
-- Fix search_path on generate_license_key_code
CREATE OR REPLACE FUNCTION public.generate_license_key_code()
RETURNS text
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
  i integer;
  segment integer;
BEGIN
  FOR segment IN 1..4 LOOP
    IF segment > 1 THEN
      result := result || '-';
    END IF;
    FOR i IN 1..5 LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
  END LOOP;
  RETURN result;
END;
$$;
