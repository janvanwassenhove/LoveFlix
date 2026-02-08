# Physical View

The Physical View describes the deployment architecture, hardware topology, network configuration, and system infrastructure.

## Overview

LoveFlix can be deployed in multiple configurations:
1. **Python CLI**: Local execution on developer machine
2. **Electron Desktop**: Standalone desktop application on end-user systems
3. **Hybrid**: Desktop app with cloud API dependencies

## Deployment Architectures

### 1. Python CLI Deployment

```
┌─────────────────────────────────────────────┐
│         Developer Machine                   │
│                                             │
│  ┌──────────────────────────────────┐      │
│  │  Python Runtime (3.8+)           │      │
│  │                                  │      │
│  │  ┌────────────────────────┐     │      │
│  │  │  LoveFlix CLI          │     │      │
│  │  │  (src/*.py)            │     │      │
│  │  └───────────┬────────────┘     │      │
│  │              │                   │      │
│  └──────────────┼───────────────────┘      │
│                 │                           │
│  ┌──────────────▼───────────────┐          │
│  │  Local File System           │          │
│  │  - movies/ (collections)     │          │
│  │  - .env (API keys)           │          │
│  └──────────────────────────────┘          │
│                                             │
└──────────────────┬──────────────────────────┘
                   │
                   │ HTTPS
                   ▼
        ┌─────────────────────┐
        │   OpenAI API        │
        │   (api.openai.com)  │
        └─────────────────────┘
```

**System Requirements**:
- **OS**: Windows 10+, macOS 10.14+, Linux (Ubuntu 20.04+)
- **Python**: 3.8 or higher
- **RAM**: 512 MB minimum
- **Storage**: 50 MB + space for collections
- **Network**: Internet connection for API calls

### 2. Electron Desktop Deployment

```
┌─────────────────────────────────────────────────────────┐
│              End-User Machine                           │
│                                                         │
│  ┌───────────────────────────────────────────────┐     │
│  │  LoveFlix Desktop Application                 │     │
│  │                                               │     │
│  │  ┌─────────────────────────────────────┐     │     │
│  │  │  Main Process (Node.js)             │     │     │
│  │  │  - API Integration                  │     │     │
│  │  │  - File I/O                         │     │     │
│  │  │  - Settings Management              │     │     │
│  │  └─────────────┬───────────────────────┘     │     │
│  │                │ IPC                          │     │
│  │  ┌─────────────▼───────────────────────┐     │     │
│  │  │  Renderer Process (Chromium)        │     │     │
│  │  │  - UI Rendering                     │     │     │
│  │  │  - User Interaction                 │     │     │
│  │  └─────────────────────────────────────┘     │     │
│  │                                               │     │
│  └───────────────────────────────────────────────┘     │
│                                                         │
│  ┌──────────────────────────────────────────────┐      │
│  │  Local Storage                               │      │
│  │                                              │      │
│  │  - AppData/loveflix/config.json (Settings)  │      │
│  │  - movies/ (Collections)                    │      │
│  │    └── [Movie_Name]/                        │      │
│  │        ├── README.md                        │      │
│  │        └── poster.png                       │      │
│  └──────────────────────────────────────────────┘      │
│                                                         │
└────────────────────┬────────────┬──────────────────────┘
                     │            │
                     │ HTTPS      │ HTTPS
                     ▼            ▼
          ┌─────────────────┐  ┌─────────────────┐
          │   OpenAI API    │  │   TMDB API      │
          │ (api.openai.com)│  │(api.themoviedb. │
          └─────────────────┘  │     org)        │
                                └─────────────────┘
```

**System Requirements**:
- **OS**: Windows 10+ (64-bit), macOS 10.14+, Linux (Ubuntu 20.04+)
- **RAM**: 2 GB minimum, 4 GB recommended
- **Storage**: 150 MB + space for collections
- **Display**: 1280x720 minimum resolution
- **Network**: Internet connection for API calls

### 3. Cloud Dependency Architecture

