-- Migration: Corriger les politiques RLS pour la table dresses
-- Description: Permet aux admins d'ajouter/modifier/supprimer des robes

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Public can view dresses" ON dresses;
DROP POLICY IF EXISTS "Admins can insert dresses" ON dresses;
DROP POLICY IF EXISTS "Admins can update dresses" ON dresses;
DROP POLICY IF EXISTS "Admins can delete dresses" ON dresses;

-- 1. Tout le monde peut VOIR les robes
CREATE POLICY "Public can view dresses"
ON dresses FOR SELECT
TO public
USING (true);

-- 2. Les admins peuvent AJOUTER des robes
CREATE POLICY "Admins can insert dresses"
ON dresses FOR INSERT
TO authenticated
WITH CHECK (
  (auth.jwt() ->> 'role')::text = 'admin'
);

-- 3. Les admins peuvent MODIFIER des robes
CREATE POLICY "Admins can update dresses"
ON dresses FOR UPDATE
TO authenticated
USING (
  (auth.jwt() ->> 'role')::text = 'admin'
)
WITH CHECK (
  (auth.jwt() ->> 'role')::text = 'admin'
);

-- 4. Les admins peuvent SUPPRIMER des robes
CREATE POLICY "Admins can delete dresses"
ON dresses FOR DELETE
TO authenticated
USING (
  (auth.jwt() ->> 'role')::text = 'admin'
);
