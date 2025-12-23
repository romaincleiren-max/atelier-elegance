# Guide de Démarrage Rapide

## Pour tester localement (SANS Supabase)

Le site fonctionne en mode démo avec des données de test.

```bash
cd atelier-elegance
npm install
npm run dev
```

Ouvrez [http://localhost:5173](http://localhost:5173)

Vous verrez les 6 robes de la collection même sans Supabase configuré !

## Pour activer toutes les fonctionnalités

### 1. Créer un compte Supabase (gratuit)

1. Allez sur [https://supabase.com](https://supabase.com)
2. Créez un compte
3. Créez un nouveau projet

### 2. Configurer la base de données

1. Dans Supabase, allez dans **SQL Editor**
2. Copiez/collez le contenu de `supabase/migrations/001_initial_schema.sql`
3. Cliquez sur "Run"
4. Répétez avec `supabase/migrations/002_rls_policies.sql`

### 3. Récupérer les clés

1. Allez dans **Settings** > **API**
2. Copiez:
   - Project URL
   - anon public key

### 4. Configurer l'app

1. Créez un fichier `.env` à la racine:

```bash
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-cle-anon
```

2. Redémarrez le serveur:

```bash
npm run dev
```

### 5. Tester

- Cliquez sur "Connexion" dans le header
- Créez un compte
- Testez les favoris et les rendez-vous

## Déployer en production

```bash
# 1. Créer un repo Git
git init
git add .
git commit -m "Initial commit"

# 2. Pusher sur GitHub
# Créez un repo sur github.com puis:
git remote add origin https://github.com/VOTRE-USERNAME/atelier-elegance.git
git push -u origin main

# 3. Déployer sur Vercel
# Allez sur vercel.com
# Importez votre repo
# Ajoutez les variables d'environnement Supabase
# Deploy !
```

Voir [DEPLOIEMENT.md](DEPLOIEMENT.md) pour le guide complet.

## Problèmes courants

### Les robes ne s'affichent pas
- Vérifiez que les migrations SQL ont bien été exécutées
- Vérifiez la console du navigateur (F12)

### Erreur de connexion
- Vérifiez que les clés Supabase sont correctes dans `.env`
- Dans Supabase, allez dans **Authentication** > **URL Configuration**
- Ajoutez `http://localhost:5173/**` dans les Redirect URLs

### Build échoue
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Structure minimale

Fichiers essentiels:
- `src/App.jsx` - Point d'entrée
- `src/pages/Home.jsx` - Page d'accueil
- `src/styles/main.css` - Tous les styles
- `.env` - Configuration Supabase

## Prochaines étapes

1. Personnalisez les couleurs dans `src/styles/main.css`
2. Ajoutez vos propres robes dans Supabase
3. Personnalisez les informations de contact dans `src/components/Footer.jsx`
4. Ajoutez votre logo en remplaçant le texte "ATELIER ÉLÉGANCE"

Bon développement !
