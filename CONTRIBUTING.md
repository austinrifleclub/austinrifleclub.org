# Contributing to Austin Rifle Club Website

Thank you for your interest in contributing to the Austin Rifle Club website.

## Branching Policy

We use **GitHub Flow** - a simple, branch-based workflow.

### Branch Structure

| Branch | Purpose | Deploys To |
|--------|---------|------------|
| `main` | Production-ready code | Staging (auto) |
| `feature/*` | New features | - |
| `fix/*` | Bug fixes | - |
| `hotfix/*` | Urgent production fixes | - |

### Workflow

1. **Create a branch** from `main`:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/your-feature-name
   ```

2. **Make changes** and commit frequently:
   ```bash
   git add .
   git commit -m "Add feature description"
   ```

3. **Push your branch** to GitHub:
   ```bash
   git push -u origin feature/your-feature-name
   ```

4. **Open a Pull Request** against `main`

5. **Get review** - at least one approval required

6. **Merge** - squash merge preferred for clean history

7. **Delete branch** after merge

### Branch Naming Convention

- `feature/` - New functionality (e.g., `feature/member-dashboard`)
- `fix/` - Bug fixes (e.g., `fix/login-redirect`)
- `hotfix/` - Urgent fixes (e.g., `hotfix/payment-error`)
- `docs/` - Documentation only (e.g., `docs/api-endpoints`)
- `refactor/` - Code refactoring (e.g., `refactor/auth-middleware`)

### Deployment

| Action | Environment |
|--------|-------------|
| Push to `main` | Staging (`staging.austinrifleclub.org`) |
| Create GitHub Release | Production (`austinrifleclub.org`) |

### Commit Messages

Write clear, concise commit messages:

```
<type>: <short description>

<optional longer description>
```

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

Examples:
- `feat: Add volunteer hours tracking`
- `fix: Correct membership renewal date calculation`
- `docs: Update API endpoint documentation`

## Development Setup

See [README.md](README.md#getting-started) for setup instructions.

## Code Standards

### Before Submitting

- [ ] Run `npm run typecheck` - no TypeScript errors
- [ ] Run `npm test` - all tests pass
- [ ] Run `cd web && npm run typecheck` - frontend types pass
- [ ] Test your changes locally

### Code Style

- Use TypeScript for all new code
- Follow existing patterns in the codebase
- Add tests for new functionality
- Keep functions small and focused

## Pull Request Process

1. Update documentation if needed
2. Add tests for new features
3. Ensure CI passes
4. Request review from a maintainer
5. Address review feedback
6. Squash merge when approved

## Questions?

- Open an issue for bugs or feature requests
- Email info@austinrifleclub.org for other questions
