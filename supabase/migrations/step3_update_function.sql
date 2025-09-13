-- Step 8: Main function to update monthly summary
CREATE OR REPLACE FUNCTION public.update_monthly_summary(
  p_user_id UUID,
  p_year INTEGER,
  p_month INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  v_total_income NUMERIC;
  v_total_inventory_cost NUMERIC;
  v_total_profit NUMERIC;
  v_days_recorded INTEGER;
  v_avg_daily_income NUMERIC;
  v_avg_daily_profit NUMERIC;
  v_month_name TEXT;
  v_month_year_display TEXT;
  v_growth_percentage NUMERIC DEFAULT 0;
  v_prev_month_profit NUMERIC;
BEGIN
  -- Calculate aggregated data from daily earnings
  SELECT 
    COALESCE(SUM(amount), 0),
    COALESCE(SUM(inventory_cost), 0),
    COALESCE(SUM(amount - inventory_cost), 0),
    COUNT(*)
  INTO 
    v_total_income,
    v_total_inventory_cost,
    v_total_profit,
    v_days_recorded
  FROM earnings
  WHERE user_id = p_user_id
    AND EXTRACT(YEAR FROM earning_date::date) = p_year
    AND EXTRACT(MONTH FROM earning_date::date) = p_month;

  -- Calculate averages
  v_avg_daily_income := CASE WHEN v_days_recorded > 0 THEN v_total_income / v_days_recorded ELSE 0 END;
  v_avg_daily_profit := CASE WHEN v_days_recorded > 0 THEN v_total_profit / v_days_recorded ELSE 0 END;

  -- Get month name and display format
  v_month_name := public.get_month_name(p_month);
  v_month_year_display := v_month_name || ' ' || p_year::text;

  -- Calculate growth percentage compared to previous month
  SELECT total_profit INTO v_prev_month_profit
  FROM monthly_summaries
  WHERE user_id = p_user_id
    AND ((year = p_year AND month = p_month - 1) OR (year = p_year - 1 AND month = 12 AND p_month = 1))
  ORDER BY year DESC, month DESC
  LIMIT 1;

  IF v_prev_month_profit IS NOT NULL AND v_prev_month_profit > 0 THEN
    v_growth_percentage := ((v_total_profit - v_prev_month_profit) / v_prev_month_profit) * 100;
  ELSIF v_total_profit > 0 THEN
    v_growth_percentage := 100;
  END IF;

  -- Insert or update monthly summary
  INSERT INTO monthly_summaries (
    user_id, year, month, month_name, month_year_display,
    total_income, total_inventory_cost, total_profit,
    days_recorded, avg_daily_income, avg_daily_profit, growth_percentage
  )
  VALUES (
    p_user_id, p_year, p_month, v_month_name, v_month_year_display,
    v_total_income, v_total_inventory_cost, v_total_profit,
    v_days_recorded, v_avg_daily_income, v_avg_daily_profit, v_growth_percentage
  )
  ON CONFLICT (user_id, year, month)
  DO UPDATE SET
    total_income = EXCLUDED.total_income,
    total_inventory_cost = EXCLUDED.total_inventory_cost,
    total_profit = EXCLUDED.total_profit,
    days_recorded = EXCLUDED.days_recorded,
    avg_daily_income = EXCLUDED.avg_daily_income,
    avg_daily_profit = EXCLUDED.avg_daily_profit,
    growth_percentage = EXCLUDED.growth_percentage,
    updated_at = now();
END;
$$;