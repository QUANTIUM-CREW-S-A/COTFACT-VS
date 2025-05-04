-- Actualizar la tabla profiles para usar la nueva estructura de usuario con campos de 2FA mejorados
-- Este script debe ejecutarse en la consola SQL de Supabase

-- Actualizar la tabla profiles
ALTER TABLE profiles
  -- Agregar nuevos campos para nombre y apellido
  ADD COLUMN IF NOT EXISTS nombre VARCHAR(50),
  ADD COLUMN IF NOT EXISTS apellido VARCHAR(50),
  
  -- Campos para autenticación de dos factores (2FA) mejorada
  ADD COLUMN IF NOT EXISTS tfa_habilitado BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS tfa_metodo VARCHAR(10) CHECK (tfa_metodo IN ('app', 'sms', 'email') OR tfa_metodo IS NULL),
  ADD COLUMN IF NOT EXISTS tfa_backup_codes TEXT,
  ADD COLUMN IF NOT EXISTS tfa_ultimo_uso TIMESTAMP,
  
  -- Campos de auditoría y seguridad
  ADD COLUMN IF NOT EXISTS fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS ultimo_acceso TIMESTAMP,
  ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS token_recuperacion VARCHAR(255),
  ADD COLUMN IF NOT EXISTS expiracion_token TIMESTAMP,
  ADD COLUMN IF NOT EXISTS intentos_fallidos SMALLINT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bloqueado_hasta TIMESTAMP,
  ADD COLUMN IF NOT EXISTS creado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS ultima_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS modificado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Modificar restricciones del campo role
ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check,
  ADD CONSTRAINT profiles_role_check CHECK (role IN ('root', 'admin', 'audit'));

-- Actualizar la función para mantener actualizado el timestamp de modificación
CREATE OR REPLACE FUNCTION update_profiles_modified_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.ultima_modificacion = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger que actualiza automáticamente el timestamp
DROP TRIGGER IF EXISTS set_profiles_timestamp ON profiles;
CREATE TRIGGER set_profiles_timestamp
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_profiles_modified_timestamp();

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_profiles_activo ON profiles(activo);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Actualizar datos existentes: copiar full_name a nombre y apellido si están vacíos
UPDATE profiles
SET 
  nombre = SPLIT_PART(full_name, ' ', 1),
  apellido = SUBSTRING(full_name FROM POSITION(' ' IN full_name) + 1)
WHERE 
  nombre IS NULL AND apellido IS NULL AND full_name IS NOT NULL;

-- Actualizar datos existentes: sincronizar two_factor_enabled con tfa_habilitado
UPDATE profiles
SET 
  tfa_habilitado = two_factor_enabled,
  tfa_metodo = CASE WHEN two_factor_enabled THEN 'app' ELSE NULL END
WHERE 
  tfa_habilitado IS NULL;

-- Actualizar datos existentes: configurar fecha_creacion y ultimo_acceso
UPDATE profiles
SET 
  fecha_creacion = created_at,
  ultimo_acceso = last_login
WHERE 
  fecha_creacion IS NULL;