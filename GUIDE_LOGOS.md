# Guide de Gestion des Logos

## Vue d'ensemble

Le système de logos permet à l'admin de gérer tous les logos affichés sur le site (logo principal, partenaires, sponsors, etc.).

## Emplacements disponibles

Les logos peuvent être placés dans différentes zones du site :

1. **header** - En-tête du site (logo principal)
2. **footer** - Pied de page
3. **hero** - Page d'accueil (section hero)
4. **sponsors** - Section sponsors (page d'accueil)
5. **partenaires** - Section partenaires (footer)
6. **sidebar** - Barre latérale (réservé)

## Accès à la gestion des logos

1. Connectez-vous en tant qu'admin
2. Allez sur `/admin`
3. Cliquez sur **🎨 Logos**
4. Vous arrivez sur `/admin/logos`

## Ajouter un logo

### 1. Upload de l'image

- Cliquez sur "Choisir un fichier"
- Formats acceptés : PNG, JPG, SVG, WebP
- Recommandations :
  - PNG avec transparence pour les logos
  - SVG pour la meilleure qualité
  - Taille max recommandée : 500KB

### 2. Remplir les informations

**Champs obligatoires :**
- **Nom** : Nom du logo (ex: "Logo Principal", "Partenaire X")
- **Image** : Uploadée à l'étape précédente
- **Emplacement** : Choisir où afficher le logo

**Champs optionnels :**
- **Description** : Description du logo
- **Largeur** : Largeur en pixels (laissez vide pour auto)
- **Hauteur** : Hauteur en pixels (laissez vide pour auto)
- **Ordre** : Ordre d'affichage (1 = premier)
- **Lien URL** : URL de redirection si le logo est cliquable
- **Actif** : Cocher pour afficher le logo sur le site

### 3. Enregistrer

Cliquez sur **Ajouter** pour sauvegarder.

## Modifier un logo

1. Dans la liste des logos, cliquez sur **Modifier**
2. Modifiez les informations
3. Cliquez sur **Modifier** pour enregistrer

## Supprimer un logo

1. Cliquez sur **Supprimer**
2. Confirmez la suppression

⚠️ **Attention** : La suppression est définitive !

## Activer/Désactiver un logo

- Éditez le logo
- Décochez "Logo actif" pour le cacher
- Cliquez sur "Modifier"

Le logo reste dans la base de données mais n'est plus visible sur le site.

## Bonnes pratiques

### Dimensions recommandées

| Emplacement | Largeur | Hauteur | Format |
|-------------|---------|---------|--------|
| Header | 150-200px | 50-80px | PNG/SVG |
| Footer | 100-150px | 40-60px | PNG/SVG |
| Sponsors | 120-180px | 60-80px | PNG/JPG |
| Partenaires | 100-150px | 50-70px | PNG/JPG |

### Ordre d'affichage

- Les logos sont affichés par ordre croissant
- Ordre 1 = affiché en premier
- Ordre 2 = affiché en deuxième, etc.

### URLs de liens

- Utilisez des URLs complètes : `https://example.com`
- Les liens s'ouvrent dans un nouvel onglet
- Laissez vide si le logo ne doit pas être cliquable

## Migrations Supabase à appliquer

Avant d'utiliser le système de logos, appliquez ces migrations dans Supabase :

1. **Migration 019** - Table logos
2. **Migration 020** - Bucket storage logos

### Comment appliquer

1. Allez sur https://supabase.com/dashboard
2. Projet : `whcvnmtidvdfpbwgvpoq`
3. SQL Editor
4. Copiez le contenu de `supabase/migrations/019_logos_system.sql`
5. Exécutez (**Run**)
6. Répétez pour `020_logos_storage_bucket.sql`

## Affichage sur le site

Les logos actifs s'affichent automatiquement dans les emplacements configurés :

- **Footer** : Logos avec placement "footer" ou "partenaires"
- **Home** : Section sponsors avec placement "sponsors"
- **Header** : Logos avec placement "header" (à personnaliser)

## Dépannage

### Le logo ne s'affiche pas
- Vérifiez que le logo est **actif**
- Vérifiez l'URL de l'image (doit être https://)
- Vérifiez le **placement** choisi

### L'image est trop grande/petite
- Modifiez les dimensions (Largeur/Hauteur)
- Ou utilisez une image de taille adaptée

### Le lien ne fonctionne pas
- Vérifiez que l'URL commence par `https://`
- Le lien s'ouvre dans un nouvel onglet

## Support

Pour toute question, contactez le développeur.
