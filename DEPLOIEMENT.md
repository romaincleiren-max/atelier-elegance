# Guide de Déploiement - Atelier Élégance

## Prérequis

- Un compte GitHub
- Un compte Vercel (gratuit)
- Supabase configuré (voir SETUP_SUPABASE.md)

## Étape 1: Initialiser Git

Dans le dossier `atelier-elegance`:

```bash
git init
git add .
git commit -m "Initial commit - Atelier Élégance"
```

## Étape 2: Créer un repository GitHub

1. Allez sur [https://github.com/new](https://github.com/new)
2. Nom du repository: `atelier-elegance`
3. Laissez-le en **Public** ou **Private** selon votre choix
4. Ne cochez **rien** (pas de README, .gitignore, license)
5. Cliquez sur "Create repository"

## Étape 3: Pousser le code sur GitHub

Copiez les commandes affichées sur GitHub (remplacez `VOTRE-USERNAME`):

```bash
git remote add origin https://github.com/VOTRE-USERNAME/atelier-elegance.git
git branch -M main
git push -u origin main
```

## Étape 4: Déployer sur Vercel

### Option A: Via le Dashboard Vercel (Recommandé)

1. Allez sur [https://vercel.com](https://vercel.com)
2. Connectez-vous avec votre compte GitHub
3. Cliquez sur "Add New Project"
4. Importez votre repository `atelier-elegance`
5. Configurez les paramètres:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

6. **IMPORTANT**: Ajoutez les variables d'environnement:
   - Cliquez sur "Environment Variables"
   - Ajoutez:
     - `VITE_SUPABASE_URL` = votre URL Supabase
     - `VITE_SUPABASE_ANON_KEY` = votre clé Supabase anon

7. Cliquez sur "Deploy"
8. Attendez 2-3 minutes

### Option B: Via la CLI Vercel

```bash
npm i -g vercel
vercel login
vercel
```

Suivez les instructions et ajoutez les variables d'environnement quand demandé.

## Étape 5: Configurer l'URL dans Supabase

1. Une fois déployé, copiez votre URL Vercel (ex: `https://atelier-elegance.vercel.app`)
2. Allez dans Supabase > **Authentication** > **URL Configuration**
3. Ajoutez votre URL Vercel dans:
   - **Site URL**: `https://atelier-elegance.vercel.app`
   - **Redirect URLs**: `https://atelier-elegance.vercel.app/**`

## Étape 6: Tester

1. Visitez votre site déployé
2. Testez la connexion/inscription
3. Vérifiez que les robes s'affichent correctement

## Mises à jour futures

Pour déployer des modifications:

```bash
git add .
git commit -m "Description des modifications"
git push
```

Vercel déploiera automatiquement les changements !

## Domaine personnalisé (Optionnel)

1. Dans Vercel, allez dans votre projet > **Settings** > **Domains**
2. Ajoutez votre domaine personnalisé
3. Suivez les instructions pour configurer les DNS
4. N'oubliez pas de mettre à jour l'URL dans Supabase

## Sécurité

Vérifications à faire:
- ✅ Les clés Supabase sont dans les variables d'environnement Vercel
- ✅ Le fichier `.env` est dans `.gitignore`
- ✅ Les RLS policies sont activées dans Supabase
- ✅ L'URL de production est configurée dans Supabase

## Monitoring

- Logs: Vercel Dashboard > votre projet > "Logs"
- Analytics: Vercel Dashboard > votre projet > "Analytics"
- Supabase: Supabase Dashboard > votre projet > "Logs"

## Support

En cas de problème:
- Vérifiez les logs dans Vercel
- Vérifiez la console du navigateur (F12)
- Vérifiez que les variables d'environnement sont bien configurées
