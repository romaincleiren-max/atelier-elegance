# Atelier Élégance - Site de Robes de Mariée

Site web moderne pour la boutique de robes de mariée "Atelier Élégance" (Coline Cleiren Couture). Application complète avec authentification, base de données et hébergement sécurisé.

## Technologies

- **Frontend**: React 18 + Vite
- **Backend**: Supabase (PostgreSQL + Auth)
- **Routing**: React Router v6
- **Hébergement**: Vercel
- **Authentification**: Supabase Auth (Email/Password)

## Fonctionnalités

- Catalogue de robes de mariée avec filtres par style
- Authentification utilisateur (connexion/inscription)
- Système de favoris
- Prise de rendez-vous pour essayage
- Demandes de robes personnalisées
- Interface responsive
- Sécurité: Row Level Security (RLS) sur toutes les tables

## Structure du projet

```
atelier-elegance/
├── src/
│   ├── components/
│   │   ├── AuthModal.jsx          # Modal de connexion/inscription
│   │   ├── DressCard.jsx          # Carte d'affichage d'une robe
│   │   ├── DressSVG.jsx           # Illustration SVG des robes
│   │   ├── Footer.jsx             # Pied de page
│   │   └── Header.jsx             # En-tête avec navigation
│   ├── lib/
│   │   ├── AuthContext.jsx        # Context React pour l'authentification
│   │   └── supabaseClient.js      # Configuration client Supabase
│   ├── pages/
│   │   └── Home.jsx               # Page d'accueil
│   ├── styles/
│   │   └── main.css               # Styles globaux
│   └── App.jsx                    # Composant racine
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql # Schéma de base de données
│       └── 002_rls_policies.sql   # Politiques de sécurité
├── SETUP_SUPABASE.md              # Guide configuration Supabase
├── DEPLOIEMENT.md                 # Guide de déploiement
└── README.md                      # Ce fichier
```

## Installation locale

### Prérequis

- Node.js 18+ et npm
- Un compte Supabase (gratuit)

### Étapes

1. Clonez le projet:
```bash
git clone https://github.com/VOTRE-USERNAME/atelier-elegance.git
cd atelier-elegance
```

2. Installez les dépendances:
```bash
npm install
```

3. Configurez Supabase (voir [SETUP_SUPABASE.md](SETUP_SUPABASE.md))

4. Créez un fichier `.env`:
```bash
cp .env.example .env
```

5. Ajoutez vos clés Supabase dans `.env`:
```
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-cle-anon
```

6. Lancez le serveur de développement:
```bash
npm run dev
```

7. Ouvrez [http://localhost:5173](http://localhost:5173)

## Déploiement en production

Voir le guide complet: [DEPLOIEMENT.md](DEPLOIEMENT.md)

Résumé rapide:
1. Push sur GitHub
2. Connectez Vercel à votre repository
3. Ajoutez les variables d'environnement Supabase
4. Deploy !

## Base de données

### Tables

- **dresses**: Catalogue des robes
- **appointments**: Rendez-vous pour essayage
- **favorites**: Favoris des utilisateurs
- **custom_proposals**: Demandes de robes sur mesure

### Sécurité

Toutes les tables utilisent Row Level Security (RLS):
- Les robes sont publiques
- Les utilisateurs accèdent uniquement à leurs propres données
- Les admins ont accès complet

## Scripts disponibles

```bash
npm run dev          # Serveur de développement
npm run build        # Build de production
npm run preview      # Prévisualiser le build
npm run lint         # Vérification du code
```

## Personnalisation

### Modifier les couleurs

Dans [src/styles/main.css](src/styles/main.css), modifiez les variables CSS:

```css
:root {
    --primary: #f8f5f0;
    --secondary: #d4b5a0;
    --accent: #a67c52;
    --dark: #2c2420;
    --light: #ffffff;
}
```

### Ajouter des robes

1. Dans Supabase, allez dans l'éditeur SQL
2. Exécutez:

```sql
INSERT INTO dresses (name, style, description, price, category)
VALUES ('Nom', 'Style', 'Description', 2490, 'categorie');
```

## Licence

Ce projet est sous licence MIT.

## Support

Pour toute question, consultez les guides:
- [SETUP_SUPABASE.md](SETUP_SUPABASE.md) - Configuration de la base de données
- [DEPLOIEMENT.md](DEPLOIEMENT.md) - Déploiement en production

---

Créé avec ❤️ pour Atelier Élégance
