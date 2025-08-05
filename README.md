# Masa: Open Source AI Coding Assistant - 100% FREE

Masa is an open source desktop application that provides AI-powered coding assistance, inspired by [Cluely](https://cluely.com/) but **completely free** and transparent. Masa leverages advanced AI models to analyze coding problems directly from your screen and deliver structured solutions, code samples, and key insights.

## 🆓 Truly Free AI Assistant

**Zero Cost Operation**: Masa is now 100% free using Google's Gemini API with generous limits:
- ✅ **1,000 requests per day** - Free forever
- ✅ **60 requests per minute** - No throttling for normal use  
- ✅ **No credit card required** - Get started immediately
- ✅ **Production-grade AI** - Gemini 2.5 Pro with automatic fallback

## 🎥 Live Demo

[![Masa Live Demo](https://img.youtube.com/vi/eSEKbUN8GqE/maxresdefault.jpg)](https://youtu.be/eSEKbUN8GqE)

*Click the image above to watch Masa in action*

## Features

- **🆓 100% Free Operation**: Uses Google Gemini API with 1,000 free requests daily - no costs, no limits for normal usage
- **Screen Capture & OCR**: Capture coding problems from your screen and extract text using OCR
- **AI-Powered Solutions**: Get detailed explanations, code samples (10+ languages), and complexity analysis using Gemini (default & free), OpenAI, or Claude models
- **Customizable Hotkey**: Default global hotkey (`Ctrl+Shift+J`) to trigger analysis, with the option to rebind
- **Cross-Platform Overlay**: Stealth overlay window designed for minimal distraction and screen sharing compatibility
- **No Vendor Lock-in**: Fully open source, with no proprietary restrictions

## How It Works

1. **Capture**: Use the global hotkey or overlay button to capture the current screen.
2. **Analyze**: Masa extracts and analyzes coding problems using OCR and AI.
3. **Assist**: Receive a structured solution, including code, explanation, and complexity analysis.

## Getting Started

### Quick Start (for experienced developers)

```bash
# Clone and setup
git clone git@github.com:hunkeelin/masa.git
cd masa
npm install

# Install Tesseract (macOS)
brew install tesseract

# Install Gemini CLI dependencies (for FREE AI)
pip3 install google-generativeai

# Get your FREE Gemini API key from: https://aistudio.google.com/app/apikey
export GEMINI_API_KEY=your-free-key-here

# Run the app - completely free!
npm run masa
```

> **💡 Pro Tip**: Gemini provides 1,000 free requests daily - enough for serious coding work without any costs!

### Detailed Installation

### Prerequisites

Before installation, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download from nodejs.org](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Python** (required for native module compilation)
  - macOS: Install via Homebrew: `brew install python`
  - Windows: Download from [python.org](https://python.org/) or use Microsoft Store
  - Linux: Use your package manager (e.g., `apt install python3`)

> **Note**: This is a Node.js/Electron application, not a Python project. While Python is needed for compiling native modules, you don't need to create a Python virtual environment. If you want to isolate Node.js versions, consider using [nvm](https://github.com/nvm-sh/nvm) (Node Version Manager) instead.

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone git@github.com:hunkeelin/masa.git
   cd masa
   ```

2. **Install Node.js dependencies**
   ```bash
   # Install all required packages
   npm install
   
   # If you encounter native module compilation issues, try:
   npm install --build-from-source
   ```

3. **Install system dependencies**

   **On macOS:**
   ```bash
   # Install Tesseract for OCR
   brew install tesseract
   
   # Install Xcode command line tools (if not already installed)
   xcode-select --install
   ```

   **On Windows:**
   ```bash
   # Install via chocolatey (recommended)
   choco install tesseract
   
   # Or download from: https://github.com/UB-Mannheim/tesseract/wiki
   ```

   **On Linux (Ubuntu/Debian):**
   ```bash
   # Install Tesseract and build tools
   sudo apt update
   sudo apt install tesseract-ocr tesseract-ocr-eng build-essential
   ```

4. **Set up your AI provider**
   
   **🆓 RECOMMENDED: Free Gemini Setup (Zero Cost)**
   
   Get your FREE Gemini API key:
   1. Visit [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
   2. Sign in with Google account (no credit card needed)
   3. Create new API key - **completely free**
   4. Copy your key starting with "AIza..."
   
   ```bash
   # Install Gemini CLI dependencies (one-time setup)
   pip3 install google-generativeai
   
   # Set your FREE API key
   export GEMINI_API_KEY=your-free-gemini-key-here
   
   # Run the app - zero costs!
   npm run masa
   ```
   
   **Benefits of Free Gemini:**
   - ✅ 1,000 requests per day (enough for professional use)
   - ✅ 60 requests per minute (no annoying rate limits)
   - ✅ Gemini 2.5 Pro quality (state-of-the-art AI)
   - ✅ No credit card or billing setup required
   - ✅ Works indefinitely - not a trial
   
   ---
   
   **Alternative Paid Options** (if you need more than 1,000 daily requests):
   
   - **OpenAI**: Visit [platform.openai.com](https://platform.openai.com/api-keys) (~$0.003 per query)
   - **Claude (Anthropic)**: Visit [console.anthropic.com](https://console.anthropic.com/) (~$0.024 per query)
   
   **Configuration Methods:**
   
   **Method A: Environment Variables (Recommended for Free Gemini)**
   ```bash
   # Set your FREE Gemini API key
   export GEMINI_API_KEY=your-free-gemini-key-here
   
   # Optional: Set paid alternatives if you have them
   # export OPENAI_API_KEY=your-openai-key-here
   # export ANTHROPIC_API_KEY=your-claude-key-here
   
   # Run the app with free AI
   npm run masa
   ```
   
   **Method B: Runtime Configuration**
   - Start the application and click the settings gear (⚙️)
   - **Gemini is pre-selected as default** (free option)
   - Enter your API key in the settings panel
   - Keys are stored in memory only for security (never saved to disk)

5. **Verify installation**
   ```bash
   # Test the installation
   npm run masa
   ```

   If successful, you should see the Masa overlay window appear.

### Troubleshooting

**Common Issues:**

- **"Failed to compile native modules"**: Install Python and build tools for your platform
- **"Tesseract not found"**: Ensure Tesseract is installed and in your PATH
- **"Permission denied on macOS"**: Grant screen recording permissions in System Preferences > Security & Privacy
- **"API key invalid"**: Verify your API key in the settings panel using the "Test API Key" button

### Running Modes

Masa offers different running modes for various use cases:

```bash
# Full AI-powered assistant (recommended)
npm run masa

# Basic stealth overlay demo
npm run stealth

# Simple overlay test
npm start

# Development mode with logging
npm run dev
```

### Development Setup

For developers who want to contribute or modify Masa:

1. **Enable development mode**
   ```bash
   # Run with detailed logging
   npm run dev
   ```

2. **Build native modules** (if needed)
   ```bash
   npm run build-native
   ```

3. **Code structure**
   ```
   ├── src/
   │   ├── main/                # Main process files
   │   │   ├── masa-main.js     # Main AI application
   │   │   ├── main-stealth.js  # Stealth overlay demo
   │   │   └── main.js          # Basic overlay test
   │   ├── renderer/            # Renderer process files (HTML/CSS/JS)
   │   │   ├── masa-overlay.html # AI assistant UI
   │   │   ├── overlay.html     # Basic overlay
   │   │   ├── overlay-advanced.html # Advanced overlay
   │   │   └── stealth-overlay.html # Stealth overlay
   │   └── utils/               # Utility modules
   │       └── native-helper.js # Platform-specific native functions
   └── assets/                  # Static assets
       └── eng.traineddata     # Tesseract language data
   ```

## Configuration

- **AI Provider**: Gemini (Google) is the default free option with 1,000 daily requests
- **Hotkey**: The default hotkey is `Ctrl+Shift+J`. You can change this in the settings panel
- **Language Support**: Choose from 10+ programming languages (Python, JavaScript, Java, C++, Go, Rust, etc.)
- **Overlay**: The overlay window can be repositioned and minimized as required

## Usage

1. **Start Masa**: Run `npm run masa` to launch the application
2. **Position the overlay**: Drag the window to your preferred location
3. **Analyze problems**: 
   - Press `Ctrl+Shift+J` (or your configured hotkey) to capture and analyze your screen
   - Or click the 🔍 button in the overlay
4. **View solutions**: Solutions appear in the overlay with code examples and explanations
5. **Manage settings**: Click ⚙️ to configure API keys, models, and hotkeys

## 💰 Cost Breakdown

**FREE Option (Recommended):**
- **Gemini (Google)**: $0.00 - Completely free with 1,000 daily requests ⭐

**Paid Alternatives** (for heavy usage >1,000 requests/day):
- **OpenAI GPT-3.5 Turbo**: ~$0.003 per analysis (cost-effective)
- **OpenAI GPT-4**: ~$0.03-0.06 per analysis (premium quality)
- **Claude 3.5 Sonnet**: ~$0.024 per analysis (balanced performance)

**Example**: Most users stay well under the 1,000 free daily limit. Even heavy users analyzing 100 problems daily would only use 10% of the free quota!

## Security

- API keys are never written to disk and are only stored in memory during runtime.
- Sensitive files such as `.env` are excluded from version control.

## Platform Support

- **macOS**: Uses advanced window layering and vibrancy for stealth overlays.
- **Windows**: Toolbar mode and exclusion flags for screen capture compatibility.
- **Linux**: Standard overlay support.

## License

This project is licensed under the MIT License.
