-- Step 1: Create monthly_summaries table
CREATE TABLE
  IF NOT EXISTS public.monthly_summaries (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL CHECK (
      month >= 1
      AND month <= 12
    ),
    month_name TEXT NOT NULL,
    month_year_display TEXT NOT NULL,
    total_income NUMERIC DEFAULT 0,
    total_inventory_cost NUMERIC DEFAULT 0,
    total_profit NUMERIC DEFAULT 0,
    days_recorded INTEGER DEFAULT 0,
    avg_daily_income NUMERIC DEFAULT 0,
    avg_daily_profit NUMERIC DEFAULT 0,
    growth_percentage NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now (),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now (),
    UNIQUE (user_id, year, month)
  );

-- Step 2: Enable Row Level Security
ALTER TABLE public.monthly_summaries ENABLE ROW LEVEL SECURITY;

-- Step 3: Create policies
CREATE POLICY "Users can view own monthly summaries" ON public.monthly_summaries FOR
SELECT
  USING (auth.uid () = user_id);

CREATE POLICY "Users can insert own monthly summaries" ON public.monthly_summaries FOR INSERT
WITH
  CHECK (auth.uid () = user_id);

CREATE POLICY "Users can update own monthly summaries" ON public.monthly_summaries FOR
UPDATE USING (auth.uid () = user_id);

-- Step 4: Create indexes
CREATE INDEX IF NOT EXISTS idx_monthly_summaries_user_id ON public.monthly_summaries (user_id);

CREATE INDEX IF NOT EXISTS idx_monthly_summaries_year_month ON public.monthly_summaries (year, month);

CREATE INDEX IF NOT EXISTS idx_monthly_summaries_month_year ON public.monthly_summaries (user_id, year, month);