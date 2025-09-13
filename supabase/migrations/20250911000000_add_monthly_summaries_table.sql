-- Create monthly_summaries table to store monthly financial data with month names
CREATE TABLE public.monthly_summaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  month_name TEXT NOT NULL, -- Full month name like "January", "February", etc.
  month_year_display TEXT NOT NULL, -- Display format like "January 2025"
  total_income NUMERIC DEFAULT 0,
  total_inventory_cost NUMERIC DEFAULT 0,
  total_profit NUMERIC DEFAULT 0,
  days_recorded INTEGER DEFAULT 0,
  avg_daily_income NUMERIC DEFAULT 0,
  avg_daily_profit NUMERIC DEFAULT 0,
  growth_percentage NUMERIC DEFAULT 0, -- Growth compared to previous month
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  
  -- Ensure one record per user per month
  UNIQUE(user_id, year, month)
);

-- Enable Row Level Security
ALTER TABLE public.monthly_summaries ENABLE ROW LEVEL SECURITY;

-- Create policies for monthly_summaries
CREATE POLICY "Users can view own monthly summaries" 
ON public.monthly_summaries 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own monthly summaries" 
ON public.monthly_summaries 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own monthly summaries" 
ON public.monthly_summaries 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_monthly_summaries_user_id ON public.monthly_summaries(user_id);
CREATE INDEX idx_monthly_summaries_year_month ON public.monthly_summaries(year, month);
CREATE INDEX idx_monthly_summaries_month_year ON public.monthly_summaries(user_id, year, month);

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create trigger for updated_at
CREATE TRIGGER on_monthly_summaries_updated
  BEFORE UPDATE ON public.monthly_summaries
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to get month name from month number
CREATE OR REPLACE FUNCTION public.get_month_name(month_num INTEGER)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN CASE month_num
    WHEN 1 THEN 'January'
    WHEN 2 THEN 'February'
    WHEN 3 THEN 'March'
    WHEN 4 THEN 'April'
    WHEN 5 THEN 'May'
    WHEN 6 THEN 'June'
    WHEN 7 THEN 'July'
    WHEN 8 THEN 'August'
    WHEN 9 THEN 'September'
    WHEN 10 THEN 'October'
    WHEN 11 THEN 'November'
    WHEN 12 THEN 'December'
    ELSE 'Unknown'
  END;
END;
$$;

-- Function to update or create monthly summary
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
    v_growth_percentage := 100; -- First month with profit
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

-- Trigger function to automatically update monthly summary when earnings change
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

-- Create trigger on earnings table
CREATE TRIGGER on_earnings_monthly_summary
  AFTER INSERT OR UPDATE OR DELETE ON public.earnings
  FOR EACH ROW EXECUTE FUNCTION public.handle_earnings_monthly_summary();