const { app, BrowserWindow, ipcMain, shell, Menu } = require('electron');
const path = require('path');
const Store = require('electron-store');
const OpenAI = require('openai');
const axios = require('axios');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');

const store = new Store();

let mainWindow;

// Common brand/franchise names to remove for safety system compliance
const BRAND_FRANCHISE_NAMES = [
  // Movie franchises
  'Marvel', 'DC', 'Disney', 'Pixar', 'DreamWorks', 'Warner Bros', 'Universal',
  'Star Wars', 'Star Trek', 'Harry Potter', 'Lord of the Rings', 'Hobbit',
  'Avengers', 'Spider-Man', 'Spiderman', 'Batman', 'Superman', 'Wonder Woman',
  'X-Men', 'Transformers', 'Fast & Furious', 'Fast and Furious', 'Jurassic',
  'Terminator', 'Matrix', 'James Bond', '007', 'Mission Impossible',
  'Indiana Jones', 'Pirates of the Caribbean', 'Alien', 'Predator',
  'Ghostbusters', 'Men in Black', 'Shrek', 'Toy Story', 'Finding Nemo',
  'Frozen', 'Minions', 'Despicable Me', 'Kung Fu Panda', 'Madagascar',
  'Ice Age', 'How to Train Your Dragon', 'Godzilla', 'Kong', 'King Kong',
  'John Wick', 'Rocky', 'Creed', 'Rambo', 'Die Hard', 'Lethal Weapon',
  'Back to the Future', 'Blade Runner', 'Hunger Games', 'Twilight',
  'Fifty Shades', 'The Godfather', 'Scarface', 'Goodfellas',
  // Characters
  'Iron Man', 'Captain America', 'Thor', 'Hulk', 'Black Widow', 'Hawkeye',
  'Black Panther', 'Doctor Strange', 'Ant-Man', 'Groot', 'Thanos',
  'Joker', 'Harley Quinn', 'Catwoman', 'Robin', 'Aquaman', 'Flash',
  'Darth Vader', 'Luke Skywalker', 'Yoda', 'Chewbacca', 'Han Solo',
  'Dumbledore', 'Voldemort', 'Gandalf', 'Frodo', 'Gollum', 'Sauron',
  'Optimus Prime', 'Bumblebee', 'Megatron',
  // Studios/Companies
  'Netflix', 'Amazon', 'HBO', 'Paramount', 'Sony', 'Fox', '20th Century',
  'MGM', 'Lionsgate', 'New Line', 'Legendary', 'Columbia Pictures',
  // Horror franchises
  'Chucky', 'Child\'s Play', 'Freddy', 'Krueger', 'Jason', 'Voorhees',
  'Michael Myers', 'Halloween', 'Nightmare on Elm Street', 'Friday the 13th',
  'Saw', 'Conjuring', 'Annabelle', 'Insidious', 'Paranormal Activity',
  'Scream', 'Ghostface', 'Pennywise', 'IT', 'Exorcist', 'Poltergeist',
  // Video game adaptations
  'Mario', 'Sonic', 'Pokemon', 'Pikachu', 'Zelda', 'Minecraft',
  'Resident Evil', 'Tomb Raider', 'Mortal Kombat', 'Street Fighter',
  'Assassin\'s Creed', 'Uncharted', 'Halo', 'Call of Duty'
];

/**
 * Creates a safer prompt for image generation by removing brand names
 * and making the description more generic/original
 */
function createSaferImagePrompt(originalTitle, romanticTitle, genre, originalSummary) {
  // Remove brand/franchise names from title
  let safeTitle = romanticTitle || originalTitle || 'Untitled Romance';
  let safeOriginalTitle = originalTitle || '';
  
  // Remove brand names (case insensitive)
  for (const brand of BRAND_FRANCHISE_NAMES) {
    const regex = new RegExp(brand, 'gi');
    safeTitle = safeTitle.replace(regex, '').trim();
    safeOriginalTitle = safeOriginalTitle.replace(regex, '').trim();
  }
  
  // Clean up multiple spaces and trailing/leading punctuation
  safeTitle = safeTitle.replace(/\s+/g, ' ').replace(/^[:\-\s]+|[:\-\s]+$/g, '').trim();
  safeOriginalTitle = safeOriginalTitle.replace(/\s+/g, ' ').replace(/^[:\-\s]+|[:\-\s]+$/g, '').trim();
  
  // If title is now empty or too short, use generic title
  if (!safeTitle || safeTitle.length < 3) {
    safeTitle = 'Eternal Hearts';
  }
  
  // Convert genre to a safe, generic description
  const genreLower = (genre || '').toLowerCase();
  let themeDescription = '';
  
  if (genreLower.includes('sci-fi') || genreLower.includes('science')) {
    themeDescription = 'a futuristic setting with advanced technology and cosmic elements';
  } else if (genreLower.includes('horror') || genreLower.includes('thriller')) {
    themeDescription = 'a mysterious gothic atmosphere with dramatic lighting';
  } else if (genreLower.includes('action') || genreLower.includes('adventure')) {
    themeDescription = 'an adventurous backdrop with dynamic energy';
  } else if (genreLower.includes('fantasy')) {
    themeDescription = 'a magical, enchanted world with mystical elements';
  } else if (genreLower.includes('animation') || genreLower.includes('family')) {
    themeDescription = 'a colorful, whimsical animated world';
  } else if (genreLower.includes('war') || genreLower.includes('history')) {
    themeDescription = 'a historical setting with period-appropriate details';
  } else if (genreLower.includes('comedy')) {
    themeDescription = 'a lighthearted, joyful atmosphere';
  } else {
    themeDescription = 'a cinematic, dramatic setting';
  }
  
  // Build a completely original prompt that doesn't reference any existing movie
  const saferPrompt = `Create an ORIGINAL romantic movie poster concept (not based on any existing film or franchise).

POSTER TITLE: "${safeTitle}"

SCENE DESCRIPTION:
A beautiful romantic couple in ${themeDescription}. The couple is shown in a tasteful, loving embrace or tender moment together.

ARTISTIC STYLE:
- Professional Hollywood/Netflix movie poster quality
- Photorealistic, high-end cinematographic look
- Beautiful warm lighting with sunset/golden hour tones
- Color palette: pink, rose gold, purple, warm orange
- Dreamy soft-focus background with bokeh effects
- 8K detail quality
- Family-friendly, elegant composition

TYPOGRAPHY:
- Display the title "${safeTitle}" prominently
- Use elegant, romantic script or serif font
- Add subtle glow or metallic effect to the title text

IMPORTANT: This is an ORIGINAL creative concept, not a recreation or parody of any existing film. Create something unique and beautiful.`;

  return saferPrompt;
}

/**
 * Creates an ultra-safe fallback prompt with minimal specific details
 */
function createUltraSafeImagePrompt(romanticTitle = 'Eternal Love') {
  return `Create a beautiful romantic movie poster for "${romanticTitle}".

SCENE: A couple in love shown in a tasteful, elegant embrace during golden hour sunset.

STYLE:
- Professional cinema poster quality
- Warm pink, gold, and purple color palette
- Dreamy bokeh background
- Photorealistic, high quality
- Family-friendly and elegant

Include decorative romantic typography that says "${romanticTitle}" in elegant script font.

This is an original artistic creation, not based on any existing property.`;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 1000,
    minWidth: 1000,
    minHeight: 800,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#141414',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets', 'icon.png')
  });

  mainWindow.loadFile('index.html');

  // Create application menu
  createMenu();

  // Open DevTools in development
  // mainWindow.webContents.openDevTools();
}

