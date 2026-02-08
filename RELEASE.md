# LoveFlix Release Guide

This guide explains how to create and distribute new releases of LoveFlix using the automated release script.

## Prerequisites

Before creating a release, ensure you have:

1. **Git** - For version control and tagging
2. **Node.js & npm** - For building the Electron app
3. **GitHub CLI (optional)** - For automatic GitHub release creation
   - Install: `winget install --id GitHub.cli`
   - Authenticate: `gh auth login`

## Quick Start

### Basic Release (Windows & macOS)

```powershell
.\release.ps1
```
The script will ask for the version number if not provided.

### Specify Version

```powershell
.\release.ps1 -Version "1.1.0"
```

### Full Release with GitHub

```powershell
.\release.ps1 -Version "1.1.0" -CreateGitHubRelease
```

**Note**: The script builds for your current platform only. For multi-platform releases:
- Build on Windows for Windows installers
- Build on macOS for macOS installers  
- Use GitHub Actions for automated multi-platform builds

## Release Script Parameters

| Parameter | Description | Example |
|-----------|-------------|---------|
| `-Version` | Version number (optional - will prompt if not provided) | `"1.1.0"` |
| `-SkipTests` | Skip npm test checks | Flag |
| `-SkipPush` | Don't push to remote repository | Flag |
| `-CreateGitHubRelease` | Create GitHub release automatically | Flag |
| `-Help` | Show help message | Flag |

**Note**: The script builds for your current platform only.
- **Windows**: Creates `.exe` installer
- **macOS**: Creates `.dmg` for Intel and Apple Silicon
- **Multi-platform**: Use CI/CD or build separately on each platform

## Release Process Steps

The script automatically performs these steps:

1. ✅ **Validate Environment**
   - Check if in git repository
   - Verify working directory is clean
   - Validate version format

2. 📝 **Update Version**
   - Updates `electron-app/package.json`
   - Creates backup of files

3. 🧪 **Build Application**
   - Installs dependencies (`npm install`)
   - Runs tests (unless `-SkipTests`)
   - Builds Electron installers for selected platforms

4. 📦 **Create Git Release**
   - Commits version changes
   - Creates git tag `v{version}`
   - Pushes to remote (optional)

5. 🚀 **GitHub Release** (optional)
   - Creates GitHub release
   - Uploads installers automatically
   - Generates release notes

## Build Outputs

After a successful build, installers are located in:

```
electron-app/dist/
```

### Windows Installers
- `LoveFlix Setup {version}.exe` - NSIS installer with auto-update support

### macOS Installers
- `LoveFlix-{version}.dmg` - Intel Mac installer
- `LoveFlix-{version}-arm64.dmg` - Apple Silicon (M1/M2/M3) installer

## Auto-Update Feature

### How It Works

LoveFlix includes automatic update functionality powered by `electron-updater`:

1. **Update Check**: App checks for updates 3 seconds after launch
2. **Notification**: Users see an in-app notification when updates are available
3. **Download**: Users can download updates with one click
4. **Install**: Updates install on restart or app exit
5. **Data Preservation**: All user data is preserved:
   - API keys (OpenAI & TMDB)
   - Saved movie collections
   - App settings

### User Data Location

User data is stored in Electron's `userData` directory, which persists across updates:

- **Windows**: `%APPDATA%\loveflix\`
- **macOS**: `~/Library/Application Support/loveflix/`
- **Linux**: `~/.config/loveflix/`

### Update Channels

Updates are published through GitHub releases. When you create a release with `-CreateGitHubRelease`, the app will automatically detect it.

## Version Numbering

Follow **Semantic Versioning** (SemVer):

```
MAJOR.MINOR.PATCH
```

- **MAJOR**: Breaking changes (e.g., `2.0.0`)
- **MINOR**: New features, backward compatible (e.g., `1.1.0`)
- **PATCH**: Bug fixes (e.g., `1.0.1`)

### Examples

```powershell
# Patch release (bug fixes)
.\release.ps1 -Version "1.0.1"

# Minor release (new features)
.\release.ps1 -Version "1.1.0"

# Major release (breaking changes)
.\release.ps1 -Version "2.0.0"
```

## Common Scenarios

### Scenario 1: Quick Local Release

```powershell
.\release.ps1 -Version "1.0.1" -SkipPush
```

This builds all installers locally without pushing to GitHub.

### Scenario 2: Full Production Release

```powershell
.\release.ps1 -Version "1.1.0" -CreateGitHubRelease
```

This:
- Builds Windows & macOS installers (Intel + Apple Silicon)
- Commits and pushes to GitHub
- Creates GitHub release with all installers
- Users get auto-update notification automatically

### Scenario 3: Test Build

```powershell
.\release.ps1 -Version "1.1.0-beta" -SkipPush -SkipTests
```

This creates a local test build without affecting the repository.

## Troubleshooting

### Error: Working directory is not clean

**Solution**: Commit or stash your changes first:

```powershell
git add .
git commit -m "Prepare for release"
```

### Error: Build failed

**Solution**: The script automatically restores backup files. Check the error message and fix issues, then try again.

### macOS Build on Windows

**Note**: Building macOS installers from Windows has limitations:
- DMG files are created but may not be signed
- For signed releases, build on macOS or use CI/CD

### GitHub Release Creation Failed

**Solution**: You can manually create the release:
1. Go to: `https://github.com/janvanwassenhove/LoveFlix/releases/new?tag=v{version}`
2. Upload installers from `electron-app/dist/`
3. Add release notes

## CI/CD Integration (Future)

For automated releases on git push:

1. **GitHub Actions**: Create `.github/workflows/release.yml`
2. **Auto-build**: Trigger on tag push (`v*`)
3. **Multi-platform**: Use matrix builds for Windows/macOS/Linux

## Security Notes

### Code Signing

For production releases, you should sign your installers:

**Windows**: 
- Requires code signing certificate
- Add certificate to `electron-builder` config

**macOS**:
- Requires Apple Developer ID
- Enable in `package.json` build config

### API Keys

Never commit API keys to the repository:
- Use environment variables
- Keys are stored securely in `electron-store`
- User data directory is user-specific

## Best Practices

1. ✅ **Test Before Release**: Always test the app before creating a release
2. ✅ **Clean Working Directory**: Commit all changes before running release script
3. ✅ **Semantic Versioning**: Follow SemVer for version numbers
4. ✅ **Release Notes**: Manually edit GitHub release notes if needed
5. ✅ **Backup**: Script creates automatic backups, but keep your own too
6. ✅ **Update Changelog**: Maintain a CHANGELOG.md file (recommended)

## Manual Release Process

If you prefer not to use the script:

### 1. Update Version

```powershell
cd electron-app
npm version 1.1.0
```

### 2. Build

```powershell
npm run build:all
```

### 3. Commit & Tag

```powershell
git add package.json
git commit -m "Release v1.1.0"
git tag -a v1.1.0 -m "Release v1.1.0"
git push origin main
git push origin v1.1.0
```

### 4. Create GitHub Release

1. Go to: https://github.com/janvanwassenhove/LoveFlix/releases/new
2. Select the tag
3. Upload installers from `electron-app/dist/`
4. Write release notes
5. Publish

## Support

For issues or questions:
- **GitHub Issues**: https://github.com/janvanwassenhove/LoveFlix/issues
- **Discussions**: https://github.com/janvanwassenhove/LoveFlix/discussions

---

**Happy Releasing! 🎬❤️**
