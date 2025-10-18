# Release Process

This repository is now configured for automated releases using GitHub Actions.

## How to Create a Release

### Option 1: Tag-based Release (Recommended)

1. Ensure all changes are committed and pushed to the `main` branch
2. Create and push a version tag:
   ```bash
   git tag v1.0.1
   git push origin v1.0.1
   ```
3. The GitHub Actions workflow will automatically:
   - Build the project
   - Create a GitHub Release with release notes
   - Attach the dist files to the release

### Option 2: Manual Release via GitHub UI

1. Go to the repository on GitHub
2. Click on "Releases" → "Draft a new release"
3. Choose or create a new tag (e.g., `v1.0.1`)
4. Fill in the release title and description
5. Click "Publish release"

## Publishing to NPM

After creating a GitHub release, the package can be published to NPM:

1. **Setup Required (One-time)**:
   - Go to Repository Settings → Secrets and variables → Actions
   - Add a secret named `NPM_TOKEN` with your NPM authentication token
   - Get your token from: https://www.npmjs.com/settings/YOUR_USERNAME/tokens

2. **Automatic Publishing**:
   - When you publish a GitHub release, the workflow will automatically publish to NPM
   - You can also trigger it manually from Actions → "Publish to NPM" → "Run workflow"

## Repository Settings

The following settings have been configured:

- **dist/ directory**: Now committed to the repository (removed from .gitignore)
- **GitHub Actions workflows**:
  - `ci.yml` - Runs build and tests on every push and PR
  - `release.yml` - Creates GitHub releases when tags are pushed
  - `publish.yml` - Publishes to NPM when releases are created

## Workflow Files

- `.github/workflows/ci.yml` - Continuous Integration
- `.github/workflows/release.yml` - GitHub Release automation
- `.github/workflows/publish.yml` - NPM publishing automation

## Version Numbering

Follow semantic versioning (semver):
- `v1.0.0` - Major release (breaking changes)
- `v1.1.0` - Minor release (new features, backward compatible)
- `v1.0.1` - Patch release (bug fixes)
