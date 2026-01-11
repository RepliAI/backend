# Backend ReplyIA

Backend de l'application ReplyIA, une plateforme de gestion de tickets et de réponses automatisées par IA via Gmail.

## 🚀 Technologies

- **Framework**: NestJS 10
- **Langage**: TypeScript
- **Base de données**: PostgreSQL
- **ORM**: Prisma 6
- **Authentification**: JWT (Passport)
- **WebSocket**: Socket.IO
- **Intégrations**:
  - Gmail API (Googleapis)
  - OpenAI API
  - Stripe (paiements)
- **Email**: Nodemailer avec Handlebars

## 📋 Prérequis

- Node.js >= 18
- PostgreSQL
- npm ou yarn

## 🔧 Installation

```bash
# Installer les dépendances
npm install

# Générer le client Prisma
npx prisma generate
```

## ⚙️ Configuration

Créez un fichier `.env` à la racine du dossier `backend` avec les variables suivantes :

```env
# Base de données
DATABASE_URL="postgresql://user:password@localhost:5432/replyia?schema=public"

# Application
PORT=3000
FRONTEND_URL="http://localhost:3001"

# JWT
JWT_ACCESS_SECRET="votre-secret-access-token"
JWT_REFRESH_SECRET="votre-secret-refresh-token"

# Email
MAIL_USER="votre-email@gmail.com"
MAIL_PASS="votre-mot-de-passe-app"

# OpenAI
OPENAI_API_KEY="sk-..."

# Google OAuth (Gmail)
GOOGLE_CLIENT_ID="votre-client-id"
GOOGLE_CLIENT_SECRET="votre-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:3000/gmail/callback"

# Stripe
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_REDIRECT_URI="http://localhost:3000/billing"
STRIPE_PRICE_PRO="price_..."
STRIPE_PRICE_BUSINESS="price_..."
```

## 🗄️ Base de données

```bash
# Appliquer les migrations
npx prisma migrate dev

# (Optionnel) Peupler la base de données
npx prisma db seed

# Visualiser la base de données
npx prisma studio
```

## 🏃 Scripts disponibles

```bash
# Développement (mode watch)
npm run start:dev

# Production
npm run build
npm run start:prod

# Tests
npm run test              # Tests unitaires
npm run test:watch        # Tests en mode watch
npm run test:cov          # Couverture de code
npm run test:e2e          # Tests end-to-end

# Linting et formatage
npm run lint
npm run format
```

## 🏗️ Architecture

Le projet suit une architecture en couches (Clean Architecture / DDD) :

```
src/
├── domain/           # Entités et interfaces métier
├── application/      # Cas d'usage (use cases)
├── infrastructure/   # Implémentations techniques
│   ├── prisma/       # Service Prisma
│   ├── auth/         # Services d'authentification
│   ├── integrations/ # Gmail, OpenAI, Stripe
│   ├── mailer/       # Service d'envoi d'emails
│   ├── websocket/    # Gateway WebSocket
│   └── cron/         # Tâches planifiées
└── interfaces/       # Contrôleurs HTTP
    └── http/         # Routes REST
```

## 📁 Modules principaux

- **Auth**: Authentification JWT, inscription, connexion, refresh token
- **Users**: Gestion des utilisateurs, changement d'email
- **Tickets**: Gestion des tickets et messages
- **Gmail**: Intégration Gmail, synchronisation des emails
- **Billing**: Gestion des abonnements Stripe
- **Plans**: Gestion des plans tarifaires
- **Stats**: Statistiques d'utilisation
- **UserPreferences**: Préférences utilisateur (ton, signature, auto-import, auto-AI)
- **WebSocket**: Notifications en temps réel

## 🔐 Authentification

L'API utilise JWT avec deux tokens :
- **Access Token**: Durée de vie courte, inclus dans l'header `Authorization`
- **Refresh Token**: Durée de vie longue, utilisé pour renouveler l'access token

Les nouveaux tokens sont renvoyés dans les headers :
- `X-New-Access-Token`
- `X-New-Refresh-Token`

## 📡 WebSocket

Le serveur expose un gateway WebSocket pour les notifications en temps réel :
- Mises à jour de tickets
- Notifications utilisateur
- Statut de synchronisation Gmail

## 🧪 Tests

```bash
# Tests unitaires
npm run test

# Tests avec couverture
npm run test:cov

# Tests end-to-end
npm run test:e2e
```

## 🚢 Déploiement

1. **Build de l'application** :
```bash
npm run build
```

2. **Migrations de base de données** :
```bash
npx prisma migrate deploy
```

3. **Générer le client Prisma** :
```bash
npx prisma generate
```

4. **Lancer en production** :
```bash
npm run start:prod
```

## 📝 Notes

- Le webhook Stripe nécessite un body parser brut pour `/billing/webhook`
- CORS est configuré pour autoriser le frontend défini dans `FRONTEND_URL`
- Les tokens Gmail sont stockés chiffrés dans la base de données
- Les réponses IA sont suivies dans la table `AiResponseUsage` pour la facturation

## 📚 Documentation

- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Socket.IO Documentation](https://socket.io/docs/v4)