```
┌─────────────────────────────────────────────────┐
│            Client Side                          │
│                                                 │
│  ┌──────────────────────────────────────┐      │
│  │  LoveFlix Application                │      │
│  │  (CLI or Desktop)                    │      │
│  └────────────┬─────────────────────────┘      │
│               │                                 │
└───────────────┼─────────────────────────────────┘
                │
                │ Internet (HTTPS)
                │
┌───────────────┼─────────────────────────────────┐
│               │      Cloud Services             │
│               │                                 │
│  ┌────────────▼──────────────┐                 │
│  │  OpenAI Platform          │                 │
│  │  (api.openai.com)         │                 │
│  │                           │                 │
│  │  ┌─────────────────────┐ │                 │
│  │  │ GPT-5.x Models      │ │                 │
│  │  │ - Text Generation   │ │                 │
│  │  └─────────────────────┘ │                 │
│  │                           │                 │
│  │  ┌─────────────────────┐ │                 │
│  │  │ DALL-E Models       │ │                 │
│  │  │ - Image Generation  │ │                 │
│  │  └─────────────────────┘ │                 │
│  └───────────────────────────┘                 │
│                                                 │
│  ┌───────────────────────────┐                 │
│  │  TMDB Platform            │                 │
│  │  (api.themoviedb.org)     │                 │
│  │                           │                 │
│  │  ┌─────────────────────┐ │                 │
│  │  │ Movie Database      │ │                 │
│  │  │ - Trending Data     │ │                 │
│  │  │ - Movie Metadata    │ │                 │
│  │  └─────────────────────┘ │                 │
│  └───────────────────────────┘                 │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Installation and Distribution

### Python CLI Installation

**Manual Installation**:
1. Clone repository: `git clone https://github.com/janvanwassenhove/LoveFlix.git`
2. Install dependencies: `pip install -r requirements.txt`
3. Set API key: `export OPENAI_API_KEY="sk-..."`
4. Run: `python src/main.py`

**Distribution Method**: Source distribution via GitHub

### Electron Desktop Installation

**Windows**:
1. Download `LoveFlix Setup 1.0.0.exe`
2. Run installer (NSIS)
3. Choose installation directory
4. Launch from Start Menu or Desktop shortcut

**Installed Locations**:
- **Program Files**: `C:\Program Files\LoveFlix\`
- **User Data**: `%APPDATA%\loveflix\`
- **Desktop Shortcut**: Optional during install

**macOS**:
1. Download `LoveFlix-1.0.0.dmg`
2. Open DMG file
3. Drag LoveFlix to Applications folder
4. Launch from Applications

**Installed Locations**:
- **Application**: `/Applications/LoveFlix.app`
- **User Data**: `~/Library/Application Support/loveflix/`

**Auto-Update**: Not implemented (manual updates required)

## Network Architecture

### API Communication

```
Client App ──HTTPS──> api.openai.com
           Port 443
           
           ┌─────────────────────────────┐
           │ Request                     │
           │ - Authorization: Bearer     │
           │ - Content-Type: JSON        │
           │ - Model: gpt-5.2            │
           └─────────────────────────────┘
           
           ┌─────────────────────────────┐
           │ Response                    │
           │ - Content-Type: JSON        │
           │ - Data: Generated text/URL  │
           └─────────────────────────────┘

Client App ──HTTPS──> api.themoviedb.org
           Port 443
           
           ┌─────────────────────────────┐
           │ Request                     │
           │ - Authorization: Bearer     │
           │ - Query: region=US          │
           └─────────────────────────────┘
           
           ┌─────────────────────────────┐
           │ Response                    │
           │ - Content-Type: JSON        │
           │ - Data: Movie/TV list       │
           └─────────────────────────────┘
```

**Protocols**:
- **HTTPS**: All external API communication
- **TLS 1.2+**: Encryption standard

**Firewall Requirements**:
- **Outbound HTTPS (443)**: Required for OpenAI and TMDB APIs
- **No Inbound Ports**: Application doesn't listen on any ports

### Network Dependencies

**External Services**:
1. **api.openai.com** (Critical)
   - Purpose: Text and image generation
   - Fallback: None (core feature)
   - Timeout: 60 seconds

2. **api.themoviedb.org** (Optional)
   - Purpose: Trending movies/shows data
   - Fallback: Feature unavailable
   - Timeout: 10 seconds

**Offline Capabilities**:
- View saved collections (no network required)
- Browse saved posters (no network required)
- Cannot transform new movies (requires OpenAI API)
- Cannot fetch Top 10 (requires TMDB API)

## Storage Architecture

### Local File System Layout

```
User Home Directory
│
├── [Installation Directory]
│   └── LoveFlix/                    # Application binaries
│       ├── LoveFlix.exe             # Main executable (Windows)
│       ├── resources/               # Electron resources
│       └── locales/                 # Language files
│
├── AppData/Roaming/loveflix/        # Windows user data
│   └── config.json                  # Encrypted settings
│
├── Library/Application Support/loveflix/  # macOS user data
│   └── config.json
│
└── [Workspace]/movies/              # Collection storage
    ├── Movie_Title_1/
    │   ├── README.md                # 5-10 KB
    │   └── poster.png               # 500 KB - 2 MB
    └── Movie_Title_2/
        ├── README.md
        └── poster.png
