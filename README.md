# Masa: Open Source AI Coding Assistant

Masa is an open source desktop application that provides AI-powered coding assistance, inspired by [Cluely](https://cluely.com/) but fully free and transparent. Masa leverages advanced AI models to analyze coding problems directly from your screen and deliver structured solutions, code samples, and key insights.

## Features

- **Screen Capture & OCR**: Capture coding problems from your screen and extract text using OCR.
- **AI-Powered Solutions**: Get detailed explanations, code samples (Python/JavaScript), and complexity analysis using OpenAI or Claude models.
- **Customizable Hotkey**: Default global hotkey (`Ctrl+Shift+J`) to trigger analysis, with the option to rebind.
- **Cross-Platform Overlay**: Stealth overlay window designed for minimal distraction and screen sharing compatibility.
- **No Vendor Lock-in**: Fully open source, with no proprietary restrictions.

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

# Set your API key and run
export OPENAI_API_KEY=your-key-here
npm run masa
```

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

4. **Set up your API keys**
   
   Masa requires an AI API key to function. Choose your preferred provider:
   
   **Getting API Keys:**
   - **OpenAI**: Visit [platform.openai.com](https://platform.openai.com/api-keys) to create an API key
   - **Claude (Anthropic)**: Visit [console.anthropic.com](https://console.anthropic.com/) to get your API key
   
   **Configuration Methods:**
   
   **Method A: Environment Variables (Recommended)**
   ```bash
   # Create a .env file in the project root
   cp .env.example .env
   
   # Edit .env and add your API keys
   export OPENAI_API_KEY=your-openai-key-here
   export ANTHROPIC_API_KEY=your-claude-key-here
   ```
   
   **Method B: Runtime Configuration**
   - Start the application and click the settings gear (⚙️)
   - Enter your API key in the settings panel
   - Keys are stored in memory only for security

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
   ├── masa-main.js         # Main AI application
   ├── masa-overlay.html    # AI assistant UI
   ├── main-stealth.js      # Stealth overlay demo
   ├── main.js              # Basic overlay test
   └── native-helper.js     # Platform-specific native functions
   ```

## Configuration

- **Hotkey**: The default hotkey is `Ctrl+Shift+J`. You can change this in the settings panel.
- **API Providers**: Switch between OpenAI and Claude models as needed.
- **Overlay**: The overlay window can be repositioned and minimized as required.

## Usage

1. **Start Masa**: Run `npm run masa` to launch the application
2. **Position the overlay**: Drag the window to your preferred location
3. **Analyze problems**: 
   - Press `Ctrl+Shift+J` (or your configured hotkey) to capture and analyze your screen
   - Or click the 🔍 button in the overlay
4. **View solutions**: Solutions appear in the overlay with code examples and explanations
5. **Manage settings**: Click ⚙️ to configure API keys, models, and hotkeys

### Expected Costs

API usage costs are typically very low for casual use:

- **OpenAI GPT-3.5 Turbo**: ~$0.003 per analysis (recommended for cost-effectiveness)
- **OpenAI GPT-4**: ~$0.03-0.06 per analysis (higher quality)
- **Claude 3.5 Sonnet**: ~$0.024 per analysis (premium quality)

Example: 100 coding problems analyzed with GPT-3.5 would cost approximately $0.30.

## Security

- API keys are never written to disk and are only stored in memory during runtime.
- Sensitive files such as `.env` are excluded from version control.

## Platform Support

- **macOS**: Uses advanced window layering and vibrancy for stealth overlays.
- **Windows**: Toolbar mode and exclusion flags for screen capture compatibility.
- **Linux**: Standard overlay support.

## License

This project is licensed under the MIT License.
