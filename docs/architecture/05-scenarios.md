# Scenarios (Use Cases)

The Scenarios view describes the key use cases that tie together the other architectural views, demonstrating how the system fulfills its requirements.

## Overview

LoveFlix scenarios illustrate the end-to-end workflows that users perform to transform movies into romantic versions, manage their collections, and discover trending content.

## Primary Use Cases

### UC-01: Transform a Movie to Romantic Version

**Actor**: End User

**Preconditions**:
- Application is installed and running
- User has valid OpenAI API key configured

**Basic Flow**:
1. User launches LoveFlix application
2. User navigates to Home view (default)
3. User enters original movie title (e.g., "Terminator")
4. User selects target language (e.g., "English")
5. User selects text generation model (e.g., "gpt-5.2")
6. User selects image generation model (e.g., "dall-e-3")
7. User clicks "Transform" button
8. System validates input
9. System sends request to OpenAI for romantic title
10. System displays progress: "Generating romantic title..." (33%)
11. System receives romantic title (e.g., "Heart of Steel")
12. System sends request to OpenAI for romantic summary
13. System displays progress: "Generating romantic summary..." (66%)
14. System receives romantic summary
15. System sends request to OpenAI for movie poster image
16. System displays progress: "Generating movie poster..." (99%)
17. System receives poster image URL
18. System downloads poster image
19. System saves collection to `movies/Heart_of_Steel/` folder
20. System creates README.md with metadata and content
21. System saves poster.png
22. System displays success message with romantic title and summary
23. System displays generated poster image

**Postconditions**:
- New collection created in `movies/` folder
- User can view the romantic version
- Collection appears in Collections view

**Alternative Flows**:
- **3a. Invalid API Key**:
  - System displays error: "Invalid API key. Please check your settings."
  - User navigates to Settings to update API key
  - Return to step 3
- **9a. API Rate Limit Exceeded**:
  - System displays error: "Rate limit exceeded. Please try again later."
  - Transformation cancelled
- **15a. Image Generation Fails**:
  - System displays error with details
  - Collection saved without poster
  - User can retry transformation

**Related Views**:
- **Logical**: MovieProcessor, OpenAIClient, IPC handlers
- **Process**: Sequential API calls with progress updates
- **Development**: main.js, renderer.js, preload.js
- **Physical**: OpenAI API communication over HTTPS

---

### UC-02: Configure API Keys

**Actor**: End User

**Preconditions**:
- Application is installed and running

**Basic Flow**:
1. User clicks "Settings" in navigation menu
2. System displays Settings view
3. User enters OpenAI API key in text field
4. User clicks "Save OpenAI API Key" button
5. System validates API key format (starts with "sk-")
6. System stores API key using electron-store
7. System displays success message: "API key saved successfully!"
8. User enters TMDB API key in text field (optional)
9. User clicks "Save TMDB API Key" button
10. System stores TMDB API key
11. System displays success message

**Postconditions**:
- API keys stored in electron-store config
- Keys available for future API calls
- Top 10 feature enabled (if TMDB key provided)

**Alternative Flows**:
- **5a. Invalid API Key Format**:
  - System displays error: "Invalid API key format"
  - Key not saved
  - Return to step 3
- **6a. Storage Error**:
  - System displays error: "Failed to save API key"
  - User can retry

**Related Views**:
- **Logical**: electron-store, Settings management
- **Process**: IPC communication for settings
- **Development**: main.js IPC handlers
- **Physical**: Local storage in AppData

---

### UC-03: Browse and Delete Collections

**Actor**: End User

**Preconditions**:
- Application is running
- At least one movie collection exists

**Basic Flow**:
1. User clicks "Collections" in navigation menu
2. System reads `movies/` folder
3. System parses each collection's README.md
4. System displays grid of movie collections with:
   - Romantic title
   - Poster image
   - Brief summary preview
   - Delete button
5. User scrolls through collections
6. User clicks "Delete" button on a specific collection
7. System displays confirmation dialog
8. User confirms deletion
9. System deletes collection folder and contents
10. System refreshes collection list
11. System displays success message: "Collection deleted"

**Postconditions**:
- Selected collection removed from disk
- Collection no longer appears in list
- Disk space freed

**Alternative Flows**:
- **2a. No Collections Exist**:
  - System displays message: "No collections yet. Transform your first movie!"
  - System provides link to Home view
- **8a. User Cancels Deletion**:
  - Dialog closed
  - Collection preserved
  - Return to step 5
- **9a. Deletion Fails**:
  - System displays error: "Failed to delete collection"
  - Collection remains in list

**Related Views**:
- **Logical**: File system operations, Collection manager
- **Process**: IPC for collection list and deletion
- **Development**: main.js file operations, renderer.js UI
- **Physical**: Local file system in `movies/` folder

---

### UC-04: Discover Trending Movies (Top 10)

**Actor**: End User

**Preconditions**:
- Application is running
- TMDB API key is configured

**Basic Flow**:
1. User clicks "Top 10" in navigation menu
2. System displays Top 10 view with country selector
3. User selects country from dropdown (e.g., "United States")
4. System displays loading indicator
5. System sends parallel requests to TMDB API:
   - Fetch trending movies for region
   - Fetch trending TV shows for region
6. System receives both response lists
7. System combines and sorts by popularity
8. System takes top 10 items
9. System displays results in grid with:
   - Title
   - Poster image
   - Overview/description
   - Media type badge (Movie/TV)
   - Release date
   - Rating
10. User scrolls through trending content
11. User clicks on a movie title
12. Title is copied to clipboard
13. User navigates to Home view
14. User pastes title into transform input

**Postconditions**:
- User discovers popular movies and shows
- User can easily transform trending content

