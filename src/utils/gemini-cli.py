#!/usr/bin/env python3
"""
Gemini CLI - Pure API passthrough for Google Gemini integration
"""

import json
import sys
import argparse
import os
import logging
import google.generativeai as genai

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def generate_response(prompt, language='javascript'):
    """Generate coding solution using Gemini API - pure passthrough"""
    try:
        # Configure Gemini API with API key from environment
        api_key = os.environ.get('GEMINI_API_KEY')
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable not set")
        
        genai.configure(api_key=api_key)
        
        # Configure the model
        generation_config = {
            "temperature": 0.7,
            "top_p": 0.95,
            "top_k": 64,
            "max_output_tokens": 8192,
        }

        safety_settings = [
            {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
        ]

        # Create model instance
        model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            generation_config=generation_config,
            safety_settings=safety_settings
        )

        # Generate response - pure passthrough of prompt
        response = model.generate_content(prompt)
        
        if response.text:
            return {
                "success": True,
                "content": response.text,
                "model": "gemini-1.5-flash"
            }
        else:
            return {
                "success": False,
                "error": "Empty response from Gemini API"
            }
            
    except Exception as e:
        logger.error(f"Gemini API error: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }

def main():
    parser = argparse.ArgumentParser(description='Gemini CLI for coding assistance')
    
    prompt_group = parser.add_mutually_exclusive_group(required=True)
    prompt_group.add_argument('--prompt', help='The prompt text to send to Gemini')
    prompt_group.add_argument('--prompt-file', help='File containing the prompt text')
    
    parser.add_argument('--language', default='javascript', help='Programming language for the solution')
    
    args = parser.parse_args()
    
    # Get prompt text
    if args.prompt:
        prompt_text = args.prompt
    else:
        try:
            with open(args.prompt_file, 'r', encoding='utf-8') as f:
                prompt_text = f.read()
        except Exception as e:
            result = {"success": False, "error": f"Failed to read prompt file: {str(e)}"}
            print(json.dumps(result))
            return
    
    # Generate response
    result = generate_response(prompt_text, args.language)
    
    # Output as JSON
    print(json.dumps(result))

if __name__ == '__main__':
    main()
