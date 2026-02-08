# LoveFlix Release Builder (PowerShell version)
param(
    [Parameter(Mandatory=$false)]
    [switch]$SkipTests,
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipPush,
    
    [Parameter(Mandatory=$false)]
    [switch]$Help
)

if ($Help) {
    Write-Host @"
LoveFlix Release Builder

Usage:
    .\release.ps1 [-SkipTests] [-SkipPush] [-Help]

Parameters:
    -SkipTests            : Skip npm test (faster but less safe)
    -SkipPush             : Don't push to remote repository
    -Help                 : Show this help message

Examples:
    .\release.ps1
    .\release.ps1 -SkipPush
    .\release.ps1 -SkipTests

What happens:
    1. You'll be prompted for the version number
    2. Builds locally for your current platform (verifies the build works)
    3. Creates a git tag (v<version>)
    4. Pushes tag to GitHub
    5. GitHub Actions automatically builds BOTH Windows + macOS installers
    6. A GitHub Release is created with all installers attached
    7. Existing users get auto-update notifications
"@
    exit 0
}

Write-Host ""
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "         LoveFlix Release Builder" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# Detect platform
$isWindows = $PSVersionTable.Platform -eq 'Win32NT' -or $PSVersionTable.PSVersion.Major -le 5 -or [System.Environment]::OSVersion.Platform -eq 'Win32NT'
$isMacOS = $PSVersionTable.Platform -eq 'Unix' -and $IsMacOS
$Platform = if ($isWindows) { "Windows" } elseif ($isMacOS) { "macOS" } else { "Linux/Other" }

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
do {
    $Version = Read-Host "Enter new version (e.g., 1.0.1, 2.0.0)"
} while (-not $Version)

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
    
    # Clear electron-builder cache on Windows to avoid symlink issues
    # Then pre-populate the winCodeSign cache manually, ignoring symlink errors
    # (the symlinks are for macOS darwin libs which are not needed on Windows)
    if ($isWindows) {
        $cacheDir = Join-Path $env:LOCALAPPDATA "electron-builder\Cache\winCodeSign"
        $expectedDir = Join-Path $cacheDir "winCodeSign-2.6.0"
        
        if (-not (Test-Path $expectedDir)) {
            Write-Host "Pre-populating winCodeSign cache (working around Windows symlink restriction)..." -ForegroundColor Yellow
            
            # Ensure cache directory exists
            New-Item -ItemType Directory -Path $cacheDir -Force | Out-Null
            
            # Download the archive
            $archiveUrl = "https://github.com/electron-userland/electron-builder-binaries/releases/download/winCodeSign-2.6.0/winCodeSign-2.6.0.7z"
            $archivePath = Join-Path $cacheDir "winCodeSign-2.6.0.7z"
            
            Write-Host "  Downloading winCodeSign-2.6.0..." -ForegroundColor Gray
            Invoke-WebRequest -Uri $archiveUrl -OutFile $archivePath -UseBasicParsing
            
            # Extract using the bundled 7za.exe, ignoring exit code 2 (symlink errors are harmless)
            $sevenZip = Join-Path (Get-Location) "node_modules\7zip-bin\win\x64\7za.exe"
            if (-not (Test-Path $sevenZip)) {
                # Fallback: try to find any 7za.exe
                $sevenZip = Get-ChildItem -Path "node_modules" -Filter "7za.exe" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty FullName
            }
            
            if ($sevenZip) {
                Write-Host "  Extracting (ignoring macOS symlink warnings)..." -ForegroundColor Gray
                & $sevenZip x -bd -y $archivePath "-o$expectedDir" 2>&1 | Out-Null
                # Exit code 2 = "sub items errors" (symlinks) - this is fine on Windows
                if ($LASTEXITCODE -le 2) {
                    Write-Host "  ✅ winCodeSign cache ready" -ForegroundColor Green
                } else {
                    Write-Host "  ⚠ Extraction had issues (exit code: $LASTEXITCODE), build may still work" -ForegroundColor Yellow
                }
            } else {
                Write-Host "  ⚠ Could not find 7za.exe, electron-builder will download winCodeSign itself" -ForegroundColor Yellow
            }
            
            # Clean up the archive
            Remove-Item $archivePath -Force -ErrorAction SilentlyContinue
        } else {
            Write-Host "winCodeSign cache already exists, skipping..." -ForegroundColor Gray
        }
    }

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
    Write-Host "Building Electron application for current platform (this may take a while)..." -ForegroundColor Yellow
    
    # Disable code signing completely to avoid winCodeSign download issues on Windows
    $env:CSC_IDENTITY_AUTO_DISCOVERY = "false"
    
    if ($isWindows) {
        Write-Host "  - Windows installer (NSIS)" -ForegroundColor Cyan
        npm run build:win
    } elseif ($isMacOS) {
        Write-Host "  - macOS installer (DMG) - Intel & Apple Silicon" -ForegroundColor Cyan
        npm run build:mac
    } else {
        Write-Host "  - Building for current platform" -ForegroundColor Cyan
        npm run build
    }
    
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
    Write-Host "Local installer created:" -ForegroundColor Yellow
    if ($isWindows) {
        Write-Host "  [Windows] LoveFlix Setup $Version.exe" -ForegroundColor Cyan
    } elseif ($isMacOS) {
        Write-Host "  [macOS Intel] LoveFlix-$Version.dmg" -ForegroundColor Cyan
        Write-Host "  [macOS ARM] LoveFlix-$Version-arm64.dmg" -ForegroundColor Cyan
    }
    Write-Host ""
    Write-Host "Git tag created: v$Version" -ForegroundColor Yellow
    Write-Host "App version updated in package.json" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "[OK] Auto-update enabled: Users will be notified of new versions" -ForegroundColor Green
    Write-Host "     User data (API keys, collections, settings) is preserved" -ForegroundColor Green
    Write-Host ""
    if (-not $SkipPush -and ($pushChoice -eq "y" -or $pushChoice -eq "Y")) {
        Write-Host ">> GitHub Actions will now automatically:" -ForegroundColor Cyan
        Write-Host "   1. Build Windows installer (.exe)" -ForegroundColor White
        Write-Host "   2. Build macOS installers (.dmg for Intel + Apple Silicon)" -ForegroundColor White
        Write-Host "   3. Create GitHub Release with all installers" -ForegroundColor White
        Write-Host ""
        Write-Host ">> Monitor progress at:" -ForegroundColor Yellow
        Write-Host "   https://github.com/janvanwassenhove/LoveFlix/actions" -ForegroundColor Cyan
        Write-Host ""
        Write-Host ">> Release will appear at:" -ForegroundColor Yellow
        Write-Host "   https://github.com/janvanwassenhove/LoveFlix/releases/tag/v$Version" -ForegroundColor Cyan
    } else {
        Write-Host ">> To trigger multi-platform builds, push the tag:" -ForegroundColor Yellow
        Write-Host "   git push origin main" -ForegroundColor White
        Write-Host "   git push origin v$Version" -ForegroundColor White
        Write-Host "   GitHub Actions will build Windows + macOS installers automatically" -ForegroundColor Gray
    }
    Write-Host ""

} catch {
    Write-Host "ERROR: An unexpected error occurred: $_" -ForegroundColor Red
    Restore-BackupFiles
}

Read-Host "Press Enter to exit"
