-- Correction SAFE des politiques RLS pour vérifier le rôle admin dans user_metadata
-- Ce script vérifie l'existence des tables avant de modifier les politiques
-- À exécuter dans Supabase SQL Editor

-- 1. Correction pour calendar_availability
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'calendar_availability') THEN
        DROP POLICY IF EXISTS "Seuls les admins peuvent gérer les disponibilités" ON calendar_availability;

        CREATE POLICY "Seuls les admins peuvent gérer les disponibilités"
            ON calendar_availability FOR ALL
            USING (
                (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
            )
            WITH CHECK (
                (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
            );

        RAISE NOTICE '✓ calendar_availability mis à jour';
    ELSE
        RAISE NOTICE '✗ calendar_availability n''existe pas';
    END IF;
END $$;

-- 2. Correction pour appointments
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'appointments') THEN
        DROP POLICY IF EXISTS "Les admins peuvent tout voir" ON appointments;
        CREATE POLICY "Les admins peuvent tout voir"
            ON appointments FOR SELECT
            USING (
                (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
                OR auth.uid()::text = user_id::text
            );

        DROP POLICY IF EXISTS "Les admins peuvent tout modifier" ON appointments;
        CREATE POLICY "Les admins peuvent tout modifier"
            ON appointments FOR ALL
            USING (
                (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
            )
            WITH CHECK (
                (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
            );

        RAISE NOTICE '✓ appointments mis à jour';
    ELSE
        RAISE NOTICE '✗ appointments n''existe pas';
    END IF;
END $$;

-- 3. Correction pour dresses
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'dresses') THEN
        DROP POLICY IF EXISTS "Seuls les admins peuvent gérer les robes" ON dresses;
        CREATE POLICY "Seuls les admins peuvent gérer les robes"
            ON dresses FOR ALL
            USING (
                (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
            )
            WITH CHECK (
                (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
            );

        RAISE NOTICE '✓ dresses mis à jour';
    ELSE
        RAISE NOTICE '✗ dresses n''existe pas';
    END IF;
END $$;

-- 4. Correction pour logos
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'logos') THEN
        DROP POLICY IF EXISTS "Seuls les admins peuvent gérer les logos" ON logos;
        CREATE POLICY "Seuls les admins peuvent gérer les logos"
            ON logos FOR ALL
            USING (
                (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
            )
            WITH CHECK (
                (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
            );

        RAISE NOTICE '✓ logos mis à jour';
    ELSE
        RAISE NOTICE '✗ logos n''existe pas';
    END IF;
END $$;

-- 5. Correction pour photos (si elle existe)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'photos') THEN
        DROP POLICY IF EXISTS "Seuls les admins peuvent gérer les photos" ON photos;
        CREATE POLICY "Seuls les admins peuvent gérer les photos"
            ON photos FOR ALL
            USING (
                (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
            )
            WITH CHECK (
                (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
            );

        RAISE NOTICE '✓ photos mis à jour';
    ELSE
        RAISE NOTICE '✗ photos n''existe pas (normal si pas encore créée)';
    END IF;
END $$;

-- Confirmation finale
SELECT '✅ Script terminé avec succès! Politiques RLS corrigées.' as message;
