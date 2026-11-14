# US-x.y — <Titre de la story>

> Copier ce fichier en `docs/project/stories/US-x.y.md` quand la story passe en `in-progress`.
> Ce fichier est le **contexte de travail** de l'agent : il doit permettre de reprendre la story sans relire toute la conversation.

- **Statut** : in-progress | review | done
- **Epic** : Ex — <nom>
- **Priorité** : P0 | P1
- **Exigences PRD** : <IDs>
- **Décisions liées** : <ADR-xxx, OPEN-xx (doivent être tranchées)>
- **Branche** : `feat/US-x.y-<slug>`

## Story

En tant que …, je souhaite … afin de …

## Critères d'acceptation

Copiés de USER_STORIES.md, cochés **uniquement** avec une preuve (test, capture, sortie de commande).

- [ ] 1. Étant donné … quand … alors … — *preuve :*
- [ ] 2. …

## Plan (Understand → Plan)

- Fichiers à créer / modifier :
- Approche :
- Risques et dépendances :
- Dépendance nouvelle ? (nom, justification, alternative écartée) — **validation humaine requise**

## Tâches

- [ ] Tâche 1 (AC n°…)
  - [ ] Sous-tâche
- [ ] Tests (unitaires / composants / intégrité)
- [ ] Documentation impactée

## Notes de développement

Contraintes d'architecture applicables (ARCHITECTURE §…), règles de données (DATA_MODEL §…), pièges connus.

## Vérification (Verify)

| Contrôle | Commande / méthode | Résultat réel |
|---|---|---|
| G1 lint | `npm run lint` | |
| G2 typecheck | `npm run typecheck` | |
| G3 test | `npm test` | |
| G4 build | `npm run build` | |
| Manuels applicables (QG-…) | | |

## Journal de l'agent

- Modèle / session :
- Décisions prises en cours de route (et validées par qui) :
- Fichiers modifiés :
- Problèmes non résolus :

## Revue humaine

- Relu par : · Date : · Verdict : accepté | modifications demandées
