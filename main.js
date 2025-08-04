const { app, BrowserWindow, screen } = require('electron');
const path = require('path');
const nativeHelper = require('./native-helper');

let overlayWindow;

function createOverlayWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  overlayWindow = new BrowserWindow({
    width: 300,
    height: 100,
    x: width - 320,  // Position in top-right corner
    y: 20,
    frame: false,           // Remove window frame
    transparent: true,      // Make window background transparent
    alwaysOnTop: true,     // Keep window on top
    skipTaskbar: true,     // Don't show in taskbar
    resizable: false,
    movable: true,
    minimizable: false,
    maximizable: false,
    closable: true,
    
    // Enhanced screen capture exclusion attempts
    enableLargerThanScreen: false,
    hasShadow: false,
    opacity: 0.95,         // Slightly transparent
    
    // Try to exclude from screen capture
    ...(process.platform === 'darwin' && {
      // macOS: Use kiosk mode and special window levels
      type: 'panel',
      titleBarStyle: 'hidden',
      vibrancy: 'popover',
      visualEffectState: 'active',
      acceptFirstMouse: true,
      disableAutoHideCursor: true
    }),
    
    ...(process.platform === 'win32' && {
      // Windows: Use tool window type
      type: 'toolbar',
      parent: null,
      modal: false,
      show: false
    }),
    
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      backgroundThrottling: false
    },
    
    // Platform-specific exclusion flags
    ...process.platform === 'darwin' ? {
      // macOS specific flags
      titleBarStyle: 'customButtonsOnHover',
      vibrancy: 'ultra-dark',
      visualEffectState: 'active'
    } : {},
    
    ...process.platform === 'win32' ? {
      // Windows specific flags
      skipTaskbar: true,
      show: false  // Will show manually after setting exclusion
    } : {}
  });

  // Load the HTML content
  overlayWindow.loadFile('overlay-advanced.html');

  // Platform-specific screen capture exclusion
  if (process.platform === 'darwin') {
    // macOS: Advanced exclusion techniques
    try {
      // Set special window level that excludes from most screen capture
      overlayWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
      overlayWindow.setAlwaysOnTop(true, 'pop-up-menu', 1);
      
      // Try to set the window as non-recordable (requires newer Electron versions)
      try {
        overlayWindow.setContentProtection(true);
      } catch (e) {
        console.log('Content protection not available:', e.message);
      }
      
      // Additional macOS-specific exclusion using native helper
      overlayWindow.once('ready-to-show', () => {
        try {
          const nativeHandle = overlayWindow.getNativeWindowHandle();
          if (nativeHandle && nativeHelper.available) {
            const success = nativeHelper.setMacOSWindowNonCapturable(nativeHandle);
            console.log('Native macOS exclusion result:', success);
          }
          
          // Alternative approach: Use very specific window level
          overlayWindow.setAlwaysOnTop(true, 'torn-off-menu', 2);
          
        } catch (e) {
          console.log('Native handle access failed:', e);
        }
      });
      
    } catch (error) {
      console.log('macOS exclusion failed:', error);
    }
  }

  if (process.platform === 'win32') {
    // Windows: Enhanced exclusion techniques
    overlayWindow.once('ready-to-show', () => {
      try {
        // Set window as layered and exclude from capture
        overlayWindow.setSkipTaskbar(true);
        overlayWindow.show();
        
        // Try to use Windows-specific exclusion
        const hwnd = overlayWindow.getNativeWindowHandle();
        if (hwnd) {
          console.log('Windows handle obtained for exclusion attempts');
          // Note: Full implementation would require native Windows API calls
          // to set WDA_EXCLUDEFROMCAPTURE flag
        }
      } catch (error) {
        console.log('Windows exclusion failed:', error);
        overlayWindow.show();
      }
    });
  } else {
    // For other platforms, show immediately
    overlayWindow.once('ready-to-show', () => {
      overlayWindow.show();
    });
  }

  // Make window draggable
  overlayWindow.webContents.on('did-finish-load', () => {
    overlayWindow.webContents.executeJavaScript(`
      const { ipcRenderer } = require('electron');
      let isDragging = false;
      let dragOffset = { x: 0, y: 0 };
      
      document.addEventListener('mousedown', (e) => {
        isDragging = true;
        dragOffset.x = e.clientX;
        dragOffset.y = e.clientY;
      });
      
      document.addEventListener('mousemove', (e) => {
        if (isDragging) {
          const { screen } = require('electron').remote || require('@electron/remote');
          const currentWindow = require('electron').remote?.getCurrentWindow() || 
                               require('@electron/remote').getCurrentWindow();
          const bounds = currentWindow.getBounds();
          currentWindow.setBounds({
            x: bounds.x + e.clientX - dragOffset.x,
            y: bounds.y + e.clientY - dragOffset.y,
            width: bounds.width,
            height: bounds.height
          });
        }
      });
      
      document.addEventListener('mouseup', () => {
        isDragging = false;
      });
    `);
  });

  // Development: Open DevTools
  if (process.env.NODE_ENV === 'development') {
    overlayWindow.webContents.openDevTools({ mode: 'detach' });
  }

  overlayWindow.on('closed', () => {
    overlayWindow = null;
  });
}

app.whenReady().then(() => {
  createOverlayWindow();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createOverlayWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Additional attempt to exclude from screen capture on macOS
if (process.platform === 'darwin') {
  app.on('ready', () => {
    try {
      // Set app to not appear in screen recordings
      app.dock?.hide();
    } catch (error) {
      console.log('Dock hide failed:', error);
    }
  });
}
