# LoveFlix Electron Desktop App

A Netflix-styled desktop application that transforms any movie into a hyper-romantic masterpiece! 💕

## Quick Start

### Easy Launch (Recommended)

**Windows:** Double-click `start-loveflix.bat` in the project root

**macOS/Linux:**
```bash
chmod +x start-loveflix.sh
./start-loveflix.sh
```

### Manual Installation

#### Prerequisites
- Node.js 18+ installed
- OpenAI API key (for movie transformation)
- TMDB API key (for Top 10 feature)

#### Getting API Keys

1. **OpenAI API Key**
   - Visit: https://platform.openai.com/api-keys
   - Create an account or sign in
   - Generate a new API key
   - Copy and save it securely

2. **TMDB API Key** (Required for Top 10 feature)
   - Visit: https://www.themoviedb.org/signup
   - Create a free account
   - Go to: https://www.themoviedb.org/settings/api
   - Request an API key (choose "Developer" option)
   - Accept the terms and provide basic information
   - Copy your API key

#### Steps

```bash
# Navigate to the electron app directory
cd electron-app

# Install dependencies
npm install

# Start the app
npm start
```

### Building Installers

```bash
# Build for Windows
npm run build:win

# Build for macOS
npm run build:mac

# Build for both
npm run build:all
```

## Features

### 🎬 Transform Any Movie
Enter any movie title and watch as AI transforms it into a romantic masterpiece with:
- Romanticized title
- Romantic plot summary
- AI-generated romantic movie poster in one of 40+ diverse styles!

### 🎨 40+ Romantic Poster Styles
Each poster is randomly styled from our extensive collection, ensuring variety and uniqueness:

**☀️ Sunset & Warm Tones:**
- Golden Hour Passion, Amber Dream, Sunrise Promise

**🌊 Water & Ocean Themes:**
- Ocean Romance, Moonlit Waves, Tropical Paradise, Underwater Love

**🌸 Nature & Garden Settings:**
- Cherry Blossom Dreams, Enchanted Garden, Autumn Embrace, Lavender Fields, Wildflower Meadow

**❄️ Winter & Cold Weather:**
- Winter Wonderland Love, Northern Lights Romance, Fireside Glow, Ice Palace Dreams

**🌃 Urban & Modern:**
- City Lights Romance, Rain-Kissed Love, Art Deco Elegance, Neon Dreams

**📜 Classic & Vintage:**
- Vintage Romance, Victorian Dreams, French Riviera, Retro Drive-In

**✨ Night & Celestial:**
- Starlight Love, Milky Way Magic, Midnight Garden

**🏰 Fantasy & Magical:**
- Fairytale Castle, Ethereal Mist, Crystal Ballroom, Enchanted Forest

**🎭 Dramatic & Artistic:**
- Film Noir Romance, Renaissance Love, Watercolor Dreams, Gothic Romance

Each style includes unique color palettes, lighting, mood, and composition instructions to create visually stunning and diverse romantic posters!

### 📺 Live Top 10 from TMDB
Real-time popular movies and TV shows fetched from The Movie Database (TMDB) API based on your selected country:
- **Popular Movies** - Currently trending films in your region
- **Popular TV Shows** - Top series in your country
- **Action Movies** - Popular action films
- **Sci-Fi Movies** - Trending science fiction
- One-click romanticization or use **"Romanticize All 10"** to transform an entire category!

### 🌍 Country Selection
Choose your country in Settings to see region-specific Top 10 content. Default is Belgium, with support for:
- Belgium, United States, United Kingdom, Netherlands, France, Germany
- Spain, Italy, Portugal, Japan, South Korea, China
- Canada, Australia, India, Brazil, Mexico, and more!

### 💕 Romanticize All 10
Each Top 10 category (Movies, TV Shows, Action, Sci-Fi) has a dedicated "Romanticize All 10" button that:
- Transforms all 10 movies/shows in the category sequentially
- Generates romantic titles, summaries, and posters for each
- Automatically saves them to your collection
- Renames the genre to a romantic version (e.g., "Action Movies" → "Action Romance")
- Displays them in a special Top 10 card layout in your collection

