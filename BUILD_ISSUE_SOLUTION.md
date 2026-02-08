# Windows Build Issue - Symlink Permission Error

## Problem
electron-builder fails on Windows with error:
```
ERROR: Cannot create symbolic link : Een van de vereiste bevoegdheden is niet aan de client toegekend.
```

This happens because electron-builder downloads `winCodeSign` tools that contain symbolic links for macOS libraries, and Windows requires administrator privileges to create symlinks.

## Solution

### Option 1: Run VS Code as Administrator (RECOMMENDED)

1. **Close VS Code completely**
2. **Right-click** on VS Code icon
3. Select **"Run as administrator"**
4. Open your workspace
5. Run the release script: `.\release.ps1 -Version "1.0.0"`

This allows the symlink creation and the build will complete successfully.

### Option 2: Enable Developer Mode (Windows 10/11)

This allows non-admin users to create symlinks:

1. Open **Settings** → **Update & Security** → **For developers**
2. Turn on **Developer Mode**
3. Restart your computer
4. Run the release script: `.\release.ps1 -Version "1.0.0"`

### Option 3: Use Portable Target (No Auto-Update)

If you don't want to run as admin, you can build a portable version without auto-update:

1. Edit `electron-app/package.json`
2. Change the `win.target` from `"nsis"` to `"portable"`:
   ```json
   "win": {
     "target": "portable",
     ...
   }
   ```
3. Run: `npm run build:win`

**Note**: Portable builds don't support auto-update functionality.

## Why This Happens

electron-builder always downloads signing tools on Windows, even when signing is disabled. The tools include macOS binaries with symlinks. Windows security policy requires elevated privileges to create symlinks, causing the build to fail.

## Recommended Solution

**Run VS Code as Administrator** for the release build. This is a one-time action when creating releases and doesn't affect normal development work.

After the first successful build, the cache will be populated and subsequent builds may work without admin rights (though this isn't guaranteed).
