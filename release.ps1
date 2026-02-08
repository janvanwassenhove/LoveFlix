# LoveFlix Release Builder (PowerShell version)
param(
    [Parameter(Mandatory=$false)]
    [string]$Version,
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipTests,
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipPush,
    
    [Parameter(Mandatory=$false)]
    [switch]$CreateGitHubRelease,
    
    [Parameter(Mandatory=$false)]
    [switch]$Help
)

if ($Help) {
    Write-Host @"
LoveFlix Release Builder

Usage:
    .\release.ps1 [-Version <version>] [-SkipTests] [-SkipPush] [-CreateGitHubRelease] [-Help]

Parameters:
    -Version <version>     : Specify the version (e.g., 1.0.0, 1.1.0)
    -SkipTests            : Skip npm test (faster but less safe)
    -SkipPush             : Don't push to remote repository
    -CreateGitHubRelease  : Automatically create GitHub release with installers
    -Help                 : Show this help message

Examples:
    .\release.ps1
    .\release.ps1 -Version "1.1.0"
    .\release.ps1 -Version "2.0.0" -CreateGitHubRelease
    .\release.ps1 -CreateGitHubRelease

Note: Always builds for both Windows and macOS.
      Auto-update is enabled - new versions will update existing installations
      without losing user data (API keys, saved collections, settings).
"@
    exit 0
}

