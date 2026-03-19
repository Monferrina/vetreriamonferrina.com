# Contributing

Grazie per l'interesse nel contribuire a questo progetto!

## Come contribuire

1. **Forka** il repository
2. **Crea un branch** dal `main`: `git checkout -b fix/descrizione`
3. **Fai le modifiche** seguendo le convenzioni del progetto
4. **Esegui i test**: `npm test`
5. **Esegui il lint**: `npm run lint`
6. **Committa** con messaggi chiari e descrittivi
7. **Apri una Pull Request** verso `main`

## Requisiti per le PR

- Tutti i test devono passare
- Il codice deve passare ESLint e Prettier (i pre-commit hook li eseguono automaticamente)
- Descrivere chiaramente le modifiche nella PR
- Una PR per feature/fix

## Convenzioni

- **Commit messages**: seguire il formato [Conventional Commits](https://www.conventionalcommits.org/) (`fix:`, `feat:`, `chore:`, ecc.)
- **Branch naming**: `tipo/descrizione` (es. `fix/form-validation`, `feat/new-page`)
- **Lingua**: codice e commenti in inglese, contenuti utente in italiano

## Setup locale

```bash
git clone <repo-url> && cd <repo-name>
npm install
cp .env.example .env.local
npm run dev
```

Vedi il [README](README.md) per i dettagli completi.

## Segnalare bug

Apri una [issue](../../issues/new?template=bug_report.yml) con:

- Descrizione del problema
- Passaggi per riprodurlo
- Comportamento atteso vs attuale

## Sicurezza

Per vulnerabilità di sicurezza, **non aprire issue pubbliche**. Segui la [Security Policy](SECURITY.md).