function createMenu() {
  const isMac = process.platform === 'darwin';
  
  const template = [
    // macOS app menu
    ...(isMac ? [{
      label: app.name,
      submenu: [
        {
          label: 'About LoveFlix',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('show-about');
            }
          }
        },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }] : []),
    // Edit menu
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        ...(isMac ? [
          { role: 'pasteAndMatchStyle' },
          { role: 'delete' },
          { role: 'selectAll' },
        ] : [
          { role: 'delete' },
          { type: 'separator' },
          { role: 'selectAll' }
        ])
      ]
    },
    // View menu
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    // Window menu
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac ? [
          { type: 'separator' },
          { role: 'front' },
          { type: 'separator' },
          { role: 'window' }
        ] : [
          { role: 'close' }
        ])
      ]
    },
    // Help menu (with About for Windows/Linux)
    {
      label: 'Help',
      submenu: [
        ...(!isMac ? [{
          label: 'About LoveFlix',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('show-about');
            }
          }
        },
        { type: 'separator' }] : []),
        {
          label: 'Learn More',
          click: async () => {
            await shell.openExternal('https://github.com/janvanwassenhove/LoveFlix')
          }
        },
        {
          label: 'Documentation',
          click: async () => {
            await shell.openExternal('https://github.com/janvanwassenhove/LoveFlix#readme')
          }
        },
        { type: 'separator' },
        {
          label: 'Check for Updates...',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('manual-update-check');
            }
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Auto-updater configuration
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

autoUpdater.on('checking-for-update', () => {
  console.log('Checking for updates...');
});

autoUpdater.on('update-available', (info) => {
  console.log('Update available:', info.version);
  if (mainWindow) {
    mainWindow.webContents.send('update-available', info);
  }
});

autoUpdater.on('update-not-available', (info) => {
  console.log('No updates available');
});

autoUpdater.on('error', (err) => {
  console.log('Error checking for updates:', err);
  if (mainWindow) {
    mainWindow.webContents.send('update-error', err.message);
  }
});

autoUpdater.on('download-progress', (progress) => {
  console.log(`Download progress: ${progress.percent}%`);
  if (mainWindow) {
    mainWindow.webContents.send('update-download-progress', progress);
  }
});

