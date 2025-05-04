-- Recrear la tabla profiles desde cero en Supabase
-- Este script debe ejecutarse en la consola SQL de Supabase

-- 1. Crear la tabla profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  nombre VARCHAR(50),
  apellido VARCHAR(50),
  role VARCHAR(20) NOT NULL DEFAULT 'audit' CHECK (role IN ('root', 'admin', 'audit')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP WITH TIME ZONE,
  
  -- Campos para autenticación de dos factores (2FA)
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  two_factor_secret TEXT,
  tfa_habilitado BOOLEAN DEFAULT FALSE,
  tfa_metodo VARCHAR(10) CHECK (tfa_metodo IN ('app', 'sms', 'email') OR tfa_metodo IS NULL),
  tfa_backup_codes TEXT,
  tfa_ultimo_uso TIMESTAMP WITH TIME ZONE,
  
  -- Campos de auditoría y seguridad
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  ultimo_acceso TIMESTAMP WITH TIME ZONE,
  activo BOOLEAN DEFAULT TRUE,
  token_recuperacion VARCHAR(255),
  expiracion_token TIMESTAMP WITH TIME ZONE,
  intentos_fallidos SMALLINT DEFAULT 0,
  bloqueado_hasta TIMESTAMP WITH TIME ZONE,
  creado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ultima_modificacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  modificado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Restricciones adicionales
  CONSTRAINT username_length CHECK (char_length(username) >= 3)
);

-- 2. Configurar permisos RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Crear políticas RLS
CREATE POLICY "Usuarios pueden ver sus propios perfiles"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Usuarios pueden actualizar sus propios perfiles"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins pueden ver todos los perfiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('root', 'admin')
    )
  );

CREATE POLICY "Root y admins pueden actualizar perfiles"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('root', 'admin')
    )
  );

CREATE POLICY "Root y admins pueden insertar perfiles"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('root', 'admin')
    )
  );

-- 4. Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_activo ON profiles(activo);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- 5. Crear función para actualizar timestamp de modificación
CREATE OR REPLACE FUNCTION update_profiles_modified_timestamp()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.ultima_modificacion = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Crear trigger para actualizar timestamp automáticamente
CREATE TRIGGER set_profiles_timestamp
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_profiles_modified_timestamp();

-- 7. Configurar publicación Realtime
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;

-- 8. Crear usuario root inicial para pruebas (opcional, ajustar según necesidades)
-- NOTA: Reemplazar 'ID_USUARIO_EXISTENTE' con el ID real del usuario en auth.users
-- INSERT INTO public.profiles (id, username, email, full_name, role, nombre, apellido)
-- VALUES ('ID_USUARIO_EXISTENTE', 'root', 'admin@example.com', 'Administrador Root', 'root', 'Administrador', 'Root')
-- ON CONFLICT (id) DO NOTHING;

-- 9. Comentario final
COMMENT ON TABLE public.profiles IS 'Perfiles de usuario con información extendida y campos para 2FA';