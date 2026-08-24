-- Schema de Base de Datos para Supabase (FiguCheck - Futsal Mendoza)
-- IMPORTANTE: En Supabase Dashboard -> Authentication -> Settings, desactivar "Enable email confirmations"

-- 1. Tabla de Equipos
CREATE TABLE IF NOT EXISTS public.teams (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "shortName" TEXT,
    "logoUrl" TEXT,
    "city" TEXT,
    "country" TEXT,
    "region" TEXT,
    "isActive" BOOLEAN DEFAULT true,
    "externalId" TEXT,
    "source" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    "sort_order" INT DEFAULT 0
);

-- Aseguramos columnas necesarias si la tabla ya existia
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS "shortName" TEXT;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS "logoUrl" TEXT;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS "city" TEXT;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS "country" TEXT;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS "region" TEXT;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS "externalId" TEXT;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS "source" TEXT;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS "sort_order" INT DEFAULT 0;

-- 2. Tabla de Figuritas
CREATE TABLE IF NOT EXISTS public.stickers (
    "id" SERIAL PRIMARY KEY,
    "sticker_number" INT NOT NULL UNIQUE,
    "team_id" TEXT REFERENCES public.teams("id"),
    "slot_number" INT NOT NULL,
    "player_name" TEXT,
    "position" TEXT
);

-- 3. Tabla de Perfiles de Usuario (vinculada a Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    "id" UUID PRIMARY KEY REFERENCES auth.users("id") ON DELETE CASCADE,
    "username" TEXT NOT NULL UNIQUE,
    "phone_whatsapp" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS "phone_whatsapp" TEXT;

-- 4. Tabla de Progreso del Usuario (vinculada a auth user id)
CREATE TABLE IF NOT EXISTS public.user_stickers (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID REFERENCES auth.users("id") ON DELETE CASCADE,
    "sticker_number" INT NOT NULL,
    "count" INT DEFAULT 0,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE("user_id", "sticker_number")
);

-- Si la tabla user_stickers ya existia con la version anterior, agregamos la columna user_id
ALTER TABLE public.user_stickers ADD COLUMN IF NOT EXISTS "user_id" UUID REFERENCES auth.users("id") ON DELETE CASCADE;

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stickers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stickers ENABLE ROW LEVEL SECURITY;

-- Limpieza de politicas viejas si existian
DROP POLICY IF EXISTS "Permitir operacion publica de progreso por sync_code" ON public.user_stickers;
DROP POLICY IF EXISTS "Permitir lectura publica de perfiles" ON public.profiles;
DROP POLICY IF EXISTS "Permitir operacion publica de perfiles" ON public.profiles;

DO $$ 
BEGIN
    -- Equipos: lectura publica
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'teams_read_public') THEN
        CREATE POLICY "teams_read_public" ON public.teams FOR SELECT USING (true);
    END IF;

    -- Figuritas: lectura publica
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'stickers_read_public') THEN
        CREATE POLICY "stickers_read_public" ON public.stickers FOR SELECT USING (true);
    END IF;

    -- Perfiles: lectura publica (para el matchmaking), escritura solo del propio usuario
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'profiles_read_public') THEN
        CREATE POLICY "profiles_read_public" ON public.profiles FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'profiles_insert_own') THEN
        CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = "id");
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'profiles_update_own') THEN
        CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = "id");
    END IF;

    -- User Stickers: lectura publica (para matchmaking), escritura solo del propio usuario
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'user_stickers_read_public') THEN
        CREATE POLICY "user_stickers_read_public" ON public.user_stickers FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'user_stickers_insert_own') THEN
        CREATE POLICY "user_stickers_insert_own" ON public.user_stickers FOR INSERT WITH CHECK (auth.uid() = "user_id");
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'user_stickers_update_own') THEN
        CREATE POLICY "user_stickers_update_own" ON public.user_stickers FOR UPDATE USING (auth.uid() = "user_id");
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'user_stickers_delete_own') THEN
        CREATE POLICY "user_stickers_delete_own" ON public.user_stickers FOR DELETE USING (auth.uid() = "user_id");
    END IF;
END $$;

-- Funcion para crear perfil automaticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles ("id", "username", "phone_whatsapp")
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'username',
        NEW.raw_user_meta_data->>'phone_whatsapp'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: al crear usuario en auth, crear perfil automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed de Equipos (Insert de los 16 equipos provistos + Leyendas)
