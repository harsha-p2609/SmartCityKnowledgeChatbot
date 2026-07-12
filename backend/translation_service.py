import os
import requests
from dotenv import load_dotenv

base_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(base_dir, ".env")
load_dotenv(dotenv_path=env_path)

GOOGLE_TRANSLATE_API_KEY = os.getenv("GOOGLE_TRANSLATE_API_KEY")

# Language code mappings
LANGUAGE_CODES = {
    'en': 'en',
    'hi': 'hi',
    'te': 'te',
    'ta': 'ta',
    'kn': 'kn',
}

LANGUAGE_NAMES = {
    'en': 'English',
    'hi': 'Hindi',
    'te': 'Telugu',
    'ta': 'Tamil',
    'kn': 'Kannada',
}

def translate_text(text, target_language='en'):
    """
    Translate text to target language using Google Translate API.
    Falls back to original text if translation fails.
    """
    if target_language == 'en' or not text:
        return text
    
    if not GOOGLE_TRANSLATE_API_KEY:
        print("[TRANSLATION] Google Translate API key not configured, returning original text")
        return text
    
    try:
        target_lang_code = LANGUAGE_CODES.get(target_language, 'en')
        
        url = "https://translation.googleapis.com/language/translate/v2"
        params = {
            'key': GOOGLE_TRANSLATE_API_KEY,
            'q': text,
            'target': target_lang_code,
            'source': 'en'
        }
        
        response = requests.post(url, params=params, timeout=10)
        
        if response.status_code == 200:
            result = response.json()
            translated_text = result['data']['translations'][0]['translatedText']
            print(f"[TRANSLATION] Successfully translated to {LANGUAGE_NAMES.get(target_language, target_language)}")
            return translated_text
        else:
            print(f"[TRANSLATION] API error (status {response.status_code}): {response.text}")
            return text
            
    except Exception as e:
        print(f"[TRANSLATION] Translation failed: {e}")
        return text

def translate_answer(answer, target_language='en'):
    """
    Translate the AI answer to the target language.
    Preserves source citations and formatting.
    """
    if target_language == 'en':
        return answer
    
    # Extract citations if present (they should remain in English)
    citations = []
    lines = answer.split('\n')
    translated_lines = []
    
    for line in lines:
        # Check if line contains a citation (source: filename, page X)
        if 'source:' in line.lower() or 'page' in line.lower():
            # Keep citations as-is
            translated_lines.append(line)
        else:
            # Translate non-citation lines
            if line.strip():
                translated_line = translate_text(line, target_language)
                translated_lines.append(translated_line)
            else:
                translated_lines.append(line)
    
    return '\n'.join(translated_lines)

def get_language_name(lang_code):
    """Get full language name from code."""
    return LANGUAGE_NAMES.get(lang_code, 'English')

def is_valid_language(lang_code):
    """Check if language code is supported."""
    return lang_code in LANGUAGE_CODES
