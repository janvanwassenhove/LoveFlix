# LoveFlix Release Quick Reference

## 🚀 Common Commands

### Full Release (Recommended)
```powershell
.\release.ps1 -Version "1.1.0" -CreateGitHubRelease
```
✅ Builds Windows & macOS installers (Intel + ARM)  
✅ Creates git tag and pushes  
✅ Creates GitHub release  
✅ Uploads all installers  
✅ Enables auto-update for users  

---

### Interactive Release (No Version Specified)
```powershell
.\release.ps1 -CreateGitHubRelease
```
❓ Script will prompt for version number  
✅ Same as above - builds everything  
💡 Good for manual releases  

---

### Test Build (No Git Push)
```powershell
.\release.ps1 -Version "1.1.0-beta" -SkipPush
```
🧪 Creates local build only  
❌ Doesn't push to GitHub  
💡 Good for testing  

---

### Fast Build (Skip Tests)
```powershell
.\release.ps1 -Version "1.1.0" -SkipTests -CreateGitHubRelease
```
⚡ Skips npm test checks  
⚠️ Use with caution  

---

## 📋 Parameter Reference

| Parameter | Values | Description |
|-----------|--------|-------------|
| `-Version` | `"1.0.0"` | Version number (will prompt if not provided) |
| `-SkipTests` | Flag | Skip test checks |
| `-SkipPush` | Flag | Don't push to GitHub |
| `-CreateGitHubRelease` | Flag | Create GitHub release |
| `-Help` | Flag | Show help |

**Note**: Script always builds for Windows + macOS (Intel + ARM). No platform selection needed.

---

## 📦 Version Examples

```powershell
# Patch Release (Bug fixes)
.\release.ps1 -Version "1.0.1" -CreateGitHubRelease

# Minor Release (New features)
.\release.ps1 -Version "1.1.0" -CreateGitHubRelease

# Major Release (Breaking changes)
.\release.ps1 -Version "2.0.0" -CreateGitHubRelease

# Beta Release
.\release.ps1 -Version "1.1.0-beta" -SkipPush
```

---

## 📍 Build Outputs

Installers are created in:
```
electron-app/dist/
```

### Files Created:
- `LoveFlix Setup {version}.exe` - Windows
- `LoveFlix-{version}.dmg` - macOS Intel
- `LoveFlix-{version}-arm64.dmg` - macOS ARM

---

## ✅ Pre-Release Checklist

Before running release script:

- [ ] All changes committed
- [ ] Working directory clean
- [ ] Tests passing
- [ ] Version number decided
- [ ] GitHub CLI authenticated (for `-CreateGitHubRelease`)

---

## 🐛 Common Issues

### "Working directory is not clean"
```powershell
git status
git add .
git commit -m "Prepare release"
```

### "GitHub CLI not found"
```powershell
winget install --id GitHub.cli
gh auth login
```

### Build failed
- Check error message
- Script auto-restores backups
- Fix issue and retry

---

## 💾 What Gets Updated

The script automatically updates:
- ✅ `electron-app/package.json` → version field
- ✅ Git → new commit + tag
- ✅ GitHub → new release (if `-CreateGitHubRelease`)

---

## 🔄 Auto-Update Flow

1. **Create Release**: Run script with `-CreateGitHubRelease`
2. **GitHub Release**: Installers uploaded automatically
3. **User Gets Notified**: App checks on startup
4. **One-Click Update**: User downloads & installs
5. **Data Preserved**: All settings, keys, collections safe

---

## 📞 Need Help?

```powershell
.\release.ps1 -Help
```

Or check [RELEASE.md](RELEASE.md) for full documentation.

---

**Quick Tip**: Always use `-CreateGitHubRelease` for production releases to enable auto-update! 🚀
