# Version Management with Changesets

This project uses [Changesets](https://github.com/changesets/changesets) for automated version management and publishing.

## How it works

Changesets automatically manages package versions and generates changelogs based on the changes you make. When you make changes that should trigger a version bump, you create a "changeset" that describes the change and its impact.

## Workflow

### 1. Making Changes

When you make changes to any package that should be published:

```bash
# After making your changes, create a changeset
pnpm changeset
```

This will:
- Ask which packages have changed
- Ask what type of change it is (major, minor, patch)
- Ask for a summary of the changes
- Generate a changeset file in `.changeset/`

### 2. Version Bumping

When you're ready to release:

```bash
# This will update package.json versions and generate CHANGELOG.md files
pnpm version-packages
```

This command:
- Reads all changeset files
- Updates package.json versions accordingly
- Generates/updates CHANGELOG.md files
- Removes the consumed changeset files

### 3. Publishing

```bash
# Build and publish all packages
pnpm release
```

This will:
- Build all packages
- Publish changed packages to npm
- Create git tags for the releases

## Change Types

- **Patch** (1.0.0 → 1.0.1): Bug fixes, small improvements
- **Minor** (1.0.0 → 1.1.0): New features, backwards compatible
- **Major** (1.0.0 → 2.0.0): Breaking changes

## Example Workflow

```bash
# 1. Make your changes to packages
vim packages/logger/src/index.ts

# 2. Create a changeset
pnpm changeset
# Select packages: @notjustcoders/one-logger-client-sdk
# Change type: minor
# Summary: "Add new wrappedObject functionality"

# 3. Commit your changes including the changeset
git add .
git commit -m "feat: add wrappedObject functionality"

# 4. When ready to release, update versions
pnpm version-packages

# 5. Commit the version changes
git add .
git commit -m "chore: release packages"

# 6. Publish
pnpm release

# 7. Push to repository
git push --follow-tags
```

## Configuration

The Changesets configuration is in `.changeset/config.json`. Key settings:

- `access: "public"` - Packages are published as public
- `baseBranch: "main"` - Main branch for releases
- `updateInternalDependencies: "patch"` - How to handle workspace dependencies

## Benefits

- ✅ Automatic version management
- ✅ Generated changelogs
- ✅ Prevents accidental breaking changes
- ✅ Handles monorepo dependencies
- ✅ Git tags for releases
- ✅ Consistent release process