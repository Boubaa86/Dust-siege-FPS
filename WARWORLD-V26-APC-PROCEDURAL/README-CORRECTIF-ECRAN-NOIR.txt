WARWORLD V24.2 — CORRECTIF DE L'INITIALISATION

Cause corrigee : une ligne de commentaire JavaScript englobait par erreur les declarations uid, guest, cloudSession, saveTimer et saveD. Le jeu pouvait ensuite declencher une ReferenceError lors de l'initialisation des donnees de partie.

Correction : retour a la ligne apres le commentaire, afin que les declarations soient executees normalement. La variable saveD est ainsi definie avant les fonctions qui l'utilisent.

Aucun mode, fichier de jeu, modele 3D, interface, commande, sauvegarde ou fonctionnalite n'a ete volontairement supprime. La taille d'ecran et l'orientation ne sont pas modifiees.

Verification effectuee : integrite de l'archive ZIP, presence des 15 fichiers, analyse syntaxique Node.js des scripts principaux et des scripts de correctif. Le test de lancement dans Chromium n'a pas pu etre execute dans cet environnement (navigation locale bloquee). Le test final sur Android/AppMint reste necessaire.
