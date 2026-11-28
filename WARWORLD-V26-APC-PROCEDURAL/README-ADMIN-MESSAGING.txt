WARWORLD V24.2 — PATCH MESSAGERIE ADMIN

Cette archive conserve les fichiers et ressources de la V24.2 Agora d'origine.

Modifications :
- Le WebSocket envoie le jeton de session Supabase au serveur lors de la connexion.
- Le serveur peut associer une connexion à un compte authentifié sans faire confiance à l'identifiant fourni par le navigateur.
- Le panneau de compte permet d'activer ou de désactiver volontairement le partage de l'adresse e-mail avec l'administrateur.
- Les messages administrateur reçus en partie s'affichent sous forme de notification temporaire.

Le serveur et la console sont déployés séparément. Pour que les messages privés et l'opt-in e-mail fonctionnent dans la version du jeu en ligne, cette archive doit remplacer l'archive du site du jeu dans le dépôt GitHub connecté à Render, puis le site doit être redéployé.
