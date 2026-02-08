# Development View

The Development View describes the software module organization, library dependencies, build systems, and development workflow.

## Overview

LoveFlix consists of two separate applications with different technology stacks:
1. **Python CLI Application** - Python 3.x with minimal dependencies
2. **Electron Desktop Application** - Node.js and Electron framework

## Project Structure

```
LoveFlix/
├── .github/
│   ├── copilot-instructions.md           # Main Copilot guidelines
│   └── architecture-copilot-instructions.md  # Architecture doc maintenance
│
├── docs/
│   └── architecture/                     # 4+1 Architecture documentation
│       ├── README.md                     # Architecture overview
│       ├── 01-logical-view.md
│       ├── 02-process-view.md
│       ├── 03-development-view.md
│       ├── 04-physical-view.md
│       └── 05-scenarios.md
│
├── electron-app/                         # Desktop application
│   ├── main.js                          # Main process entry point
│   ├── preload.js                       # Security bridge script
│   ├── index.html                       # UI structure
│   ├── renderer.js                      # Renderer process logic
│   ├── styles.css                       # Netflix-style theme
│   ├── package.json                     # Dependencies and build config
│   ├── package-lock.json                # Locked dependency versions
│   ├── README.md                        # Desktop app documentation
│   └── assets/                          # Icons and images
│       ├── icon.ico                     # Windows icon
│       ├── icon.icns                    # macOS icon
│       └── README.md                    # Asset guidelines
│
├── src/                                  # Python CLI application
│   ├── main.py                          # CLI entry point
│   ├── movie_processor.py               # Business logic
│   ├── openai_client.py                 # OpenAI API wrapper
│   ├── utils.py                         # Helper functions
│   └── __pycache__/                     # Python bytecode cache
│
├── movies/                               # Saved movie collections
│   └── [Movie_Name]/                    # One folder per movie
│       ├── README.md                    # Movie metadata and content
│       └── poster.png                   # Generated poster image
│
├── README.md                            # Project documentation
├── requirements.txt                     # Python dependencies
├── start-loveflix.bat                   # Windows launcher
├── start-loveflix.sh                    # macOS/Linux launcher
└── TMDB_INTEGRATION.md                  # TMDB API integration docs
```

## Module Organization

### Python CLI Application

```
src/
├── main.py                 # Entry point, CLI argument parsing
├── movie_processor.py      # Core business logic module
├── openai_client.py        # External API integration
└── utils.py                # Shared utilities
```

**Module Dependencies**:
```
main.py
  └── movie_processor.py
       ├── openai_client.py
       └── utils.py
```

### Electron Desktop Application

```
electron-app/
├── main.js          # Main process - Node.js environment
├── preload.js       # Security bridge - Limited Node.js
├── renderer.js      # Renderer process - Browser environment
├── index.html       # View templates
└── styles.css       # Presentation styles
```

**Module Dependencies**:
```
main.js (Main Process)
  ├── electron
  ├── openai
  ├── axios
  └── electron-store

preload.js (Preload Script)
  └── electron (contextBridge, ipcRenderer)

renderer.js (Renderer Process)
  └── window.electronAPI (from preload)
```

## Dependency Management

### Python CLI Dependencies

**requirements.txt**:
```
openai         # OpenAI API client
requests       # HTTP library
Pillow         # Image processing
click          # CLI framework (optional)
```

**Installation**:
```bash
pip install -r requirements.txt
```

**Version Strategy**: Unpinned versions for flexibility

### Electron Desktop Dependencies

**package.json**:
```json
{
  "dependencies": {
    "openai": "^4.20.1",        # OpenAI SDK
    "axios": "^1.6.2",          # TMDB API client
    "electron-store": "^8.1.0"  # Settings persistence
  },
  "devDependencies": {
    "electron": "^28.0.0",      # Framework
    "electron-builder": "^24.9.1"  # Build tool
  }
}
```

**Installation**:
```bash
cd electron-app
npm install
```

**Version Strategy**: Caret (^) for minor updates

### Dependency Tree

**Electron App Key Dependencies**:
```
loveflix@1.0.0
├── openai@4.20.1
│   ├── node-fetch@^2.6.7
│   ├── form-data@^4.0.0
│   └── agentkeepalive@^4.2.1
├── axios@1.6.2
│   ├── follow-redirects@^1.15.0
│   └── form-data@^4.0.0
├── electron-store@8.1.0
│   └── conf@^10.2.0
└── electron@28.0.0 (dev)
    └── [Large Chromium + Node.js bundle]
```

## Build System

### Python CLI Build

**No Build Required**: Python scripts run directly

**Distribution**:
- Source distribution via Git repository
- Users install dependencies and run directly

### Electron Desktop Build

**Build Tool**: electron-builder

**Build Commands**:
```bash
npm run start       # Development mode
npm run build       # Build for current platform
npm run build:win   # Windows installer (.exe)
npm run build:mac   # macOS installer (.dmg)
npm run build:all   # All platforms
```

