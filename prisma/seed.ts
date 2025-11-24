import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const USER_ID = "fe474bee-82e1-4cf2-90c8-c53a029a26c5";

async function main() {
  console.log("Seeding realistic tickets...");

  const tickets = [
    {
      subject: "Impossible de valider mon panier",
      status: "OPEN",
      createdAt: new Date("2025-11-10T10:14:00Z"),
      messages: {
        create: [
          {
            from: "customer",
            to: "support",
            content:
              "Bonjour, impossible de valider mon panier. Quand je clique sur 'Payer', la page charge puis revient au panier sans message d'erreur.",
            date: new Date("2025-11-10T10:14:00Z"),
          },
          {
            from: "agent",
            to: "customer",
            content:
              "Bonjour, et merci pour votre message. Nous sommes navrés pour ce dysfonctionnement. Pouvez-vous nous indiquer si vous utilisez un ordinateur ou un mobile, ainsi que votre navigateur ? Cela nous aidera à reproduire le problème.",
            date: new Date("2025-11-10T10:30:00Z"),
          },
        ],
      },
    },

    {
      subject: "Erreur 500 lors de la connexion",
      status: "PENDING",
      createdAt: new Date("2025-11-09T08:22:00Z"),
      messages: {
        create: [
          {
            from: "customer",
            to: "support",
            content:
              "Bonjour, je n'arrive plus à me connecter depuis hier. Une erreur 500 apparaît après avoir entré mes identifiants.",
            date: new Date("2025-11-09T08:22:00Z"),
          },
          {
            from: "agent",
            to: "customer",
            content:
              "Bonjour, merci pour votre retour. Cette erreur signifie qu’un problème technique empêche la connexion. Notre équipe en est informée. Pouvez-vous confirmer si le problème persiste sur un autre navigateur ?",
            date: new Date("2025-11-09T08:35:00Z"),
          },
        ],
      },
    },

    {
      subject: "Débit en double sur ma carte",
      status: "OPEN",
      createdAt: new Date("2025-11-11T12:05:00Z"),
      messages: {
        create: [
          {
            from: "customer",
            to: "support",
            content:
              "Bonjour, mon compte bancaire affiche deux paiements identiques de votre site pour la même commande. Merci de vérifier.",
            date: new Date("2025-11-11T12:05:00Z"),
          },
        ],
      },
    },

    {
      subject: "Email de confirmation non reçu",
      status: "RESOLVED",
      createdAt: new Date("2025-11-08T16:45:00Z"),
      messages: {
        create: [
          {
            from: "customer",
            to: "support",
            content: "Bonjour, je n'ai pas reçu l'email de confirmation après ma commande.",
            date: new Date("2025-11-08T16:45:00Z"),
          },
          {
            from: "agent",
            to: "customer",
            content:
              "Bonjour, merci de votre message. L’email semble avoir été bloqué par votre fournisseur. Nous venons de vous le renvoyer, pouvez-vous vérifier ?",
            date: new Date("2025-11-08T17:00:00Z"),
          },
          {
            from: "customer",
            to: "agent",
            content: "Oui je l'ai bien reçu, merci beaucoup !",
            date: new Date("2025-11-08T17:05:00Z"),
          },
        ],
      },
    },

    {
      subject: "Problème d'affichage sur mobile",
      status: "OPEN",
      createdAt: new Date("2025-11-12T09:15:00Z"),
      messages: {
        create: [
          {
            from: "customer",
            to: "support",
            content:
              "Bonjour, certains éléments du site se chevauchent quand je navigue depuis mon iPhone.",
            date: new Date("2025-11-12T09:15:00Z"),
          },
        ],
      },
    },

    {
      subject: "Commande marquée livrée mais jamais reçue",
      status: "PENDING",
      createdAt: new Date("2025-11-14T13:40:00Z"),
      messages: {
        create: [
          {
            from: "customer",
            to: "support",
            content:
              "Bonjour, ma commande apparaît comme livrée depuis hier alors que je n’ai rien reçu.",
            date: new Date("2025-11-14T13:40:00Z"),
          },
          {
            from: "agent",
            to: "customer",
            content:
              "Bonjour, merci pour l'information. Nous lançons immédiatement une enquête auprès du transporteur. Nous revenons vers vous sous 24h.",
            date: new Date("2025-11-14T13:55:00Z"),
          },
        ],
      },
    },

    {
      subject: "Bug dans le formulaire de contact",
      status: "OPEN",
      createdAt: new Date("2025-11-07T11:32:00Z"),
      messages: {
        create: [
          {
            from: "customer",
            to: "support",
            content:
              "Bonjour, le formulaire de contact reste bloqué sur 'Envoi en cours…' et ne répond plus.",
            date: new Date("2025-11-07T11:32:00Z"),
          },
        ],
      },
    },

    {
      subject: "Impossible d’ajouter un moyen de paiement",
      status: "OPEN",
      createdAt: new Date("2025-11-12T15:22:00Z"),
      messages: {
        create: [
          {
            from: "customer",
            to: "support",
            content:
              "Bonjour, l’ajout d’une carte bancaire échoue systématiquement. Message : 'Moyen de paiement refusé'.",
            date: new Date("2025-11-12T15:22:00Z"),
          },
        ],
      },
    },

    {
      subject: "Erreur lors du téléchargement de facture",
      status: "RESOLVED",
      createdAt: new Date("2025-11-03T14:00:00Z"),
      messages: {
        create: [
          {
            from: "customer",
            to: "support",
            content: "Bonjour, je ne parviens pas à télécharger mes factures depuis mon espace.",
            date: new Date("2025-11-03T14:00:00Z"),
          },
          {
            from: "agent",
            to: "customer",
            content:
              "Bonjour, nous avons corrigé un problème sur les PDF. Le téléchargement fonctionne désormais. Merci de réessayer.",
            date: new Date("2025-11-03T14:25:00Z"),
          },
          {
            from: "customer",
            to: "agent",
            content: "C’est parfait, merci !",
            date: new Date("2025-11-03T14:40:00Z"),
          },
        ],
      },
    },

    {
      subject: "Problème de lenteur sur la page profil",
      status: "OPEN",
      createdAt: new Date("2025-11-15T08:10:00Z"),
      messages: {
        create: [
          {
            from: "customer",
            to: "support",
            content: "Bonjour, la page profil met plus de 15 secondes à s’afficher.",
            date: new Date("2025-11-15T08:10:00Z"),
          },
        ],
      },
    },

    {
      subject: "Je n’arrive pas à changer mon mot de passe",
      status: "PENDING",
      createdAt: new Date("2025-11-16T19:22:00Z"),
      messages: {
        create: [
          {
            from: "customer",
            to: "support",
            content:
              "Bonsoir, impossible de mettre à jour mon mot de passe. On me dit que l’ancien est incorrect alors qu’il est bon.",
            date: new Date("2025-11-16T19:22:00Z"),
          },
        ],
      },
    },

    {
      subject: "Erreur : paiement refusé alors que le compte est approvisionné",
      status: "OPEN",
      createdAt: new Date("2025-11-05T09:50:00Z"),
      messages: {
        create: [
          {
            from: "customer",
            to: "support",
            content:
              "Bonjour, mon paiement est refusé sans raison. J’ai pourtant largement de quoi couvrir l’achat.",
            date: new Date("2025-11-05T09:50:00Z"),
          },
        ],
      },
    },
    {
        subject: "Message d’erreur lors de l’ajout au panier",
        status: "OPEN",
        createdAt: new Date("2025-11-12T11:10:00Z"),
        messages: {
          create: [
            {
              from: "customer",
              to: "support",
              content:
                "Dès que j’ajoute un article au panier, un message s’affiche : 'Une erreur s’est produite'.",
              date: new Date("2025-11-12T11:10:00Z"),
            },
          ],
        },
      },
  
      {
        subject: "Impossible de télécharger l’application mobile",
        status: "OPEN",
        createdAt: new Date("2025-11-04T13:20:00Z"),
        messages: {
          create: [
            {
              from: "customer",
              to: "support",
              content:
                "Bonjour, l’App Store indique que l’application n’est pas disponible dans ma région alors que je suis en France.",
              date: new Date("2025-11-04T13:20:00Z"),
            },
          ],
        },
      },
  
      {
        subject: "Modification d’adresse impossible",
        status: "PENDING",
        createdAt: new Date("2025-11-06T08:40:00Z"),
        messages: {
          create: [
            {
              from: "customer",
              to: "support",
              content:
                "Bonjour, je veux modifier mon adresse de livraison mais le champ est grisé.",
              date: new Date("2025-11-06T08:40:00Z"),
            },
            {
              from: "agent",
              to: "customer",
              content:
                "Bonjour, merci pour votre message. Il est possible que votre commande soit déjà en préparation. Nous vérifions et revenons vers vous rapidement.",
              date: new Date("2025-11-06T08:55:00Z"),
            },
          ],
        },
      },
  
      {
        subject: "Problème sur la page d’abonnement",
        status: "OPEN",
        createdAt: new Date("2025-11-03T12:15:00Z"),
        messages: {
          create: [
            {
              from: "customer",
              to: "support",
              content:
                "Sur la page d’abonnement, le bouton 'Souscrire' ne fait rien. La page ne réagit pas.",
              date: new Date("2025-11-03T12:15:00Z"),
            },
          ],
        },
      },
  
      {
        subject: "Remboursement non reçu",
        status: "PENDING",
        createdAt: new Date("2025-11-01T10:00:00Z"),
        messages: {
          create: [
            {
              from: "customer",
              to: "support",
              content:
                "Bonjour, vous m’aviez indiqué un remboursement sous 5 jours ouvrés mais je n’ai rien reçu.",
              date: new Date("2025-11-01T10:00:00Z"),
            },
            {
              from: "agent",
              to: "customer",
              content:
                "Bonjour, nous venons de vérifier : le remboursement est bien parti. Il devrait apparaître d’ici 24 à 48 h en fonction de votre banque.",
              date: new Date("2025-11-01T10:15:00Z"),
            },
          ],
        },
      },
  
      {
        subject: "Erreur 404 sur la page produit",
        status: "OPEN",
        createdAt: new Date("2025-11-15T14:40:00Z"),
        messages: {
          create: [
            {
              from: "customer",
              to: "support",
              content:
                "Impossible d'accéder à un produit, la page affiche une erreur 404.",
              date: new Date("2025-11-15T14:40:00Z"),
            },
          ],
        },
      },
  
      {
        subject: "Carte cadeau introuvable",
        status: "OPEN",
        createdAt: new Date("2025-11-13T07:58:00Z"),
        messages: {
          create: [
            {
              from: "customer",
              to: "support",
              content:
                "J’ai reçu une carte cadeau par email mais elle n’apparaît pas dans mon compte.",
              date: new Date("2025-11-13T07:58:00Z"),
            },
          ],
        },
      },
  
      {
        subject: "Mauvais montant facturé",
        status: "PENDING",
        createdAt: new Date("2025-11-10T18:50:00Z"),
        messages: {
          create: [
            {
              from: "customer",
              to: "support",
              content:
                "Bonjour, le montant facturé n’est pas celui affiché au moment du paiement. Merci de corriger.",
              date: new Date("2025-11-10T18:50:00Z"),
            },
            {
              from: "agent",
              to: "customer",
              content:
                "Bonjour, nous allons vérifier cela immédiatement. Pouvez-vous nous envoyer une capture d’écran du montant affiché lors du paiement ?",
              date: new Date("2025-11-10T19:05:00Z"),
            },
          ],
        },
      },
  
      {
        subject: "Problème d'affichage du panier",
        status: "OPEN",
        createdAt: new Date("2025-11-01T09:12:00Z"),
        messages: {
          create: [
            {
              from: "customer",
              to: "support",
              content:
                "Bonjour, certains articles disparaissent du panier après quelques minutes.",
              date: new Date("2025-11-01T09:12:00Z"),
            },
          ],
        },
      },
  
      {
        subject: "Notification push jamais reçue",
        status: "RESOLVED",
        createdAt: new Date("2025-11-07T10:33:00Z"),
        messages: {
          create: [
            {
              from: "customer",
              to: "support",
              content: "Je n’ai jamais reçu la notification envoyée hier.",
              date: new Date("2025-11-07T10:33:00Z"),
            },
            {
              from: "agent",
              to: "customer",
              content:
                "Merci pour l’information. Un problème temporaire a été corrigé sur notre système de notifications. Vous devriez les recevoir à nouveau normalement.",
              date: new Date("2025-11-07T10:45:00Z"),
            },
          ],
        },
      },
  
      {
        subject: "Produit reçu abîmé",
        status: "PENDING",
        createdAt: new Date("2025-11-02T15:22:00Z"),
        messages: {
          create: [
            {
              from: "customer",
              to: "support",
              content:
                "Bonjour, le produit que j’ai reçu est abîmé sur un coin. Pouvez-vous procéder à un échange ?",
              date: new Date("2025-11-02T15:22:00Z"),
            },
          ],
        },
      },
  
      {
        subject: "Changement de plan d’abonnement",
        status: "OPEN",
        createdAt: new Date("2025-11-05T17:40:00Z"),
        messages: {
          create: [
            {
              from: "customer",
              to: "support",
              content:
                "Je souhaite passer à l’abonnement supérieur mais le bouton reste désactivé.",
              date: new Date("2025-11-05T17:40:00Z"),
            },
          ],
        },
      },
  
      {
        subject: "Synchronisation impossible entre appareils",
        status: "OPEN",
        createdAt: new Date("2025-11-14T09:55:00Z"),
        messages: {
          create: [
            {
              from: "customer",
              to: "support",
              content:
                "Mes données ne se synchronisent pas entre mon téléphone et mon ordinateur.",
              date: new Date("2025-11-14T09:55:00Z"),
            },
          ],
        },
      },
      {
        subject: "Déconnexion automatique trop fréquente",
        status: "OPEN",
        createdAt: new Date("2025-11-09T08:20:00Z"),
        messages: {
          create: [
            {
              from: "customer",
              to: "support",
              content:
                "Bonjour, je suis déconnecté automatiquement après seulement quelques minutes d’inactivité. Est-ce normal ?",
              date: new Date("2025-11-09T08:20:00Z"),
            },
          ],
        },
      },
  
      {
        subject: "Double paiement détecté",
        status: "PENDING",
        createdAt: new Date("2025-11-08T16:05:00Z"),
        messages: {
          create: [
            {
              from: "customer",
              to: "support",
              content:
                "Je viens d’être débité deux fois pour la même commande. Merci de régulariser rapidement.",
              date: new Date("2025-11-08T16:05:00Z"),
            },
            {
              from: "agent",
              to: "customer",
              content:
                "Nous sommes désolés pour cette situation. Un double paiement peut survenir en cas de latence. Nous procédons au remboursement immédiat du paiement en trop.",
              date: new Date("2025-11-08T16:18:00Z"),
            },
          ],
        },
      },
  
      {
        subject: "Impossibilité de changer de mot de passe",
        status: "OPEN",
        createdAt: new Date("2025-11-11T10:25:00Z"),
        messages: {
          create: [
            {
              from: "customer",
              to: "support",
              content:
                "Le formulaire de changement de mot de passe affiche systématiquement 'mot de passe incorrect' même si je saisis le bon.",
              date: new Date("2025-11-11T10:25:00Z"),
            },
          ],
        },
      },
  
      {
        subject: "Commande bloquée en préparation",
        status: "PENDING",
        createdAt: new Date("2025-11-06T19:30:00Z"),
        messages: {
          create: [
            {
              from: "customer",
              to: "support",
              content:
                "Ma commande est bloquée en statut 'En préparation' depuis 48h.",
              date: new Date("2025-11-06T19:30:00Z"),
            },
            {
              from: "agent",
              to: "customer",
              content:
                "Nous vérifions auprès de l’entrepôt. Une mise à jour devrait être disponible dans la journée.",
              date: new Date("2025-11-06T19:40:00Z"),
            },
          ],
        },
      },
  
      {
        subject: "Crash de l’application Android",
        status: "OPEN",
        createdAt: new Date("2025-11-13T14:05:00Z"),
        messages: {
          create: [
            {
              from: "customer",
              to: "support",
              content:
                "L’application plante au démarrage sur Android 14. Je ne peux plus l'utiliser du tout.",
              date: new Date("2025-11-13T14:05:00Z"),
            },
          ],
        },
      },
  
      {
        subject: "Erreur lors de l’export CSV",
        status: "OPEN",
        createdAt: new Date("2025-11-12T09:55:00Z"),
        messages: {
          create: [
            {
              from: "customer",
              to: "support",
              content:
                "Lorsque je clique sur 'Exporter en CSV', cela retourne un fichier vide.",
              date: new Date("2025-11-12T09:55:00Z"),
            },
          ],
        },
      },
  
      {
        subject: "Lien de réinitialisation expiré immédiatement",
        status: "PENDING",
        createdAt: new Date("2025-11-15T07:48:00Z"),
        messages: {
          create: [
            {
              from: "customer",
              to: "support",
              content:
                "J’ai reçu un lien pour réinitialiser mon mot de passe mais il dit qu’il est expiré alors que je viens de le recevoir.",
              date: new Date("2025-11-15T07:48:00Z"),
            },
            {
              from: "agent",
              to: "customer",
              content:
                "Nous venons de renvoyer un lien valide. Si le problème persiste, nous pourrons réinitialiser manuellement votre mot de passe.",
              date: new Date("2025-11-15T08:00:00Z"),
            },
          ],
        },
      },
  
      {
        subject: "Adresse email déjà utilisée",
        status: "RESOLVED",
        createdAt: new Date("2025-11-02T11:15:00Z"),
        messages: {
          create: [
            {
              from: "customer",
              to: "support",
              content:
                "Lorsque j’essaye de créer un compte, on me dit que mon email est déjà utilisé alors que je ne me suis jamais inscrit.",
              date: new Date("2025-11-02T11:15:00Z"),
            },
            {
              from: "agent",
              to: "customer",
              content:
                "Votre email était lié à un compte inactif. Nous venons de le supprimer : vous pouvez maintenant vous inscrire.",
              date: new Date("2025-11-02T11:40:00Z"),
            },
          ],
        },
      },
  
      {
        subject: "Formulaire qui ne se valide pas",
        status: "OPEN",
        createdAt: new Date("2025-11-16T12:30:00Z"),
        messages: {
          create: [
            {
              from: "customer",
              to: "support",
              content:
                "Le bouton 'Valider' reste grisé même une fois tous les champs remplis.",
              date: new Date("2025-11-16T12:30:00Z"),
            },
          ],
        },
      },
  
      {
        subject: "Impossible d’appliquer un code promo",
        status: "OPEN",
        createdAt: new Date("2025-11-03T09:27:00Z"),
        messages: {
          create: [
            {
              from: "customer",
              to: "support",
              content:
                "Mon code promo 'BIENVENUE10' est refusé alors que je ne l’ai jamais utilisé.",
              date: new Date("2025-11-03T09:27:00Z"),
            },
          ],
        },
      },
  
      {
        subject: "Page blanche après connexion",
        status: "OPEN",
        createdAt: new Date("2025-11-18T15:10:00Z"),
        messages: {
          create: [
            {
              from: "customer",
              to: "support",
              content:
                "Après connexion, j’arrive sur une page entièrement blanche. Je dois actualiser 2 à 3 fois pour voir le contenu.",
              date: new Date("2025-11-18T15:10:00Z"),
            },
          ],
        },
      },
  
      {
        subject: "Sonneries de notification trop fortes",
        status: "RESOLVED",
        createdAt: new Date("2025-11-07T12:45:00Z"),
        messages: {
          create: [
            {
              from: "customer",
              to: "support",
              content:
                "Les notifications font un son extrêmement fort même avec mon téléphone presque en silencieux.",
              date: new Date("2025-11-07T12:45:00Z"),
            },
            {
              from: "agent",
              to: "customer",
              content:
                "Nous avons ajusté les niveaux sonores dans la dernière mise à jour. Tout devrait revenir à la normale.",
              date: new Date("2025-11-07T13:00:00Z"),
            },
          ],
        },
      },
  
      {
        subject: "Impossible de changer la langue",
        status: "OPEN",
        createdAt: new Date("2025-11-11T17:33:00Z"),
        messages: {
          create: [
            {
              from: "customer",
              to: "support",
              content:
                "Lorsque j’essaye de changer la langue de l’application, elle reste bloquée sur le français.",
              date: new Date("2025-11-11T17:33:00Z"),
            },
          ],
        },
      },
      {
        subject: "Mauvais montant affiché dans le panier",
        status: "OPEN",
        createdAt: new Date("2025-11-04T14:10:00Z"),
        messages: {
          create: [
            {
              from: "customer",
              to: "support",
              content:
                "Le montant total change lorsque je rafraîchis la page du panier. Je perds parfois des réductions.",
              date: new Date("2025-11-04T14:10:00Z"),
            },
          ],
        },
      },
  
      {
        subject: "Badge de notification incorrect",
        status: "RESOLVED",
        createdAt: new Date("2025-11-10T09:40:00Z"),
        messages: {
          create: [
            {
              from: "customer",
              to: "support",
              content:
                "L’icône de l’application affiche constamment 3 notifications alors qu’il n’y a rien.",
              date: new Date("2025-11-10T09:40:00Z"),
            },
            {
              from: "agent",
              to: "customer",
              content:
                "Nous avons corrigé un bug de synchronisation des compteurs dans la dernière mise à jour. Le problème est maintenant résolu.",
              date: new Date("2025-11-10T10:00:00Z"),
            },
          ],
        },
      },
  
      {
        subject: "Impossible de mettre à jour mes informations personnelles",
        status: "OPEN",
        createdAt: new Date("2025-11-05T11:20:00Z"),
        messages: {
          create: [
            {
              from: "customer",
              to: "support",
              content:
                "Quand je modifie mon adresse dans mon profil, j’ai un message d’erreur disant que la modification n’a pas pu être enregistrée.",
              date: new Date("2025-11-05T11:20:00Z"),
            },
          ],
        },
      },
  
      {
        subject: "Réception d’emails en double",
        status: "PENDING",
        createdAt: new Date("2025-11-08T07:55:00Z"),
        messages: {
          create: [
            {
              from: "customer",
              to: "support",
              content:
                "Je reçois systématiquement 2 emails identiques pour chaque notification.",
              date: new Date("2025-11-08T07:55:00Z"),
            },
            {
              from: "agent",
              to: "customer",
              content:
                "Nous analysons ce comportement. Il provient sûrement d’une duplication d’événements dans notre service d’envoi.",
              date: new Date("2025-11-08T08:10:00Z"),
            },
          ],
        },
      },
  
      {
        subject: "Recherche produit ne donne aucun résultat",
        status: "OPEN",
        createdAt: new Date("2025-11-14T08:40:00Z"),
        messages: {
          create: [
            {
              from: "customer",
              to: "support",
              content:
                "Peu importe le mot-clé que j’entre, la recherche ne renvoie aucun produit.",
              date: new Date("2025-11-14T08:40:00Z"),
            },
          ],
        },
      },
  
      {
        subject: "Téléchargement de facture impossible",
        status: "PENDING",
        createdAt: new Date("2025-11-01T10:25:00Z"),
        messages: {
          create: [
            {
              from: "customer",
              to: "support",
              content:
                "Quand je clique sur 'Télécharger la facture', rien ne se passe.",
              date: new Date("2025-11-01T10:25:00Z"),
            },
            {
              from: "agent",
              to: "customer",
              content:
                "Nous avons transmis votre problème à notre équipe technique. Un correctif devrait être déployé sous peu.",
              date: new Date("2025-11-01T10:45:00Z"),
            },
          ],
        },
      },
  
      {
        subject: "Chargement infini de la page commandes",
        status: "OPEN",
        createdAt: new Date("2025-11-17T12:15:00Z"),
        messages: {
          create: [
            {
              from: "customer",
              to: "support",
              content:
                "La page 'Mes commandes' ne s’affiche plus, j’ai un spinner infini.",
              date: new Date("2025-11-17T12:15:00Z"),
            },
          ],
        },
      },
  
      {
        subject: "Historique de navigation non sauvegardé",
        status: "RESOLVED",
        createdAt: new Date("2025-11-06T13:00:00Z"),
        messages: {
          create: [
            {
              from: "customer",
              to: "support",
              content:
                "Mon historique de navigation s’efface à chaque fois que je ferme l’application.",
              date: new Date("2025-11-06T13:00:00Z"),
            },
            {
              from: "agent",
              to: "customer",
              content:
                "Un patch a été appliqué. Votre historique sera maintenant conservé correctement.",
              date: new Date("2025-11-06T13:22:00Z"),
            },
          ],
        },
      },
  
      {
        subject: "Problème de synchronisation entre appareils",
        status: "OPEN",
        createdAt: new Date("2025-11-09T14:45:00Z"),
        messages: {
          create: [
            {
              from: "customer",
              to: "support",
              content:
                "Les modifications que je fais sur mon téléphone ne se synchronisent pas sur mon ordinateur.",
              date: new Date("2025-11-09T14:45:00Z"),
            },
          ],
        },
      },
  
      {
        subject: "Impossible d’ajouter une adresse de livraison",
        status: "PENDING",
        createdAt: new Date("2025-11-12T17:30:00Z"),
        messages: {
          create: [
            {
              from: "customer",
              to: "support",
              content:
                "J’ajoute une adresse mais elle disparaît immédiatement après validation.",
              date: new Date("2025-11-12T17:30:00Z"),
            },
            {
              from: "agent",
              to: "customer",
              content:
                "Nous avons remonté le problème à notre équipe logistique. Une investigation est en cours.",
              date: new Date("2025-11-12T17:45:00Z"),
            },
          ],
        },
      },
  
      {
        subject: "Facture manquante pour ma dernière commande",
        status: "OPEN",
        createdAt: new Date("2025-11-18T10:20:00Z"),
        messages: {
          create: [
            {
              from: "customer",
              to: "support",
              content:
                "Je n’ai jamais reçu la facture de ma commande passée hier. Elle n’apparaît pas dans mon espace non plus.",
              date: new Date("2025-11-18T10:20:00Z"),
            },
          ],
        },
      },
  
      {
        subject: "Impossible d’enregistrer mon mode de paiement",
        status: "OPEN",
        createdAt: new Date("2025-11-03T15:50:00Z"),
        messages: {
          create: [
            {
              from: "customer",
              to: "support",
              content:
                "Le formulaire refuse ma carte bancaire, alors qu’elle fonctionne ailleurs.",
              date: new Date("2025-11-03T15:50:00Z"),
            },
          ],
        },
      },
      {
        subject: "Retour impossible depuis mon espace client",
        status: "PENDING",
        createdAt: new Date("2025-11-13T11:30:00Z"),
        messages: {
          create: [
            {
              from: "customer",
              to: "support",
              content:
                "Bonjour, lorsque j’essaye de faire un retour produit depuis mon espace client, j’ai un message disant que la fonctionnalité est indisponible.",
              date: new Date("2025-11-13T11:30:00Z"),
            },
            {
              from: "agent",
              to: "customer",
              content:
                "Bonjour, merci de votre retour. Nous vérifions l’état du module de retour. Pouvez-vous essayer depuis un navigateur différent en attendant ?",
              date: new Date("2025-11-13T11:45:00Z"),
            },
          ],
        },
      },
      {
        subject: "Impossible de mettre un article en favori",
        status: "OPEN",
        createdAt: new Date("2025-11-10T09:18:00Z"),
        messages: {
          create: [
            {
              from: "customer",
              to: "support",
              content:
                "Dès que je clique sur l’icône de favori, rien ne se passe. L’article ne s'ajoute pas.",
              date: new Date("2025-11-10T09:18:00Z"),
            },
          ],
        },
      },
      {
        subject: "Historique de commandes incomplet",
        status: "OPEN",
        createdAt: new Date("2025-11-12T13:05:00Z"),
        messages: {
          create: [
            {
              from: "customer",
              to: "support",
              content:
                "Bonjour, il manque plusieurs commandes dans mon historique alors qu’elles ont été livrées.",
              date: new Date("2025-11-12T13:05:00Z"),
            },
          ],
        },
      },
      {
        subject: "Problème d’affichage des avis clients",
        status: "RESOLVED",
        createdAt: new Date("2025-11-08T10:25:00Z"),
        messages: {
          create: [
            {
              from: "customer",
              to: "support",
              content:
                "Certains avis ne s’affichent pas sous les produits, la section semble vide.",
              date: new Date("2025-11-08T10:25:00Z"),
            },
            {
              from: "agent",
              to: "customer",
              content:
                "Nous avons corrigé un problème de mise en cache. Les avis devraient maintenant s’afficher correctement.",
              date: new Date("2025-11-08T10:40:00Z"),
            },
          ],
        },
      },
      {
        subject: "Débit alors que la commande a été annulée",
        status: "PENDING",
        createdAt: new Date("2025-11-15T09:50:00Z"),
        messages: {
          create: [
            {
              from: "customer",
              to: "support",
              content:
                "Bonjour, j’ai annulé une commande hier mais j’ai quand même été débité ce matin.",
              date: new Date("2025-11-15T09:50:00Z"),
            },
            {
              from: "agent",
              to: "customer",
              content:
                "Nous sommes désolés pour ce désagrément. Nous vérifions l'état de votre annulation et revenons vers vous rapidement avec une solution.",
              date: new Date("2025-11-15T10:05:00Z"),
            },
          ],
        },
      },
      {
        subject: "Photo produit ne correspond pas",
        status: "OPEN",
        createdAt: new Date("2025-11-16T14:12:00Z"),
        messages: {
          create: [
            {
              from: "customer",
              to: "support",
              content:
                "L’article que je viens de recevoir ne correspond pas à la photo affichée sur le site.",
              date: new Date("2025-11-16T14:12:00Z"),
            },
          ],
        },
      },
      {
        subject: "Code de suivi incorrect",
        status: "PENDING",
        createdAt: new Date("2025-11-11T16:32:00Z"),
        messages: {
          create: [
            {
              from: "customer",
              to: "support",
              content:
                "Bonjour, le numéro de suivi fourni correspond à un colis qui n’est pas le mien.",
              date: new Date("2025-11-11T16:32:00Z"),
            },
            {
              from: "agent",
              to: "customer",
              content:
                "Nous allons vérifier auprès du transporteur. Un nouveau numéro vous sera envoyé si nécessaire.",
              date: new Date("2025-11-11T16:50:00Z"),
            },
          ],
        },
      },
      {
        subject: "Erreur lors du changement d’adresse email",
        status: "OPEN",
        createdAt: new Date("2025-11-13T07:45:00Z"),
        messages: {
          create: [
            {
              from: "customer",
              to: "support",
              content:
                "Impossible de modifier mon adresse email. Le système indique que mon mot de passe est incorrect.",
              date: new Date("2025-11-13T07:45:00Z"),
            },
          ],
        },
      },
      {
        subject: "Messagerie interne qui ne charge plus",
        status: "OPEN",
        createdAt: new Date("2025-11-17T16:12:00Z"),
        messages: {
          create: [
            {
              from: "customer",
              to: "support",
              content:
                "Depuis ce matin, ma messagerie interne charge indéfiniment et mes conversations ne s’ouvrent plus.",
              date: new Date("2025-11-17T16:12:00Z"),
            },
          ],
        },
      },
      {
        subject: "Livraison en retard",
        status: "OPEN",
        createdAt: new Date("2025-11-18T13:25:00Z"),
        messages: {
          create: [
            {
              from: "customer",
              to: "support",
              content:
                "Mon colis devait arriver hier et le suivi n’a pas été mis à jour depuis 48 heures.",
              date: new Date("2025-11-18T13:25:00Z"),
            },
          ],
        },
      },
      {
        subject: "Suppression de compte impossible",
        status: "PENDING",
        createdAt: new Date("2025-11-14T10:00:00Z"),
        messages: {
          create: [
            {
              from: "customer",
              to: "support",
              content:
                "Lorsque j’essaye de supprimer mon compte, un message d’erreur apparaît : 'Action impossible pour le moment'.",
              date: new Date("2025-11-14T10:00:00Z"),
            },
            {
              from: "agent",
              to: "customer",
              content:
                "Nous vérifions l’origine de ce blocage. Nous revenons vers vous rapidement avec une solution.",
              date: new Date("2025-11-14T10:15:00Z"),
            },
          ],
        },
      },                                                        
  ];

  // Create all tickets
  for (const ticket of tickets) {
    await prisma.ticket.create({
      data: {
        userId: USER_ID,
        ...ticket,
      },
    });
  }

  console.log("12 tickets inserted.");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
