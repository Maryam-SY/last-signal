# Périmètre — AeroReborn

> Rôle BMAD : Product Manager · Version 1.0 (Phase 0) · Statut : **en attente de validation**
> Source : CDC §6 « Périmètre fonctionnel et priorités » et §11 « Décisions actées ».

## Règle de priorisation

- **Aucune** tâche P1 ne démarre tant que **tous** les P0 n'ont pas franchi leur gate de phase ([QUALITY_GATES.md](../quality/QUALITY_GATES.md)).
- **Aucune** tâche P2 ne démarre pendant le hackathon.
- Toute demande hors de ce document → décision humaine tracée (ADR ou mise à jour de ce fichier) **avant** développement.

## P0 — Indispensable (MVP du hackathon)

| Élément | Exigences PRD | Stories |
|---|---|---|
| Sélecteur de destination Moon / Mars | DEST-001 → 005 | US-2.1, US-2.2 |
| Espace Lune | EXPL-001, EQUIP-*, MAP-* | E3 |
| Espace Mars | EXPL-001, EQUIP-*, MAP-* | E3 |
| Carte interactive 2D (SVG, schématique) | MAP-001 → 006 | US-3.3, US-3.6 |
| Galerie hybride synchronisée avec la carte | SYNC-001 → 003 | US-3.4 |
| Regroupement par mission + accès rapide par mission | EQUIP-001, EQUIP-006 | US-3.1, US-3.5 |
| Fiches des équipements (résumé + détail) | EQUIP-002 → 005 | US-3.2 |
| Histoires en six étapes (moteur + ≥ 1 récit par destination) | STORY-001 → 010 | E4 |
| Sources scientifiques visibles et relations documentées | SOURCE-001 → 005 | US-1.5, US-4.4, US-5.4 |
| Page About & Sources | ABOUT-001, ABOUT-002 | US-5.1, US-5.2 |
| Navigation globale, fil d'Ariane, URLs adressables | NAV-001 → 005 | US-1.3, US-2.3 |
| Site public sans authentification (frontend + API, ADR-016) | DEPLOY-001, DEPLOY-002 | US-1.6, US-1.7, US-5.5 |
| Accessibilité et responsive mobile-first | NFR-A11Y-*, NFR-RESP-* | US-5.3 + chaque story |

## P1 — Améliorations si le MVP est stable

| Élément | Exigences / stories | Condition d'entrée |
|---|---|---|
| Filtres supplémentaires (statut, type) | EQUIP-007 / US-3.7 | Gates phase 3 verts |
| Recherche simple | — (à spécifier) | Gates phase 5 verts |
| Transitions visuelles plus élaborées | — | OPEN-10 tranché, gates phase 4 verts |
| Tracés de relations sur la carte | MAP-007 | OPEN-09 tranché |
| Histoire supplémentaire Ingenuity | US-4.8 | Récits P0 relus (QG-SCI) |
| Scénario « Be the engineer » | — (à spécifier) | Gates phase 5 verts |

## P2 — Évolutions futures (hors hackathon)

- Animations narratives avancées (scroll storytelling / parallax poussés).
- Audio / mode radio.
- PWA et consultation hors ligne.
- Mini-quiz.
- Version française complète de l'interface (si OPEN-06 confirme l'anglais pour le MVP).
- Nouvelles destinations et nouveaux corps célestes ; espace séparé « deep space » (dont **Pioneer 10**).

## Explicitement exclu

| Exclu | Raison |
|---|---|
| Objets de l'espace profond, orbite solaire, Vesta, Cérès, Éros dans les espaces Lune/Mars | CDC §6 : ne pas les intégrer artificiellement |
| Pioneer 10 dans le parcours principal | CDC §6, §11 (sauf décision explicite ultérieure) |
| Base de données, comptes | Pas de besoin identifié ; le backend est retenu (ADR-016) mais lit du contenu versionné (OPEN-18) |
| Docker | Pas nécessaire tant que l'hébergement n'impose pas de conteneur (ADR-005, à réexaminer avec OPEN-05/OPEN-18) |
| Carte 3D / globe / librairie cartographique | Complexité sans bénéfice P0 (ADR-007) |
| Collecte de données personnelles, analytics nominatives | CDC §10, NFR-LEGAL-001 |
| Logo NASA, formulation « officielle » | CDC §7 |
| Nom, image ou voix de personne mineure | CDC §7 |

## Décisions ouvertes impactant le périmètre

OPEN-06 (langue), OPEN-07 (catalogue et total), OPEN-08 (récits du MVP), OPEN-09 (relations sur la carte), OPEN-14 (filtre par mission) — voir [AUDIT_PHASE0.md §7](../project/AUDIT_PHASE0.md#7-décisions-ouvertes-à-valider-par-léquipe).
