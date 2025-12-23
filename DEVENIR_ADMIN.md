# Comment devenir Admin

## Étape 1 : Exécuter la migration RLS

Dans **Supabase > SQL Editor**, exécutez le fichier :
```
supabase/migrations/004_admin_rls_policies.sql
```

Cela modifie les permissions pour que les admins puissent voir TOUS les rendez-vous.

## Étape 2 : Donner le rôle admin à votre compte

Dans **Supabase > SQL Editor**, exécutez cette requête en remplaçant l'email par le vôtre :

```sql
-- Remplacez 'votre-email@example.com' par votre vrai email
UPDATE auth.users
SET raw_app_meta_data =
  COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
WHERE email = 'votre-email@example.com';
```

**Exemple** :
```sql
UPDATE auth.users
SET raw_app_meta_data =
  COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
WHERE email = 'admin@atelier-elegance.fr';
```

## Étape 3 : Se déconnecter et se reconnecter

1. Allez sur votre site
2. Déconnectez-vous complètement
3. Reconnectez-vous avec votre compte

Le rôle admin sera maintenant actif dans votre JWT (token d'authentification).

## Étape 4 : Vérifier que ça marche

1. Allez sur `/admin`
2. Vous devriez maintenant voir **TOUS** les rendez-vous (pas seulement les vôtres)
3. Vous pouvez gérer tous les rendez-vous

## Vérifier votre rôle admin

Pour vérifier que le rôle admin est bien attribué, exécutez cette requête SQL :

```sql
SELECT
  email,
  raw_app_meta_data->>'role' as role
FROM auth.users
WHERE email = 'votre-email@example.com';
```

Vous devriez voir :
```
email                        | role
---------------------------- | -----
votre-email@example.com      | admin
```

## Troubleshooting

### Je ne vois toujours pas tous les rendez-vous

1. Vérifiez que vous avez bien exécuté la migration `004_admin_rls_policies.sql`
2. Vérifiez que le rôle admin est bien dans vos métadonnées (requête ci-dessus)
3. **IMPORTANT** : Déconnectez-vous et reconnectez-vous pour rafraîchir le JWT
4. Videz le cache du navigateur si nécessaire (Ctrl+Shift+R)

### Erreur "permission denied"

Si vous avez une erreur de permission, c'est que les RLS policies ne sont pas correctement configurées. Réexécutez la migration `004_admin_rls_policies.sql`.

## Retirer le rôle admin à quelqu'un

```sql
UPDATE auth.users
SET raw_app_meta_data =
  raw_app_meta_data - 'role'
WHERE email = 'email-a-retirer@example.com';
```

## Donner le rôle admin à plusieurs personnes

Répétez simplement la requête de l'Étape 2 pour chaque email :

```sql
UPDATE auth.users
SET raw_app_meta_data =
  COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
WHERE email IN (
  'admin1@example.com',
  'admin2@example.com',
  'admin3@example.com'
);
```
