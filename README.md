# Loveflix 💕

"Because even horror movies get a happily ever after... and everything is better with a romantic twist!"

So, it's Valentine's Day. You’re all set for an epic action movie night—popcorn in hand, ready to witness explosions, car chases, and maybe even a few well-timed one-liners. But then... disaster strikes.

"Can we watch something romantic instead?" 😱

Your dreams of high-speed pursuits are about to be replaced by slow-motion hand-holding. But wait! That’s where Romantic Movie Maker saves the day!

Simply enter your favorite movie title, and BOOM—we sprinkle some heart-shaped magic dust on it, turning it into the most romantic film ever.

Die Hard? Now it's Love Hard—a tender tale of a man desperately trying to reunite with his true love on Christmas Eve.
Mad Max? It’s now Madly in Love Max—a post-apocalyptic romance where fuel is scarce, but love is eternal.
Terminator? Welcome to I’ll Be Back… for You—a heartwarming story about an AI learning to love.
Not only does this app generate a romantic title and summary, but it also creates a romanticized movie poster! Impress your partner with a film that feels romantic—even if it still has a few explosions.

Your movie night is saved. Your relationship is thriving. You’re welcome. 🎩💖

## 🖥️ Desktop App (NEW!)

LoveFlix is now available as a **Netflix-styled desktop application** for Windows and macOS!

### Desktop Features
- 🎨 **Beautiful Netflix-inspired UI** - Dark theme with romantic accents
- 🎬 **Transform Any Movie** - Enter any title and get instant romanticization
- 🎭 **40+ Romantic Poster Styles** - Each poster uses a randomly selected aesthetic from our diverse collection:
  - Sunset & warm tones (Golden Hour, Amber Dream, Sunrise Promise)
  - Ocean & water themes (Moonlit Waves, Tropical Paradise, Underwater Love)
  - Nature & gardens (Cherry Blossoms, Autumn Embrace, Lavender Fields)
  - Winter wonderlands (Northern Lights, Ice Palace, Fireside Glow)
  - Urban romance (City Lights, Rain-Kissed, Neon Dreams)
  - Classic & vintage (Victorian Dreams, French Riviera, Art Deco)
  - Fantasy & magical (Fairytale Castle, Ethereal Mist, Enchanted Forest)
  - And many more artistic styles!
- 📺 **Live Top 10 from TMDB** - Real-time popular movies and shows by country
- 🌍 **Country-Specific Top 10** - Select your country to see region-specific trending content
- 📈 **Romanticize All 10** - Transform an entire Top 10 category at once with a single click
- 💾 **Netflix-Style Collection** - Your collection now features:
  - 🎬 Hero banner with featured movie
  - 📁 Smart romantic subcategories (Passionate Dramas, Star-Crossed Lovers, Action Romance, Fantasy Love, etc.)
  - 📺 Horizontal scrolling rows like Netflix
  - 🏆 Top 10 collections with ranking display
- 🤖 **Multiple AI Models** - Choose from DALL-E 2/3, GPT Image 1/1.5/Mini, GPT-5.2/Mini/Nano
- 🌍 **Full Internationalization** - UI and content in 10+ languages (English, Dutch, French, Spanish, German, Italian, Portuguese, Japanese, Korean, Chinese)
- ⚙️ **Customizable Settings** - Pick your preferred AI models, language, and region

### API Keys Required

1. **OpenAI API Key** (Required for movie transformation)
   - Get it from: https://platform.openai.com/api-keys
   - Used for: Generating romantic titles, summaries, and posters

2. **TMDB API Key** (Required for Top 10 feature)
   - Get it from: https://www.themoviedb.org/settings/api
   - Free registration required
   - Used for: Fetching popular movies and TV shows by country

Add both API keys in the app's Settings menu.

### Quick Start (Desktop)

**Windows:** Double-click `start-loveflix.bat`

**macOS/Linux:**
```bash
chmod +x start-loveflix.sh
./start-loveflix.sh
```

**Or manually:**
```bash
cd electron-app
npm install
npm start
```

### Build Installers

```bash
npm run build:win   # Windows installer
npm run build:mac   # macOS installer
```

See [electron-app/README.md](electron-app/README.md) for full documentation.

---

## Features (CLI Version)

Turn any movie title, summary & poster into a romantic masterpiece with our powerful and fun tools! 
Whether you're convincing your partner that Die Hard is a love story or just want a fresh twist on your favorite films, Loveflix has got you covered.

## Installation

To get started with Loveflix, follow these steps:

1. Clone the repository:
   ```
   git clone https://github.com/janvanwassenhove/LoveFlix.git
   cd Loveflix
   ```

2. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Set up your OpenAI API key. You can do this by exporting it as an environment variable:
   
   **Windows (PowerShell):**
   ```powershell
   $env:OPENAI_API_KEY='your_api_key_here'
   ```
   
   **Windows (CMD):**
   ```cmd
   set OPENAI_API_KEY=your_api_key_here
   ```
   
   **macOS/Linux:**
   ```bash
   export OPENAI_API_KEY='your_api_key_here'
   ```
   
   *Note: The Desktop App also allows you to enter the API key in Settings.*

## Usage

To run the application, execute the following command in your terminal:

```
python src/main.py
```

You will be prompted to enter the title of the movie you wish to romanticize. After entering the title, the application will process it and provide you with a romanticized title, summary, and an movie poster in the movies directory.

## 🔄 Auto-Update Feature

The desktop app includes automatic update functionality:

- **Automatic Checks**: App checks for updates on startup
- **In-App Notifications**: Get notified when new versions are available
- **One-Click Updates**: Download and install updates with a single click
- **Data Preservation**: All your settings, API keys, and collections are preserved during updates
- **Background Downloads**: Updates download in the background without interrupting your work

### User Data Location

Your data is safely stored in:
- **Windows**: `%APPDATA%\loveflix\`
- **macOS**: `~/Library/Application Support/loveflix/`

This data persists across all updates, ensuring you never lose your romantic movie collection!

## 🚀 For Developers: Creating Releases

Want to create a new release? See the [RELEASE.md](RELEASE.md) guide for detailed instructions.

Quick release:
```powershell
.\release.ps1 -Version "1.1.0" -CreateGitHubRelease
```

Or simply run and enter version when prompted:
```powershell
.\release.ps1 -CreateGitHubRelease
```

This will:
- Build installers for Windows and macOS (Intel + Apple Silicon)
- Create git tag and GitHub release
- Upload installers automatically
- Enable auto-update for users

## OpenAI API Integration

This application utilizes the OpenAI API to generate romanticized content. Ensure you have a valid API key and that you adhere to the usage policies set forth by OpenAI.

## Contributing

Contributions are welcome! If you have suggestions for improvements or new features, feel free to open an issue or submit a pull request.
