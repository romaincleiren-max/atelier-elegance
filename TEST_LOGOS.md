# Comment tester le système de logos

## Le système fonctionne, mais il faut ajouter des logos manuellement !

### Pourquoi vous ne voyez rien ?

Les logos ne s'affichent QUE si :
1. ✅ Les migrations 019 et 020 sont appliquées (vous l'avez fait)
2. ❌ Il y a au moins 1 logo **actif** dans la base de données (pas encore fait)

### Comment ajouter votre premier logo

1. **Connectez-vous en admin**
   - Allez sur votre site
   - Cliquez sur "Connexion"
   - Connectez-vous avec votre compte admin

2. **Allez sur la page logos**
   - Cliquez sur `/admin`
   - Vous devriez voir un bouton **🎨 Logos**
   - Cliquez dessus
   - Vous arrivez sur `/admin/logos`

3. **Uploadez votre premier logo**
   - Cliquez sur "Choisir un fichier"
   - Sélectionnez une image (PNG, JPG, SVG)
   - Remplissez :
     - **Nom** : "Mon Logo Test"
     - **Emplacement** : Choisir "sponsors" ou "footer"
     - **Actif** : Cocher la case
   - Cliquez sur "Ajouter"

4. **Vérifiez l'affichage**
   - Retournez sur la page d'accueil `/`
   - Si vous avez choisi "sponsors" : scrollez vers le bas, section "Nos Partenaires"
   - Si vous avez choisi "footer" : scrollez tout en bas du site
   - Votre logo devrait apparaître !

## Dépannage

### Le bouton 🎨 Logos n'apparaît pas
- Vérifiez que vous êtes connecté en **admin**
- Vérifiez que le dernier déploiement Vercel est terminé
- Videz le cache du navigateur (Ctrl+F5)

### La page /admin/logos donne une erreur
- Vérifiez que les migrations 019 et 020 sont bien appliquées dans Supabase
- Vérifiez dans Supabase > SQL Editor que la table "logos" existe
- Vérifiez dans Supabase > Storage que le bucket "logos" existe

### Je ne vois toujours pas le logo
- Vérifiez que le logo est **actif** (case cochée)
- Vérifiez l'emplacement choisi
- Vérifiez dans la console du navigateur (F12) s'il y a des erreurs

## Commande de vérification rapide

Vous pouvez vérifier que tout est bien déployé en regardant :

1. **Vercel Dashboard** : https://vercel.com/dashboard
   - Le dernier déploiement doit être "Ready"
   - Hash du commit : f6cc57c (système logos)

2. **Supabase Dashboard** : https://supabase.com/dashboard
   - SQL Editor > Exécutez : `SELECT * FROM logos;`
   - Devrait retourner 0 rows (normal, aucun logo ajouté)
   - Storage > Vérifiez que le bucket "logos" existe

## Test rapide sans upload

Si vous voulez tester rapidement sans uploader de fichier, ajoutez un logo avec une URL externe :

1. Allez sur `/admin/logos`
2. Collez une URL d'image dans le champ (au lieu d'uploader)
   Exemple : `https://via.placeholder.com/150x60?text=Test+Logo`
3. Remplissez les autres champs
4. Enregistrez
5. Le logo devrait s'afficher !
