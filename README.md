# Julien Fretille — Portfolio

**Systèmes · Réseaux · Cybersécurité**

Bienvenue sur mon portfolio. Je suis étudiant en Bachelor Systèmes et Réseaux à **Sup de Vinci, Paris**. Passionné par la cybersécurité, je développe mes compétences à travers ma formation, mes projets académiques et une veille technologique personnelle.

Ce site présente mon parcours, mes réalisations et les technologies que j’explore, dans un univers visuel sombre ponctué de touches lumineuses.

[Me contacter](mailto:julien.fretille@gmail.com) · [LinkedIn](https://www.linkedin.com/in/julien-fretille) · [Profil GitHub](https://github.com/Vitoff22)

## Découvrir le portfolio

- **Projets** — quatre réalisations académiques, filtrables par domaine, avec des fiches détaillées.
- **Compétences** — systèmes et réseaux, virtualisation, cybersécurité, développement et automatisation.
- **Parcours** — ma formation à Sup de Vinci et mon parcours au lycée Saint Jean à Limoges.
- **À propos** — ma présentation, mes qualités, mes langues et mes centres d’intérêt.
- **Contact** — mes coordonnées, mes liens professionnels et mon CV téléchargeable en PDF ou en Word.

## Projets présentés

| Projet | Description | Technologies et sujets |
| --- | --- | --- |
| **VINCI-INDUS** | Mise en place d’une infrastructure réseau et système complète. | Active Directory, DNS, DHCP, GPO, VLAN, serveur web |
| **Gymshark Sync** | Développement d’un site internet avec intégration d’un assistant IA. | NodeJS, développement web, intelligence artificielle |
| **Python + MongoDB** | Création d’un jeu en ligne avec base de données et gestion des scores. | Python, MongoDB |
| **FlutterFlow** | Application mobile de diagnostic végétal avec IA. | FlutterFlow, mobile, intelligence artificielle |

Ces réalisations sont des **projets académiques**. Les visuels du portfolio illustrent leurs sujets ; ils ne constituent pas des captures des applications.

## Une expérience interactive

- Globe filaire dessiné avec Canvas, réactif aux mouvements du curseur.
- Filtres pour explorer les projets par catégorie.
- Fiches projets avec passage au projet suivant et fermeture avec la touche `Échap`.
- Onglets de compétences accessibles au clavier avec les touches fléchées.
- Détails du parcours scolaire dépliables.
- Menu adapté aux petits écrans.
- Bouton de copie de l’adresse e-mail.
- Commande de pause des animations et prise en compte de la préférence de réduction des mouvements.

Le formulaire de contact **prépare un e-mail dans la messagerie du visiteur**. Le visiteur confirme lui-même l’envoi depuis sa messagerie ; le site ne dispose pas de service d’envoi côté serveur.

## Technologies

| Élément | Choix technique |
| --- | --- |
| Structure | HTML5 sémantique |
| Présentation | CSS, Grid, Flexbox et mises en page adaptatives |
| Interactions | JavaScript natif |
| Globe animé | Canvas 2D |
| Illustrations | SVG et CSS |
| Typographie | Barlow Condensed et Manrope, via Google Fonts |
| Hébergement compatible | GitHub Pages ou tout hébergement de fichiers statiques |

Le site ne nécessite **ni framework, ni installation de dépendances, ni étape de compilation**. Des polices de remplacement sont prévues si Google Fonts est indisponible.

## Organisation des fichiers

```text
portfolio-julien-fretille/
├── index.html       # Sections et contenu principal
├── style.css        # Couleurs, typographie, animations et responsive
├── app.js           # Interactions, données des fiches et globe
├── assets/
│   ├── favicon.svg
│   ├── julien-fretille.png
│   ├── CV_Julien_Fretille.pdf
│   └── CV_Julien_Fretille.docx
└── README.md
```

## Consulter le site en local

1. Télécharge le dépôt ou l’archive du portfolio.
2. Décompresse les fichiers si nécessaire.
3. Ouvre `index.html` dans un navigateur récent.

Pour travailler avec un serveur local, tu peux utiliser l’extension **Live Server** de Visual Studio Code. Si Python est déjà installé, tu peux aussi lancer cette commande depuis le dossier contenant `index.html` :

```bash
python -m http.server 8000
```

Ouvre ensuite [localhost:8000](http://localhost:8000).

## Publier sur GitHub Pages

Pour utiliser l’adresse `https://vitoff22.github.io`, le dépôt doit être nommé **`Vitoff22.github.io`**.

1. Place `index.html`, `style.css`, `app.js` et le dossier `assets` directement à la racine du dépôt.
2. Ouvre **Settings → Pages** dans les paramètres du dépôt.
3. Dans **Build and deployment**, sélectionne **Deploy from a branch**.
4. Choisis la branche **main** et le dossier **/(root)**, puis clique sur **Save**.
5. Consulte l’état de publication dans GitHub Pages ou dans l’onglet **Actions**.

L’adresse devient accessible une fois le déploiement terminé. Les modifications publiées sur la branche sélectionnée déclenchent ensuite une nouvelle mise à jour du site.

[Consulter le guide officiel de GitHub Pages](https://docs.github.com/en/pages/quickstart)

## Mettre à jour le contenu

| Modification | Fichier à modifier |
| --- | --- |
| Présentation, parcours, langues et centres d’intérêt | `index.html` |
| Cartes et catégories de projets | `index.html` |
| Contenu des fiches projets | Objet `projects` dans `app.js` |
| Détails des compétences | Objet `skills` dans `app.js` |
| Palette, espacements et typographie | Variables et règles dans `style.css` |
| Adresse e-mail | `index.html` et `app.js`, y compris les liens, la copie et le formulaire |
| Photo, favicon et CV | Fichiers correspondants dans `assets/` |

Lors de l’ajout d’un projet, conserve le même identifiant entre l’attribut `data-project` de sa carte et sa clé dans l’objet `projects`. Pense également à actualiser les compteurs des filtres.

Après une modification, vérifie l’affichage sur ordinateur et mobile, les filtres, les fiches projets, les liens de contact et les téléchargements du CV.

## Contact

**Julien Fretille**  
Étudiant en Bachelor Systèmes et Réseaux — Sup de Vinci, Paris

- **E-mail :** [julien.fretille@gmail.com](mailto:julien.fretille@gmail.com)
- **LinkedIn :** [julien-fretille](https://www.linkedin.com/in/julien-fretille)
- **GitHub :** [Vitoff22](https://github.com/Vitoff22)
# Julien Fretille — Portfolio

**Systèmes · Réseaux · Cybersécurité**

Bienvenue sur mon portfolio. Je suis étudiant en Bachelor Systèmes et Réseaux à **Sup de Vinci, Paris**. Passionné par la cybersécurité, je développe mes compétences à travers ma formation, mes projets académiques et une veille technologique personnelle.

Ce site présente mon parcours, mes réalisations et les technologies que j’explore, dans un univers visuel sombre ponctué de touches lumineuses.

[Me contacter](mailto:julien.fretille@gmail.com) · [LinkedIn](https://www.linkedin.com/in/julien-fretille) · [Profil GitHub](https://github.com/Vitoff22)

## Découvrir le portfolio

- **Projets** — quatre réalisations académiques, filtrables par domaine, avec des fiches détaillées.
- **Compétences** — systèmes et réseaux, virtualisation, cybersécurité, développement et automatisation.
- **Parcours** — ma formation à Sup de Vinci et mon parcours au lycée Saint Jean à Limoges.
- **À propos** — ma présentation, mes qualités, mes langues et mes centres d’intérêt.
- **Contact** — mes coordonnées, mes liens professionnels et mon CV téléchargeable en PDF ou en Word.

## Projets présentés

| Projet | Description | Technologies et sujets |
| --- | --- | --- |
| **VINCI-INDUS** | Mise en place d’une infrastructure réseau et système complète. | Active Directory, DNS, DHCP, GPO, VLAN, serveur web |
| **Gymshark Sync** | Développement d’un site internet avec intégration d’un assistant IA. | NodeJS, développement web, intelligence artificielle |
| **Python + MongoDB** | Création d’un jeu en ligne avec base de données et gestion des scores. | Python, MongoDB |
| **FlutterFlow** | Application mobile de diagnostic végétal avec IA. | FlutterFlow, mobile, intelligence artificielle |

Ces réalisations sont des **projets académiques**. Les visuels du portfolio illustrent leurs sujets ; ils ne constituent pas des captures des applications.

## Une expérience interactive

- Globe filaire dessiné avec Canvas, réactif aux mouvements du curseur.
- Filtres pour explorer les projets par catégorie.
- Fiches projets avec passage au projet suivant et fermeture avec la touche `Échap`.
- Onglets de compétences accessibles au clavier avec les touches fléchées.
- Détails du parcours scolaire dépliables.
- Menu adapté aux petits écrans.
- Bouton de copie de l’adresse e-mail.
- Commande de pause des animations et prise en compte de la préférence de réduction des mouvements.

Le formulaire de contact **prépare un e-mail dans la messagerie du visiteur**. Le visiteur confirme lui-même l’envoi depuis sa messagerie ; le site ne dispose pas de service d’envoi côté serveur.

## Technologies

| Élément | Choix technique |
| --- | --- |
| Structure | HTML5 sémantique |
| Présentation | CSS, Grid, Flexbox et mises en page adaptatives |
| Interactions | JavaScript natif |
| Globe animé | Canvas 2D |
| Illustrations | SVG et CSS |
| Typographie | Barlow Condensed et Manrope, via Google Fonts |
| Hébergement compatible | GitHub Pages ou tout hébergement de fichiers statiques |

Le site ne nécessite **ni framework, ni installation de dépendances, ni étape de compilation**. Des polices de remplacement sont prévues si Google Fonts est indisponible.

## Organisation des fichiers

```text
portfolio-julien-fretille/
├── index.html       # Sections et contenu principal
├── style.css        # Couleurs, typographie, animations et responsive
├── app.js           # Interactions, données des fiches et globe
├── assets/
│   ├── favicon.svg
│   ├── julien-fretille.png
│   ├── CV_Julien_Fretille.pdf
│   └── CV_Julien_Fretille.docx
└── README.md
```

## Consulter le site en local

1. Télécharge le dépôt ou l’archive du portfolio.
2. Décompresse les fichiers si nécessaire.
3. Ouvre `index.html` dans un navigateur récent.

Pour travailler avec un serveur local, tu peux utiliser l’extension **Live Server** de Visual Studio Code. Si Python est déjà installé, tu peux aussi lancer cette commande depuis le dossier contenant `index.html` :

```bash
python -m http.server 8000
```

Ouvre ensuite [localhost:8000](http://localhost:8000).

## Publier sur GitHub Pages

Pour utiliser l’adresse `https://vitoff22.github.io`, le dépôt doit être nommé **`Vitoff22.github.io`**.

1. Place `index.html`, `style.css`, `app.js` et le dossier `assets` directement à la racine du dépôt.
2. Ouvre **Settings → Pages** dans les paramètres du dépôt.
3. Dans **Build and deployment**, sélectionne **Deploy from a branch**.
4. Choisis la branche **main** et le dossier **/(root)**, puis clique sur **Save**.
5. Consulte l’état de publication dans GitHub Pages ou dans l’onglet **Actions**.

L’adresse devient accessible une fois le déploiement terminé. Les modifications publiées sur la branche sélectionnée déclenchent ensuite une nouvelle mise à jour du site.

[Consulter le guide officiel de GitHub Pages](https://docs.github.com/en/pages/quickstart)

## Mettre à jour le contenu

| Modification | Fichier à modifier |
| --- | --- |
| Présentation, parcours, langues et centres d’intérêt | `index.html` |
| Cartes et catégories de projets | `index.html` |
| Contenu des fiches projets | Objet `projects` dans `app.js` |
| Détails des compétences | Objet `skills` dans `app.js` |
| Palette, espacements et typographie | Variables et règles dans `style.css` |
| Adresse e-mail | `index.html` et `app.js`, y compris les liens, la copie et le formulaire |
| Photo, favicon et CV | Fichiers correspondants dans `assets/` |

Lors de l’ajout d’un projet, conserve le même identifiant entre l’attribut `data-project` de sa carte et sa clé dans l’objet `projects`. Pense également à actualiser les compteurs des filtres.

Après une modification, vérifie l’affichage sur ordinateur et mobile, les filtres, les fiches projets, les liens de contact et les téléchargements du CV.

## Contact

**Julien Fretille**  
Étudiant en Bachelor Systèmes et Réseaux — Sup de Vinci, Paris

- **E-mail :** [julien.fretille@gmail.com](mailto:julien.fretille@gmail.com)
- **LinkedIn :** [julien-fretille](https://www.linkedin.com/in/julien-fretille)
- **GitHub :** [Vitoff22](https://github.com/Vitoff22)
