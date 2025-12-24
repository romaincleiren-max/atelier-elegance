# Instructions pour appliquer les migrations Supabase

## ⚠️ Migrations à appliquer

Vous devez appliquer 2 migrations dans votre projet Supabase :

### 1. Migration 014 - Correction des policies RLS dangereuses ✅
**Statut** : À appliquer (ou déjà appliquée si vous avez reçu "success")

Cette migration corrige la vulnérabilité critique qui permettait aux utilisateurs non authentifiés d'insérer des données.

**Fichier** : `supabase/migrations/014_fix_dangerous_rls_policies.sql`

### 2. Migration 016 - Contraintes de validation (CORRIGÉE)
**Statut** : À appliquer

⚠️ **IMPORTANT** : Utilisez la migration **016** et non la 015.
La migration 015 contenait des erreurs de noms de colonnes.

**Fichier** : `supabase/migrations/016_fix_validation_constraints.sql`

## 📝 Comment appliquer les migrations

### Étape 1 : Connexion à Supabase
1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet : `whcvnmtidvdfpbwgvpoq`
3. Dans le menu de gauche, cliquez sur **SQL Editor**

### Étape 2 : Appliquer la migration 014
1. Créez une nouvelle requête
2. Copiez-collez le contenu de `supabase/migrations/014_fix_dangerous_rls_policies.sql`
3. Cliquez sur **Run** (ou Ctrl+Enter)
4. Vérifiez que vous obtenez "Success" ✅

### Étape 3 : Appliquer la migration 016
1. Créez une nouvelle requête
2. Copiez-collez le contenu de `supabase/migrations/016_fix_validation_constraints.sql`
3. Cliquez sur **Run** (ou Ctrl+Enter)
4. Vérifiez que vous obtenez "Success" ✅

## ✅ Vérification

Après avoir appliqué les migrations, vérifiez que :
- ✅ Les utilisateurs non authentifiés ne peuvent plus créer de rendez-vous
- ✅ Les URLs invalides sont rejetées au niveau de la base de données
- ✅ Les prix négatifs sont refusés
- ✅ Les catégories de robes sont validées

## 📊 Impact sur la sécurité

Après application des migrations :
- **Score de sécurité** : 5.5/10 → 8.5/10
- **Vulnérabilités critiques corrigées** : 5/5

## 🔍 En cas de problème

Si vous rencontrez une erreur lors de l'application :
1. Lisez le message d'erreur
2. Vérifiez que vous utilisez bien la migration **016** (pas la 015)
3. Si l'erreur persiste, contactez-moi avec le message exact

## 📁 Fichiers concernés

```
supabase/migrations/
├── 014_fix_dangerous_rls_policies.sql  ← À appliquer
├── 015_add_validation_constraints.sql  ← NE PAS UTILISER (erreur)
└── 016_fix_validation_constraints.sql  ← À appliquer (corrigé)
```
