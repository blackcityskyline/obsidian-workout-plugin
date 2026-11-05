# helper/: Workout Helper (our exercise reference)

Our own Obsidian plugin (ranked exercise base, workout days, interval timer, EN/RU) lives here so that the rest of the
repository stays identical to upstream and `git merge` never conflicts with it.

- Source of truth: `blackcityskyline/workout-helper` (branch `ranking`). This folder is a copy; rebuild with `sh workout-helper/dev/build.sh`.
- Plan for merging it into Workout Planner: `docs/workout-vault-roadmap.md`.

## Keeping the fork in sync with upstream (SpatariuRares/obsidian-workout-plugin)

```bash
git remote add upstream https://github.com/SpatariuRares/obsidian-workout-plugin.git   # once
git fetch upstream
git checkout main && git merge --ff-only upstream/main && git push origin main        # main = pure mirror of upstream
git checkout vault && git merge main                                                   # bring upstream into our branch
```

Rules: never commit our work on `main`; all changes go to `vault` (or feature branches off it). Keep our additions in
new files/folders (`helper/`, `docs/`, new features as new modules) and touch upstream files as little as possible.