### 💾 Personal Collection (Netflix-Style)
Your collection now features a beautiful Netflix-inspired layout:

**🎬 Featured Hero Section**
- Large hero banner showcasing a random movie from your collection
- Full-screen poster backdrop with gradient overlay
- Quick access buttons to watch on Netflix or view details

**📺 Romantic Top 10 Collections**
- Complete transformed categories with Netflix-style ranking display
- Horizontal scrolling rows with rank numbers

**📁 Smart Romantic Categories**
Individual movies are automatically organized into romantic subcategories:
- 🔥 **Passionate Dramas** - Intense emotional stories
- ⭐ **Star-Crossed Lovers** - Forbidden love and tragic romance
- 💪 **Action Romance** - Adventure meets love
- ✨ **Fantasy & Enchanted Love** - Magical romantic tales
- 🚀 **Sci-Fi Romance** - Love across space and time
- 🌙 **Gothic & Dark Romance** - Mysterious and atmospheric
- 😊 **Lighthearted Romance** - Fun and charming stories
- 💕 **Classic Love Stories** - Timeless romantic tales
- 🆕 **Recently Added** - Your newest additions

Movies can appear in multiple categories based on their themes!

### ⚙️ AI Model Selection
Choose from multiple OpenAI models:

**Image Generation:**
- DALL-E 3 (Best quality)
- DALL-E 2 (Faster)
- GPT Image 1.5 (Latest)
- GPT Image 1
- GPT Image 1 Mini (Fastest)

**Text Generation:**
- GPT-5.2 (Latest & Best, Default)
- GPT-5 Mini (Fast)
- GPT-5 Nano (Fastest)

### 🌍 Multi-Language Support
Generate romantic content in:
- English, Dutch, French, Spanish, German
- Italian, Portuguese, Japanese, Korean, Chinese

The entire UI is also translated based on your language selection! When you change the language in settings, all interface elements (navigation, buttons, messages, etc.) will automatically update to your chosen language.

## Configuration

### API Key Setup

The app supports two ways to provide your OpenAI API key:

1. **Environment Variable (Recommended for developers):**
   
   **Windows (PowerShell):**
   ```powershell
   $env:OPENAI_API_KEY='sk-your-key-here'
   ```
   
   **Windows (CMD):**
   ```cmd
   set OPENAI_API_KEY=sk-your-key-here
   ```
   
   **macOS/Linux:**
   ```bash
   export OPENAI_API_KEY='sk-your-key-here'
   ```

2. **Settings Panel:**
   - Launch the app
   - Click the ⚙️ Settings icon
   - Enter your API key
   - Save settings

*Note: Environment variable takes priority over saved settings.*

### Model Selection

1. Click the ⚙️ Settings icon
2. Select your preferred image and text models
3. Choose your language
4. Save settings

## Project Structure

```
electron-app/
├── main.js          # Main process (Electron)
├── preload.js       # Preload script (IPC bridge)
├── index.html       # Main UI
├── styles.css       # Netflix-style CSS
├── renderer.js      # Renderer process logic
├── package.json     # Dependencies & build config
└── assets/
    └── README.md    # Icon creation guide
```

## Tech Stack

- **Electron** - Cross-platform desktop framework
- **OpenAI API** - AI-powered text & image generation
- **electron-store** - Persistent settings storage
- **electron-builder** - Packaging & distribution

## Building Custom Icons

See `assets/README.md` for icon creation instructions.

## Troubleshooting

### API Key Issues
- Ensure your OpenAI API key has access to the selected models
- DALL-E 3 requires specific API access

### Build Issues
- Run `npm cache clean --force` and reinstall
- Ensure you have proper code signing certificates for macOS

## License

MIT
