# Versioning

Updated: 2026-04-30

Use milestone-based pre-1.0 versions:

```txt
0.<milestone>.<patch>
```

Rules:

- `milestone` is the active project milestone number from [roadmap.md](roadmap.md).
- `patch` is the code-change counter inside that milestone.
- Every code change must update the version.
- When moving to a new milestone, set the version to `0.<milestone>.0`.
- Subsequent code changes in that milestone increment only `patch`.
- Keep version values synchronized in `package.json`, `package-lock.json`, and `manifest.json`.

Examples:

```txt
Milestone 1 initial scaffold: 0.1.0
Milestone 1 first patch:     0.1.1
Milestone 2 start:           0.2.0
Milestone 2 second patch:    0.2.2
Milestone 2 third patch:     0.2.3
Milestone 2 fourth patch:    0.2.4
Milestone 3 first patch:     0.3.1
Milestone 3 second patch:    0.3.2
```

Current version:

```txt
0.3.2
```
