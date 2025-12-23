-- Migration: Système admin complet en production
-- Description: Configuration sécurisée des rôles et permissions admin

-- 1. Réactiver RLS sur dresses
ALTER TABLE dresses ENABLE ROW LEVEL SECURITY;

-- 2. Supprimer toutes les anciennes politiques
DROP POLICY IF EXISTS "Public can view dresses" ON dresses;
DROP POLICY IF EXISTS "Admins can insert dresses" ON dresses;
DROP POLICY IF EXISTS "Admins can update dresses" ON dresses;
DROP POLICY IF EXISTS "Admins can delete dresses" ON dresses;

-- 3. Tout le monde peut VOIR les robes disponibles
CREATE POLICY "Public can view available dresses"
ON dresses FOR SELECT
TO public
USING (available = true);

-- 4. Les utilisateurs authentifiés avec role='admin' peuvent tout faire
CREATE POLICY "Admins can manage dresses"
ON dresses FOR ALL
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
)
WITH CHECK (
  (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
);

-- 5. Créer une fonction pour vérifier si un utilisateur est admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Ajouter le rôle admin à votre utilisateur
-- IMPORTANT: Remplacez 'VOTRE_EMAIL' par votre vrai email
UPDATE auth.users
SET raw_user_meta_data =
  COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
WHERE email = 'VOTRE_EMAIL';

-- 7. Vérifier que le rôle a été ajouté
SELECT
  email,
  raw_user_meta_data ->> 'role' as role,
  raw_user_meta_data
FROM auth.users
WHERE email = 'VOTRE_EMAIL';

-- Note: Après avoir exécuté cette migration:
-- 1. Déconnectez-vous du site
-- 2. Reconnectez-vous pour que le JWT soit rafraîchi avec le nouveau rôle
-- 3. Vous pourrez alors accéder aux pages admin
