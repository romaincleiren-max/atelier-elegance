-- Migration: Vérifier et configurer le rôle admin
-- Description: Ajoute le rôle admin à votre utilisateur

-- 1. Voir tous les utilisateurs et leurs rôles actuels
-- Exécutez cette requête pour voir votre email et votre rôle actuel:
SELECT id, email, raw_user_meta_data FROM auth.users;

-- 2. Remplacez 'VOTRE_EMAIL_ICI' par votre email réel
-- Puis exécutez cette commande pour ajouter le rôle admin:
UPDATE auth.users
SET raw_user_meta_data =
  CASE
    WHEN raw_user_meta_data IS NULL THEN '{"role": "admin"}'::jsonb
    ELSE raw_user_meta_data || '{"role": "admin"}'::jsonb
  END
WHERE email = 'VOTRE_EMAIL_ICI';

-- 3. Vérifiez que le rôle a bien été ajouté:
SELECT email, raw_user_meta_data ->> 'role' as role FROM auth.users WHERE email = 'VOTRE_EMAIL_ICI';

-- Note: Après avoir exécuté cette migration, vous devrez vous déconnecter et vous reconnecter
-- pour que le nouveau rôle soit pris en compte dans le JWT
