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
You are an expert {language} developer and coding interview coach. Help analyze this coding problem with realistic interview strategies.

Context: This is for coding interview preparation where showing natural problem-solving progression is important.

Requirements:
1. **Problem Understanding**: Brief explanation of what the problem is asking
2. **Multiple Solution Approaches**: 
   - **Approach 1 - Initial/Intuitive**: A straightforward solution that naturally comes to mind first (may not be optimal, but shows logical thinking)
   - **Approach 2 - Optimized**: The more efficient solution with better time/space complexity
3. **Clean, Interview-Ready Code**: 
   - Use descriptive variable names (e.g., 'leftPointer' instead of 'l', 'currentSum' instead of 's')
   - Add comprehensive comments explaining the thought process
   - Use clear function/method names that describe their purpose
   - Structure code for maximum readability during interviews
4. **Complexity Analysis**: Time and space complexity for each approach with clear explanations
5. **Interview Insights**: 
   - Why you might start with the first approach
   - How you would naturally progress to the optimization
   - Key patterns or techniques that demonstrate problem-solving skills

User Request: {prompt}

Please provide solutions in {language} that show realistic interview progression:
- Start with a working but potentially suboptimal solution
- Then show how you would optimize it
- Explain the thought process between approaches
- Use descriptive variable names and clear comments throughout
- Make it look like natural problem-solving, not just the final optimal answer
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
