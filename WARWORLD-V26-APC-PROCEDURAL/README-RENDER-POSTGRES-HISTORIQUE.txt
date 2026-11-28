WARWORLD V25 — HISTORIQUE DE PARTIES ET CLASSEMENT EN LIGNE

Cette version conserve la base V24.3 et ajoute :
- une fenêtre « Historique des parties » pour les 30 derniers résultats du compte connecté ;
- un classement en ligne sur 7 jours, 30 jours ou toutes les parties.

BACKEND RENDER
Le backend a été mis à jour sur le dépôt dust-siege-server et le déploiement Render
est marqué LIVE. La base warworld-game-db est reliée au serveur par la connexion interne
Render. Le journal du serveur confirme : « Render PostgreSQL prête : historique des parties activé. »

Les comptes, l'authentification, les sauvegardes, les amis, les équipes et la progression
existants continuent d'utiliser Supabase. La nouvelle base Render ajoute seulement la table
ww_match_history et ses index ; aucune table Supabase existante n'est supprimée ou remplacée.

Les scores, vagues et éliminations envoyés par le jeu sont explicitement marqués
« client-reported ». Le classement est donc provisoire : il ne constitue pas un score
certifié anti-triche et ne déclenche aucune récompense automatique.

IMPORTANT — BASE GRATUITE TEMPORAIRE
La base Render actuelle utilise le forfait Free, sans frais, et sa date d'expiration affichée
par Render est le 24 décembre 2026. Les bases PostgreSQL gratuites Render expirent après
30 jours et ne bénéficient pas des sauvegardes gérées. Avant cette date, il faudra exporter
les données ou décider de passer à un forfait payant pour conserver la base. Aucun forfait
payant n'a été activé.

INSTALLATION DU JEU
Importer cette archive dans AppMint pour afficher les deux nouveaux boutons du menu.
Le serveur Render est déjà prêt pour ces fonctions. Le reste des modes, de la carte, du viseur,
du solde d'argent, des commandes tactiles, des amis et équipes et des sauvegardes Supabase
reste dans le projet.
