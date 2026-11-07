# Kamikaze IA — studio multimédia

Application web responsive avec trois modules :
- génération d'images via fal.ai ;
- génération de vidéos via fal.ai ;
- assistant conversationnel via OpenAI.

## Déploiement Render

Le dépôt contient le serveur Node.js, l'interface web et le fichier `render.yaml`.
Sur Render, créez un Blueprint à partir de ce dépôt. Les variables secrètes à fournir dans Render sont :
- `FAL_KEY` : clé fal.ai pour les images et les vidéos ;
- `OPENAI_API_KEY` : clé OpenAI pour l'assistant.

Ne mettez jamais ces clés dans GitHub ni dans le navigateur. Le fichier `.env.example` est un modèle sans secrets.

## Vérifications et limites

Le serveur expose `/api/health`, `/api/image`, `/api/video` et `/api/chat`.
Le démarrage et les appels réels aux fournisseurs doivent encore être vérifiés sur Render avec des clés valides et des crédits actifs. Les schémas d'entrée et identifiants des modèles fal.ai peuvent évoluer; validez-les dans le compte fournisseur.

Cette base n'est pas encore un produit commercial prêt à vendre. Avant une mise en vente, ajouter l'authentification, les comptes utilisateurs, les quotas/crédits, la protection contre l'abus, la journalisation, les paiements, les politiques légales et les tests de charge.
