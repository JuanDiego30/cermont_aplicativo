# Git Workflow — Cermont S.A.S.

## Branch Strategy

| Branch | Purpose | Protection |
|--------|---------|------------|
| `deploy/vps-clean` | Production — automatic deploy to VPS | Force-push block, deletion block, PR required |
| `release/production-deploy-cermont-*` | Production release tags | Read-only after tag |
| `integration/*` | Multi-commit feature aggregation | PR + checks required |
| `fix/*` | Bugfix branches | PR required |
| `feat/*` | Feature branches | PR required |
| `docs/*` | Documentation-only changes | PR optional for trivial |
| `rescue/*` | Emergency snapshots | Never merged — kept as safety net |

## Worktree Convention

One module = one branch = one worktree = one PR.

```bash
git worktree add ../cermont-<module> -b <type>/<module-desc> origin/deploy/vps-clean
```

Active worktrees are registered via `git worktree list`. Never work on the main repo checkout for feature work.

## Commit Convention

Follow Conventional Commits:

```
<type>(<scope>): <description>
```

Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `style`, `perf`, `ci`, `revert`.

Before commit:
1. Verify active branch is correct (`git branch --show-current`)
2. Show changed-file inventory (`git status --short`, `git diff --stat`)
3. Check for secrets (`.env*`, `*.pem`, `*.key`, tokens)
4. Check for generated files (`node_modules`, `.next`, `dist`, `coverage`, `.turbo`)
5. Run validation gates (`npm run typecheck && npm run lint && npm run test`)
6. Show staged file inventory (`git diff --cached --name-status`)
7. Create descriptive commit
8. Push only the current feature branch
9. Verify remote SHA matches local SHA

## Checkpoint Policy

Before any risky operation:
1. Create external backup (exclude `node_modules`, `.next`, `dist`, `coverage`, `.turbo`)
2. Create checkpoint branch: `rescue/checkpoint-YYYYMMDD-HHMMSS`
3. Commit all valid files
4. Push to origin
5. Verify remote SHA

## Rescue Protocol

When local work is at risk (1,000+ uncommitted changes, no remote backup):

1. **Stop all editing.** Run read-only inspection:
   ```
   git status --short
   git diff --stat
   git ls-files --others --exclude-standard
   git log --oneline --decorate -n 20
   ```

2. **External backup** — copy repo excluding caches:
   ```
   robocopy <src> <dst>/cermont-rescue-YYYYMMDD-HHMMSS /MIR /XD node_modules .next dist coverage .turbo cache
   ```

3. **Security inventory** — classify each file, detect secrets. Never stage `.env`, `.env.local`, `.env.production`, private keys, certificates, tokens, database dumps, or build output.

4. **Rescue branch** — create from current HEAD:
   ```
   git switch -c rescue/local-snapshot-YYYYMMDD-HHMMSS
   ```

5. **Rescue commit:**
   ```
   git add -A
   git commit -m "chore(rescue): preserve local work before remediation"
   ```

6. **Push and verify:**
   ```
   git push -u origin rescue/local-snapshot-YYYYMMDD-HHMMSS
   git rev-parse HEAD
   git ls-remote --heads origin rescue/local-snapshot-YYYYMMDD-HHMMSS
   ```

7. **Draft PR** — open a Draft Pull Request from rescue branch to base branch. Never merge.

8. **Worktree cleanup** — create fresh worktree from base branch, import changes in logical groups:
   ```
   git worktree add ../cermont-integration -b integration/<group> origin/deploy/vps-clean
   git restore --source rescue/local-snapshot-YYYYMMDD-HHMMSS -- <files>
   ```

## PR Workflow

1. Branch from `origin/deploy/vps-clean`
2. Make changes in isolated worktree
3. Run gates before commit
4. Push branch
5. Open PR (Draft if WIP)
6. Request review
7. Pass status checks
8. Squash-merge to `deploy/vps-clean`
9. Delete feature branch

## Allowed Commands (no auth required)

- `git status`
- `git diff`
- `git log`
- `git show`
- `git branch --show-current`
- `git rev-parse`
- `git remote -v`
- `git ls-files`
- `git fetch`
- `git worktree list`

## Commands Requiring Authorization

Before using any of these, show the plan to the user and get explicit approval:

- `git reset` (any mode)
- `git clean`
- `git restore .` (full working tree)
- `git checkout -- .`
- `git rebase`
- `git merge`
- `git cherry-pick`
- `git stash pop` / `git stash drop` / `git stash clear`
- `git push --force` / `git push --force-with-lease`
- `git branch -D`
- `git tag -d`
- `git gc --prune`
- `git pull` (in dirty working tree)
- `rm -rf` (any path in repo)

## Secrets Handling

- Never stage: `.env`, `.env.local`, `.env.production`, `*.pem`, `*.key`, `*-secret*`, `credential*`, `token*`
- `.env.example` may be versioned if it contains no real credentials
- Before `git add -A`, verify `.gitignore` covers all secret files
- If a secret is detected: do not display its contents, do not stage it, confirm it's gitignored, then continue

## Generated Files

Never stage:
- `node_modules/`
- `.next/`
- `dist/`
- `coverage/`
- `.turbo/`
- `cache/`
- `*.log`

## Recovery

If work is lost in the working tree:
1. Check `git stash list` (but stash is NOT a reliable backup)
2. Check `git reflog` for orphaned commits
3. Check `rescue/*` branches on remote
4. Check external backups in `C:\Users\camil\Backups\`
5. Never `git reset --hard` or `git clean` as recovery

## Branch Protection (Recommended)

Settings for `deploy/vps-clean` and `release/*`:
- ☑ Require pull request before merging
- ☑ Require approvals (1 minimum)
- ☑ Require status checks (typecheck, lint, test, build)
- ☑ Require branches to be up to date
- ☑ Require conversation resolution
- ☑ Restrict force pushes (deny everyone)
- ☑ Restrict branch deletions (deny everyone)
- ☑ Do not allow bypassing the above settings
