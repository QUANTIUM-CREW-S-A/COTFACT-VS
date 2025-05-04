-- Update company_info table to include user_id
ALTER TABLE company_info
DROP CONSTRAINT company_info_id_check,
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ALTER COLUMN id TYPE UUID USING gen_random_uuid(),
DROP CONSTRAINT IF EXISTS company_info_pkey,
ADD PRIMARY KEY (id);

-- Update template_preferences table to include user_id
ALTER TABLE template_preferences
DROP CONSTRAINT template_preferences_id_check,
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ALTER COLUMN id TYPE UUID USING gen_random_uuid(),
DROP CONSTRAINT IF EXISTS template_preferences_pkey,
ADD PRIMARY KEY (id);

-- Enable RLS
ALTER TABLE company_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own company info"
  ON company_info FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own company info"
  ON company_info FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own company info"
  ON company_info FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own template preferences"
  ON template_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own template preferences"
  ON template_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own template preferences"
  ON template_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);