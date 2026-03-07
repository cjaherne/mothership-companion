# Contributing

## Release Process (Semantic Versioning)

We follow [semver](https://semver.org/): `MAJOR.MINOR.PATCH`.

| Change type | Version bump | Example |
|-------------|--------------|---------|
| Bug fixes, minor corrections | Patch (1.0.x → 1.0.x+1) | 1.0.1 → 1.0.2 |
| New features, campaigns, non-breaking changes | Minor (1.x.0 → 1.x+1.0) | 1.0.1 → 1.1.0 |
| Breaking API or config changes | Major (x.0.0 → x+1.0.0) | 1.1.0 → 2.0.0 |

### Release Checklist

1. **Bump version** in `package.json` *before* tagging.
2. **Commit** the version bump (e.g. `chore: bump version to X.Y.Z`).
3. **Tag** with `v` prefix: `git tag -a vX.Y.Z -m "Version X.Y.Z - <description>"`.
4. **Push** branch and tag: `git push origin main` and `git push origin vX.Y.Z`.

Always ensure `package.json` version matches the git tag.
