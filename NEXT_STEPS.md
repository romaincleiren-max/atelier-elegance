# Prochaines Étapes - À Faire Maintenant

## 🎯 Objectif: Mettre le site en ligne

Suivez ces étapes dans l'ordre pour avoir votre site en production.

---

## Étape 1: Configurer Supabase (15 min)

### 1.1 Créer un compte
1. Allez sur [https://supabase.com](https://supabase.com)
2. Créez un compte (gratuit)
3. Cliquez sur "New Project"
4. Nom: `atelier-elegance`
5. Mot de passe BDD: Choisissez-en un fort et **notez-le**
6. Région: Europe West (Frankfurt)
7. Attendez 2-3 minutes

### 1.2 Créer les tables
1. Dans Supabase, menu gauche: **SQL Editor**
2. Cliquez sur "+ New query"
3. Ouvrez le fichier `supabase/migrations/001_initial_schema.sql`
4. Copiez tout le contenu
5. Collez dans l'éditeur SQL
6. Cliquez sur "Run" (en bas à droite)
7. Vous devez voir "Success"

### 1.3 Activer la sécurité
1. Nouvelle query dans SQL Editor
2. Ouvrez `supabase/migrations/002_rls_policies.sql`
3. Copiez/Collez
4. Run
5. Success !

### 1.4 Récupérer les clés
1. Menu gauche: **Settings** > **API**
2. Copiez ces deux valeurs:
   - **Project URL** (ex: https://xxxxx.supabase.co)
   - **anon public** (longue clé commençant par "eyJ...")

### 1.5 Configurer l'app
1. Ouvrez le fichier `.env` dans atelier-elegance
2. Remplacez:
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...votre-cle...
```

### 1.6 Tester en local
```bash
cd E:\Projets\atelier-elegance
npm run dev
```

Ouvrez [http://localhost:5173](http://localhost:5173)

- Cliquez sur "Connexion"
- Créez un compte
- Vérifiez vos emails Supabase
- Confirmez votre compte
- Connectez-vous

✅ Si ça marche, passez à l'étape 2 !

---

## Étape 2: Pousser sur GitHub (5 min)

### 2.1 Créer le repository
1. Allez sur [https://github.com/new](https://github.com/new)
2. Nom: `atelier-elegance`
3. Description: "Site de robes de mariée - Atelier Élégance"
4. Public ou Private (votre choix)
5. **Ne cochez RIEN** (pas de README, gitignore, licence)
6. "Create repository"

### 2.2 Pousser le code
Copiez votre nom d'utilisateur GitHub puis:

```bash
cd E:\Projets\atelier-elegance

# Premier commit
git add .
git commit -m "Initial commit - Site Atelier Élégance complet"

# Lier au repo GitHub (remplacez VOTRE-USERNAME)
git remote add origin https://github.com/VOTRE-USERNAME/atelier-elegance.git
git branch -M main
git push -u origin main
```

Entrez vos identifiants GitHub quand demandé.

✅ Rafraîchissez la page GitHub, votre code doit apparaître !

---

## Étape 3: Déployer sur Vercel (10 min)

### 3.1 Créer un compte Vercel
1. Allez sur [https://vercel.com](https://vercel.com)
2. "Sign Up" avec votre compte GitHub
3. Autorisez Vercel à accéder à GitHub

### 3.2 Importer le projet
1. Cliquez sur "Add New..." > "Project"
2. Trouvez `atelier-elegance` dans la liste
3. Cliquez sur "Import"

### 3.3 Configuration
1. **Framework Preset**: Vite (auto-détecté normalement)
2. **Root Directory**: ./
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`

### 3.4 Variables d'environnement (IMPORTANT!)
1. Cliquez sur "Environment Variables"
2. Ajoutez:

```
Name: VITE_SUPABASE_URL
Value: https://xxxxx.supabase.co (votre URL Supabase)

Name: VITE_SUPABASE_ANON_KEY
Value: eyJ... (votre clé anon)
```

3. Cliquez sur "Deploy"

### 3.5 Attendre le déploiement
- Attendez 2-3 minutes
- Vous verrez "Congratulations!" quand c'est prêt

✅ Copiez l'URL de votre site (ex: atelier-elegance.vercel.app)

---

## Étape 4: Finaliser Supabase (2 min)

### 4.1 Configurer l'URL de production
1. Retournez dans Supabase
2. **Authentication** > **URL Configuration**
3. **Site URL**: Collez votre URL Vercel
4. **Redirect URLs**: Ajoutez `https://votre-site.vercel.app/**`
5. Save

✅ Voilà ! Votre site est EN LIGNE !

---

## Vérification Finale

Visitez votre site Vercel:

1. ✅ Les robes s'affichent ?
2. ✅ Les filtres fonctionnent ?
3. ✅ Le modal s'ouvre ?
4. ✅ Vous pouvez créer un compte ?
5. ✅ Vous pouvez vous connecter ?

Si tout marche: **FÉLICITATIONS !** 🎉

---

## Problèmes Courants

### "Les robes ne s'affichent pas"
- Vérifiez que la migration SQL a bien fonctionné dans Supabase
- Regardez l'onglet "Table Editor" dans Supabase, vous devez voir 6 robes

### "Impossible de se connecter"
- Vérifiez que l'URL de redirection est bien configurée dans Supabase
- Vérifiez que les variables d'environnement sont bien dans Vercel

### "Build failed"
- Vérifiez que les variables d'environnement sont bien nommées (VITE_...)
- Regardez les logs d'erreur dans Vercel

---

## Après le Déploiement

### Personnalisation
1. Changez les couleurs dans `src/styles/main.css`
2. Changez les infos de contact dans `src/components/Footer.jsx`
3. Ajoutez vos vraies robes dans Supabase

### Ajouter des robes
1. Supabase > Table Editor > dresses
2. Insert row
3. Remplissez: name, style, description, price, category

### Partager
Votre site est en ligne à: `https://votre-site.vercel.app`

Partagez le lien ! 🎊

---

## Besoin d'Aide ?

Consultez:
- [QUICKSTART.md](QUICKSTART.md) - Démarrage rapide
- [SETUP_SUPABASE.md](SETUP_SUPABASE.md) - Configuration Supabase détaillée
- [DEPLOIEMENT.md](DEPLOIEMENT.md) - Guide de déploiement complet
- [PROJET_COMPLET.md](PROJET_COMPLET.md) - Vue d'ensemble du projet

---

Bon courage ! Vous y êtes presque ! 💪
