const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // Window controls
  minimize: () => ipcRenderer.invoke('window-minimize'),
  maximize: () => ipcRenderer.invoke('window-maximize'),
  close: () => ipcRenderer.invoke('window-close'),
  
  // Auto-updater
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  downloadUpdate: () => ipcRenderer.invoke('download-update'),
  installUpdate: () => ipcRenderer.invoke('install-update'),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  onUpdateAvailable: (callback) => ipcRenderer.on('update-available', (_, info) => callback(info)),
  onUpdateDownloadProgress: (callback) => ipcRenderer.on('update-download-progress', (_, progress) => callback(progress)),
  onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', (_, info) => callback(info)),
  onManualUpdateCheck: (callback) => ipcRenderer.on('manual-update-check', () => callback()),
  
  // About
  onShowAbout: (callback) => ipcRenderer.on('show-about', callback),
  
  // Settings
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  
  // Movies
  getSavedMovies: () => ipcRenderer.invoke('get-saved-movies'),
  saveMovie: (movie) => ipcRenderer.invoke('save-movie', movie),
  deleteMovie: (movieId) => ipcRenderer.invoke('delete-movie', movieId),
  
  // Top 10 Collections
  getTop10Collections: () => ipcRenderer.invoke('get-top10-collections'),
  saveTop10Collection: (collection) => ipcRenderer.invoke('save-top10-collection', collection),
  deleteTop10Collection: (collectionId) => ipcRenderer.invoke('delete-top10-collection', collectionId),
  
  // OpenAI
  getMovieInfo: (title) => ipcRenderer.invoke('get-movie-info', title),
  romanticizeMovie: (data) => ipcRenderer.invoke('romanticize-movie', data),
  generatePoster: (data) => ipcRenderer.invoke('generate-poster', data),
  generateTags: (data) => ipcRenderer.invoke('generate-tags', data),
  
  // Netflix
  getNetflixTop10: (category) => ipcRenderer.invoke('get-netflix-top10', category),
  getAllTop10: () => ipcRenderer.invoke('get-all-top10'),
  
  // External
  openExternal: (url) => ipcRenderer.invoke('open-external', url)
});
