# TMDB API Integration Summary

## What Changed

LoveFlix now fetches **live Top 10 data from The Movie Database (TMDB)** instead of using hardcoded lists. The Top 10 feature is now **region-specific** based on your selected country.

## New Features

### 1. TMDB API Integration
- Real-time popular movies and TV shows
- Data fetched from TMDB's API endpoints:
  - Popular Movies
  - Popular TV Shows
  - Action Movies (Genre ID: 28)
  - Sci-Fi Movies (Genre ID: 878)

### 2. Country Selection
- Default country: **Belgium (BE)**
- Supported countries include:
  - Belgium, United States, United Kingdom, Netherlands
  - France, Germany, Spain, Italy, Portugal
  - Japan, South Korea, China, Canada, Australia
  - India, Brazil, Mexico, and more

### 3. Dynamic Genre Mapping
- Automatically converts TMDB genre IDs to readable names
- Supports both movie and TV show genres
- Displays up to 2 genres per item

## Files Modified

1. **electron-app/index.html**
   - Added TMDB API Key input field
   - Added Country dropdown selector
   - Both in Settings modal

2. **electron-app/main.js**
   - Replaced hardcoded Top 10 data with TMDB API calls
   - Added `getGenreNames()` helper function
   - Updated `get-settings` to include `tmdbApiKey` and `country`
   - Updated `save-settings` to save new settings
   - Modified `get-netflix-top10` to fetch from TMDB
   - Updated `get-all-top10` to use new handler

3. **electron-app/renderer.js**
   - Updated settings UI to handle TMDB API key and country
   - Added error handling for missing TMDB API key
   - Enhanced `renderTop10Row()` to handle error states

4. **README.md**
   - Added TMDB API Key to requirements
   - Updated feature descriptions
   - Added instructions for obtaining API keys

5. **electron-app/README.md**
   - Added TMDB API Key prerequisites
   - Updated feature descriptions with country selection
   - Added step-by-step guide for getting TMDB API key

## Getting Your TMDB API Key

1. Visit: https://www.themoviedb.org/signup
2. Create a free account
3. Go to: https://www.themoviedb.org/settings/api
4. Request an API key (choose "Developer" option)
5. Accept the terms and provide basic information
6. Copy your API key
7. Add it in LoveFlix Settings

## How It Works

### Backend (main.js)

```javascript
// Fetches data from TMDB based on category and country
ipcMain.handle('get-netflix-top10', async (event, category = 'movies') => {
  const tmdbApiKey = store.get('tmdbApiKey', '');
  const country = store.get('country', 'BE');
  
  // Build appropriate TMDB endpoint based on category
  // - movies: /movie/popular
  // - series: /tv/popular
  // - action: /discover/movie?with_genres=28
  // - scifi: /discover/movie?with_genres=878
  
  // Fetch and format results with poster URLs, years, genres
  return formattedResults;
});
```

### Frontend (renderer.js)

- Settings load/save now includes `tmdbApiKey` and `country`
- Error handling displays user-friendly messages if API key is missing
- Shows "No movies available" if API returns empty results

## Error Handling

If TMDB API key is not configured:
- Error message: "TMDB API key not configured. Please add it in Settings."
- Displayed in toast notification
- Each category slider shows the error message

## TMDB API Endpoints Used

| Category | Endpoint | Parameters |
|----------|----------|------------|
| Movies | `/movie/popular` | `region`, `language` |
| Series | `/tv/popular` | `region`, `language` |
| Action | `/discover/movie` | `region`, `with_genres=28` |
| Sci-Fi | `/discover/movie` | `region`, `with_genres=878` |

All endpoints:
- Limited to 10 results (`.slice(0, 10)`)
- Use poster base URL: `https://image.tmdb.org/t/p/w500`
- Include error handling for network failures

## Testing

To test the changes:

1. Start the app: `npm start` (from electron-app directory)
2. Go to Settings (⚙️ icon)
3. Enter your TMDB API Key
4. Select your country (default: Belgium)
5. Save settings
6. Navigate to "Top 10" tab
7. Verify that real movies from TMDB are displayed
8. Try changing the country and reload the Top 10 view

## Benefits

✅ Real-time data instead of outdated hardcoded lists  
✅ Region-specific content based on user's country  
✅ Automatic updates as TMDB popularity changes  
✅ More accurate genre information  
✅ Better user experience with real poster images  
✅ Scalable - can easily add more categories/genres

## Future Enhancements (Potential)

- Add more genre categories (Horror, Comedy, Drama, etc.)
- Implement "Trending" vs "Popular" toggle
- Add date range filters (This Week, This Month, etc.)
- Cache TMDB results to reduce API calls
- Add language selection for TMDB content
- Show vote ratings and popularity scores
