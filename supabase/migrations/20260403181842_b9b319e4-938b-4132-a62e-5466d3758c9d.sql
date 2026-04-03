
CREATE OR REPLACE FUNCTION public.get_user_achievements()
 RETURNS json
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _user_id uuid;
  _total numeric;
  _monthly json;
  _milestones json;
  _plates json;
BEGIN
  _user_id := auth.uid();
  IF _user_id IS NULL THEN
    RETURN json_build_object('error', 'not authenticated');
  END IF;

  SELECT COALESCE(SUM(amount), 0) INTO _total
  FROM public.financial_transactions
  WHERE user_id = _user_id AND type = 'receita' AND status = 'pago';

  SELECT json_agg(row_to_json(m)) INTO _monthly
  FROM (
    SELECT 
      to_char(date_trunc('month', paid_date::date), 'Mon/YY') as month_label,
      to_char(date_trunc('month', paid_date::date), 'YYYY-MM') as month_key,
      COALESCE(SUM(amount), 0) as total
    FROM public.financial_transactions
    WHERE user_id = _user_id 
      AND type = 'receita' 
      AND status = 'pago'
      AND paid_date IS NOT NULL
      AND paid_date::date >= (now() - interval '12 months')::date
    GROUP BY date_trunc('month', paid_date::date)
    ORDER BY date_trunc('month', paid_date::date)
  ) m;

  SELECT json_agg(json_build_object(
    'label', ml.label,
    'value', ml.val,
    'reached', _total >= ml.val
  )) INTO _milestones
  FROM (VALUES 
    ('R$ 1k', 1000),
    ('R$ 5k', 5000),
    ('R$ 10k', 10000),
    ('R$ 20k', 20000),
    ('R$ 30k', 30000),
    ('R$ 40k', 40000),
    ('R$ 50k', 50000)
  ) AS ml(label, val);

  SELECT json_agg(json_build_object(
    'label', pl.label,
    'value', pl.val,
    'reached', _total >= pl.val
  )) INTO _plates
  FROM (VALUES 
    ('100K', 100000),
    ('250K', 250000),
    ('500K', 500000),
    ('1M', 1000000)
  ) AS pl(label, val);

  RETURN json_build_object(
    'total_revenue', _total,
    'monthly', COALESCE(_monthly, '[]'::json),
    'milestones', _milestones,
    'plates', _plates
  );
END;
$function$;
