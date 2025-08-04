const { app, BrowserWindow, screen } = require('electron');

let overlayWindow;

function createStealthOverlay() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  overlayWindow = new BrowserWindow({
    width: 250,
    height: 80,
    x: width - 270,
    y: 20,
    
    // Maximum stealth configuration
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    minimizable: false,
    maximizable: false,
    closable: true,
    
    // Key exclusion settings
    hasShadow: false,
    opacity: 0.85,
    
    // Platform-specific stealth settings
    ...(process.platform === 'darwin' && {
      type: 'panel',
      titleBarStyle: 'hidden',
      vibrancy: 'under-window',
      visualEffectState: 'followsWindowActiveState',
    }),
    
    ...(process.platform === 'win32' && {
      type: 'toolbar',
      show: false
    }),
    
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      backgroundThrottling: false,
      offscreen: false  // Important: keep onscreen rendering
    }
  });

  overlayWindow.loadFile('stealth-overlay.html');

  // macOS specific exclusion attempts
  if (process.platform === 'darwin') {
    overlayWindow.once('ready-to-show', () => {
      try {
        // Try multiple window levels to find one that avoids capture
        overlayWindow.setAlwaysOnTop(true, 'pop-up-menu', 5);
        
        // Alternative: try floating window level
        setTimeout(() => {
          overlayWindow.setAlwaysOnTop(true, 'floating', 1);
        }, 1000);
        
        // Try content protection
        try {
          overlayWindow.setContentProtection(true);
          console.log('Content protection enabled');
        } catch (e) {
          console.log('Content protection not available');
        }
        
        overlayWindow.show();
      } catch (error) {
        console.log('macOS stealth setup failed:', error);
        overlayWindow.show();
      }
    });
  } else {
    overlayWindow.once('ready-to-show', () => {
      overlayWindow.show();
    });
  }

  // Simple drag implementation without remote
  overlayWindow.webContents.on('did-finish-load', () => {
    overlayWindow.webContents.executeJavaScript(`
      let isDragging = false;
      let startPos = { x: 0, y: 0 };
      
      document.addEventListener('mousedown', (e) => {
        isDragging = true;
        startPos = { x: e.screenX, y: e.screenY };
      });
      
      document.addEventListener('mousemove', (e) => {
        if (isDragging) {
          const deltaX = e.screenX - startPos.x;
          const deltaY = e.screenY - startPos.y;
          
          // Use IPC to move window
          require('electron').ipcRenderer.send('move-window', deltaX, deltaY);
          startPos = { x: e.screenX, y: e.screenY };
        }
      });
      
      document.addEventListener('mouseup', () => {
        isDragging = false;
      });
    `);
  });

  // Handle window movement
  const { ipcMain } = require('electron');
  ipcMain.on('move-window', (event, deltaX, deltaY) => {
    const bounds = overlayWindow.getBounds();
    overlayWindow.setBounds({
      x: bounds.x + deltaX,
      y: bounds.y + deltaY,
      width: bounds.width,
      height: bounds.height
    });
  });

  overlayWindow.on('closed', () => {
    overlayWindow = null;
  });
}

app.whenReady().then(() => {
  createStealthOverlay();
  
  // Hide from dock on macOS
  if (process.platform === 'darwin') {
    app.dock?.hide();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createStealthOverlay();
  }
});
