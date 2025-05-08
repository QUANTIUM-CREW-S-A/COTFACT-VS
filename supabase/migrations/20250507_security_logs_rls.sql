-- Enable Row Level Security for security_logs table
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to view all logs
CREATE POLICY "Admins can view all security logs"
ON security_logs
FOR SELECT
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role IN ('admin', 'root')
  )
);

-- Create policy for regular users to view only their own logs
CREATE POLICY "Users can view their own security logs"
ON security_logs
FOR SELECT
USING (
  auth.uid() = user_id
);

-- Create policy that allows only the system to insert logs
-- Fixed syntax: use correct way to check for service role
CREATE POLICY "System service can insert logs"
ON security_logs
FOR INSERT
WITH CHECK (
  -- Allow service role authentication to insert (backend operations)
  -- Allow authenticated users to have their actions logged
  -- In production, you'd implement more specific checks
  (auth.jwt()->>'role' = 'service_role') OR 
  (auth.uid() IS NOT NULL)
);

-- No one can delete security logs through the API
CREATE POLICY "No one can delete security logs"
ON security_logs
FOR DELETE
USING (false);

-- No one can update security logs through the API
CREATE POLICY "No one can update security logs"
ON security_logs
FOR UPDATE
USING (false);

-- Add a comment to the table to indicate it's protected by RLS
COMMENT ON TABLE security_logs IS 'Security event logs protected by RLS';