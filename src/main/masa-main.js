const { app, BrowserWindow, screen, globalShortcut, ipcMain } = require('electron');
const screenshot = require('screenshot-desktop');
const Tesseract = require('tesseract.js');
const Jimp = require('jimp');
const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

let overlayWindow;
let isProcessing = false;
let currentSettings = {
  apiKey: process.env.OPENAI_API_KEY || '',
  claudeApiKey: process.env.ANTHROPIC_API_KEY || '',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  model: 'gemini-auto', // Default to Gemini auto-selection
  provider: 'gemini', // Default to Gemini (free option)
  hotkey: 'Ctrl+Shift+J', // Default hotkey in user-friendly format
  language: 'python' // Default programming language for solutions
};

// Initialize AI clients
let openai = null;
let anthropic = null;

function initializeAIClients() {
  // Initialize OpenAI if key is available
  if (currentSettings.apiKey && currentSettings.apiKey !== 'your-api-key-here') {
    openai = new OpenAI({
      apiKey: currentSettings.apiKey
    });
  }
  
  // Initialize Claude if key is available
  if (currentSettings.claudeApiKey && currentSettings.claudeApiKey !== 'your-claude-api-key-here') {
    anthropic = new Anthropic({
      apiKey: currentSettings.claudeApiKey
    });
  }
}

// Load settings from environment variables only
function loadSettings() {
  // Settings are already loaded from environment variables in currentSettings
  // No file loading needed - API keys only exist in memory
  initializeAIClients();
}

// Settings are kept in memory only - no file saving
function saveSettings() {
  // API keys are only kept in memory for security
  // No persistent storage of any data
}

// Convert user-friendly hotkey to Electron format
function convertHotkeyToElectron(hotkey) {
  return hotkey
    .replace(/\bCtrl\b/g, 'Control') // Map Ctrl specifically to Control (not CommandOrControl)
    .replace(/\bCmd\b/g, 'CommandOrControl') // Map Cmd to CommandOrControl for cross-platform
    .replace(/\s/g, '') // Remove spaces
    .replace(/\+/g, '+'); // Ensure proper format
}

// Register global hotkey dynamically
function registerHotkey() {
  // Unregister existing hotkey
  globalShortcut.unregisterAll();
  
  // Convert user-friendly format to Electron format
  const electronHotkey = convertHotkeyToElectron(currentSettings.hotkey);
  
  // Register new hotkey
  const registered = globalShortcut.register(electronHotkey, () => {
    console.log(`Hotkey triggered: ${currentSettings.hotkey}`);
    
    if (overlayWindow) {
      if (overlayWindow.isVisible()) {
        captureAndAnalyzeScreen();
      } else {
        overlayWindow.show();
        setTimeout(() => captureAndAnalyzeScreen(), 500);
      }
    }
  });
  
  if (!registered) {
    console.log('Global shortcut registration failed for:', currentSettings.hotkey, '(', electronHotkey, ')');
    return false;
  }
  
  return true;
}

