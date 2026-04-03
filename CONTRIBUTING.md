# Contributing to ChamberForge

## Development Setup

See [docs/local-setup.md](docs/local-setup.md) for full environment setup.

## Branch Naming

- `ai-feature/<name>` — AI-generated feature branches
- `feature/<name>` — Human-developed features
- `fix/<name>` — Bug fixes
- `docs/<name>` — Documentation updates

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — New feature
- `fix:` — Bug fix
- `docs:` — Documentation
- `test:` — Tests
- `refactor:` — Code restructuring
- `chore:` — Maintenance

## Pull Request Process

1. Create a feature branch from `main`
2. Write code + tests
3. Ensure all tests pass: `make test`
4. Update documentation if needed
5. Submit PR with description of changes

## Code Review Checklist

- [ ] Code follows project conventions
- [ ] Tests added/updated
- [ ] Docs updated
- [ ] No secrets committed
- [ ] Security considerations addressed