autoUpdater.on('update-downloaded', (info) => {
  console.log('Update downloaded:', info.version);
  if (mainWindow) {
    mainWindow.webContents.send('update-downloaded', info);
  }
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Window controls
ipcMain.handle('window-minimize', () => {
  mainWindow.minimize();
});

ipcMain.handle('window-maximize', () => {
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
});

ipcMain.handle('window-close', () => {
  mainWindow.close();
});

// Settings management
function getApiKey() {
  // Check environment variable first, then fall back to stored setting
  return process.env.OPENAI_API_KEY || store.get('apiKey', '');
}

ipcMain.handle('get-settings', () => {
  const envApiKey = process.env.OPENAI_API_KEY;
  return {
    apiKey: store.get('apiKey', ''),
    envApiKey: envApiKey || null,  // Let UI know if env key exists
    hasEnvApiKey: !!envApiKey,
    imageModel: store.get('imageModel', 'dall-e-3'),
    textModel: store.get('textModel', 'gpt-5.2'),
    language: store.get('language', 'English'),
    tmdbApiKey: store.get('tmdbApiKey', ''),
    country: store.get('country', 'BE')
  };
});

ipcMain.handle('save-settings', (event, settings) => {
  store.set('apiKey', settings.apiKey);
  store.set('imageModel', settings.imageModel);
  store.set('textModel', settings.textModel);
  store.set('language', settings.language);
  store.set('tmdbApiKey', settings.tmdbApiKey);
  store.set('country', settings.country);
  return true;
});

// Test TMDB API key
ipcMain.handle('test-tmdb-key', async (event, apiKey) => {
  if (!apiKey || apiKey.trim() === '') {
    return { success: false, error: 'API key is required' };
  }
  
  try {
    // Test with a simple configuration request
    const testUrl = `https://api.themoviedb.org/3/configuration?api_key=${apiKey}`;
    const response = await axios.get(testUrl, { timeout: 10000 });
    
    if (response.data && response.data.images) {
      return { success: true, message: 'TMDB API key is valid!' };
    }
    
    return { success: false, error: 'Invalid response from TMDB' };
  } catch (error) {
    console.error('TMDB API test failed:', error.message);
    
    if (error.response) {
      // TMDB returned an error
      if (error.response.status === 401) {
        return { success: false, error: 'Invalid API key. Please check your TMDB API key.' };
      } else if (error.response.status === 404) {
        return { success: false, error: 'TMDB API endpoint not found.' };
      } else {
        return { success: false, error: `TMDB API error: ${error.response.status}` };
      }
    } else if (error.code === 'ENOTFOUND' || error.code === 'EAI_AGAIN') {
      return { success: false, error: 'Network error. Please check your internet connection.' };
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
      return { success: false, error: 'Request timeout. Please try again.' };
    }
    
    return { success: false, error: `Connection failed: ${error.message}` };
  }
});

// Get saved movies
ipcMain.handle('get-saved-movies', () => {
  return store.get('movies', []);
});

ipcMain.handle('save-movie', (event, movie) => {
  const movies = store.get('movies', []);
  movies.unshift(movie);
  store.set('movies', movies);
  return movies;
});

ipcMain.handle('delete-movie', (event, movieId) => {
  const movies = store.get('movies', []);
  const filtered = movies.filter(m => String(m.id) !== String(movieId));
  store.set('movies', filtered);
  return filtered;
});

// Top 10 Collections management
ipcMain.handle('get-top10-collections', () => {
  return store.get('top10Collections', []);
});

ipcMain.handle('save-top10-collection', (event, collection) => {
  const collections = store.get('top10Collections', []);
  collections.unshift(collection);
  store.set('top10Collections', collections);
  return collections;
});

ipcMain.handle('delete-top10-collection', (event, collectionId) => {
  const collections = store.get('top10Collections', []);
  const collectionToDelete = collections.find(c => c.id === collectionId);
  
  // Also delete the associated movies
  if (collectionToDelete && collectionToDelete.movieIds) {
    const movies = store.get('movies', []);
    const filteredMovies = movies.filter(m => !collectionToDelete.movieIds.includes(m.id));
    store.set('movies', filteredMovies);
  }
  
  const filteredCollections = collections.filter(c => c.id !== collectionId);
  store.set('top10Collections', filteredCollections);
  return filteredCollections;
});

// OpenAI API calls
function getOpenAIClient() {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('OpenAI API key not configured. Set OPENAI_API_KEY environment variable or add it in Settings.');
  }
  return new OpenAI({ apiKey });
}

ipcMain.handle('get-movie-info', async (event, movieTitle) => {
  try {
    const openai = getOpenAIClient();
    const textModel = store.get('textModel', 'gpt-5.2');
    
    console.log(`Fetching movie info for: "${movieTitle}" using model: ${textModel}`);
    
    const response = await openai.chat.completions.create({
      model: textModel,
      messages: [
        { 
          role: 'system', 
          content: `You are a helpful movie database assistant. When given a movie title (which may be misspelled or incomplete), find the best matching real movie and return information about it.
          
Always return valid JSON with these exact keys:
- title: The correct/official movie title
- year: Release year as a number
- genre: Main genre(s)
- director: Director name(s)
- summary: A brief plot summary (2-3 sentences)
- matchedQuery: The original query you received (for reference)

If the movie title seems misspelled, find the closest matching real movie. If you truly cannot identify any movie, return JSON with title set to the query and a summary explaining you couldn't find information about this specific movie.`
        },
        { role: 'user', content: `Find information about the movie: "${movieTitle}"` }
      ],
      max_completion_tokens: 600,
      response_format: { type: "json_object" }
    });
    
    console.log('API Response received:', JSON.stringify(response, null, 2));
    
    const content = response.choices?.[0]?.message?.content;
    if (!content || content.trim() === '') {
      console.warn('Empty response content, returning fallback data');
      // Return fallback data instead of throwing error
      return {
        title: movieTitle,
        year: new Date().getFullYear(),
        genre: 'Drama',
        director: 'Unknown',
        summary: `"${movieTitle}" - A cinematic masterpiece waiting to be transformed into a romantic adventure. While we couldn't retrieve all details, we can still create an amazing romantic version!`
      };
    }
    
    try {
      const parsed = JSON.parse(content);
      console.log('Successfully parsed movie info:', parsed);
      return parsed;
    } catch (parseError) {
      console.error('Failed to parse JSON response:', content);
      // Return a fallback object if parsing fails
      return {
        title: movieTitle,
        year: new Date().getFullYear(),
        genre: 'Drama',
        director: 'Unknown',
        summary: `Could not retrieve detailed information for "${movieTitle}". You can still proceed to create a romantic version!`
      };
    }
  } catch (error) {
    console.error('Error in get-movie-info:', error);
    // Return fallback instead of throwing
    return {
      title: movieTitle,
      year: new Date().getFullYear(),
      genre: 'Drama',
      director: 'Unknown',
      summary: `"${movieTitle}" - Let's transform this into a romantic masterpiece! (Note: Could not retrieve original details due to: ${error.message})`
    };
  }
});

ipcMain.handle('romanticize-movie', async (event, { title, summary }) => {
  try {
    console.log('=== ROMANTICIZE MOVIE START ===');
    console.log('Input:', { title, summary });
    
    const openai = getOpenAIClient();
    const textModel = store.get('textModel', 'gpt-5.2');
    const language = store.get('language', 'English');
    
    console.log('Using text model:', textModel, 'Language:', language);
    
    // Reasoning models (gpt-5.x, gpt-4o, etc.) use tokens for internal reasoning
    // so we need MUCH higher limits to get actual content output
    // gpt-5-mini can use 300-600 tokens just for reasoning alone!
    const isReasoningModel = textModel.includes('gpt-5') || textModel.includes('gpt-4o');
    const titleTokenLimit = isReasoningModel ? 800 : 100;
    
    console.log('Token strategy - Reasoning model:', isReasoningModel, 'Token limit:', titleTokenLimit);
    
    // Get romantic title
    // For reasoning models, use a more direct prompt that requires less reasoning
    const systemPrompt = isReasoningModel 
      ? `Transform ANY movie title into a romantic version. Examples:
"Alien" → "Hearts Among the Stars"
"Jaws" → "Ocean of Desire"
"IT" → "Love's Eternal Promise"
"Saw" → "Pieces of My Heart"

Respond with ONLY the romantic title.`
      : `You are a creative writer specializing in romantic movie titles. Your task is to transform ANY movie title into a romantic version. This is for a fun movie poster generator app.

RULES:
1. ALWAYS respond with exactly one romantic title
2. Keep it family-friendly and tasteful
3. Be creative - transform the theme into romance
4. Never refuse - every movie can have a romantic twist

Examples of transformations:
- "Alien" → "Hearts Among the Stars"
- "Jaws" → "Ocean of Desire"  
- "The Terminator" → "A Machine's Heart"
- "Die Hard" → "Love Never Surrenders"
- "Saw" → "Pieces of My Heart"
- "Friday the 13th" → "A Fateful Love"

Respond with ONLY the new romantic title, no quotes, no explanation.`;
    
    const titleResponse = await openai.chat.completions.create({
      model: textModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Create a romantic movie title based on: "${title}" (in ${language})` }
      ],
      max_completion_tokens: titleTokenLimit
    });
    
    console.log('Title API response:', JSON.stringify(titleResponse, null, 2));
    
    // Check for refusal
    const message = titleResponse.choices?.[0]?.message;
    if (message?.refusal) {
      console.warn('Model refused to generate title:', message.refusal);
    }
    
    // Check if response was truncated due to token limit
    const finishReason = titleResponse.choices?.[0]?.finish_reason;
    if (finishReason === 'length' && (!message?.content || message.content.trim() === '')) {
      console.warn('Empty response with finish_reason=length. Model used all tokens for reasoning. Usage:', titleResponse.usage);
      console.warn('This indicates the model needs more completion tokens for reasoning + output.');
    }
    
    let romanticTitle = message?.content?.trim();
    
    // Remove any quotes the model might have added
    if (romanticTitle) {
      romanticTitle = romanticTitle.replace(/^["']|["']$/g, '');
    }
    
    // If still empty, try a second attempt with simpler prompt
    if (!romanticTitle) {
      console.warn('Empty romantic title response, trying simpler prompt...');
      
      // Use even more tokens for retry with simpler prompt
      const retryTokenLimit = isReasoningModel ? 1000 : 100;
      console.log('Retry attempt with token limit:', retryTokenLimit);
      
      const retryResponse = await openai.chat.completions.create({
        model: textModel,
        messages: [
          { role: 'user', content: `Give me a romantic movie title inspired by "${title}". Just the title, nothing else.` }
        ],
        max_completion_tokens: retryTokenLimit
      });
      
      console.log('Retry response finish_reason:', retryResponse.choices?.[0]?.finish_reason);
      console.log('Retry response usage:', retryResponse.usage);
      console.log('Retry response content:', retryResponse.choices?.[0]?.message?.content);
      
      romanticTitle = retryResponse.choices?.[0]?.message?.content?.trim();
      if (romanticTitle) {
        romanticTitle = romanticTitle.replace(/^["']|["']$/g, '');
      }
    }
    
    // Before final fallback, try to sanitize the description and regenerate
    if (!romanticTitle) {
      console.warn('Title generation still failed, attempting to sanitize description and regenerate...');
      
      try {
        // Step 1: Ask LLM to create a sanitized/safer description
        const sanitizeResponse = await openai.chat.completions.create({
          model: textModel,
          messages: [
            { 
              role: 'system', 
              content: `You are a helpful assistant that creates safe, brand-free descriptions for creative projects. Remove all:
- Brand names (Disney, Marvel, DC, Netflix, etc.)
- Franchise names (Star Wars, Harry Potter, etc.)
- Character names from existing media (Darth Vader, Spider-Man, etc.)
- Trademarked terms
- Potentially problematic content

Replace them with generic descriptive terms that capture the essence and themes without referencing specific intellectual property.`
            },
            { 
              role: 'user', 
              content: `Create a safe, generic description for a movie originally titled "${title}" with this plot: "${summary}". 
              
Remove all brand names, franchise references, and trademarked content. Focus on the core themes, genre elements, and story structure without referencing specific properties. Keep it concise (2-3 sentences max).` 
            }
          ],
          max_completion_tokens: isReasoningModel ? 1200 : 200
        });
        
        console.log('Sanitization response finish_reason:', sanitizeResponse.choices?.[0]?.finish_reason);
        console.log('Sanitization response usage:', sanitizeResponse.usage);
        
        const sanitizedDescription = sanitizeResponse.choices?.[0]?.message?.content?.trim();
        console.log('Sanitized description:', sanitizedDescription);
        
        if (sanitizedDescription && sanitizedDescription.length > 20) {
          // Step 2: Try to generate romantic title with sanitized description
          const sanitizedTitleResponse = await openai.chat.completions.create({
            model: textModel,
            messages: [
              { 
                role: 'system', 
                content: `You are a creative writer specializing in romantic movie titles. Create an original, romantic title based on the description provided. Be creative and passionate, but keep it family-friendly. Respond with ONLY the title, no quotes or explanation.` 
              },
              { 
                role: 'user', 
                content: `Create a romantic movie title in ${language} based on this concept: "${sanitizedDescription}". Just the title, nothing else.` 
              }
            ],
            max_completion_tokens: isReasoningModel ? 1000 : 100
          });
          
          console.log('Sanitized title response finish_reason:', sanitizedTitleResponse.choices?.[0]?.finish_reason);
          console.log('Sanitized title response usage:', sanitizedTitleResponse.usage);
          
          const sanitizedTitle = sanitizedTitleResponse.choices?.[0]?.message?.content?.trim();
          if (sanitizedTitle) {
            romanticTitle = sanitizedTitle.replace(/^["']|["']$/g, '');
            console.log('Successfully generated title from sanitized description:', romanticTitle);
          }
        }
      } catch (sanitizeError) {
        console.error('Sanitization attempt failed:', sanitizeError.message);
        // Continue to final fallback
      }
    }
    
    // Final fallback - generate creative title ourselves
    if (!romanticTitle) {
      console.warn('All API attempts failed, using creative fallback...');
      const romanticPrefixes = ['Hearts of', 'Love in', 'Passion of', 'Eternal', 'Whispers of', 'Dreams of'];
      const romanticSuffixes = ['of Love', 'of the Heart', 'in Bloom', 'Forever', 'of Desire'];
      const usePrefix = Math.random() > 0.5;
      if (usePrefix) {
        const prefix = romanticPrefixes[Math.floor(Math.random() * romanticPrefixes.length)];
        romanticTitle = `${prefix} ${title}`;
      } else {
        const suffix = romanticSuffixes[Math.floor(Math.random() * romanticSuffixes.length)];
        romanticTitle = `${title} ${suffix}`;
      }
    }
    
    console.log('Generated romantic title:', romanticTitle);
    
    // Get romantic summary (use higher token limit for reasoning models)
    const summaryTokenLimit = isReasoningModel ? 1500 : 800;
    console.log('Generating summary with token limit:', summaryTokenLimit);
    
    const summaryResponse = await openai.chat.completions.create({
      model: textModel,
      messages: [
        { role: 'system', content: 'You are a creative assistant that transforms movie summaries into romantic versions. Be creative but keep it concise (max 150 words). Focus on love and passion!' },
        { role: 'user', content: `Transform this movie summary into a hyper-romantic version in ${language}. Make it dramatic and full of love, but keep it under 150 words:\n\n"${summary}"` }
      ],
      max_completion_tokens: summaryTokenLimit
    });
    
    console.log('Summary API response finish_reason:', summaryResponse.choices?.[0]?.finish_reason);
    console.log('Summary API response usage:', summaryResponse.usage);
    
    let romanticSummary = summaryResponse.choices[0]?.message?.content?.trim();
    
    // Check if summary generation failed due to token limit
    if (!romanticSummary || romanticSummary === '') {
      const summaryFinishReason = summaryResponse.choices?.[0]?.finish_reason;
      if (summaryFinishReason === 'length') {
        console.warn('Summary generation hit token limit. Reasoning tokens used:', summaryResponse.usage?.completion_tokens_details?.reasoning_tokens);
      }
      romanticSummary = 'A passionate love story awaits...';
      console.warn('Empty summary response, using fallback:', romanticSummary);
    }
    
    console.log('Generated romantic summary:', romanticSummary);
    console.log('=== ROMANTICIZE MOVIE END ===');
    
    return {
      romanticTitle,
      romanticSummary
    };
  } catch (error) {
    console.error('Error in romanticize-movie:', error);
    throw new Error(error.message);
  }
});

ipcMain.handle('generate-tags', async (event, { romanticTitle, romanticSummary, genre }) => {
  try {
    console.log('=== GENERATE TAGS START ===');
    
    const openai = getOpenAIClient();
    const textModel = store.get('textModel', 'gpt-5.2');
    const language = store.get('language', 'English');
    
    const response = await openai.chat.completions.create({
      model: textModel,
      messages: [
        { 
          role: 'system', 
          content: `You are a creative assistant that generates engaging tags/keywords for romantic movies. Return ONLY a JSON array of 4-6 short tags (1-2 words each) that capture the essence and themes of the romantic story. Focus on emotions, settings, and romantic elements. Always return valid JSON with an array of strings.` 
        },
        { 
          role: 'user', 
          content: `Generate 4-6 engaging tags in ${language} for this romantic movie:\n\nTitle: ${romanticTitle}\n\nSummary: ${romanticSummary}\n\nOriginal Genre: ${genre || 'Unknown'}\n\nReturn only a JSON array of tags like: ["Tag1", "Tag2", "Tag3", "Tag4"]` 
        }
      ],
      max_completion_tokens: 150,
      response_format: { type: "json_object" }
    });
    
    const content = response.choices[0]?.message?.content?.trim();
    console.log('Raw tags response:', content);
    
    if (!content) {
      console.warn('Empty tags response, using defaults');
      return ['Romance', 'Love Story', 'Passion', 'AI Generated'];
    }
    
    try {
      const parsed = JSON.parse(content);
      // Handle both {tags: [...]} and direct array formats
      const tags = Array.isArray(parsed) ? parsed : (parsed.tags || parsed.keywords || []);
      
      if (Array.isArray(tags) && tags.length > 0) {
        console.log('Generated tags:', tags);
        return tags.slice(0, 6); // Limit to 6 tags
      }
    } catch (parseError) {
      console.error('Failed to parse tags JSON:', parseError);
    }
    
    // Fallback tags
    return ['Romance', 'Love Story', 'Passion', 'AI Generated'];
  } catch (error) {
    console.error('Error in generate-tags:', error);
    // Return fallback tags on error
    return ['Romance', 'Love Story', 'Passion', 'AI Generated'];
  }
});

ipcMain.handle('generate-poster', async (event, { originalTitle, romanticTitle, genre, originalSummary, originalPosterUrl }) => {
  try {
    console.log('=== POSTER GENERATION START ===');
    console.log('Input params:', JSON.stringify({ originalTitle, romanticTitle, genre, originalSummary, originalPosterUrl }, null, 2));
    
    const openai = getOpenAIClient();
    const imageModel = store.get('imageModel', 'dall-e-3');
    console.log('Using image model:', imageModel);
    
    // Use romanticTitle, fallback to originalTitle if empty
    const titleForPrompt = romanticTitle && romanticTitle.trim() ? romanticTitle : originalTitle || 'Untitled Romance';
    console.log('Title for prompt:', titleForPrompt);
    
    // Add romantic variations for diversity in poster collection
    // Expanded collection with 30+ unique romantic styles
    const romanticStyles = [
      // === SUNSET & WARM TONES ===
      {
        name: 'Sunset Romance',
        colors: 'Warm golden sunset, pink, rose gold, and amber tones',
        lighting: 'Golden hour sunset lighting with lens flare',
        mood: 'Dreamy and ethereal with soft bokeh',
        composition: 'Couple silhouetted against a dramatic sunset sky'
      },
      {
        name: 'Golden Hour Passion',
        colors: 'Rich orange, deep red, gold, and warm magenta',
        lighting: 'Dramatic side-lighting from low sun',
        mood: 'Intense and passionate with high contrast',
        composition: 'Close intimate moment with dramatic lighting on faces'
      },
      {
        name: 'Amber Dream',
        colors: 'Burnt orange, amber, honey gold, and deep rose',
        lighting: 'Warm glowing light from multiple candles or lanterns',
        mood: 'Intimate and dreamy with soft focus',
        composition: 'Couple bathed in amber candlelight with bokeh effects'
      },
      {
        name: 'Sunrise Promise',
        colors: 'Soft peach, coral pink, gold, and pale lavender',
        lighting: 'First light of dawn breaking through mist',
        mood: 'Hopeful and fresh with new beginning energy',
        composition: 'Couple watching sunrise together with warm morning glow'
      },
      
      // === WATER & OCEAN THEMES ===
      {
        name: 'Ocean Romance',
        colors: 'Turquoise, coral pink, cream, and seafoam green',
        lighting: 'Bright beach sunlight with water reflections',
        mood: 'Fresh and breezy with ocean elements',
        composition: 'Couple on a beach or near water with sunset reflection'
      },
      {
        name: 'Moonlit Waves',
        colors: 'Deep navy, silver moonlight, pearl white, and soft lavender',
        lighting: 'Moonlight reflecting off water with starry sky',
        mood: 'Mysterious and romantic with nocturnal atmosphere',
        composition: 'Couple by moonlit ocean with waves and stars above'
      },
      {
        name: 'Tropical Paradise',
        colors: 'Vibrant coral, aqua blue, lime green, and sunset pink',
        lighting: 'Bright tropical sunshine with palm shadows',
        mood: 'Exotic and vibrant with lush island romance',
        composition: 'Couple in tropical setting with waterfalls and exotic flowers'
      },
      {
        name: 'Underwater Love',
        colors: 'Deep teal, electric blue, sea green, and pearl shimmer',
        lighting: 'Filtered sunlight rays through water surface',
        mood: 'Surreal and mystical with aquatic beauty',
        composition: 'Ethereal underwater scene with couple floating among coral and light rays'
      },
      
      // === NATURE & GARDEN SETTINGS ===
      {
        name: 'Enchanted Garden',
        colors: 'Emerald green, rose pink, ivory, and soft gold',
        lighting: 'Dappled sunlight through foliage',
        mood: 'Lush and magical with nature elements',
        composition: 'Couple in a blooming garden with roses and vines'
      },
      {
        name: 'Cherry Blossom Dreams',
        colors: 'Soft pink petals, white blossoms, sage green, and pearl',
        lighting: 'Diffused spring sunlight through falling petals',
        mood: 'Delicate and ethereal with Japanese garden aesthetic',
        composition: 'Couple under cherry blossom trees with petals floating around them'
      },
      {
        name: 'Autumn Embrace',
        colors: 'Russet red, golden amber, burnt sienna, and warm brown',
        lighting: 'Golden afternoon light through autumn leaves',
        mood: 'Cozy and warm with seasonal charm',
        composition: 'Couple surrounded by falling autumn leaves in forest setting'
      },
      {
        name: 'Lavender Fields',
        colors: 'Purple lavender, soft lilac, cream, and golden wheat',
        lighting: 'Late afternoon French countryside light',
        mood: 'Serene and romantic with Provence aesthetic',
        composition: 'Couple walking through endless lavender fields at sunset'
      },
      {
        name: 'Wildflower Meadow',
        colors: 'Bright wildflower colors: yellow, purple, red, white on green',
        lighting: 'Bright midday sun with soft clouds',
        mood: 'Joyful and carefree with natural beauty',
        composition: 'Couple in vast meadow of colorful wildflowers'
      },
      
      // === WINTER & COLD WEATHER ===
      {
        name: 'Winter Wonderland Love',
        colors: 'Ice blue, silver, white, and rose pink',
        lighting: 'Soft winter light with snow glow',
        mood: 'Cozy and intimate with snowy atmosphere',
        composition: 'Couple in winter setting with snowflakes and warm embrace'
      },
      {
        name: 'Northern Lights Romance',
        colors: 'Electric green aurora, deep blue sky, pink accents, and white snow',
        lighting: 'Magical aurora borealis illuminating the scene',
        mood: 'Otherworldly and magical with arctic wonder',
        composition: 'Couple under dancing northern lights in snowy landscape'
      },
      {
        name: 'Fireside Glow',
        colors: 'Warm orange firelight, deep burgundy, cream, and chocolate brown',
        lighting: 'Flickering fireplace light in cozy interior',
        mood: 'Intimate and warm with cabin romance',
        composition: 'Couple by crackling fireplace with soft blankets and wine'
      },
      {
        name: 'Ice Palace Dreams',
        colors: 'Crystal blue, diamond white, silver frost, and pale pink',
        lighting: 'Sparkling ice reflections and cold blue light',
        mood: 'Majestic and frozen beauty with winter magic',
        composition: 'Couple in ice palace or frozen wonderland with crystal formations'
      },
      
      // === URBAN & MODERN ===
      {
        name: 'City Lights Romance',
        colors: 'Neon pink, electric blue, warm yellow lights, and deep night sky',
        lighting: 'City skyline lights and street lamps at night',
        mood: 'Modern and sophisticated with urban energy',
        composition: 'Couple on rooftop or balcony with glittering cityscape behind'
      },
      {
        name: 'Rain-Kissed Love',
        colors: 'Slate grey, neon reflections, warm amber street lights, and rose pink umbrellas',
        lighting: 'Atmospheric rain with glowing street lamps and neon reflections',
        mood: 'Moody and cinematic with urban romance',
        composition: 'Couple sharing umbrella or dancing in rain with city lights reflected in puddles'
      },
      {
        name: 'Art Deco Elegance',
        colors: 'Gold, black, cream, and deep emerald green',
        lighting: 'Glamorous 1920s style lighting with geometric patterns',
        mood: 'Luxurious and sophisticated with vintage glamour',
        composition: 'Couple in elegant formal wear with art deco architecture and patterns'
      },
      {
        name: 'Neon Dreams',
        colors: 'Hot pink neon, electric purple, cyan blue, and deep black',
        lighting: 'Vibrant neon signs and lights in night setting',
        mood: 'Contemporary and electric with cyberpunk romance',
        composition: 'Couple in neon-lit urban environment with signs and reflections'
      },
      
      // === CLASSIC & VINTAGE ===
      {
        name: 'Vintage Romance',
        colors: 'Sepia tones, burgundy, cream, and antique gold',
        lighting: 'Soft vintage studio lighting',
        mood: 'Classic and timeless with nostalgic feel',
        composition: 'Old Hollywood style glamour portrait of couple'
      },
      {
        name: 'Victorian Dreams',
        colors: 'Deep velvet red, antique gold, ivory lace, and forest green',
        lighting: 'Soft oil lamp glow and candlelight',
        mood: 'Ornate and romantic with period drama aesthetic',
        composition: 'Couple in Victorian clothing with elaborate costumes and period setting'
      },
      {
        name: 'French Riviera',
        colors: 'Azure blue, white, sand beige, and sunset coral',
        lighting: 'Mediterranean golden hour with sea breeze',
        mood: 'Elegant and breezy with European sophistication',
        composition: 'Couple on yacht or coastal villa with blue waters and white architecture'
      },
      {
        name: 'Retro Drive-In',
        colors: 'Vintage teal, candy pink, cream, and warm amber',
        lighting: 'Nostalgic 1950s drive-in movie screen glow',
        mood: 'Nostalgic and sweet with retro Americana',
        composition: 'Couple at classic car in drive-in theater setting'
      },
      
      // === NIGHT & CELESTIAL ===
      {
        name: 'Starlight Love',
        colors: 'Deep purple, midnight blue, silver, and soft pink',
        lighting: 'Moonlight and starlight illumination',
        mood: 'Mystical and enchanting with twinkling stars',
        composition: 'Couple under a starry night sky with glowing constellation patterns'
      },
      {
        name: 'Milky Way Magic',
        colors: 'Deep space black, purple nebula, blue stars, and pink cosmic dust',
        lighting: 'Starlight from Milky Way galaxy visible overhead',
        mood: 'Cosmic and awe-inspiring with universe romance',
        composition: 'Couple silhouetted under visible Milky Way with shooting stars'
      },
      {
        name: 'Midnight Garden',
        colors: 'Deep indigo, moonlight white, silver, and dark rose',
        lighting: 'Full moon illumination with soft shadows',
        mood: 'Mysterious and enchanted with nocturnal beauty',
        composition: 'Couple in moonlit garden with night-blooming flowers'
      },
      
      // === FANTASY & MAGICAL ===
      {
        name: 'Fairytale Castle',
        colors: 'Royal purple, gold, ivory towers, and pink sunset',
        lighting: 'Magical twilight with castle windows glowing',
        mood: 'Enchanted and regal with storybook romance',
        composition: 'Couple before majestic castle with fairy lights and towers'
      },
      {
        name: 'Ethereal Mist',
        colors: 'Soft lavender fog, pearl white, silver, and pale pink',
        lighting: 'Diffused dreamy light through morning mist',
        mood: 'Mystical and soft with fantasy atmosphere',
        composition: 'Couple emerging from or embracing in misty forest with soft glow'
      },
      {
        name: 'Crystal Ballroom',
        colors: 'Brilliant crystal white, silver, champagne gold, and soft blue',
        lighting: 'Sparkling chandelier light with crystal reflections',
        mood: 'Luxurious and magical with fairy tale ball aesthetic',
        composition: 'Couple dancing in grand ballroom with chandeliers and flowing gowns'
      },
      {
        name: 'Enchanted Forest',
        colors: 'Deep forest green, golden fairy lights, moss green, and amber',
        lighting: 'Magical firefly and fairy light glow',
        mood: 'Whimsical and mysterious with woodland magic',
        composition: 'Couple in ancient forest with glowing lights and mystical atmosphere'
      },
      
      // === DRAMATIC & ARTISTIC ===
      {
        name: 'Film Noir Romance',
        colors: 'Black and white with dramatic red accent and smoky grey',
        lighting: 'High contrast dramatic shadows with single spotlight',
        mood: 'Mysterious and intense with noir aesthetic',
        composition: 'Couple in dramatic pose with venetian blind shadows and fog'
      },
      {
        name: 'Renaissance Love',
        colors: 'Rich Renaissance colors: deep crimson, gold leaf, ultramarine, and ivory',
        lighting: 'Classical painting lighting with chiaroscuro technique',
        mood: 'Artistic and timeless with masterpiece quality',
        composition: 'Couple posed like classical painting with dramatic fabric and flowers'
      },
      {
        name: 'Watercolor Dreams',
        colors: 'Soft bleeding pastels: pink, lavender, peach, and sky blue',
        lighting: 'Soft diffused natural light with artistic glow',
        mood: 'Artistic and delicate with painted quality',
        composition: 'Couple with soft watercolor-style blending and floral elements'
      },
      {
        name: 'Gothic Romance',
        colors: 'Deep burgundy, midnight black, blood red roses, and pale moonlight',
        lighting: 'Dramatic chiaroscuro with candles and moonlight',
        mood: 'Dark and passionate with Victorian gothic aesthetic',
        composition: 'Couple in gothic setting with roses, candelabras, and dramatic architecture'
      }
    ];
    
    // Randomly select a romantic style for variation
    const selectedStyle = romanticStyles[Math.floor(Math.random() * romanticStyles.length)];
    console.log('Selected romantic style:', selectedStyle.name);
    
    // Build a safe, family-friendly romantic movie poster prompt
    const genreContext = genre ? `Original genre: ${genre.replace(/horror|thriller/gi, 'drama')} - reimagined as a passionate romance.` : '';
    const summaryContext = originalSummary ? `Original story essence: ${originalSummary.substring(0, 300)}` : '';
    const originalContext = originalTitle ? `This is a romantic reimagining of the movie "${originalTitle}".` : '';
    
    // Create a prompt that transforms the original movie concept into a romantic version
    const prompt = `Create a hyper-romantic movie poster for "${titleForPrompt}" in ${selectedStyle.name} style.

${originalContext}
${genreContext}
${summaryContext}

TRANSFORMATION CONCEPT:
- Imagine taking the original movie "${originalTitle || titleForPrompt}" and turning it into an over-the-top romantic version
- Keep iconic visual elements from the original film but bathe them in romance
- If it was sci-fi: spaceships become vessels of love, aliens become star-crossed lovers
- If it was horror: dark castles become gothic romance settings, monsters become misunderstood romantic figures
- If it was action: explosions become fireworks of passion, fights become dances of desire
- If it was drama: amplify any existing romantic undertones to maximum

STYLE REQUIREMENTS (${selectedStyle.name}):
- Professional Netflix/Hollywood movie poster aesthetic
- ${selectedStyle.composition}
- Characters should evoke the spirit of the original film but in a romantic context
- ${selectedStyle.lighting}
- Color palette: ${selectedStyle.colors}
- Mood: ${selectedStyle.mood}
- High quality, 8K detail, photorealistic style
- Include the movie title "${titleForPrompt}" prominently displayed in elegant, romantic typography
- Title should be in a stylish script or serif font with a subtle glow or metallic effect
- Family-friendly, elegant, and tasteful composition
- Make it unmistakably a ROMANCE version of a blockbuster film`;

    console.log('Full prompt:', prompt);
    
    let response;
    
    console.log('Calling OpenAI images.generate...');
    
    if (imageModel === 'dall-e-2') {
      response = await openai.images.generate({
        model: 'dall-e-2',
        prompt: prompt,
        n: 1,
        size: '1024x1024'
      });
    } else if (imageModel === 'dall-e-3') {
      response = await openai.images.generate({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'hd'
      });
    } else {
      // For gpt-image models (gpt-image-1, gpt-image-1-mini, gpt-image-1.5)
      response = await openai.images.generate({
        model: imageModel,
        prompt: prompt,
        n: 1,
        size: '1024x1024'
      });
    }
    
    console.log('Response.data:', response?.data);
    console.log('Response.data type:', typeof response?.data);
    
    const imageData = response?.data?.[0];
    if (!imageData) {
      console.error('No image data in response. Full response:', JSON.stringify(response, null, 2));
      throw new Error('Failed to get image data from API response');
    }
    
    // Check for URL format (hosted image)
    if (imageData.url) {
      console.log('Successfully generated poster URL:', imageData.url);
      console.log('=== POSTER GENERATION SUCCESS ===');
      return {
        url: imageData.url,
        style: selectedStyle.name,
        styleDetails: {
          colors: selectedStyle.colors,
          mood: selectedStyle.mood,
          composition: selectedStyle.composition
        }
      };
    }
    
    // Check for base64 format (inline image)
    if (imageData.b64_json) {
      console.log('Received base64 image, converting to data URL');
      const dataUrl = `data:image/png;base64,${imageData.b64_json}`;
      console.log('Data URL created (length:', dataUrl.length, 'chars)');
      console.log('=== POSTER GENERATION SUCCESS ===');
      return {
        url: dataUrl,
        style: selectedStyle.name,
        styleDetails: {
          colors: selectedStyle.colors,
          mood: selectedStyle.mood,
          composition: selectedStyle.composition
        }
      };
    }
    
    console.error('No URL or b64_json in response. Image data:', imageData);
    throw new Error('Failed to extract image from API response (no url or b64_json field)');
  } catch (error) {
    console.error('Error in generate-poster:', error);
    // If safety system rejected the request, try with progressively safer prompts
    if (error.message && error.message.includes('safety')) {
      console.log('Safety rejection detected, trying with safer prompt (attempt 1)...');
      
      // First retry: Use the sanitized prompt that removes brand names
      try {
        const openai = getOpenAIClient();
        const imageModel = store.get('imageModel', 'dall-e-3');
        
        const saferPrompt = createSaferImagePrompt(originalTitle, romanticTitle, genre, originalSummary);
        console.log('Safer prompt (attempt 1):', saferPrompt);
        
        let retryResponse;
        if (imageModel === 'dall-e-3') {
          retryResponse = await openai.images.generate({
            model: 'dall-e-3',
            prompt: saferPrompt,
            n: 1,
            size: '1024x1024',
            quality: 'hd'
          });
        } else {
          retryResponse = await openai.images.generate({
            model: imageModel,
            prompt: saferPrompt,
            n: 1,
            size: '1024x1024'
          });
        }
        
        const retryImageData = retryResponse?.data?.[0];
        if (!retryImageData) {
          throw new Error('Failed to get image data from retry attempt 1');
        }
        
        // Handle both URL and base64 formats
        if (retryImageData.url) {
          console.log('Retry attempt 1 successful, poster URL:', retryImageData.url);
          return retryImageData.url;
        }
        
        if (retryImageData.b64_json) {
          console.log('Retry attempt 1 successful, received base64 image');
          const dataUrl = `data:image/png;base64,${retryImageData.b64_json}`;
          return dataUrl;
        }
        
        throw new Error('Failed to extract image from retry attempt 1');
      } catch (retryError1) {
        console.error('Retry attempt 1 failed:', retryError1.message);
        
        // If still rejected by safety, try ultra-safe prompt
        if (retryError1.message && retryError1.message.includes('safety')) {
          console.log('Safety rejection on attempt 1, trying ultra-safe prompt (attempt 2)...');
          
          try {
            const openai = getOpenAIClient();
            const imageModel = store.get('imageModel', 'dall-e-3');
            
            const titleForUltraSafe = romanticTitle && romanticTitle.trim() ? romanticTitle : originalTitle || 'Eternal Love';
            const ultraSafePrompt = createUltraSafeImagePrompt(titleForUltraSafe);
            console.log('Ultra-safe prompt (attempt 2):', ultraSafePrompt);
            
            let retryResponse2;
            if (imageModel === 'dall-e-3') {
              retryResponse2 = await openai.images.generate({
                model: 'dall-e-3',
                prompt: ultraSafePrompt,
                n: 1,
                size: '1024x1024',
                quality: 'hd'
              });
            } else {
              retryResponse2 = await openai.images.generate({
                model: imageModel,
                prompt: ultraSafePrompt,
                n: 1,
                size: '1024x1024'
              });
            }
            
            const retryImageData2 = retryResponse2?.data?.[0];
            if (!retryImageData2) {
              throw new Error('Failed to get image data from retry attempt 2');
            }
            
            if (retryImageData2.url) {
              console.log('Retry attempt 2 successful, poster URL:', retryImageData2.url);
              return retryImageData2.url;
            }
            
            if (retryImageData2.b64_json) {
              console.log('Retry attempt 2 successful, received base64 image');
              const dataUrl = `data:image/png;base64,${retryImageData2.b64_json}`;
              return dataUrl;
            }
            
            throw new Error('Failed to extract image from retry attempt 2');
          } catch (retryError2) {
            console.error('Retry attempt 2 failed:', retryError2);
            throw new Error('Could not generate poster even with safe prompts. The content may not be suitable for image generation. Please try a different movie.');
          }
        }
        
        throw new Error('Could not generate poster. Please try a different movie or try again later.');
      }
    }
    throw new Error(error.message);
  }
});

// Hardcoded fallback Top 10 data
function getFallbackTop10Data() {
  const posterBase = 'https://image.tmdb.org/t/p/w500';
  
  return {
    movies: [
      { title: "Oppenheimer", year: 2023, genre: "Drama/Biography", poster: `${posterBase}/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg` },
      { title: "Dune: Part Two", year: 2024, genre: "Sci-Fi/Adventure", poster: `${posterBase}/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg` },
      { title: "The Fall Guy", year: 2024, genre: "Action/Comedy", poster: `${posterBase}/tSz1qsmSJon0rqjHBxXZmrotuse.jpg` },
      { title: "Poor Things", year: 2023, genre: "Comedy/Drama", poster: `${posterBase}/kCGlIMHnOm8JPXq3rXM6c5wMxcT.jpg` },
      { title: "Godzilla x Kong", year: 2024, genre: "Action/Sci-Fi", poster: `${posterBase}/z1p34vh7dEOnLDmyCrlUVLuoDzd.jpg` },
      { title: "Civil War", year: 2024, genre: "Action/Drama", poster: `${posterBase}/sh7Rg8Er3tFcN9BpKIPOMvALgZd.jpg` },
      { title: "Kung Fu Panda 4", year: 2024, genre: "Animation/Action", poster: `${posterBase}/kDp1vUBnMpe8ak4rjgl3cLELqjU.jpg` },
      { title: "Anyone But You", year: 2023, genre: "Comedy/Romance", poster: `${posterBase}/5qHoazZiaLe7oFBok7XlUhg96f2.jpg` },
      { title: "Ghostbusters: Frozen Empire", year: 2024, genre: "Comedy/Fantasy", poster: `${posterBase}/e1J2oNzSBdou01sUvriVeCgMtqt.jpg` },
      { title: "The Beekeeper", year: 2024, genre: "Action/Thriller", poster: `${posterBase}/A7EByudX0eOzlkQ2FIbogzyazm2.jpg` }
    ],
    series: [
      { title: "Squid Game", year: 2021, genre: "Thriller/Drama", poster: `${posterBase}/dDlEmu3EZ0Pgg93K2SVNLCjCSvE.jpg` },
      { title: "Wednesday", year: 2022, genre: "Comedy/Fantasy", poster: `${posterBase}/9PFonBhy4cQy7Jz20NpMygczOkv.jpg` },
      { title: "Stranger Things", year: 2016, genre: "Sci-Fi/Horror", poster: `${posterBase}/49WJfeN0moxb9IPfGn8AIqMGskD.jpg` },
      { title: "The Witcher", year: 2019, genre: "Fantasy/Action", poster: `${posterBase}/cZ0d3rtvXPVvuiX22sP79K3Hmjz.jpg` },
      { title: "Bridgerton", year: 2020, genre: "Drama/Romance", poster: `${posterBase}/luoKpgVwi1E5nQsi7W0UuKHu2Rq.jpg` },
      { title: "The Crown", year: 2016, genre: "Drama/History", poster: `${posterBase}/1M876KPjulVwppEpldhdc8V4o68.jpg` },
      { title: "Money Heist", year: 2017, genre: "Action/Crime", poster: `${posterBase}/reEMJA1uzscCbkpeRJeTT2bjqUp.jpg` },
      { title: "Dark", year: 2017, genre: "Sci-Fi/Thriller", poster: `${posterBase}/5LoHuHWA4H8jElFlZDvsmU2n63b.jpg` },
      { title: "Ozark", year: 2017, genre: "Crime/Drama", poster: `${posterBase}/pCGyPVrI9Fzw6KENHlA0M0Kf6qG.jpg` },
      { title: "The Queen's Gambit", year: 2020, genre: "Drama", poster: `${posterBase}/zU0htwkhNvBQdVSIKB9s6MgHn6T.jpg` }
    ],
    action: [
      { title: "John Wick: Chapter 4", year: 2023, genre: "Action/Thriller", poster: `${posterBase}/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg` },
      { title: "Mission: Impossible - Dead Reckoning", year: 2023, genre: "Action/Adventure", poster: `${posterBase}/NNxYkU70HPurnNCSiCjYAmacwm.jpg` },
      { title: "The Equalizer 3", year: 2023, genre: "Action/Crime", poster: `${posterBase}/b0Ej6fnXAP8fK75hlyi2jKqdhHz.jpg` },
      { title: "Fast X", year: 2023, genre: "Action/Adventure", poster: `${posterBase}/fiVW06jE7z9YnO4trhaMEdclSiC.jpg` },
      { title: "Extraction 2", year: 2023, genre: "Action/Thriller", poster: `${posterBase}/7gKI9hpEMcZUQpNgKrkDzJpbnNS.jpg` },
      { title: "The Meg 2", year: 2023, genre: "Action/Sci-Fi", poster: `${posterBase}/4m1Au3YkjqsxF8iwQy0fPYSxE0h.jpg` },
      { title: "Rebel Moon", year: 2023, genre: "Action/Sci-Fi", poster: `${posterBase}/ui4DrH1cKk2vkHshcUcGt2lKxCm.jpg` },
      { title: "Expendables 4", year: 2023, genre: "Action/Adventure", poster: `${posterBase}/iwsMu0ehRPbtaSxqiaUDQB9qMWT.jpg` },
      { title: "Blue Beetle", year: 2023, genre: "Action/Sci-Fi", poster: `${posterBase}/mXLOHHc1Zeuwsl4xYKjKh2280oL.jpg` },
      { title: "Gran Turismo", year: 2023, genre: "Action/Drama", poster: `${posterBase}/51tqzRtKMMZEYUpSYkrUE7v9ehm.jpg` }
    ],
    scifi: [
      { title: "Interstellar", year: 2014, genre: "Sci-Fi/Drama", poster: `${posterBase}/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg` },
      { title: "The Matrix", year: 1999, genre: "Sci-Fi/Action", poster: `${posterBase}/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg` },
      { title: "Inception", year: 2010, genre: "Sci-Fi/Thriller", poster: `${posterBase}/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg` },
      { title: "Blade Runner 2049", year: 2017, genre: "Sci-Fi/Drama", poster: `${posterBase}/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg` },
      { title: "Ex Machina", year: 2014, genre: "Sci-Fi/Thriller", poster: `${posterBase}/btbRB7BrD887j5NrvjxceRDmaot.jpg` },
      { title: "Arrival", year: 2016, genre: "Sci-Fi/Drama", poster: `${posterBase}/x2FJsf1ElAgr63Y3PNPtJrcmpoe.jpg` },
      { title: "The Martian", year: 2015, genre: "Sci-Fi/Adventure", poster: `${posterBase}/5BHuvQ6p9kfc091Z8RiFNhCwL4b.jpg` },
      { title: "Edge of Tomorrow", year: 2014, genre: "Sci-Fi/Action", poster: `${posterBase}/xjw5trHV7Mwo61P0aFTMU74KpWz.jpg` },
      { title: "Annihilation", year: 2018, genre: "Sci-Fi/Horror", poster: `${posterBase}/d3qcpfNwbAMCNqWDHzPQsUYiUgS.jpg` },
      { title: "Tenet", year: 2020, genre: "Sci-Fi/Action", poster: `${posterBase}/k68nPLbIST6NP96JmTxmZijEvCA.jpg` }
    ]
  };
}

// Fetch Top 10 from TMDB API (with fallback to hardcoded data)
ipcMain.handle('get-netflix-top10', async (event, category = 'movies') => {
  const tmdbApiKey = store.get('tmdbApiKey', '');
  const country = store.get('country', 'BE');
  
  // If no API key, return fallback data with flag
  if (!tmdbApiKey) {
    const fallbackData = getFallbackTop10Data();
    return {
      data: fallbackData[category] || fallbackData.movies,
      usingFallback: true
    };
  }
  
  try {
    const posterBase = 'https://image.tmdb.org/t/p/w500';
    let endpoint;
    
    // Map category to TMDB endpoint
    switch(category) {
      case 'movies':
        endpoint = `https://api.themoviedb.org/3/movie/popular?api_key=${tmdbApiKey}&region=${country}&language=en-US&page=1`;
        break;
      case 'series':
        endpoint = `https://api.themoviedb.org/3/tv/popular?api_key=${tmdbApiKey}&region=${country}&language=en-US&page=1`;
        break;
      case 'action':
        endpoint = `https://api.themoviedb.org/3/discover/movie?api_key=${tmdbApiKey}&region=${country}&with_genres=28&sort_by=popularity.desc&language=en-US&page=1`;
        break;
      case 'scifi':
        endpoint = `https://api.themoviedb.org/3/discover/movie?api_key=${tmdbApiKey}&region=${country}&with_genres=878&sort_by=popularity.desc&language=en-US&page=1`;
        break;
      default:
        endpoint = `https://api.themoviedb.org/3/movie/popular?api_key=${tmdbApiKey}&region=${country}&language=en-US&page=1`;
    }
    
    const response = await axios.get(endpoint);
    const results = response.data.results.slice(0, 10);
    
    // Format results and return with flag indicating live data
    return {
      data: results.map(item => {
        const isTV = category === 'series';
        return {
          title: isTV ? item.name : item.title,
          year: isTV ? 
            (item.first_air_date ? new Date(item.first_air_date).getFullYear() : 'N/A') : 
            (item.release_date ? new Date(item.release_date).getFullYear() : 'N/A'),
          genre: item.genre_ids ? getGenreNames(item.genre_ids, isTV) : 'N/A',
          poster: item.poster_path ? `${posterBase}${item.poster_path}` : ''
        };
      }),
      usingFallback: false
    };
  } catch (error) {
    console.error('Error fetching from TMDB:', error.message);
    // On error, return fallback data
    const fallbackData = getFallbackTop10Data();
    return {
      data: fallbackData[category] || fallbackData.movies,
      usingFallback: true,
      error: 'Could not connect to TMDB. Showing sample data.'
    };
  }
});

// Helper function to convert genre IDs to names
function getGenreNames(genreIds, isTV = false) {
  const movieGenres = {
    28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
    99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
    27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi',
    10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western'
  };
  
  const tvGenres = {
    10759: 'Action & Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
    99: 'Documentary', 18: 'Drama', 10751: 'Family', 10762: 'Kids',
    9648: 'Mystery', 10763: 'News', 10764: 'Reality', 10765: 'Sci-Fi & Fantasy',
    10766: 'Soap', 10767: 'Talk', 10768: 'War & Politics', 37: 'Western'
  };
  
  const genres = isTV ? tvGenres : movieGenres;
  const names = genreIds.slice(0, 2).map(id => genres[id] || '').filter(Boolean);
  return names.join('/') || 'N/A';
}

// Get all Top 10 categories at once
ipcMain.handle('get-all-top10', async () => {
  const tmdbApiKey = store.get('tmdbApiKey', '');
  const country = store.get('country', 'BE');
  const categories = ['movies', 'series', 'action', 'scifi'];
  const results = {};
  
  // If no API key, return all fallback data
  if (!tmdbApiKey) {
    const fallbackData = getFallbackTop10Data();
    for (const category of categories) {
      results[category] = {
        data: fallbackData[category],
        usingFallback: true
      };
    }
    return results;
  }
  
  // Fetch data for each category
  for (const category of categories) {
    try {
      const posterBase = 'https://image.tmdb.org/t/p/w500';
      let endpoint;
      
      switch(category) {
        case 'movies':
          endpoint = `https://api.themoviedb.org/3/movie/popular?api_key=${tmdbApiKey}&region=${country}&language=en-US&page=1`;
          break;
        case 'series':
          endpoint = `https://api.themoviedb.org/3/tv/popular?api_key=${tmdbApiKey}&region=${country}&language=en-US&page=1`;
          break;
        case 'action':
          endpoint = `https://api.themoviedb.org/3/discover/movie?api_key=${tmdbApiKey}&region=${country}&with_genres=28&sort_by=popularity.desc&language=en-US&page=1`;
          break;
        case 'scifi':
          endpoint = `https://api.themoviedb.org/3/discover/movie?api_key=${tmdbApiKey}&region=${country}&with_genres=878&sort_by=popularity.desc&language=en-US&page=1`;
          break;
        default:
          endpoint = `https://api.themoviedb.org/3/movie/popular?api_key=${tmdbApiKey}&region=${country}&language=en-US&page=1`;
      }
      
      const response = await axios.get(endpoint);
      const items = response.data.results.slice(0, 10);
      
      // Format results
      results[category] = {
        data: items.map(item => {
          const isTV = category === 'series';
          return {
            title: isTV ? item.name : item.title,
            year: isTV ? 
              (item.first_air_date ? new Date(item.first_air_date).getFullYear() : 'N/A') : 
              (item.release_date ? new Date(item.release_date).getFullYear() : 'N/A'),
            genre: item.genre_ids ? getGenreNames(item.genre_ids, isTV) : 'N/A',
            poster: item.poster_path ? `${posterBase}${item.poster_path}` : ''
          };
        }),
        usingFallback: false
      };
    } catch (error) {
      console.error(`Error fetching ${category} from TMDB:`, error.message);
      // On error, return fallback data for this category
      const fallbackData = getFallbackTop10Data();
      results[category] = {
        data: fallbackData[category] || fallbackData.movies,
        usingFallback: true,
        error: 'Could not connect to TMDB. Showing sample data.'
      };
    }
  }
  
  return results;
});

// Open external links
ipcMain.handle('open-external', (event, url) => {
  shell.openExternal(url);
});

// Get app version
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});
