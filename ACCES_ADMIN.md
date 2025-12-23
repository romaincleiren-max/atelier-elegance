# Accès Administration

## Page Admin

L'interface d'administration est accessible à l'URL :
**http://localhost:5173/admin** (en développement)

## Fonctionnalités Admin

### 📊 Tableau de bord
- Vue d'ensemble des statistiques
- Nombre total de rendez-vous
- Rendez-vous en attente, confirmés, annulés

### 📅 Gestion des Rendez-vous

Pour chaque rendez-vous, vous pouvez :

1. **Confirmer le RDV** ✓
   - Valide la date et l'heure proposées par le client
   - Le client voit le statut "Confirmé" dans son compte

2. **Proposer une autre date** 📅
   - Permet de suggérer une nouvelle date/heure
   - Ajout d'un message personnalisé optionnel
   - Le client reçoit la proposition dans son compte

3. **Refuser le RDV** ✕
   - Annule la demande de rendez-vous
   - Le statut passe à "Annulé"

### 🔍 Filtres disponibles
- **Tous** : Affiche tous les rendez-vous
- **En attente** : Rendez-vous à traiter
- **Confirmés** : Rendez-vous validés
- **Annulés** : Rendez-vous refusés

## Informations affichées

Pour chaque rendez-vous :
- 👤 Nom et prénom du client
- 👗 Robe choisie (nom, style, prix)
- 📧 Email de contact
- 📱 Téléphone
- 📅 Date et heure souhaitées
- 📏 Taille demandée
- 💬 Message du client
- 🕐 Date de création de la demande

## Accès sécurisé

### Pour le moment
Tout utilisateur connecté peut accéder à la page admin en tapant `/admin` dans l'URL.

### Pour sécuriser (production)
Vous devrez créer un compte admin dans Supabase :

1. Allez dans Supabase > **SQL Editor**
2. Exécutez ce code (remplacez l'email par le vôtre) :

```sql
-- Donner le rôle admin à un utilisateur
UPDATE auth.users
SET raw_app_meta_data =
  raw_app_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'votre-email@example.com';
```

3. Ensuite, modifiez le code pour vérifier le rôle admin dans `src/pages/Admin.jsx`

## Workflow typique

1. **Client demande un RDV**
   - Choisit une robe
   - Remplit le formulaire
   - Sélectionne date/heure souhaitées

2. **Admin reçoit la demande**
   - Apparaît dans "En attente"
   - Consulte les détails

3. **Admin traite**
   - **Option A** : Confirme directement si la date convient
   - **Option B** : Propose une autre date si indisponible
   - **Option C** : Refuse si impossible

4. **Client est notifié**
   - Voit le statut mis à jour dans "Mon Compte"
   - Peut voir la nouvelle date proposée

## URL de la page Admin

- **Développement** : http://localhost:5173/admin
- **Production** : https://votre-site.vercel.app/admin

## Raccourcis clavier (à venir)

Pour plus d'efficacité, vous pourrez bientôt :
- Naviguer avec les flèches
- Confirmer avec Entrée
- Annuler avec Échap

---

**Note** : La page admin n'est pas listée dans le menu pour plus de discrétion. Seuls ceux qui connaissent l'URL peuvent y accéder.
