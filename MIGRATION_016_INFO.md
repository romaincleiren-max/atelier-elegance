# Migration 016 - Correction des contraintes de validation

## Problème
La migration 015 contenait des erreurs de noms de colonnes :
- ❌ `appointment_date` → ✅ `preferred_date`
- ❌ `client_name` → ✅ `first_name` et `last_name`

## Solution
La migration 016 corrige ces erreurs et utilise les bons noms de colonnes.

## Instructions d'application

### Si vous avez déjà exécuté la migration 015 (avec erreur)
Ignorez la migration 015 et exécutez directement la migration 016.

### Si vous n'avez pas encore exécuté la migration 015
Exécutez uniquement la migration 016 dans le SQL Editor de Supabase.

## Contenu de la migration 016

La migration ajoute les contraintes CHECK suivantes :

### Table `dresses`
- Nom : entre 2 et 200 caractères
- Prix : entre 0 et 50000€
- Image URL : doit commencer par `https://`
- Catégorie : doit être parmi {princesse, sirene, empire, boheme}

### Table `appointments`
- Date préférée : dans le futur ou aujourd'hui (optionnel)
- Statut : parmi {pending, confirmed, cancelled, completed}
- Prénom : entre 2 et 100 caractères
- Nom : entre 2 et 100 caractères
- Email : format email valide

### Table `atelier_photos`
- Titre : entre 2 et 200 caractères
- Image URL : doit commencer par `https://`
- Ordre d'affichage : > 0

### Table `site_settings`
- Clé : entre 1 et 100 caractères

### Table `custom_proposals` (si existe)
- Description : entre 10 et 5000 caractères
- Budget min : entre 0 et 50000€ (optionnel)
- Budget max : >= budget min et <= 50000€ (optionnel)