INSERT INTO "public"."teams" ("id", "name", "slug", "shortName", "logoUrl", "city", "country", "region", "isActive", "externalId", "source", "createdAt", "updatedAt", "sort_order") VALUES 
('cmsp137zv000dhqegrhijcmov', 'Alemán', 'aleman', 'ALE', 'https://cdn.scorefy.app/teams/shield/buqhdbuybepnrwfj45861sfmv.png', 'Mendoza', 'Argentina', 'Mendoza', true, null, 'scorefy', '2026-08-11 19:03:19.867', '2026-08-11 19:03:19.867', 1),
('cmsp139ig000ghqegsphkdkre', 'Don Orione', 'don-orione', 'DOR', 'https://cdn.scorefy.app/teams/shield/xxvykydpifsapfau72439crkk.png', 'Mendoza', 'Argentina', 'Mendoza', true, null, 'scorefy', '2026-08-11 19:03:21.832', '2026-08-11 19:03:21.832', 2),
('cmsp13b6h000jhqeglqyfozdv', 'Godoy Cruz', 'godoy-cruz', 'GCR', 'https://cdn.scorefy.app/teams/shield/tpuenmmsfepzkuvs52687qkrz.png', 'Mendoza', 'Argentina', 'Mendoza', true, null, 'scorefy', '2026-08-11 19:03:23.797', '2026-08-11 19:03:23.797', 3),
('cmsp13cp1000mhqegnsa36d9r', 'Jockey Club', 'jockey-club', 'JOC', 'https://cdn.scorefy.app/teams/shield/xiixkzqhypqkmtyr19648wlcf.png', 'Mendoza', 'Argentina', 'Mendoza', true, null, 'scorefy', '2026-08-11 19:03:25.958', '2026-08-11 19:03:25.958', 4),
('cmsp13e7n000phqegoylv9yyj', 'Andes Talleres', 'andes-talleres', 'AND', 'https://cdn.scorefy.app/teams/shield/tziicpsffzkwooln63257wnaj.png', 'Mendoza', 'Argentina', 'Mendoza', true, null, 'scorefy', '2026-08-11 19:03:27.923', '2026-08-11 19:03:27.923', 5),
('cmsp13fq9000shqegi9bzhg5k', 'Regatas', 'regatas', 'REG', 'https://cdn.scorefy.app/teams/shield/adrithlvwtdhgcxm44467psde.png', 'Mendoza', 'Argentina', 'Mendoza', true, null, 'scorefy', '2026-08-11 19:03:29.889', '2026-08-11 19:03:29.889', 6),
('cmsp13h8v000vhqegw96lw1bj', 'Muni San Martín', 'muni-san-martin', 'MSM', 'https://cdn.scorefy.app/teams/shield/clv9y14tc0002s5sdcij3kdes.png', 'Mendoza', 'Argentina', 'Mendoza', true, null, 'scorefy', '2026-08-11 19:03:31.856', '2026-08-11 19:03:31.856', 7),
('cmsp13iri000yhqege5jazq8s', 'Villa Hipódromo', 'villa-hipodromo', 'VHI', 'https://cdn.scorefy.app/teams/shield/wejbvnpjfddprayi56851nywm.png', 'Mendoza', 'Argentina', 'Mendoza', true, null, 'scorefy', '2026-08-11 19:03:33.823', '2026-08-11 19:03:33.823', 8),
('cmsp13ka30011hqeg8ca92zke', 'Cementista', 'cementista', 'CEM', 'https://cdn.scorefy.app/teams/shield/niujlcyjulnsrfss48567ijaa.png', 'Mendoza', 'Argentina', 'Mendoza', true, null, 'scorefy', '2026-08-11 19:03:35.787', '2026-08-11 19:03:35.787', 9),
('cmsp13lso0014hqeg8ax6hd6p', 'Independiente Rivadavia', 'independiente-rivadavia', 'IND', 'https://cdn.scorefy.app/teams/shield/jlmvlskhdofdgywx21537tyml.png', 'Mendoza', 'Argentina', 'Mendoza', true, null, 'scorefy', '2026-08-11 19:03:37.752', '2026-08-11 19:03:37.752', 10),
('cmsp13ngr0017hqegz4wq7chr', 'Vistalba La Colonia', 'vistalba-la-colonia', 'VIS', 'https://cdn.scorefy.app/teams/shield/qcovjxoltlivasyy94560eqge.png', 'Mendoza', 'Argentina', 'Mendoza', true, null, 'scorefy', '2026-08-11 19:03:39.718', '2026-08-11 19:03:39.718', 11),
('cmsp13ozb001ahqegl5m8lev7', 'Don Bosco', 'don-bosco', 'BOC', 'https://cdn.scorefy.app/teams/shield/evgubysfaryqquxp91003epne.png', 'Mendoza', 'Argentina', 'Mendoza', true, null, 'scorefy', '2026-08-11 19:03:41.879', '2026-08-11 19:03:41.879', 12),
('cmsp13qhw001dhqeg0f1r8i9s', 'CUC', 'cuc', 'CUC', 'https://cdn.scorefy.app/teams/shield/tythronuthqkvmdl94637zbol.png', 'Mendoza', 'Argentina', 'Mendoza', true, null, 'scorefy', '2026-08-11 19:03:43.844', '2026-08-11 19:03:43.844', 13),
('cmsp13s0g001ghqeg1swj13h3', 'UMAZA', 'umaza', 'UMA', 'https://cdn.scorefy.app/teams/shield/rvrkcfvivhratbxd30828eoll.png', 'Mendoza', 'Argentina', 'Mendoza', true, null, 'scorefy', '2026-08-11 19:03:45.809', '2026-08-11 19:03:45.809', 14),
('cmsp13tj2001jhqegey0eywv5', 'Banco Nación', 'banco-nacion', 'BNA', 'https://cdn.scorefy.app/teams/shield/iqsonebbiywvoxzr63562kwcg.png', 'Mendoza', 'Argentina', 'Mendoza', true, null, 'scorefy', '2026-08-11 19:03:47.775', '2026-08-11 19:03:47.775', 15),
('cmsp13v1p001mhqegogaalc4b', 'COP', 'cop', 'COP', 'https://cdn.scorefy.app/teams/shield/uuouhvydksjxykxe23230jxen.png', 'Mendoza', 'Argentina', 'Mendoza', true, null, 'scorefy', '2026-08-11 19:03:49.741', '2026-08-11 19:03:49.741', 16),
('leyendas-extra-slot-id', 'Leyendas', 'leyendas', 'LEY', 'https://cdn-icons-png.flaticon.com/512/616/616490.png', 'Mendoza', 'Argentina', 'Mendoza', true, null, 'figucheck', '2026-08-11 19:03:50.000', '2026-08-11 19:03:50.000', 17)
ON CONFLICT (id) DO NOTHING;
