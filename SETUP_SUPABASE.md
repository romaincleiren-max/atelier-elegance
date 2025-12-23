# Configuration Supabase pour Atelier Élégance

## Étape 1: Créer un compte Supabase

1. Allez sur [https://supabase.com](https://supabase.com)
2. Créez un compte gratuit
3. Cliquez sur "New Project"

## Étape 2: Créer le projet

1. Nom du projet: `atelier-elegance` (ou votre choix)
2. Choisissez un mot de passe pour la base de données (notez-le !)
3. Région: Choisissez la plus proche (ex: Europe West)
4. Cliquez sur "Create new project"
5. Attendez 2-3 minutes que le projet soit créé

## Étape 3: Exécuter les migrations SQL

1. Dans le dashboard Supabase, allez dans **SQL Editor** (dans le menu gauche)
2. Cliquez sur "+ New query"
3. Copiez le contenu du fichier `supabase/migrations/001_initial_schema.sql`
4. Collez-le dans l'éditeur SQL
5. Cliquez sur "Run" pour créer les tables
6. Répétez l'opération avec le fichier `supabase/migrations/002_rls_policies.sql`

## Étape 4: Récupérer les clés API

1. Dans le dashboard Supabase, allez dans **Settings** > **API**
2. Vous verrez deux clés importantes:
   - **Project URL**: Votre URL Supabase
   - **anon public**: Votre clé publique (anon key)

## Étape 5: Configurer les variables d'environnement

1. Créez un fichier `.env` à la racine du projet:

```bash
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-cle-anon-publique
```

2. Remplacez `votre-projet` et `votre-cle-anon-publique` par vos vraies valeurs

## Étape 6: Configurer l'authentification

1. Dans Supabase, allez dans **Authentication** > **Providers**
2. Activez **Email** (déjà activé par défaut)
3. Dans **Authentication** > **URL Configuration**:
   - Site URL: `http://localhost:5173` (développement) ou votre URL de production
   - Redirect URLs: Ajoutez `http://localhost:5173/**` et votre URL de production

## Étape 7: Vérifier que tout fonctionne

1. Démarrez le serveur de développement:
```bash
npm run dev
```

2. Ouvrez [http://localhost:5173](http://localhost:5173)
3. Vous devriez voir les 6 robes affichées

## Tables créées

- **dresses**: Les robes de mariée
- **appointments**: Les rendez-vous pour essayage
- **favorites**: Les favoris des utilisateurs
- **custom_proposals**: Les demandes de robes personnalisées

## Sécurité

Toutes les tables sont protégées par Row Level Security (RLS):
- Les robes sont visibles par tous
- Les utilisateurs peuvent gérer leurs propres rendez-vous et favoris
- Seuls les admins peuvent modifier les robes et gérer les propositions

## Créer un compte admin (optionnel)

Pour créer un compte administrateur, exécutez ce SQL dans l'éditeur SQL:

```sql
-- Remplacez 'email@example.com' par votre email
UPDATE auth.users
SET raw_app_meta_data =
  raw_app_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'email@example.com';
```

## Déploiement (Vercel)

Lors du déploiement sur Vercel, ajoutez les variables d'environnement:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Dans **Settings** > **Environment Variables**