**Build Configuration** (package.json):
```json
{
  "build": {
    "appId": "com.loveflix.app",
    "productName": "LoveFlix",
    "directories": {
      "output": "dist"
    },
    "win": {
      "target": "nsis",
      "icon": "assets/icon.ico"
    },
    "mac": {
      "target": "dmg",
      "icon": "assets/icon.icns"
    }
  }
}
```

**Build Output**:
- **Windows**: `dist/LoveFlix Setup 1.0.0.exe` (NSIS installer)
- **macOS**: `dist/LoveFlix-1.0.0.dmg` (disk image)
- **Unpacked**: `dist/win-unpacked/` or `dist/mac/`

## Development Workflow

### Python CLI Development

1. **Setup Environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   pip install -r requirements.txt
   ```

2. **Set API Key**:
   ```bash
   export OPENAI_API_KEY="sk-..."
   ```

3. **Run Application**:
   ```bash
   python src/main.py
   ```

4. **Testing**: Manual testing (no automated tests)

### Electron Desktop Development

1. **Setup Environment**:
   ```bash
   cd electron-app
   npm install
   ```

2. **Set API Key** (optional):
   ```bash
   export OPENAI_API_KEY="sk-..."
   ```

3. **Run in Dev Mode**:
   ```bash
   npm start
   ```

4. **Development Tools**:
   - **DevTools**: F12 in renderer process
   - **Console Logs**: Main process logs in terminal
   - **Hot Reload**: Manual restart required

5. **Testing**: Manual testing (no automated tests)

6. **Building**:
   ```bash
   npm run build:win  # or build:mac
   ```

## Code Organization Principles

### Python CLI

- **Single Responsibility**: Each module has one clear purpose
- **Separation of Concerns**: API, business logic, and utilities separated
- **Simple Dependencies**: Minimal external dependencies

### Electron Desktop

- **Process Separation**: Main and renderer process code clearly separated
- **Security First**: No Node.js access from renderer (via contextBridge)
- **Modularity**: CSS, HTML, and JS in separate files

## Configuration Management

### Python CLI

- **API Keys**: Environment variables only
- **No Settings File**: All configuration via env vars or CLI args

### Electron Desktop

- **API Keys**: Environment variables (priority) or electron-store
- **Settings Storage**: `electron-store` package
  - Location: `%APPDATA%\loveflix\config.json` (Windows)
  - Location: `~/Library/Application Support/loveflix/config.json` (macOS)
- **Settings Schema**:
  ```json
  {
    "openaiApiKey": "sk-...",
    "tmdbApiKey": "...",
    "defaultTextModel": "gpt-5.2",
    "defaultImageModel": "dall-e-3",
    "defaultLanguage": "English"
  }
  ```

## Source Control

**Version Control**: Git

**Repository Structure**:
- Main branch: `main`
- No feature branches (small project)

**Ignored Files** (.gitignore):
```
node_modules/
dist/
__pycache__/
*.pyc
.env
config.json
movies/*/poster.png
```

## Build Artifacts

### Python CLI
- No build artifacts (interpreted language)
- Runtime bytecode in `__pycache__/`

### Electron Desktop
- **Development**: No artifacts
- **Production**:
  - `dist/` folder with installers
  - `dist/win-unpacked/` or `dist/mac/` with app bundle

## Testing Strategy

**Current Status**: No automated tests

**Manual Testing Checklist**:
- [ ] Movie transformation with valid API key
- [ ] Settings save and load
- [ ] Collection save and delete
- [ ] Top 10 fetch by country
- [ ] Error handling for invalid API keys
- [ ] UI navigation and responsiveness

**Future Testing Opportunities**:
- Unit tests for movie_processor.py
- Integration tests for OpenAI API calls
- E2E tests for Electron UI flows

## Documentation Standards

**Required Documentation**:
1. **README.md**: Project overview and quick start
2. **electron-app/README.md**: Desktop app details
3. **TMDB_INTEGRATION.md**: TMDB feature documentation
4. **docs/architecture/**: 4+1 architectural views
5. **.github/copilot-instructions.md**: AI assistant guidelines
6. **.github/architecture-copilot-instructions.md**: Architecture doc maintenance

**Documentation Updates**:
- Update when adding new features
- Update when changing APIs or dependencies
- Update when modifying build process
- See architecture-copilot-instructions.md for automation

## Development Tools

**Required**:
- **Python**: 3.8+ for CLI application
- **Node.js**: 18+ for Electron application
- **npm**: Comes with Node.js

**Recommended**:
- **VS Code**: IDE with GitHub Copilot
- **Git**: Version control
- **Postman**: API testing (optional)

## Release Process

**Current Status**: No formal release process

**Manual Release Steps**:
1. Update version in `package.json`
2. Run `npm run build:all`
3. Test installers on Windows and macOS
4. Upload to GitHub Releases
5. Update documentation

**Future Improvements**:
- Automated builds with GitHub Actions
- Version tagging in Git
- Changelog generation

---

**Last Updated**: 2026-02-08  
**Maintainer**: See `.github/architecture-copilot-instructions.md` for update guidelines
