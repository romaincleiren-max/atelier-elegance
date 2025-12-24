-- Migration pour corriger les policies RLS dangereuses
-- Supprime la clause "OR auth.uid() IS NULL" qui permet l'accès non authentifié

-- 1. Supprimer l'ancienne policy dangereuse pour appointments INSERT
DROP POLICY IF EXISTS "Les utilisateurs peuvent créer des rendez-vous" ON appointments;

-- Créer la nouvelle policy sécurisée (seulement utilisateurs authentifiés)
CREATE POLICY "Les utilisateurs peuvent créer des rendez-vous"
    ON appointments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 2. Supprimer l'ancienne policy dangereuse pour custom_proposals INSERT
DROP POLICY IF EXISTS "Les utilisateurs peuvent créer des propositions" ON custom_proposals;

-- Créer la nouvelle policy sécurisée
CREATE POLICY "Les utilisateurs peuvent créer des propositions"
    ON custom_proposals FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Note: Les utilisateurs doivent maintenant être authentifiés pour créer
-- des rendez-vous ou des propositions personnalisées