function createMasaOverlay() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  overlayWindow = new BrowserWindow({
    width: 450,
    height: 350,
    x: width - 470,
    y: 20,
    
    // Stealth configuration
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: true,
    minimizable: false,
    maximizable: false,
    closable: true,
    
    // Screen capture exclusion
    hasShadow: false,
    opacity: 0.92,
    
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
      enableRemoteModule: true
    }
  });

  overlayWindow.loadFile(path.join(__dirname, '../renderer/masa-overlay.html'));

  // Handle window close event - terminate the entire application
  overlayWindow.on('closed', () => {
    console.log('Overlay window closed, terminating application...');
    globalShortcut.unregisterAll();
    app.quit();
  });

  // Platform-specific exclusion setup
  if (process.platform === 'darwin') {
    overlayWindow.once('ready-to-show', () => {
      try {
        overlayWindow.setAlwaysOnTop(true, 'floating', 1);
        overlayWindow.setContentProtection(true);
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

  // Window dragging
  overlayWindow.webContents.on('did-finish-load', () => {
    overlayWindow.webContents.executeJavaScript(`
      let isDragging = false;
      let startPos = { x: 0, y: 0 };
      
      document.querySelector('.titlebar').addEventListener('mousedown', (e) => {
        isDragging = true;
        startPos = { x: e.screenX, y: e.screenY };
      });
      
      document.addEventListener('mousemove', (e) => {
        if (isDragging) {
          const deltaX = e.screenX - startPos.x;
          const deltaY = e.screenY - startPos.y;
          require('electron').ipcRenderer.send('move-window', deltaX, deltaY);
          startPos = { x: e.screenX, y: e.screenY };
        }
      });
      
      document.addEventListener('mouseup', () => {
        isDragging = false;
      });
    `);
  });
}

// Screen capture and analysis functions
async function captureAndAnalyzeScreen() {
  if (isProcessing) {
    console.log('Already processing...');
    return;
  }
  
  isProcessing = true;
  
  try {
    // Update overlay to show processing
    overlayWindow.webContents.send('update-status', 'Capturing screen...');
    
    // Take screenshot
    const imgBuffer = await screenshot({ format: 'png' });
    
    // Process image with Jimp to improve OCR
    const image = await Jimp.read(imgBuffer);
    
    // Enhance image for better OCR
    image.contrast(0.3).normalize();
    
    // Get image buffer for OCR
    const processedBuffer = await image.getBufferAsync(Jimp.MIME_PNG);
    
    overlayWindow.webContents.send('update-status', 'Reading text from screen...');
    
    // Extract text using Tesseract
    const { data: { text } } = await Tesseract.recognize(processedBuffer, 'eng', {
      logger: m => console.log(m)
    });
    
    console.log('Extracted text:', text);
    
    // Detect if this looks like a coding problem
    const isLeetCodeProblem = detectCodingProblem(text);
    
    if (isLeetCodeProblem) {
      overlayWindow.webContents.send('update-status', 'Analyzing coding problem...');
      
      // Send to AI for solution
      const solution = await getSolutionFromAI(text);
      
      // Display solution in overlay
      overlayWindow.webContents.send('show-solution', solution);
    } else {
      overlayWindow.webContents.send('update-status', 'No coding problem detected');
      overlayWindow.webContents.send('show-solution', {
        message: 'No LeetCode-style problem detected on screen',
        text: text.substring(0, 200) + '...'
      });
    }
    
  } catch (error) {
    console.error('Error in screen analysis:', error);
    overlayWindow.webContents.send('update-status', 'Error occurred');
    overlayWindow.webContents.send('show-solution', {
      error: error.message
    });
  } finally {
    isProcessing = false;
  }
}

function detectCodingProblem(text) {
  const codingKeywords = [
    'leetcode', 'function', 'algorithm', 'solution', 'example',
    'input:', 'output:', 'constraints:', 'return', 'array',
    'string', 'integer', 'complexity', 'time complexity',
    'space complexity', 'follow up', 'note:'
  ];
  
  const lowercaseText = text.toLowerCase();
  const keywordMatches = codingKeywords.filter(keyword => 
    lowercaseText.includes(keyword)
  ).length;
  
  // If we find multiple coding-related keywords, likely a coding problem
  return keywordMatches >= 3;
}

async function getSolutionFromAI(problemText) {
  try {
    const isClaudeModel = currentSettings.model.includes('claude') || currentSettings.provider === 'claude';
    const isGeminiModel = currentSettings.provider === 'gemini';
    
    if (isGeminiModel) {
      return await getSolutionFromGemini(problemText);
    } else if (isClaudeModel) {
      return await getSolutionFromClaude(problemText);
    } else {
      return await getSolutionFromOpenAI(problemText);
    }
  } catch (error) {
    console.error('AI API error:', error);
    return {
      error: `Failed to get AI solution: ${error.message}`,
      fallback: generateFallbackSolution(problemText)
    };
  }
}

async function getSolutionFromClaude(problemText) {
  try {
    if (!anthropic) {
      throw new Error('Claude API not configured. Please set your Anthropic API key in settings.');
    }

    const prompt = `You are an expert programmer analyzing a LeetCode/coding problem. Please provide a comprehensive solution.

Extracted problem text:
${problemText}

Please provide a solution specifically in ${currentSettings.language.toUpperCase()} with the following requirements:

1. **Problem Understanding**: Brief explanation of what the problem is asking
2. **Multiple Solution Approaches**: 
   - **Approach 1 - Initial/Brute Force**: A straightforward but not necessarily optimal solution that shows natural problem-solving progression
   - **Approach 2 - Optimized**: The more efficient solution with better time/space complexity
3. **Clean Code Solutions**: 
   - Use descriptive, meaningful variable names (no single letters like 'i', 'j', 'x', 'y')
   - Add comprehensive comments explaining each step
   - Use clear function/method names that describe what they do
   - Make the code as readable and self-documenting as possible
4. **Complexity Analysis**: Time and space complexity for each approach with detailed explanations
5. **Key Insights**: Important patterns or techniques used, and why the optimization works

Code Style Requirements:
- Variable names should be descriptive (e.g., 'leftPointer' instead of 'l', 'targetSum' instead of 's')
- Add inline comments explaining the logic
- Use meaningful function names
- Structure the code for maximum readability
- Show the thought process from basic to optimized solution

Format your response clearly with markdown formatting for easy reading. Present solutions in order from basic to optimal to demonstrate natural problem-solving progression.`;

    const response = await anthropic.messages.create({
      model: currentSettings.model || 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      temperature: 0.3,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    return {
      solution: response.content[0].text,
      originalText: problemText.substring(0, 300),
      provider: 'Claude',
      model: currentSettings.model
    };
    
  } catch (error) {
    console.error('Claude API error:', error);
    
    let errorMessage = 'Claude API Error occurred';
    
    if (error.message.includes('API key') || error.status === 401) {
      errorMessage = 'Invalid or missing Claude API key. Please configure in settings (⚙️).';
    } else if (error.status === 403) {
      errorMessage = 'Claude API access denied. Check your API key permissions.';
    } else if (error.status === 429) {
      errorMessage = 'Claude API rate limit exceeded. Please wait and try again.';
    } else if (error.status === 402) {
      errorMessage = 'Claude API quota exceeded. Check your Anthropic account billing.';
    } else {
      errorMessage = `Claude API Error: ${error.message}`;
    }
    
    throw new Error(errorMessage);
  }
}

async function getSolutionFromOpenAI(problemText) {
  try {
    if (!openai) {
      throw new Error('OpenAI not configured. Please set your API key in settings.');
    }

    const prompt = `
You are an expert programmer. I've extracted this text from a LeetCode/coding problem screen. 
Please analyze it and provide a solution.

Extracted text:
${problemText}

Please provide a solution specifically in ${currentSettings.language.toUpperCase()} with these requirements:

1. **Problem Explanation**: Brief explanation of what the problem is asking
2. **Multiple Solution Approaches**: 
   - **Approach 1 - Basic/Intuitive**: A straightforward solution that comes naturally when first thinking about the problem (may not be optimal)
   - **Approach 2 - Optimized**: A more efficient solution with better time/space complexity
3. **Clean, Human-Readable Code Solutions**: 
   - Use descriptive, meaningful variable names (avoid single letters like 'i', 'j', 'x', 'y')
   - Add comprehensive comments explaining each step and logic
   - Use clear function/method names that describe their purpose
   - Make the code as readable and self-documenting as possible
4. **Time and Space Complexity**: Detailed analysis with explanations for each approach
5. **Key Insights**: Important patterns or techniques used, and progression from basic to optimized

Code Style Requirements:
- Variable names must be descriptive (e.g., 'currentIndex' instead of 'i', 'targetValue' instead of 'x')
- Add inline comments explaining the reasoning behind each step
- Use meaningful function names that clearly indicate what they do
- Structure the code for maximum readability and maintainability
- Include comments for complex logic or algorithms
- Show natural problem-solving progression from intuitive to optimal

Format your response in a structured way that's easy to read. Start with the more obvious solution first, then show the optimization.
`;

    const response = await openai.chat.completions.create({
      model: currentSettings.model || "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1500,
      temperature: 0.3
    });

    return {
      solution: response.choices[0].message.content,
      originalText: problemText.substring(0, 300),
      provider: 'OpenAI',
      model: currentSettings.model
    };
    
  } catch (error) {
    console.error('OpenAI API error:', error);
    
    let errorMessage = 'API Error occurred';
    
    if (error.message.includes('API key')) {
      errorMessage = 'Invalid or missing API key. Please configure in settings (⚙️).';
    } else if (error.message.includes('404') && error.message.includes('model')) {
      errorMessage = 'Model not available. Try GPT-3.5 Turbo in settings (⚙️).';
    } else if (error.message.includes('insufficient_quota')) {
      errorMessage = 'API quota exceeded. Check your OpenAI account.';
    } else if (error.message.includes('rate_limit')) {
      errorMessage = 'Rate limit exceeded. Please wait and try again.';
    } else {
      errorMessage = `API Error: ${error.message}`;
    }
    
    throw new Error(errorMessage);
  }
}

async function getSolutionFromGemini(problemText) {
  try {
    if (!currentSettings.geminiApiKey || currentSettings.geminiApiKey === 'your-gemini-api-key-here') {
      throw new Error('Gemini API key not configured. Please set your Gemini API key in settings.');
    }

    // Use the Python CLI to call Gemini
    const { promisify } = require('util');
    const execAsync = promisify(require('child_process').exec);
    
    const command = `python3 "${path.join(__dirname, '../utils/gemini-cli.py')}" --prompt "${problemText.replace(/"/g, '\\"')}" --language "${currentSettings.language}"`;
    
    // Set the API key as environment variable for the subprocess
    const env = { ...process.env, GEMINI_API_KEY: currentSettings.geminiApiKey };
    
    const { stdout, stderr } = await execAsync(command, { env, timeout: 30000 });
    
    if (stderr) {
      console.warn('Gemini CLI stderr:', stderr);
    }
    
    const result = JSON.parse(stdout);
    
    if (!result.success) {
      throw new Error(result.error || 'Gemini API error');
    }

    return {
      solution: result.content,
      originalText: problemText.substring(0, 300),
      provider: 'Gemini',
      model: result.model || 'gemini-1.5-flash'
    };
    
  } catch (error) {
    console.error('Gemini API error:', error);
    
    let errorMessage = 'Gemini API Error occurred';
    
    if (error.message.includes('API key')) {
      errorMessage = 'Invalid or missing Gemini API key. Please configure in settings (⚙️).';
    } else if (error.message.includes('ENOENT') || error.message.includes('python3')) {
      errorMessage = 'Python3 or Gemini CLI not found. Please install dependencies.';
    } else if (error.message.includes('timeout')) {
      errorMessage = 'Gemini API timeout. Please try again.';
    } else {
      errorMessage = `Gemini Error: ${error.message}`;
    }
    
    throw new Error(errorMessage);
  }
}

function generateFallbackSolution(text) {
  // Enhanced pattern matching for common problems
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('two sum')) {
    return `
# Two Sum Problem - Multiple Approaches

## Approach 1: Brute Force (Initial Intuitive Solution)

\`\`\`javascript
function twoSumBruteForce(nums, target) {
    // Check every pair of numbers to see if they sum to target
    for (let firstIndex = 0; firstIndex < nums.length; firstIndex++) {
        for (let secondIndex = firstIndex + 1; secondIndex < nums.length; secondIndex++) {
            const currentSum = nums[firstIndex] + nums[secondIndex];
            if (currentSum === target) {
                return [firstIndex, secondIndex];
            }
        }
    }
    return []; // No solution found
}
\`\`\`

**Time Complexity:** O(n²) - nested loops  
**Space Complexity:** O(1) - only using variables

## Approach 2: Hash Map Optimization

\`\`\`javascript
function twoSumOptimized(nums, target) {
    const numberToIndexMap = new Map();
    
    for (let currentIndex = 0; currentIndex < nums.length; currentIndex++) {
        const currentNumber = nums[currentIndex];
        const neededNumber = target - currentNumber;
        
        // Check if we've seen the number we need before
        if (numberToIndexMap.has(neededNumber)) {
            return [numberToIndexMap.get(neededNumber), currentIndex];
        }
        
        // Store current number and its index for future lookups
        numberToIndexMap.set(currentNumber, currentIndex);
    }
    return []; // No solution found
}
\`\`\`

**Time Complexity:** O(n) - single pass  
**Space Complexity:** O(n) - hash map storage

**Key Insight:** Trade space for time by using a hash map to avoid nested loops.
`;
  }
  
  if (lowerText.includes('reverse') && lowerText.includes('linked list')) {
    return `
# Reverse Linked List - Multiple Approaches

## Approach 1: Iterative (Most Common Interview Solution)

\`\`\`javascript
function reverseListIterative(head) {
    let previousNode = null;
    let currentNode = head;
    
    // Traverse the list and reverse pointers as we go
    while (currentNode !== null) {
        let nextNode = currentNode.next; // Save the next node
        currentNode.next = previousNode; // Reverse the pointer
        previousNode = currentNode;      // Move previous forward
        currentNode = nextNode;          // Move current forward
    }
    
    return previousNode; // previousNode is now the new head
}
\`\`\`

**Time Complexity:** O(n) - visit each node once  
**Space Complexity:** O(1) - only using pointers

## Approach 2: Recursive (More Advanced)

\`\`\`javascript
function reverseListRecursive(head) {
    // Base case: empty list or single node
    if (head === null || head.next === null) {
        return head;
    }
    
    // Recursively reverse the rest of the list
    let reversedHead = reverseListRecursive(head.next);
    
    // Reverse the current connection
    head.next.next = head;
    head.next = null;
    
    return reversedHead;
}
\`\`\`

**Time Complexity:** O(n) - visit each node once  
**Space Complexity:** O(n) - recursion stack

**Interview Tip:** Start with iterative approach as it's more intuitive and has better space complexity.
`;
  }
  
  if (lowerText.includes('valid parentheses') || lowerText.includes('balanced')) {
    return `
# Valid Parentheses Solution

## JavaScript:
\`\`\`javascript
function isValid(s) {
    const stack = [];
    const pairs = { ')': '(', '}': '{', ']': '[' };
    
    for (let char of s) {
        if (char === '(' || char === '{' || char === '[') {
            stack.push(char);
        } else if (char === ')' || char === '}' || char === ']') {
            if (stack.pop() !== pairs[char]) {
                return false;
            }
        }
    }
    
    return stack.length === 0;
}
\`\`\`

**Time Complexity:** O(n)  
**Space Complexity:** O(n)
`;
  }
  
  return `
# Pattern-Based Solution Template

Based on the detected text, this appears to be a coding problem. Here's a general approach:

## General Strategy:
1. **Understand the problem** - What are the inputs/outputs?
2. **Identify patterns** - Array, string, tree, graph problem?
3. **Choose data structure** - Hash map, stack, queue, etc.
4. **Implement solution** - Start with brute force, then optimize

## Common Patterns:
- **Two Pointers**: For sorted arrays, palindromes
- **Sliding Window**: For subarray/substring problems  
- **Hash Map**: For counting, lookups, complements
- **Stack**: For parentheses, parsing, DFS
- **Queue**: For BFS, level-order traversal

**Note:** Configure your OpenAI API key in settings (⚙️) for detailed AI solutions.
`;
}

// Handle IPC messages
ipcMain.on('move-window', (event, deltaX, deltaY) => {
  if (overlayWindow) {
    const bounds = overlayWindow.getBounds();
    overlayWindow.setBounds({
      x: bounds.x + deltaX,
      y: bounds.y + deltaY,
      width: bounds.width,
      height: bounds.height
    });
  }
});

ipcMain.on('trigger-analysis', () => {
  captureAndAnalyzeScreen();
});

ipcMain.on('hide-overlay', () => {
  if (overlayWindow) {
    overlayWindow.hide();
  }
});

ipcMain.on('show-overlay', () => {
  if (overlayWindow) {
    overlayWindow.show();
  }
});

ipcMain.on('close-application', () => {
  console.log('Close application requested via IPC');
  globalShortcut.unregisterAll();
  app.quit();
});

ipcMain.on('get-settings', (event) => {
  event.reply('settings-loaded', currentSettings);
});

ipcMain.on('save-settings', (event, settings) => {
  currentSettings.apiKey = settings.apiKey || currentSettings.apiKey;
  currentSettings.claudeApiKey = settings.claudeApiKey || currentSettings.claudeApiKey;
  currentSettings.geminiApiKey = settings.geminiApiKey || currentSettings.geminiApiKey;
  currentSettings.model = settings.model;
  currentSettings.provider = settings.provider || 'openai';
  currentSettings.language = settings.language || 'python';
  
  // Update hotkey if provided
  if (settings.hotkey && settings.hotkey !== currentSettings.hotkey) {
    currentSettings.hotkey = settings.hotkey;
    // Re-register the hotkey with new combination
    registerHotkey();
  }
  
  saveSettings();
  initializeAIClients();
});

ipcMain.on('test-api-key', async (event, testData) => {
  try {
    const { apiKey, provider, model } = testData;
    
    if (provider === 'claude') {
      const testAnthropic = new Anthropic({ apiKey });
      
      const response = await testAnthropic.messages.create({
        model: model || 'claude-3-5-sonnet-20241022',
        max_tokens: 20,
        messages: [{
          role: 'user',
          content: 'Say "Claude API test successful"'
        }]
      });
      
      event.reply('api-test-result', { success: true, provider: 'Claude' });
    } else if (provider === 'gemini') {
      // Test Gemini using the CLI
      const { promisify } = require('util');
      const execAsync = promisify(require('child_process').exec);
      
      const command = `python3 "${path.join(__dirname, '../utils/gemini-cli.py')}" --test`;
      const env = { ...process.env, GEMINI_API_KEY: apiKey };
      
      const { stdout } = await execAsync(command, { env, timeout: 10000 });
      const result = JSON.parse(stdout);
      
      if (result.success) {
        event.reply('api-test-result', { success: true, provider: 'Gemini' });
      } else {
        throw new Error(result.error || 'Gemini test failed');
      }
    } else {
      const testOpenAI = new OpenAI({ apiKey });
      
      const response = await testOpenAI.chat.completions.create({
        model: model || 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Say "API key test successful"' }],
        max_tokens: 10
      });
      
      event.reply('api-test-result', { success: true, provider: 'OpenAI' });
    }
  } catch (error) {
    event.reply('api-test-result', { 
      success: false, 
      error: error.message,
      provider: testData.provider 
    });
  }
});

app.whenReady().then(() => {
  loadSettings(); // Load settings first
  createMasaOverlay();
  
  // Register global hotkey
  registerHotkey();
  
  // Hide from dock on macOS
  if (process.platform === 'darwin') {
    app.dock?.hide();
  }
});

app.on('window-all-closed', () => {
  // Always quit the application when all windows are closed
  // This makes sense for a utility app like Masa
  globalShortcut.unregisterAll();
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMasaOverlay();
  }
});

app.on('will-quit', () => {
  // Unregister all shortcuts
  globalShortcut.unregisterAll();
});
