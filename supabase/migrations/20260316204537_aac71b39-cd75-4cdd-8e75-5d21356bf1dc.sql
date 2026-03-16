-- Sincroniza system_config automaticamente com a última entrada do changelog
CREATE OR REPLACE FUNCTION public.sync_system_config_from_changelog_entry()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.system_config
  SET value = NEW.version,
      updated_at = now()
  WHERE key = 'app_version';

  UPDATE public.system_config
  SET value = NEW.title,
      updated_at = now()
  WHERE key = 'release_name';

  UPDATE public.system_config
  SET value = CONCAT('v', NEW.version, ' - ', NEW.title, COALESCE(': ' || NEW.description, '')),
      updated_at = now()
  WHERE key = 'changelog';

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_system_config_from_changelog_entry_trigger ON public.changelog_entries;

CREATE TRIGGER sync_system_config_from_changelog_entry_trigger
AFTER INSERT OR UPDATE ON public.changelog_entries
FOR EACH ROW
EXECUTE FUNCTION public.sync_system_config_from_changelog_entry();

-- Garante que a função de registro automático também mantenha os campos em sincronia
CREATE OR REPLACE FUNCTION public.register_changelog(
  _title text,
  _description text DEFAULT NULL::text,
  _type text DEFAULT 'feature'::text,
  _bump text DEFAULT 'patch'::text,
  _contributor_name text DEFAULT NULL::text
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  current_ver text;
  parts int[];
  new_ver text;
BEGIN
  SELECT value INTO current_ver FROM public.system_config WHERE key = 'app_version';
  IF current_ver IS NULL THEN
    current_ver := '1.0.0';
  END IF;

  parts := string_to_array(current_ver, '.')::int[];

  IF _bump = 'major' THEN
    parts[1] := parts[1] + 1; parts[2] := 0; parts[3] := 0;
  ELSIF _bump = 'minor' THEN
    parts[2] := parts[2] + 1; parts[3] := 0;
  ELSE
    parts[3] := parts[3] + 1;
  END IF;

  new_ver := parts[1] || '.' || parts[2] || '.' || parts[3];

  INSERT INTO public.changelog_entries (version, title, description, type, is_public, contributor_name)
  VALUES (new_ver, _title, _description, _type, true, _contributor_name);

  RETURN new_ver;
END;
$function$;

-- Backfill do snapshot atual para parar de exibir conteúdo desatualizado
WITH latest_entry AS (
  SELECT version, title, description
  FROM public.changelog_entries
  ORDER BY created_at DESC
  LIMIT 1
)
UPDATE public.system_config
SET value = latest_entry.version,
    updated_at = now()
FROM latest_entry
WHERE key = 'app_version';

WITH latest_entry AS (
  SELECT title
  FROM public.changelog_entries
  ORDER BY created_at DESC
  LIMIT 1
)
UPDATE public.system_config
SET value = latest_entry.title,
    updated_at = now()
FROM latest_entry
WHERE key = 'release_name';

WITH latest_entry AS (
  SELECT version, title, description
  FROM public.changelog_entries
  ORDER BY created_at DESC
  LIMIT 1
)
UPDATE public.system_config
SET value = CONCAT('v', latest_entry.version, ' - ', latest_entry.title, COALESCE(': ' || latest_entry.description, '')),
    updated_at = now()
FROM latest_entry
WHERE key = 'changelog';