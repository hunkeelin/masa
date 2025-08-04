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

1. **Clone the repository**
   ```bash
   git clone git@github.com:hunkeelin/masa.git
   cd masa
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up your API keys**
   - Provide your OpenAI or Anthropic API key via environment variables:
     ```bash
     export OPENAI_API_KEY=your-openai-key
     export ANTHROPIC_API_KEY=your-claude-key
     ```
   - Or enter your API key in the Masa settings panel (keys are stored in memory only).

4. **Install Tesseract language data**
   - Masa requires the English language data for OCR. Install it via Homebrew:
     ```bash
     brew install tesseract
     ```
   - Or download `eng.traineddata` from [tesseract-ocr/tessdata](https://github.com/tesseract-ocr/tessdata) and place it in your Tesseract data directory.

5. **Run the application**
   ```bash
   npm run masa
   ```

## Configuration

- **Hotkey**: The default hotkey is `Ctrl+Shift+J`. You can change this in the settings panel.
- **API Providers**: Switch between OpenAI and Claude models as needed.
- **Overlay**: The overlay window can be repositioned and minimized as required.

## Security

- API keys are never written to disk and are only stored in memory during runtime.
- Sensitive files such as `.env` are excluded from version control.

## Platform Support

- **macOS**: Uses advanced window layering and vibrancy for stealth overlays.
- **Windows**: Toolbar mode and exclusion flags for screen capture compatibility.
- **Linux**: Standard overlay support.

## License

This project is licensed under the MIT License.
