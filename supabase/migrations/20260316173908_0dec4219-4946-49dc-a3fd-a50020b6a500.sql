
CREATE OR REPLACE FUNCTION public.register_changelog(
  _title text,
  _description text DEFAULT NULL,
  _type text DEFAULT 'feature',
  _bump text DEFAULT 'patch',
  _contributor_name text DEFAULT NULL
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_ver text;
  parts int[];
  new_ver text;
BEGIN
  -- Get current version
  SELECT value INTO current_ver FROM system_config WHERE key = 'app_version';
  IF current_ver IS NULL THEN
    current_ver := '1.0.0';
  END IF;

  -- Parse version
  parts := string_to_array(current_ver, '.')::int[];

  -- Bump version
  IF _bump = 'major' THEN
    parts[1] := parts[1] + 1; parts[2] := 0; parts[3] := 0;
  ELSIF _bump = 'minor' THEN
    parts[2] := parts[2] + 1; parts[3] := 0;
  ELSE
    parts[3] := parts[3] + 1;
  END IF;

  new_ver := parts[1] || '.' || parts[2] || '.' || parts[3];

  -- Update version
  UPDATE system_config SET value = new_ver, updated_at = now() WHERE key = 'app_version';

  -- Insert changelog entry
  INSERT INTO changelog_entries (version, title, description, type, is_public, contributor_name)
  VALUES (new_ver, _title, _description, _type, true, _contributor_name);

  RETURN new_ver;
END;
$$;
