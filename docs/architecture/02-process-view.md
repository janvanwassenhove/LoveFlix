# Process View

The Process View describes the runtime behavior, concurrency, synchronization, and communication patterns in the LoveFlix application.

## Overview

LoveFlix employs different process models:
- **Python CLI**: Single-threaded synchronous execution
- **Electron Desktop**: Multi-process architecture with asynchronous operations

## Electron Multi-Process Architecture

```
┌─────────────────────────────────────────────────────┐
│            Main Process (Node.js)                   │
│                                                     │
│  - Window Management                                │
│  - IPC Server                                       │
│  - API Calls (OpenAI, TMDB)                        │
│  - File I/O                                         │
│  - Settings Management                              │
│                                                     │
│  Thread: Single Event Loop                         │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ IPC (Inter-Process Communication)
                   │
┌──────────────────┴──────────────────────────────────┐
│         Renderer Process (Chromium)                 │
│                                                     │
│  - UI Rendering                                     │
│  - User Event Handling                              │
│  - IPC Client                                       │
│  - View Management                                  │
│                                                     │
│  Thread: Main UI Thread                            │
└─────────────────────────────────────────────────────┘
```

## Key Runtime Scenarios

### 1. Movie Transformation Process

```
User          Renderer        Preload         Main           OpenAI API
 │               │               │              │                 │
 │ Click         │               │              │                 │
 │ Transform     │               │              │                 │
 │──────────────>│               │              │                 │
 │               │               │              │                 │
 │               │ Validate      │              │                 │
 │               │ Input         │              │                 │
 │               │               │              │                 │
 │               │ IPC:          │              │                 │
 │               │ transformMovie│              │                 │
 │               │──────────────>│              │                 │
 │               │               │              │                 │
 │               │               │ IPC Handler  │                 │
 │               │               │──────────────>│                 │
 │               │               │              │                 │
 │               │               │              │ Check API Key   │
 │               │               │              │ (env or store)  │
 │               │               │              │                 │
 │               │               │              │ Generate Title  │
 │               │               │              │────────────────>│
 │               │               │              │                 │
 │               │<──────────────────────────────│ Title Response │
 │               │ Progress 33%  │              │<────────────────│
 │               │               │              │                 │
 │               │               │              │ Generate Summary│
 │               │               │              │────────────────>│
 │               │               │              │                 │
 │               │<──────────────────────────────│ Summary Response│
 │               │ Progress 66%  │              │<────────────────│
 │               │               │              │                 │
 │               │               │              │ Generate Poster │
 │               │               │              │────────────────>│
 │               │               │              │                 │
 │               │<──────────────────────────────│ Image URL      │
 │               │ Progress 100% │              │<────────────────│
 │               │               │              │                 │
 │               │               │              │ Save to Disk    │
 │               │               │              │ (movies/ folder)│
 │               │               │              │                 │
 │               │<──────────────────────────────│ Complete        │
 │               │ Result Data   │              │                 │
 │               │               │              │                 │
 │<──────────────│               │              │                 │
 │ Display       │               │              │                 │
 │ Result        │               │              │                 │
```

**Concurrency Characteristics**:
- Main process uses async/await for OpenAI API calls
- Sequential execution: Title → Summary → Poster (each waits for previous)
- Progress events sent asynchronously to renderer
- Renderer remains responsive during transformation

**Error Handling**:
- API failures caught in main.js
- Error sent via IPC to renderer
- User notified with error message

### 2. TMDB Top 10 Fetch Process

```
User          Renderer        Preload         Main           TMDB API
 │               │               │              │                 │
 │ Select        │               │              │                 │
 │ Country       │               │              │                 │
 │──────────────>│               │              │                 │
 │               │               │              │                 │
 │               │ Show Loading  │              │                 │
 │               │               │              │                 │
 │               │ IPC:          │              │                 │
 │               │ fetchTop10    │              │                 │
 │               │──────────────>│              │                 │
 │               │               │              │                 │
 │               │               │ IPC Handler  │                 │
 │               │               │──────────────>│                 │
 │               │               │              │                 │
 │               │               │              │ Check API Key   │
 │               │               │              │                 │
 │               │               │              │ Fetch Trending  │
 │               │               │              │ Movies          │
 │               │               │              │────────────────>│
 │               │               │              │                 │
 │               │               │              │ Movie Results   │
 │               │               │              │<────────────────│
 │               │               │              │                 │
 │               │               │              │ Fetch Trending  │
 │               │               │              │ TV Shows        │
 │               │               │              │────────────────>│
 │               │               │              │                 │
 │               │               │              │ TV Results      │
 │               │               │              │<────────────────│
 │               │               │              │                 │
 │               │               │              │ Combine & Sort  │
 │               │               │              │ by Popularity   │
 │               │               │              │                 │
 │               │<──────────────────────────────│ Top 10 List     │
 │               │ Results       │              │                 │
 │               │               │              │                 │
 │<──────────────│               │              │                 │
 │ Display       │               │              │                 │
 │ Top 10        │               │              │                 │
```

**Concurrency Characteristics**:
- Parallel API calls to TMDB (movies and TV shows)
- Uses `Promise.all()` for concurrent fetching
- Results combined after both complete
- Non-blocking UI during fetch

### 3. Settings Persistence Process