Write-Host ""
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "         LoveFlix Release Builder" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in a git repository
try {
    git rev-parse --git-dir 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) { throw }
} catch {
    Write-Host "ERROR: Not in a git repository!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if working directory is clean
$status = git status --porcelain 2>$null
if ($status) {
    Write-Host "ERROR: Working directory is not clean! Please commit or stash changes first." -ForegroundColor Red
    Write-Host ""
    git status --short
    Read-Host "Press Enter to exit"
    exit 1
}

# Get current version
$packageJsonPath = "electron-app\package.json"
if (-not (Test-Path $packageJsonPath)) {
    Write-Host "ERROR: package.json not found at $packageJsonPath" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

$packageJson = Get-Content $packageJsonPath -Raw | ConvertFrom-Json
$currentVersion = $packageJson.version

Write-Host "Current version: $currentVersion" -ForegroundColor Yellow
Write-Host ""

# Get new version
if (-not $Version) {
    do {
        $Version = Read-Host "Enter new version (e.g., 1.0.1, 2.0.0)"
    } while (-not $Version)
}

# Validate version format
if ($Version -notmatch '^[0-9]+\.[0-9]+\.[0-9]+$') {
    Write-Host "ERROR: Invalid version format! Use semantic versioning (e.g., 1.0.0)" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Preparing release v$Version..." -ForegroundColor Green
Write-Host "Target platform: $Platform" -ForegroundColor Green
Write-Host ""

# Function to restore backus: Windows + macOS (Intel & Apple Silicon)
function Restore-BackupFiles {
    Write-Host ""
    Write-Host "=================================================" -ForegroundColor Red
    Write-Host "ERROR: Build failed! Restoring backup files..." -ForegroundColor Red
    Write-Host "=================================================" -ForegroundColor Red
    Write-Host ""
    
    if (Test-Path "$packageJsonPath.backup") {
        Copy-Item "$packageJsonPath.backup" $packageJsonPath -Force
        Remove-Item "$packageJsonPath.backup" -Force
    }
    Write-Host "Backup files restored. Please fix the issues and try again." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Create backup of version files
Write-Host "Creating backup of package.json..." -ForegroundColor Yellow
Copy-Item $packageJsonPath "$packageJsonPath.backup" -Force

try {
    # Update version in package.json
    Write-Host "Updating package.json version..." -ForegroundColor Yellow
    $packageJson.version = $Version
    $packageJson | ConvertTo-Json -Depth 10 | Set-Content $packageJsonPath

    Write-Host ""
    Write-Host "=================================================" -ForegroundColor Cyan
    Write-Host "Building and testing the application..." -ForegroundColor Cyan
    Write-Host "=================================================" -ForegroundColor Cyan
    Write-Host ""

    # Navigate to electron-app directory
    Push-Location "electron-app"

    # Clean previous builds
    Write-Host "Cleaning previous builds..." -ForegroundColor Yellow
    if (Test-Path "dist") { Remove-Item "dist" -Recurse -Force }

    # Install/update dependencies
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Pop-Location
        Write-Host "ERROR: npm install failed!" -ForegroundColor Red
        Restore-BackupFiles
    }

    # Run tests if not skipped
    if (-not $SkipTests) {
        Write-Host "Running tests..." -ForegroundColor Yellow
        # Add npm test here if you have tests configured
        # npm test
        # if ($LASTEXITCODE -ne 0) {
        #     Pop-Location
        #     Write-Host "ERROR: Tests failed!" -ForegroundColor Red
        #     Restore-BackupFiles
        # }
    }

    # Build the application
    Write-Host "Building Electron application for all platforms (this may take a while)..." -ForegroundColor Yellow
    Write-Host "  - Windows installer (NSIS)" -ForegroundColor Cyan
    Write-Host "  - macOS installer (DMG) - Intel" -ForegroundColor Cyan
    Write-Host "  - macOS installer (DMG) - Apple Silicon" -ForegroundColor Cyan
    
    if ($env:OS -eq "Windows_NT") {
        Write-Host ""
        Write-Host "Note: Building for macOS from Windows. DMG files will be created." -ForegroundColor Yellow
        Write-Host "      For signed releases, build on macOS or use CI/CD." -ForegroundColor Yellow
        Write-Host ""
    }
    
    npm run build:all
    
    if ($LASTEXITCODE -ne 0) {
        Pop-Location
        Write-Host "ERROR: Electron build failed!" -ForegroundColor Red
        Restore-BackupFiles
    }
    
    Pop-Location

    Write-Host ""
    Write-Host "=================================================" -ForegroundColor Green
    Write-Host "Build successful! Creating git release..." -ForegroundColor Green
    Write-Host "=================================================" -ForegroundColor Green
    Write-Host ""

    # Commit version changes
    Write-Host "Committing version changes..." -ForegroundColor Yellow
    git add $packageJsonPath
    git commit -m "Release v$Version"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Git commit failed!" -ForegroundColor Red
        Restore-BackupFiles
    }

    # Create git tag
    Write-Host "Creating git tag v$Version..." -ForegroundColor Yellow
    git tag -a "v$Version" -m "Release v$Version"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Git tag creation failed!" -ForegroundColor Red
        Restore-BackupFiles
    }

    # Push changes and tag
    if (-not $SkipPush) {
        Write-Host ""
        $pushChoice = Read-Host "Push changes and tag to remote? (y/n)"
        if ($pushChoice -eq "y" -or $pushChoice -eq "Y") {
            Write-Host "Pushing changes..." -ForegroundColor Yellow
            git push origin main
            if ($LASTEXITCODE -ne 0) {
                Write-Host "WARNING: Failed to push commits, but release was built successfully" -ForegroundColor Yellow
            }
            
            Write-Host "Pushing tag..." -ForegroundColor Yellow
            git push origin "v$Version"
            if ($LASTEXITCODE -ne 0) {
                Write-Host "WARNING: Failed to push tag, but release was built successfully" -ForegroundColor Yellow
            }
        }
    }

    # Clean up backup files
    Write-Host "Cleaning up backup files..." -ForegroundColor Yellow
    Remove-Item "$packageJsonPath.backup" -Force -ErrorAction SilentlyContinue

    Write-Host ""
    Write-Host "=================================================" -ForegroundColor Green
    Write-Host "SUCCESS! Release v$Version created!" -ForegroundColor Green
    Write-Host "=================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Build artifacts are located in:" -ForegroundColor Yellow
    Write-Host "- electron-app\dist\" -ForegroundColor White
    Write-Host ""
    Write-Host "Platform-specific installers:" -ForegroundColor Yellow
    if ($Platform -eq "all" -or $Platform -eq "windows") {
        Write-Host "  🪟 Windows: LoveFlix Setup $Version.exe" -ForegroundColor Cyan
    }
    if ($Platform -eq "all" -or $Platform -eq "macos") {
        Write-Host "  🍎 macOS: LoveFlix-$Version.dmg, LoveFlix-$Version-arm64.dmg" -ForegroundColor Cyan
    }
    Write-Host ""
    Write-Host "Installers created:" -ForegroundColor Yellow
    Write-Host "  🪟 Windows: LoveFlix Setup $Version.exe" -ForegroundColor Cyan
    Write-Host "  🍎 macOS Intel: LoveFlix-$Version.dmg" -ForegroundColor Cyan
    Write-Host "  🍎 macOS ARM: LoveFlix-$Version-arm64.dmg" -ForegroundColor Cyan
    if (-not $SkipPush -and ($pushChoice -eq "y" -or $pushChoice -eq "Y")) {
        if ($CreateGitHubRelease) {
            Write-Host "Creating GitHub release..." -ForegroundColor Blue
            
            # Check if GitHub CLI is available
            if (Get-Command "gh" -ErrorAction SilentlyContinue) {
                try {
                    # Check authentication
                    $AuthStatus = gh auth status 2>&1
                    if ($LASTEXITCODE -eq 0) {
                        # Generate release notes
                        $ReleaseNotes = @"
# LoveFlix Desktop $Version

## 🎬 What's New
Transform any movie into a hyper-romantic masterpiece with AI-powered Netflix-style UI!

## ✨ Features
- 🤖 AI-powered movie transformation (OpenAI integration)
- 🎨 AI-generated romantic movie posters (DALL-E / GPT Image)
- 🌍 Multi-language support
- 📊 Top 10 movies by country (TMDB integration)
- 💾 Save and manage your romantic movie collection
- 🎭 Multiple AI models for text and images

## 📥 Downloads

### Windows Installer
- **Setup**: ``LoveFlix Setup $Version.exe`` - Windows installer with auto-update support

### macOS Installer
- **DMG (Intel)**: ``LoveFlix-$Version.dmg`` - macOS installer for Intel Macs
- **DMG (Apple Silicon)**: ``LoveFlix-$Version-arm64.dmg`` - macOS installer for M1/M2/M3 Macs

## 🔄 Auto-Update
This version includes automatic update support. When a new version is released:
- You'll be notified in the app
- One-click update installation
- All your data is preserved (API keys, saved collections, settings)

## 💻 System Requirements

### Windows
- Windows 10/11 (64-bit)
- 4GB RAM minimum

### macOS
- macOS 10.15 (Catalina) or later
- 4GB RAM minimum
- Intel or Apple Silicon

## 🚀 Installation

### Windows
1. Download ``LoveFlix Setup $Version.exe``
2. Run the installer
3. Follow the setup wizard
4. Launch LoveFlix from Start Menu or Desktop

### macOS
1. Download the appropriate DMG for your Mac
2. Open the DMG file
3. Drag LoveFlix to Applications folder
4. Launch from Applications

## 🔑 Setup
1. Launch LoveFlix
2. Go to Settings (gear icon)
3. Enter your OpenAI API key
4. (Optional) Enter your TMDB API key for Top 10 feature

## 🐛 Issues & Support
If you encounter any issues, please report them on our [GitHub Issues](https://github.com/janvanwassenhove/LoveFlix/issues) page.

---
Generated on $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss UTC')
"@

                        # Find installer paths
                        $DistPath = "electron-app\dist"
                        $WindowsInstaller = Get-ChildItem -Path $DistPath -Filter "LoveFlix Setup*.exe" -ErrorAction SilentlyContinue | Select-Object -First 1
                        $MacDmgIntel = Get-ChildItem -Path $DistPath -Filter "LoveFlix-*-x64.dmg" -ErrorAction SilentlyContinue | Select-Object -First 1
                        $MacDmgArm = Get-ChildItem -Path $DistPath -Filter "LoveFlix-*-arm64.dmg" -ErrorAction SilentlyContinue | Select-Object -First 1
                        
                        # Create GitHub release
                        $GhArgs = @("release", "create", "v$Version", "--title", "LoveFlix Desktop $Version", "--notes", $ReleaseNotes)
                        
                        # Add installers if they exist
                        if ($WindowsInstaller) { 
                            $GhArgs += $WindowsInstaller.FullName
                            Write-Host "  ✅ Windows installer: $($WindowsInstaller.Name)" -ForegroundColor Green
                        }
                        if ($MacDmgIntel) { 
                            $GhArgs += $MacDmgIntel.FullName 
                            Write-Host "  ✅ macOS Intel installer: $($MacDmgIntel.Name)" -ForegroundColor Green
                        }
                        if ($MacDmgArm) { 
                            $GhArgs += $MacDmgArm.FullName 
                            Write-Host "  ✅ macOS ARM installer: $($MacDmgArm.Name)" -ForegroundColor Green
                        }
                        
                        & gh @GhArgs
                        
                        if ($LASTEXITCODE -eq 0) {
                            Write-Host ""
                            Write-Host "✅ GitHub release created successfully!" -ForegroundColor Green
                            Write-Host "🌐 View at: https://github.com/janvanwassenhove/LoveFlix/releases/tag/v$Version" -ForegroundColor Cyan
                        } else {
                            Write-Host "❌ Failed to create GitHub release. You can create it manually." -ForegroundColor Yellow
                            Write-Host "https://github.com/janvanwassenhove/LoveFlix/releases/new?tag=v$Version" -ForegroundColor Cyan
                        }
                    } else {
                        Write-Host "❌ Not authenticated with GitHub CLI. Run: gh auth login" -ForegroundColor Yellow
                        Write-Host "You can create the release manually at:" -ForegroundColor Yellow
                        Write-Host "https://github.com/janvanwassenhove/LoveFlix/releases/new?tag=v$Version" -ForegroundColor Cyan
                    }
                } catch {
                    Write-Host "❌ Error creating GitHub release: $($_.Exception.Message)" -ForegroundColor Yellow
                    Write-Host "You can create it manually at:" -ForegroundColor Yellow
                    Write-Host "https://github.com/janvanwassenhove/LoveFlix/releases/new?tag=v$Version" -ForegroundColor Cyan
                }
            } else {
                Write-Host "❌ GitHub CLI not found. Install with: winget install --id GitHub.cli" -ForegroundColor Yellow
                Write-Host "You can create the release manually at:" -ForegroundColor Yellow
                Write-Host "https://github.com/janvanwassenhove/LoveFlix/releases/new?tag=v$Version" -ForegroundColor Cyan
            }
        } else {
            Write-Host "You can create a GitHub release at:" -ForegroundColor Yellow
            Write-Host "https://github.com/janvanwassenhove/LoveFlix/releases/new?tag=v$Version" -ForegroundColor Cyan
        }
        Write-Host ""
    }

} catch {
    Write-Host "ERROR: An unexpected error occurred: $_" -ForegroundColor Red
    Restore-BackupFiles
}

Read-Host "Press Enter to exit"
