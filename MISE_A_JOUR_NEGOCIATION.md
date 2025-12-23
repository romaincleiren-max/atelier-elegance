# Mise à jour - Système de Négociation

## ✅ Ce qui a été fait

1. **Migration SQL créée** : `003_appointment_negotiation.sql`
   - Table `appointment_history` pour l'historique
   - Nouveaux champs `last_proposal_by` et `negotiation_count`

2. **Page Account.jsx mise à jour** avec :
   - Affichage de l'historique des négociations
   - Boutons Accepter/Refuser/Contre-proposer
   - Formulaire de contre-proposition
   - Statuts visuels clairs

## 🔧 À faire maintenant

### 1. Exécuter la migration SQL
Dans Supabase > SQL Editor, exécutez le fichier:
`supabase/migrations/003_appointment_negotiation.sql`

### 2. Tester le système côté User
1. Connectez-vous en tant qu'utilisateur
2. Allez dans "Mon Compte"
3. Vous verrez vos rendez-vous avec les nouveaux statuts

### 3. Mettre à jour Admin.jsx

Le fichier Admin.jsx doit aussi être mis à jour pour utiliser les nouveaux statuts.

**Changements principaux** :
- Remplacer "pending" par "waiting_admin" lors de contre-propositions
- Ajouter l'historique de négociation
- Bouton "Confirmer définitivement" qui met status à "confirmed"
- Enregistrer chaque action dans `appointment_history`

## 📊 Nouveaux Statuts

| Statut | Signification | Qui doit agir |
|--------|--------------|---------------|
| `pending` | Demande initiale | Admin |
| `waiting_admin` | User a répondu | Admin |
| `waiting_user` | Admin a contre-proposé | User |
| `confirmed` | **RDV VALIDÉ** | Personne (terminé) |
| `cancelled` | RDV annulé | Personne (terminé) |

## 🔄 Workflow Complet

```
USER crée RDV
  ↓ status: "pending"

ADMIN traite:
  → Confirme → "confirmed" ✅ FIN
  → Refuse → "cancelled" ❌ FIN
  → Contre-propose → "waiting_user" + historique

USER répond:
  → Accepte → "waiting_admin" (admin doit confirmer)
  → Refuse → "cancelled" ❌ FIN
  → Contre-propose → "waiting_admin" + historique

ADMIN traite:
  → Confirme → "confirmed" ✅ FIN
  → Contre-propose → "waiting_user"
  → Refuse → "cancelled" ❌ FIN

... jusqu'à "confirmed"
```

## 🎯 Pour la page Admin

Vous pouvez utiliser l'ancien code Admin.jsx mais changez juste :

### Au lieu de :
```javascript
updateAppointmentStatus(apt.id, 'confirmed')
```

### Utilisez :
```javascript
// Confirmer définitivement (FIN de la négociation)
async function confirmAppointment(appointmentId) {
  // Enregistrer dans l'historique
  await supabase.from('appointment_history').insert({
    appointment_id: appointmentId,
    proposed_by: 'admin',
    message: 'Admin a confirmé le rendez-vous',
  })

  // Statut final
  await supabase
    .from('appointments')
    .update({
      status: 'confirmed',
      last_proposal_by: 'admin'
    })
    .eq('id', appointmentId)
}
```

### Pour contre-proposer :
```javascript
async function counterPropose(appointmentId, date, time, message) {
  // Enregistrer dans l'historique
  await supabase.from('appointment_history').insert({
    appointment_id: appointmentId,
    proposed_by: 'admin',
    proposed_date: date,
    proposed_time: time,
    message: message
  })

  // Mettre à jour
  await supabase
    .from('appointments')
    .update({
      preferred_date: date,
      preferred_time: time,
      message: message,
      status: 'waiting_user',  // ← User doit répondre
      last_proposal_by: 'admin',
      negotiation_count: supabase.sql`negotiation_count + 1`
    })
    .eq('id', appointmentId)
}
```

## ✨ Fonctionnalités disponibles

**Côté User (Account.jsx)** :
- ✅ Voir l'historique complet des échanges
- ✅ Accepter une proposition de l'admin
- ✅ Refuser une proposition
- ✅ Faire une contre-proposition avec date/heure/message
- ✅ Indicateur visuel "C'est à vous de répondre"

**Côté Admin (à mettre à jour)** :
- ⏳ Voir l'historique complet
- ⏳ Confirmer définitivement un RDV
- ⏳ Contre-proposer une date
- ⏳ Refuser un RDV

## 🧪 Test rapide

1. User crée un RDV → status `pending`
2. Admin contre-propose → status `waiting_user`
3. User accepte → status `waiting_admin`
4. Admin confirme → status `confirmed` ✅

Voilà ! Le système de négociation est prêt !
