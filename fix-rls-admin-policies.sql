-- Correction des politiques RLS pour vérifier le rôle admin dans user_metadata
-- À exécuter dans Supabase SQL Editor

-- 1. Correction pour calendar_availability
DROP POLICY IF EXISTS "Seuls les admins peuvent gérer les disponibilités" ON calendar_availability;

CREATE POLICY "Seuls les admins peuvent gérer les disponibilités"
    ON calendar_availability FOR ALL
    USING (
        (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
    )
    WITH CHECK (
        (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
    );

-- 2. Vérifier et corriger d'autres tables qui pourraient avoir le même problème
-- appointments
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

-- 3. dresses (collections)
DROP POLICY IF EXISTS "Seuls les admins peuvent gérer les robes" ON dresses;
CREATE POLICY "Seuls les admins peuvent gérer les robes"
    ON dresses FOR ALL
    USING (
        (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
    )
    WITH CHECK (
        (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
    );

-- 4. logos
DROP POLICY IF EXISTS "Seuls les admins peuvent gérer les logos" ON logos;
CREATE POLICY "Seuls les admins peuvent gérer les logos"
    ON logos FOR ALL
    USING (
        (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
    )
    WITH CHECK (
        (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
    );

-- 5. photos
DROP POLICY IF EXISTS "Seuls les admins peuvent gérer les photos" ON photos;
CREATE POLICY "Seuls les admins peuvent gérer les photos"
    ON photos FOR ALL
    USING (
        (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
    )
    WITH CHECK (
        (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
    );

-- Confirmation
SELECT 'Politiques RLS corrigées avec succès!' as message;
