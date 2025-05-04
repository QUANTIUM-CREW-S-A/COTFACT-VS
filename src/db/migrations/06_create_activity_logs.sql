-- Migración para crear la tabla de logs de actividad

-- 1. Crear la tabla activity_logs
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  username VARCHAR(255),
  activity_type VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  details JSONB
);

-- 2. Crear índices para búsquedas comunes
CREATE INDEX IF NOT EXISTS activity_logs_user_id_idx ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS activity_logs_activity_type_idx ON activity_logs(activity_type);
CREATE INDEX IF NOT EXISTS activity_logs_created_at_idx ON activity_logs(created_at);
CREATE INDEX IF NOT EXISTS activity_logs_severity_idx ON activity_logs(severity);

-- 3. Configurar Row Level Security (RLS)
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- 4. Crear políticas de seguridad para la tabla
-- Administradores pueden ver todos los registros
CREATE POLICY "Admins can see all activity logs"
  ON activity_logs FOR SELECT
  USING (auth.uid() IN (
    SELECT id FROM profiles WHERE role IN ('admin', 'root')
  ));

-- Usuarios normales solo pueden ver sus propios registros
CREATE POLICY "Users can see only their own activity logs"
  ON activity_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Solo los administradores pueden eliminar registros
CREATE POLICY "Only admins can delete activity logs"
  ON activity_logs FOR DELETE
  USING (auth.uid() IN (
    SELECT id FROM profiles WHERE role IN ('admin', 'root')
  ));

-- Todos los usuarios autenticados pueden insertar registros (el sistema verifica la identidad al insertar)
CREATE POLICY "Authenticated users can insert activity logs"
  ON activity_logs FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- 5. Añadir comentarios para documentación
COMMENT ON TABLE activity_logs IS 'Registro de actividades y eventos de seguridad de usuarios';
COMMENT ON COLUMN activity_logs.id IS 'Identificador único del registro de actividad';
COMMENT ON COLUMN activity_logs.user_id IS 'ID del usuario que realizó la actividad';
COMMENT ON COLUMN activity_logs.activity_type IS 'Tipo de actividad (login, logout, password_change, etc.)';
COMMENT ON COLUMN activity_logs.description IS 'Descripción de la actividad realizada';
COMMENT ON COLUMN activity_logs.severity IS 'Nivel de severidad (info, warning, critical)';
COMMENT ON COLUMN activity_logs.details IS 'Detalles adicionales en formato JSON';

-- 6. Configurar para que esté incluida en realtime
ALTER PUBLICATION supabase_realtime ADD TABLE activity_logs;