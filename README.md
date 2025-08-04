# Masa - Your Cute AI Coding Companion 🐱

A cute pet project that does what [Cluely](https://cluely.com/) does, but it's **100% open source and free**! 

This stealth desktop application captures your screen, detects coding problems, and provides AI-powered solutions - all while being invisible to screen capture and recording. Think of it as your adorable coding buddy that helps you learn and practice without breaking the bank.

## 🌟 Why Masa?

Ever heard of [Cluely](https://cluely.com/)? It's a pretty cool service that helps with coding interviews! But here's the thing - this cute little project does the same thing, except:

- 🆓 **Completely FREE** (just bring your own OpenAI API key!)
- 🔓 **Open Source** - peek under the hood, modify, contribute!
- 🐾 **Pet Project Vibes** - made with love, not corporate demands
- 🎨 **Customizable** - make it yours however you want!

It's like having a friendly coding mentor that lives in your computer and helps you learn - without the subscription fees! Perfect for students, learners, and anyone who wants to understand how these tools work.

## 🚀 Features

### Core Functionality
- **Screen Capture & OCR**: Captures and reads text from your screen using Tesseract.js
- **LeetCode Detection**: Automatically identifies coding problems and challenges
- **AI Solutions**: Uses OpenAI GPT-4 to provide detailed solutions with explanations
- **Global Hotkey**: Customizable hotkey (default: `Ctrl+Shift+J`) to trigger analysis from anywhere
- **Stealth Mode**: Invisible to screen sharing and recording (Google Meet, Zoom, etc.)

### UI Features
- **Draggable overlay** window that stays on top
- **Real-time status** updates during processing
- **Clean solution display** with syntax highlighting
- **Multiple window modes**: Basic, Advanced, and Masa modes

## 🎯 How to Use

### 1. Setup
```bash
# Install dependencies
npm install

# Download Tesseract language data for English
curl -L https://github.com/tesseract-ocr/tessdata/raw/main/eng.traineddata -o eng.traineddata

# Optional: Set environment variables (or use the UI)
cp .env.example .env
# Edit .env and add your API keys (optional - can be set in UI)
```

### 2. Run Masa
```bash
# Start the full AI-powered version
npm run masa

# Or start basic stealth demo
npm run stealth
```

### 3. Usage
1. **Open any coding platform** (LeetCode, HackerRank, etc.)
2. **Press your configured hotkey** (default: `Ctrl+Shift+J`) to capture and analyze the screen
3. **View the solution** in the overlay window
4. **Drag the window** by clicking the title bar
5. **Hide/show** using the minimize button

## 🧠 How It Works

### Screen Capture Exclusion
The application uses several techniques to avoid detection:

1. **Window Layer Manipulation**:
   - Transparent background with overlay content
   - Custom window levels and z-ordering
   - Platform-specific window flags

2. **macOS Specific**:
   - `setContentProtection(true)` for screen recording exclusion
   - `vibrancy` effects and special window types
   - Custom window levels (`floating`, `pop-up-menu`)

3. **Content Analysis Pipeline**:
   ```
   Screen Capture → Image Enhancement → OCR → Problem Detection → AI Analysis → Solution Display
   ```

### AI Processing
- **Text Extraction**: Uses Tesseract.js for OCR
- **Problem Detection**: Pattern matching for coding keywords
- **Solution Generation**: OpenAI GPT-4 provides detailed solutions
- **Fallback Solutions**: Built-in solutions for common problems

## 🔒 Security & Privacy

### API Key Protection
- **Memory-Only Storage**: API keys are never saved to disk
- **Environment Variables**: Load keys from `.env` file (optional)
- **UI Configuration**: Set keys through secure interface
- **No Persistent Files**: No sensitive data stored permanently

### Data Privacy
- **Local Processing**: All screen capture and OCR happens locally
- **Minimal Data Transfer**: Only extracted text sent to AI APIs
- **No Data Retention**: No conversation history or personal data stored

## 🎮 Controls

| Action | Method |
|--------|--------|
| **Analyze Screen** | `Customizable` (default: `Ctrl+Shift+J`) |
| **Move Window** | Drag title bar |
| **Hide Window** | Click minimize (−) button |
| **Close Window** | Click close (×) button or `Esc` |
| **Re-analyze** | Click 🔍 button |

## 🛠 Available Scripts

```bash
npm start          # Basic demo with "Hello World"
npm run stealth    # Enhanced stealth demo
npm run masa       # Full AI-powered Masa
npm run dev        # Development mode with logging
```

## 📋 Requirements

- **Node.js** 16+ 
- **Electron** 28+
- **OpenAI API Key** (for AI solutions)
- **macOS/Windows** (Linux support experimental)

## 🔧 Configuration

### Environment Variables (.env)
```env
OPENAI_API_KEY=your-actual-api-key-here
OPENAI_MODEL=gpt-4  # Optional: change AI model
CODING_KEYWORD_THRESHOLD=3  # Sensitivity for problem detection
```

### Supported Platforms
- ✅ **macOS**: Full stealth support with content protection
- ✅ **Windows**: Stealth support with toolbar window type
- ⚠️ **Linux**: Basic functionality (stealth features limited)

## 🧪 Testing Screen Capture Exclusion

1. **Start Masa**: `npm run masa`
2. **Open video call**: Google Meet, Zoom, Teams, etc.
3. **Start screen sharing**
4. **Trigger analysis**: Press your configured hotkey (default: `Ctrl+Shift+J`)
5. **Check if overlay is visible** to other participants

## ⚠️ Important Notes

- **Educational/Research Purpose**: This demonstrates screen capture exclusion techniques
- **API Key Required**: You need an OpenAI API key for AI solutions
- **Platform Differences**: Stealth effectiveness varies by platform and capture method
- **Permissions**: May require screen recording permissions on macOS

## 🎨 Architecture

```
├── main.js              # Basic demo
├── main-stealth.js      # Enhanced stealth demo  
├── masa-main.js         # Full AI application
├── masa-overlay.html    # AI assistant UI
├── stealth-overlay.html # Simple stealth overlay
└── overlay.html         # Basic overlay
```

## 🚨 Legal & Ethical Use

This adorable pet project is intended for:
- **Educational purposes** and learning how these systems work
- **Personal coding practice** and study sessions
- **Research into screen capture technologies**
- **Understanding AI-assisted coding** in a transparent way
- **Having fun with open source alternatives** to paid services

**Not intended for:**
- Cheating in actual interviews or exams
- Violating terms of service of coding platforms  
- Any unethical or unauthorized use

Remember: this is a learning tool made with love! Use it responsibly to **learn and grow**, not to cheat. The goal is to understand concepts better, just like having a study buddy. 🤝

---

*Made with ❤️ as a free, open-source alternative to expensive coding assistance services. Because learning should be accessible to everyone!*