```

**Storage Requirements per Collection**:
- README.md: 5-10 KB (text metadata)
- poster.png: 500 KB - 2 MB (1024x1024 image)
- **Total per movie**: ~1-2 MB

**Storage Growth**:
- 100 movies: ~100-200 MB
- 1000 movies: ~1-2 GB

### Database Architecture

**No Traditional Database**: File-based storage only

**Configuration Storage**:
- **electron-store**: JSON-based key-value store
- **Location**: Platform-specific AppData directory
- **Format**: Plain JSON (settings), encrypted API keys (best effort)

## Security Architecture

### API Key Management

**Storage**:
- **Environment Variables**: Plaintext in system environment
- **electron-store**: Obfuscated (not encrypted) in config.json

**Best Practices**:
- Users should use environment variables for production
- App doesn't log or display full API keys
- Keys never transmitted except to official APIs

### Process Isolation (Electron)

```
┌────────────────────────────────────┐
│  Main Process                      │
│  - Full Node.js access             │
│  - File system access              │
│  - Network access                  │
│  - No direct user input            │
└─────────────┬──────────────────────┘
              │
              │ IPC (controlled)
              │
┌─────────────▼──────────────────────┐
│  Preload Script                    │
│  - Limited Node.js (contextBridge) │
│  - No file system access           │
│  - Only exposed APIs               │
└─────────────┬──────────────────────┘
              │
              │ contextBridge
              │
┌─────────────▼──────────────────────┐
│  Renderer Process                  │
│  - Browser environment only        │
│  - No Node.js access               │
│  - User input handling             │
│  - Can only call exposed APIs      │
└────────────────────────────────────┘
```

**Security Measures**:
- **Context Isolation**: Enabled in Electron
- **Node Integration**: Disabled in renderer
- **Remote Module**: Disabled
- **Content Security Policy**: Should be implemented (future)

### Network Security

**TLS/SSL**:
- All API calls over HTTPS
- Certificate validation by Node.js/Python

**No Telemetry**:
- Application doesn't send usage data
- No analytics or tracking

## Scalability Considerations

### Current Limitations

1. **Single User**: Not designed for multi-user environments
2. **Local Storage**: All data stored locally (not cloud-backed)
3. **API Rate Limits**: Subject to OpenAI rate limits
   - Free tier: ~3 requests/min
   - Paid tier: ~3,500 requests/min

### Performance Characteristics

**Disk I/O**:
- Collection loading: Sequential reads (~10-50 ms per folder)
- Image saving: Single write per transformation (~100-500 ms)

**Memory Usage**:
- Python CLI: ~50-100 MB
- Electron Desktop: ~150-300 MB (Chromium overhead)

**Network Bandwidth**:
- OpenAI API: ~5-50 KB per request (text), ~1-2 MB per image
- TMDB API: ~10-50 KB per request

## Monitoring and Logging

**Current Implementation**:
- **Console Logging**: stdout/stderr in development
- **No Persistent Logs**: No log files written
- **Error Reporting**: Displayed to user in UI

**Future Improvements**:
- Application logs to file
- Error reporting to developer
- Usage analytics (opt-in)

## Disaster Recovery

**Data Backup**:
- Collections stored in `movies/` folder
- Users should backup this folder manually
- Settings can be re-entered if lost

**Recovery Procedures**:
1. Reinstall application
2. Restore `movies/` folder from backup
3. Re-enter API keys in settings

---

**Last Updated**: 2026-02-08  
**Maintainer**: See `.github/architecture-copilot-instructions.md` for update guidelines
