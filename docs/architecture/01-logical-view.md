# Logical View

The Logical View describes the key abstractions, classes, and their relationships in the LoveFlix application.

## Overview

LoveFlix consists of two implementations:
1. **Python CLI Application** - Original command-line interface
2. **Electron Desktop Application** - Modern GUI with enhanced features

## Component Architecture

### Python CLI Application

```
┌─────────────────────────────────────────────┐
│             main.py                         │
│         (Entry Point)                       │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│         movie_processor.py                  │
│      (Business Logic Layer)                 │
│  - MovieProcessor                           │
│    • process_movie()                        │
│    • save_collection()                      │
└──────────┬──────────────────┬───────────────┘
           │                  │
           ▼                  ▼
┌──────────────────┐  ┌──────────────────┐
│ openai_client.py │  │    utils.py      │
│  (API Layer)     │  │ (Helper Layer)   │
│ - OpenAIClient   │  │ - Input helpers  │
│   • generate_*() │  │ - File helpers   │
└──────────────────┘  └──────────────────┘
```

#### Key Classes

**MovieProcessor**
- **Responsibility**: Orchestrate the movie transformation workflow
- **Key Methods**:
  - `process_movie(original_title, language)` - Main transformation pipeline
  - `save_collection(movie_data, original_title)` - Persist transformed movie data
- **Dependencies**: OpenAIClient, utils

**OpenAIClient**
- **Responsibility**: Interface with OpenAI API for content generation
- **Key Methods**:
  - `generate_romantic_title(title, language)` - Generate romantic title
  - `generate_romantic_summary(title, language)` - Generate romantic summary
  - `generate_movie_poster(title, summary)` - Generate movie poster image
- **Dependencies**: OpenAI SDK

### Electron Desktop Application

```
┌───────────────────────────────────────────────────────────┐
│                    index.html                             │
│                 (View Layer)                              │
│  - Home View                                              │
│  - Settings View                                          │
│  - Collections View                                       │
│  - Top 10 View                                            │
└────────────────────────┬──────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                   renderer.js                           │
│              (Presentation Logic)                       │
│  - View Router                                          │
│  - Event Handlers                                       │
│  - UI State Management                                  │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ IPC Communication
                 ▼
┌─────────────────────────────────────────────────────────┐
│                  preload.js                             │
│              (Security Bridge)                          │
│  - contextBridge API                                    │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│                    main.js                              │
│               (Main Process)                            │
│  - Window Management                                    │
│  - IPC Handlers                                         │
│  - OpenAI API Integration                               │
│  - TMDB API Integration                                 │
│  - File System Operations                               │
│  - Settings Management (electron-store)                 │
└─────────────────────────────────────────────────────────┘
```

#### Key Components

**main.js (Main Process)**
- **Responsibilities**:
  - Window lifecycle management
  - API key management (OpenAI, TMDB)
  - Backend API calls to OpenAI and TMDB
  - File system operations for collections
  - Settings persistence
- **Key IPC Handlers**:
  - `transform-movie` - Transform movie to romantic version
  - `save-api-key` - Store OpenAI API key
  - `save-tmdb-key` - Store TMDB API key
  - `get-collections` - Retrieve saved movie collections
  - `delete-collection` - Remove a movie collection
  - `fetch-top10` - Fetch trending movies/shows by country

**preload.js (Security Bridge)**
- **Responsibility**: Expose secure IPC communication to renderer
- **Exposed API**:
  - `transformMovie(data)` - Request movie transformation
  - `saveApiKey(key)` - Save OpenAI API key
  - `saveTmdbKey(key)` - Save TMDB API key
  - `getCollections()` - Get all collections
  - `deleteCollection(name)` - Delete a collection
  - `fetchTop10(country)` - Fetch top 10 by country
  - `onTransformProgress(callback)` - Progress updates

**renderer.js (Renderer Process)**
- **Responsibilities**:
  - View routing and navigation
  - Form handling and validation
  - UI updates and animations
  - Collection display and management
  - Top 10 content browsing
- **Key Components**:
  - View Router - SPA-style navigation
  - Form Handlers - User input processing
  - Collection Manager - Display and delete operations
  - Top 10 Browser - Country-specific trending content

## Data Models

### Movie Transformation Data

```javascript
{
  originalTitle: String,
  romanticTitle: String,
  romanticSummary: String,
  posterUrl: String,
  language: String,
  textModel: String,      // e.g., "gpt-5.2"
  imageModel: String,     // e.g., "dall-e-3"
  timestamp: Date
}
```

### TMDB Content Item

```javascript
{
  id: Number,
  title: String,          // For movies
  name: String,           // For TV shows
  original_title: String,
  overview: String,
  poster_path: String,
  backdrop_path: String,
  media_type: String,     // "movie" or "tv"
  release_date: String,
  vote_average: Number
}
```

### Settings Data

```javascript
{
  openaiApiKey: String,   // Optional (env var priority)
  tmdbApiKey: String,
  defaultTextModel: String,
  defaultImageModel: String,
  defaultLanguage: String
}
```

## Design Patterns

### 1. Model-View-Controller (MVC) Pattern
- **Model**: Data structures in main.js, file system
- **View**: HTML templates in index.html
- **Controller**: renderer.js event handlers and view logic

### 2. Bridge Pattern (Electron)
- preload.js acts as a secure bridge between renderer and main processes
- Prevents direct Node.js access from renderer for security

### 3. Strategy Pattern
- Configurable AI models (text and image generation)
- Different language support for transformations

### 4. Repository Pattern
- File system as repository for collections
- electron-store for settings persistence

## Class Relationships

### Python CLI
```
main.py
  └── uses MovieProcessor
       ├── uses OpenAIClient
       └── uses utils functions
```

### Electron App
```
index.html (View)
  └── renderer.js (Controller)
       └── IPC ──> preload.js (Bridge)
                    └── IPC ──> main.js (Model/Controller)
                                 ├── OpenAI SDK
                                 ├── TMDB API
                                 ├── electron-store
                                 └── File System
```

## Key Interactions

1. **Movie Transformation Flow**:
   - User inputs title → renderer.js
   - renderer.js → IPC → main.js
   - main.js → OpenAI API (title, summary, poster)
   - main.js → File System (save)
   - main.js → IPC → renderer.js (update UI)

2. **Settings Management**:
   - User updates settings → renderer.js
   - renderer.js → IPC → main.js
   - main.js → electron-store (persist)
   - main.js → IPC → renderer.js (confirmation)

3. **Top 10 Browsing**:
   - User selects country → renderer.js
   - renderer.js → IPC → main.js
   - main.js → TMDB API (fetch trending)
   - main.js → IPC → renderer.js (display results)

## Extension Points

- **New AI Models**: Add to model selection dropdowns and handle in main.js
- **New Languages**: Add to language select, passed through to OpenAI
- **New Views**: Add HTML section, navigation link, and routing in renderer.js
- **New APIs**: Add IPC handlers in main.js and expose in preload.js

---

**Last Updated**: 2026-02-08  
**Maintainer**: See `.github/architecture-copilot-instructions.md` for update guidelines
