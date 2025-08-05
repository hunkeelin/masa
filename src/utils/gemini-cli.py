#!/usr/bin/env python3
"""
Gemini CLI Interface for Masa AI Assistant
Free alternative to OpenAI/Claude APIs using Google's Gemini
"""

import os
import sys
import json
import argparse
import google.generativeai as genai
from typing import Optional, Dict, Any

class GeminiCLI:
    def __init__(self, api_key: Optional[str] = None):
        """Initialize Gemini CLI with API key"""
        self.api_key = api_key or os.getenv('GEMINI_API_KEY')
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY environment variable is required")
        
        genai.configure(api_key=self.api_key)
        # Use default model - let Gemini choose automatically
        self.model = genai.GenerativeModel('gemini-1.5-flash')
    
    def generate_response(self, prompt: str, language: str = "javascript") -> Dict[str, Any]:
        """Generate code response using Gemini"""
        try:
            enhanced_prompt = f"""
You are an expert {language} developer helping with screen capture detection avoidance techniques.

Context: This is for a desktop application that needs to create overlay windows that attempt to avoid screen capture detection.

Requirements:
1. Write clean, readable, well-commented code
2. Use descriptive variable names (e.g., 'screenCaptureExclusionWindow' instead of 'w')
3. Add comprehensive comments explaining the logic
4. Focus on cross-platform compatibility (macOS/Windows)
5. Implement proper error handling
6. Use modern {language} best practices

User Request: {prompt}

Please provide a complete, production-ready solution with:
- Descriptive variable and function names
- Inline comments explaining each step
- Error handling and edge cases
- Cross-platform considerations
"""
            
            response = self.model.generate_content(enhanced_prompt)
            
            return {
                "success": True,
                "content": response.text,
                "provider": "gemini",
                "model": "gemini-pro (auto-selected)",
                "language": language
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "provider": "gemini"
            }
    
    def test_connection(self) -> Dict[str, Any]:
        """Test Gemini API connection"""
        try:
            response = self.model.generate_content("Say 'Hello from Gemini!' in a single line.")
            return {
                "success": True,
                "message": "Gemini connection successful",
                "response": response.text.strip()
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def list_models(self) -> Dict[str, Any]:
        """List available Gemini models"""
        try:
            models = []
            for model in genai.list_models():
                if 'generateContent' in model.supported_generation_methods:
                    models.append(model.name)
            
            return {
                "success": True,
                "models": models
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

def main():
    """Main CLI interface"""
    parser = argparse.ArgumentParser(description='Gemini CLI for Masa AI Assistant')
    parser.add_argument('--prompt', type=str, help='Code generation prompt')
    parser.add_argument('--language', type=str, default='javascript', help='Programming language')
    parser.add_argument('--test', action='store_true', help='Test API connection')
    parser.add_argument('--list-models', action='store_true', help='List available models')
    parser.add_argument('--api-key', type=str, help='Gemini API key (or use GEMINI_API_KEY env var)')
    
    args = parser.parse_args()
    
    try:
        cli = GeminiCLI(api_key=args.api_key)
        
        if args.test:
            result = cli.test_connection()
            print(json.dumps(result, indent=2))
            return
        
        if args.list_models:
            result = cli.list_models()
            print(json.dumps(result, indent=2))
            return
        
        if not args.prompt:
            print(json.dumps({"success": False, "error": "Prompt is required"}, indent=2))
            return
        
        result = cli.generate_response(args.prompt, args.language)
        print(json.dumps(result, indent=2))
        
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}, indent=2))

if __name__ == "__main__":
    main()
