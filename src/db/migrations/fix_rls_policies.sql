-- Migrate: Corrección de políticas RLS para resolver errores 406 (Not Acceptable)

-- Desactivar temporalmente la verificación de integridad referencial en cascada para permitir eliminar políticas
SET session_replication_role = replica;

-- 1. Recrear políticas RLS para la tabla template_preferences
DROP POLICY IF EXISTS "Usuarios pueden ver sus propias preferencias" ON public.template_preferences;
DROP POLICY IF EXISTS "Usuarios pueden modificar sus propias preferencias" ON public.template_preferences;
DROP POLICY IF EXISTS "Admins pueden ver todas las preferencias" ON public.template_preferences;

-- Crear políticas más permisivas para template_preferences
CREATE POLICY "Usuarios pueden ver sus propias preferencias"
  ON public.template_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden modificar sus propias preferencias"
  ON public.template_preferences FOR ALL
  USING (auth.uid() = user_id);

-- 2. Recrear políticas RLS para la tabla company_info
DROP POLICY IF EXISTS "Usuarios pueden ver la información de su empresa" ON public.company_info;
DROP POLICY IF EXISTS "Usuarios pueden modificar la información de su empresa" ON public.company_info;
DROP POLICY IF EXISTS "Admins pueden ver toda la información de las empresas" ON public.company_info;

-- Crear políticas más permisivas para company_info
CREATE POLICY "Usuarios pueden ver la información de su empresa"
  ON public.company_info FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden modificar la información de su empresa"
  ON public.company_info FOR ALL
  USING (auth.uid() = user_id);

-- 3. Asegurarse de que las tablas tengan Row Level Security habilitado
ALTER TABLE IF EXISTS public.template_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.company_info ENABLE ROW LEVEL SECURITY;

-- 4. Añadir headers control para permitir 'Accept: application/json' y evitar errores 406 en API
-- Esto se maneja desde el código en la función addCommonHeaders

-- Restaurar la verificación de integridad referencial
SET session_replication_role = DEFAULT;

-- Registrar cambio en metadatos de migración (opcional)
COMMENT ON TABLE public.template_preferences IS 'Preferencias de plantilla con políticas RLS corregidas para evitar errores 406';
COMMENT ON TABLE public.company_info IS 'Información de empresa con políticas RLS corregidas para evitar errores 406';