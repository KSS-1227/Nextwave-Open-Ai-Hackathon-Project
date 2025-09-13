-- Step 9: Trigger function to automatically update monthly summary
CREATE OR REPLACE FUNCTION public.handle_earnings_monthly_summary()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_year INTEGER;
  v_month INTEGER;
BEGIN
  -- Handle INSERT and UPDATE
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    v_year := EXTRACT(YEAR FROM NEW.earning_date::date);
    v_month := EXTRACT(MONTH FROM NEW.earning_date::date);
    
    PERFORM public.update_monthly_summary(NEW.user_id, v_year, v_month);
    
    RETURN NEW;
  END IF;

  -- Handle DELETE
  IF TG_OP = 'DELETE' THEN
    v_year := EXTRACT(YEAR FROM OLD.earning_date::date);
    v_month := EXTRACT(MONTH FROM OLD.earning_date::date);
    
    PERFORM public.update_monthly_summary(OLD.user_id, v_year, v_month);
    
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$;

-- Step 10: Create trigger on earnings table
CREATE TRIGGER on_earnings_monthly_summary
  AFTER INSERT OR UPDATE OR DELETE ON public.earnings
  FOR EACH ROW EXECUTE FUNCTION public.handle_earnings_monthly_summary();