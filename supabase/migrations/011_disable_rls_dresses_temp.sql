-- Migration temporaire: Désactiver RLS sur dresses pour déboguer
-- ATTENTION: À utiliser uniquement en développement!
-- En production, vous devrez réactiver RLS et configurer correctement les rôles

-- Désactiver RLS sur la table dresses (TEMPORAIRE)
ALTER TABLE dresses DISABLE ROW LEVEL SECURITY;

-- Note: Pour réactiver RLS plus tard, utilisez:
-- ALTER TABLE dresses ENABLE ROW LEVEL SECURITY;

-- Cette solution permet de tester sans problème de permissions
-- Mais en production, il faudra:
-- 1. Réactiver RLS
-- 2. Configurer correctement les politiques
-- 3. S'assurer que les utilisateurs admin ont le bon rôle dans leur JWT
