# Fan Yao — maquettes du site

Maquettes du site du club de kung-fu wushu **Fan Yao** (Bordeaux Bastide & Talence CREPS), reconstruites à partir du contenu de fanyao.fr.

| Dossier | Version |
|---|---|
| `fanyao-v1-une-page/` | V1 — une seule page, noir et rouge (style 2-LIMITED) |
| `fanyao-v2-multipages/` | V2 — une page par section, sélecteur Bordeaux (bleu) / Talence (rouge) |
| `fanyao-v3-madeleine-leon/` | V3 — une page, crème et terracotta |
| `fanyao-v4-ouf/` | **V4 — direction retenue** : V2 + particules WebGL, taolu piloté par le défilement, transitions, curseur sabre / bâton |
| `taolu-ombre/`, `taolu-baton/` | Taolus animés en ombre chinoise (mains nues, bâton du Nord) |
| `maquettes-fanyao.html` | Page de comparaison avec sélecteur des 4 versions |

Ouvrir `maquettes-fanyao.html` (ou l'`index.html` d'une version) dans un navigateur. La V4 charge GSAP, Lenis et Three.js depuis des CDN : une connexion est nécessaire.

V4 : `hero-gl.js` et `home.js` sont générés depuis `hero-gl.src.js` et `home.src.js` (masque des silhouettes et moteur du taolu injectés) — modifier les sources, pas les fichiers générés.