**Alternative Flows**:
- **4a. TMDB API Key Not Configured**:
  - System displays error: "Please configure TMDB API key in Settings"
  - System provides link to Settings
- **6a. API Request Fails**:
  - System displays error: "Failed to fetch trending content"
  - System suggests checking internet connection
- **8a. No Results for Region**:
  - System displays message: "No trending content for this region"
  - System suggests trying different country

**Related Views**:
- **Logical**: TMDB API integration, axios client
- **Process**: Parallel API calls with Promise.all
- **Development**: main.js TMDB handlers
- **Physical**: TMDB API communication over HTTPS

---

### UC-05: First-Time Application Setup

**Actor**: New User

**Preconditions**:
- User has downloaded and installed LoveFlix

**Basic Flow**:
1. User launches LoveFlix for first time
2. System checks for existing API key in environment variable
3. No API key found
4. System displays Home view
5. User attempts to transform a movie
6. System detects missing API key
7. System displays error: "API key required. Please configure in Settings."
8. User clicks "Settings" link
9. System displays Settings view
10. User follows UC-02 to configure API keys
11. User returns to Home view
12. User successfully transforms first movie (UC-01)

**Postconditions**:
- User has configured API keys
- User has created first collection
- User understands basic workflow

**Alternative Flows**:
- **2a. API Key in Environment Variable**:
  - System uses environment variable
  - User can transform immediately
  - Skip to step 12
- **10a. User Doesn't Have API Key**:
  - User exits to obtain API key from OpenAI
  - User returns later to complete setup

**Related Views**:
- All views involved
- Critical path through entire system

---

## Secondary Use Cases

### UC-06: View Collection Details

**Description**: User opens a saved collection to view full romantic summary and poster

**Flow**:
1. User navigates to Collections
2. User clicks on collection card
3. System displays full README content with:
   - Original title
   - Romantic title
   - Full romantic summary
   - Large poster image
   - Metadata (language, models used, date)

---

### UC-07: Export Collection

**Description**: User shares or backs up a collection

**Current Status**: Not implemented

**Future Flow**:
1. User selects collection
2. User clicks "Export" button
3. System creates ZIP file with README and poster
4. System prompts user to save ZIP file
5. User selects destination
6. System exports ZIP file

---

### UC-08: Batch Transform Multiple Movies

**Description**: User transforms multiple movies in sequence

**Current Status**: Manual repetition required

**Current Flow**:
1. User completes UC-01 for first movie
2. User waits for completion
3. User repeats UC-01 for next movie
4. Repeat until all movies transformed

**Future Enhancement**: Queue system for batch processing

---

### UC-09: Update Application

**Description**: User installs newer version of LoveFlix

**Current Status**: Manual process

**Flow**:
1. User downloads new installer
2. User runs installer
3. Installer updates application files
4. User launches updated application
5. Settings and collections preserved

---

### UC-10: Recover from Crash

**Description**: Application crashes during transformation

**Current Flow**:
1. Application crashes
2. User restarts application
3. Partial transformation lost
4. User retries transformation from beginning

**Future Enhancement**: Auto-save progress, resume capability

---

## Use Case Dependencies

```
UC-05 (First-Time Setup)
  │
  ├─> UC-02 (Configure API Keys)
  │     └─> Required for UC-01
  │
  └─> UC-01 (Transform Movie)
        └─> Creates data for UC-03

UC-04 (Top 10)
  │
  ├─> UC-02 (Configure TMDB Key)
  └─> UC-01 (Transform discovered movie)

UC-03 (Browse Collections)
  └─> UC-06 (View Details)
```

## Non-Functional Scenarios

### Performance Scenarios

**PS-01: Handle Large Collections**
- **Scenario**: User has 500+ saved collections
- **Expected**: Collections view loads within 2 seconds
- **Current**: May be slow due to sequential file reads
- **Improvement**: Pagination or lazy loading

**PS-02: Handle Slow Network**
- **Scenario**: User on slow internet connection
- **Expected**: Progress updates keep user informed
- **Current**: Implemented via progress events
- **Status**: ✅ Satisfactory

### Security Scenarios

**SS-01: Protect API Keys**
- **Scenario**: Malicious software tries to read API keys
- **Current**: Keys stored in AppData with file system permissions
- **Status**: Basic protection only
- **Improvement**: OS keychain integration

**SS-02: Prevent XSS Attacks**
- **Scenario**: User enters malicious content in movie title
- **Expected**: Content sanitized before display
- **Current**: Limited sanitization
- **Improvement**: Content Security Policy

### Reliability Scenarios

**RS-01: Handle API Failures Gracefully**
- **Scenario**: OpenAI API returns error
- **Expected**: Clear error message, ability to retry
- **Current**: Implemented
- **Status**: ✅ Satisfactory

**RS-02: Preserve Data on Crash**
- **Scenario**: Application crashes during transformation
- **Expected**: Partial progress saved
- **Current**: Progress lost
- **Improvement**: Transaction-like save

---

## Scenario Traceability Matrix

| Scenario | Logical View | Process View | Development View | Physical View |
|----------|--------------|--------------|------------------|---------------|
| UC-01 | MovieProcessor, OpenAIClient | Sequential API calls | main.js, renderer.js | OpenAI API, Local storage |
| UC-02 | Settings management | IPC sync | electron-store | AppData folder |
| UC-03 | File operations | Async file I/O | Node.js fs module | movies/ folder |
| UC-04 | TMDB integration | Parallel API calls | axios, Promise.all | TMDB API |
| UC-05 | All components | Complete workflow | All modules | Complete system |

---

**Last Updated**: 2026-02-08  
**Maintainer**: See `.github/architecture-copilot-instructions.md` for update guidelines
