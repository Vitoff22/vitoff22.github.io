# Julien Fretille — Portfolio

Portfolio personnel d’un étudiant en Bachelor Systèmes et Réseaux à Sup de Vinci, Paris. Projets académiques, compétences, formation et contacts dans une interface sombre aux nuances de vert.

[Voir le portfolio](https://vitoff22.github.io/) · [GitHub](https://github.com/Vitoff22) · [LinkedIn](https://www.linkedin.com/in/julien-fretille)

## Projets présentés

| Projet | Périmètre documenté |
| --- | --- |
| VINCI-INDUS | Infrastructure AD, DNS, DHCP, GPO, VLAN et serveur web. |
| Gymshark Sync | Site NodeJS avec intégration d’un assistant IA. |
| Python + MongoDB | Jeu et gestion des scores en base de données. |
| AgriScan | Projet d’application mobile de diagnostic végétal avec IA et FlutterFlow. |

Les visuels sont des illustrations de présentation, pas des captures d’applications. Aucun résultat chiffré ou niveau de maîtrise n’est inventé.

## Fonctionnalités

- Navigation, filtres et fiches projets avec liens directs partageables.
- Accordéons pour les compétences et le parcours.
- Signature animée au survol et au focus clavier.
- Introduction limitée à une fois par session d’onglet, grâce à `sessionStorage`. Une introduction passée compte comme vue. Si le stockage est bloqué, elle ne joue pas.
- Réduction des animations selon les préférences du navigateur et commande de pause.
- Consultation du CV PDF dans un nouvel onglet.
- Copie de l’adresse e-mail et formulaire qui prépare un e-mail dans la messagerie du visiteur. Aucun message n’est envoyé par le site.

Sans JavaScript, les coordonnées, le CV, les fiches projets et les accordéons HTML restent disponibles. Les commandes de filtrage, copie et formulaire nécessitent JavaScript.

## Fichiers et modification

```text
index.html          Contenu, navigation et politique de sécurité
style.css           Mise en page et animations
app.js              Interactions et introduction
assets/             Ressources du site
tests/              Vérifications locales
.nojekyll           Publication statique GitHub Pages
```

Le dossier `assets/` contient le CV PDF, le favicon, l’image de partage et les polices WOFF2 locales. Les licences et sources des polices Manrope et Unbounded sont dans `assets/fonts/`.

Modifier directement les fichiers de ce dépôt. Les anciennes livraisons `Portfolio_Julien_Fretille.html` sont des archives et ne sont plus la source maintenue. Pour une prévisualisation locale, servir le dossier avec un serveur statique de développement, par exemple `python -m http.server 8000 --bind 127.0.0.1`, puis ouvrir `http://127.0.0.1:8000/`.

## Publication GitHub Pages

Le site est publié depuis la branche `main`, dossier racine (`/`). Dans les réglages du dépôt : **Pages → Deploy from a branch → main → / (root)**. Aucun framework ni compilation n’est nécessaire.

Publier ensemble HTML, CSS, JavaScript et ressources. Lors d’une modification CSS/JavaScript, changer le paramètre `v` des liens correspondants dans `index.html` pour renouveler le cache. Conserver `defer` sur le script. Les chemins relatifs conviennent également à une publication en sous-dossier.

## Sécurité et confidentialité

Une CSP placée au début du HTML restreint les scripts, styles, images et polices à l’origine du site. Elle interdit les scripts intégrés, `eval`, les connexions JavaScript externes, les objets, les frames et les soumissions natives. Le formulaire utilise une navigation `mailto:` avec des champs encodés ; il ne transmet pas les messages à un serveur du portfolio.

Les polices sont hébergées localement. Aucun service d’analyse d’audience, appel à une API d’IA ou script tiers n’est intégré. La politique de provenance est `no-referrer`. Les liens ouvrant un nouvel onglet utilisent `noopener noreferrer`.

Le CV PDF et les coordonnées restent volontairement publics. Le Word et le portrait isolé ont été retirés de la version courante ; leurs anciennes versions peuvent subsister dans l’historique public Git ou les caches. Le CV PDF conserve son contenu existant, dont sa photo. Retirer un lien ou un fichier courant n’efface pas les copies historiques.

Sur GitHub Pages, certaines protections dépendent de l’hébergeur. La directive anti-intégration `frame-ancestors` ne fonctionne pas dans une balise meta ; ce dépôt ne prétend pas l’activer. Aucune certification de sécurité ou d’accessibilité n’est revendiquée.

## Vérifications

Avec Node.js installé :

```text
node --check app.js
node tests/security.cjs
node tests/intro.cjs
node tests/navigation.cjs
```

Ces tests couvrent les ressources/CSP et les liens, l’encodage du formulaire avec des entrées malveillantes, la logique de l’introduction et l’absence de certains éléments du menu. Ce sont des vérifications statiques et des tests avec simulations ; ils ne remplacent pas une vérification visuelle et fonctionnelle après déploiement.

Pour enrichir les projets, ajouter uniquement des contributions personnelles, captures, configurations anonymisées et résultats réellement vérifiés. Ne jamais ajouter de secret, jeton, mot de passe ou données de tiers au dépôt.