```
User          Renderer        Preload         Main         electron-store
 │               │               │              │                 │
 │ Update        │               │              │                 │
 │ API Key       │               │              │                 │
 │──────────────>│               │              │                 │
 │               │               │              │                 │
 │               │ IPC:          │              │                 │
 │               │ saveApiKey    │              │                 │
 │               │──────────────>│              │                 │
 │               │               │              │                 │
 │               │               │ IPC Handler  │                 │
 │               │               │──────────────>│                 │
 │               │               │              │                 │
 │               │               │              │ store.set()     │
 │               │               │              │────────────────>│
 │               │               │              │                 │
 │               │               │              │ Write to Disk   │
 │               │               │              │ (async)         │
 │               │               │              │<────────────────│
 │               │               │              │                 │
 │               │<──────────────────────────────│ Success         │
 │               │ Confirmation  │              │                 │
 │               │               │              │                 │
 │<──────────────│               │              │                 │
 │ Show Success  │               │              │                 │
 │ Message       │               │              │                 │
```

**Concurrency Characteristics**:
- electron-store handles file I/O asynchronously
- Main process remains non-blocking
- Settings available immediately after write

### 4. Collection Loading Process

```
User          Renderer        Preload         Main         File System
 │               │               │              │                 │
 │ Navigate to   │               │              │                 │
 │ Collections   │               │              │                 │
 │──────────────>│               │              │                 │
 │               │               │              │                 │
 │               │ IPC:          │              │                 │
 │               │ getCollections│              │                 │
 │               │──────────────>│              │                 │
 │               │               │              │                 │
 │               │               │ IPC Handler  │                 │
 │               │               │──────────────>│                 │
 │               │               │              │                 │
 │               │               │              │ Read movies/    │
 │               │               │              │ directory       │
 │               │               │              │────────────────>│
 │               │               │              │                 │
 │               │               │              │ Directory List  │
 │               │               │              │<────────────────│
 │               │               │              │                 │
 │               │               │              │ For each folder:│
 │               │               │              │ Read README.md  │
 │               │               │              │────────────────>│
 │               │               │              │                 │
 │               │               │              │ File Content    │
 │               │               │              │<────────────────│
 │               │               │              │                 │
 │               │               │              │ Parse metadata  │
 │               │               │              │                 │
 │               │<──────────────────────────────│ Collections     │
 │               │ Array         │              │ Array           │
 │               │               │              │                 │
 │<──────────────│               │              │                 │
 │ Display       │               │              │                 │
 │ Collections   │               │              │                 │
```

**Concurrency Characteristics**:
- File reads happen sequentially (one folder at a time)
- Could be optimized with parallel reads using `Promise.all()`
- Current implementation prioritizes simplicity over speed

## Thread Model

### Main Process (Node.js)
- **Single Event Loop**: Handles all IPC, API calls, and file I/O
- **Non-blocking I/O**: Uses async/await and promises
- **No Worker Threads**: All operations on main thread

### Renderer Process (Chromium)
- **Main UI Thread**: DOM manipulation and event handling
- **No Web Workers**: Simple UI doesn't require offloading

## Synchronization Mechanisms

### IPC Communication
- **Pattern**: Request-Response
- **Channel**: Named IPC channels (`transform-movie`, `save-api-key`, etc.)
- **Serialization**: JSON for data transfer
- **Security**: contextBridge API limits exposed functions

### State Management
- **Main Process State**:
  - Settings via electron-store (persistent)
  - Window state via Electron APIs
- **Renderer Process State**:
  - DOM state (current view, form values)
  - In-memory collection cache

## Performance Characteristics

### API Call Timing (Approximate)
- **OpenAI Title Generation**: 2-5 seconds
- **OpenAI Summary Generation**: 3-8 seconds
- **DALL-E Poster Generation**: 10-30 seconds
- **TMDB API Calls**: 0.5-2 seconds each

### Bottlenecks
1. **DALL-E Image Generation**: Longest operation in transformation
2. **Sequential API Calls**: Could parallelize title and summary
3. **File System Scans**: Loading all collections reads many files

### Optimization Opportunities
1. Parallel title and summary generation
2. Collection caching in main process
3. Incremental collection loading
4. Image generation progress feedback

## Error Handling and Recovery

### API Failures
- **OpenAI Rate Limits**: Retry with exponential backoff
- **Network Errors**: Display error message, allow retry
- **Invalid API Keys**: Prompt user to check settings

### IPC Failures
- **Timeout Handling**: Not currently implemented
- **Response Validation**: Check for expected data structure

### File System Errors
- **Missing Directories**: Create automatically
- **Permission Errors**: Display error to user
- **Corrupt Data**: Skip invalid collections

## Process Lifecycle

### Application Startup
1. Electron launches main.js
2. Main process creates BrowserWindow
3. Renderer process loads index.html
4. preload.js exposes secure API
5. renderer.js initializes UI
6. Load saved settings from electron-store

### Application Shutdown
1. User closes window or quits
2. Main process receives 'closed' event
3. Cleanup resources
4. Exit process

### Crash Recovery
- **Main Process Crash**: Application closes (no recovery)
- **Renderer Crash**: Could reload window (not implemented)
- **Settings Loss**: Re-prompt for API keys

---

**Last Updated**: 2026-02-08  
**Maintainer**: See `.github/architecture-copilot-instructions.md` for update guidelines
