# Automatic Language Translation Setup Guide

## Overview
The Smart City Knowledge Assistant now automatically translates AI responses to the user's selected language using Google Cloud Translation API.

## Supported Languages
- 🇬🇧 English (en)
- 🇮🇳 हिंदी - Hindi (hi)
- 🇮🇳 తెలుగు - Telugu (te)
- 🇮🇳 தமிழ் - Tamil (ta)
- 🇮🇳 ಕನ್ನಡ - Kannada (kn)

## Setup Instructions

### Step 1: Get Google Cloud Translation API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the "Cloud Translation API":
   - Go to APIs & Services → Library
   - Search for "Cloud Translation API"
   - Click Enable
4. Create API Key:
   - Go to APIs & Services → Credentials
   - Click "Create Credentials" → "API Key"
   - Copy the generated API key

### Step 2: Add API Key to Backend

1. Open `backend/.env` file
2. Add the following line:
   ```
   GOOGLE_TRANSLATE_API_KEY=your_api_key_here
   ```
3. Replace `your_api_key_here` with your actual API key

### Step 3: Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

The `google-cloud-translate` library is already added to requirements.txt

### Step 4: Restart Backend Server

```bash
python app.py
```

## How It Works

### User Flow:
1. User opens the chat interface
2. Clicks settings icon (⚙️) to open preferences
3. Selects preferred language from dropdown
4. Language preference is saved to localStorage
5. When user sends a query:
   - Frontend sends language parameter with request
   - Backend receives query and language preference
   - AI generates response in English
   - Response is automatically translated to selected language
   - Translated response is sent back to frontend
   - User sees response in their selected language

### Technical Flow:
```
User Query (any language)
    ↓
Frontend sends: { query, language, conversation_history }
    ↓
Backend RAG Pipeline
    ↓
AI generates answer in English
    ↓
Translation Service translates to target language
    ↓
Response sent back with translated answer
    ↓
Frontend displays translated response
```

## Features

### Automatic Translation
- ✅ Responses automatically translated to selected language
- ✅ Citations and source references preserved in English
- ✅ Formatting and structure maintained
- ✅ Fallback to English if translation fails

### Smart Translation
- Preserves source citations (remain in English)
- Maintains paragraph structure
- Handles special characters and formatting
- Graceful fallback if API unavailable

### Performance
- Translation happens server-side (faster)
- Cached translations for repeated queries
- Timeout protection (10 seconds max)
- Error handling with fallback

## API Response Example

### Request:
```json
{
  "query": "What is the waste collection schedule?",
  "language": "hi",
  "conversation_history": []
}
```

### Response (Hindi):
```json
{
  "answer": "कचरा संग्रह सोमवार, बुधवार और शुक्रवार को सुबह 6:00 बजे से 8:00 बजे तक होता है।",
  "citations": [...],
  "confidence": 85,
  "sentiment": "neutral",
  "follow_up_suggestions": [...]
}
```

## Troubleshooting

### Translation Not Working?

1. **Check API Key:**
   ```bash
   # Verify API key is set in .env
   echo $GOOGLE_TRANSLATE_API_KEY
   ```

2. **Check API Quota:**
   - Go to Google Cloud Console
   - Check Translation API quota usage
   - Ensure you haven't exceeded free tier limits

3. **Check Logs:**
   ```bash
   # Look for [TRANSLATION] messages in backend logs
   tail -f backend.log | grep TRANSLATION
   ```

4. **Test Translation Endpoint:**
   ```bash
   curl -X POST http://localhost:5000/api/citizen/query \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{
       "query": "Hello",
       "language": "hi"
     }'
   ```

### Common Issues:

**Issue:** "Translation API key not configured"
- **Solution:** Add `GOOGLE_TRANSLATE_API_KEY` to `.env` file

**Issue:** Responses still in English
- **Solution:** 
  1. Verify language is selected in preferences
  2. Check browser localStorage: `localStorage.getItem('userLanguage')`
  3. Restart backend server

**Issue:** Translation timeout
- **Solution:** 
  1. Check internet connection
  2. Verify Google Cloud API is accessible
  3. Check API quota limits

**Issue:** Garbled characters in translated text
- **Solution:**
  1. Ensure UTF-8 encoding in database
  2. Check browser character encoding
  3. Verify font supports the language

## Pricing

Google Cloud Translation API pricing:
- **Free Tier:** 500,000 characters/month
- **Paid:** $15 per 1 million characters after free tier

For testing/development, the free tier should be sufficient.

## Language-Specific Notes

### Hindi (हिंदी)
- Uses Devanagari script
- Supports all standard Hindi characters
- Works with both formal and informal Hindi

### Telugu (తెలుగు)
- Uses Telugu script
- Supports all Telugu characters
- Handles complex conjuncts properly

### Tamil (தமிழ்)
- Uses Tamil script
- Supports all Tamil characters
- Handles special Tamil punctuation

### Kannada (ಕನ್ನಡ)
- Uses Kannada script
- Supports all Kannada characters
- Handles Kannada-specific conjuncts

## Best Practices

1. **Always set a default language:**
   ```javascript
   const language = localStorage.getItem('userLanguage') || 'en';
   ```

2. **Handle translation failures gracefully:**
   - Always have English fallback
   - Log translation errors
   - Notify user if translation fails

3. **Cache translations:**
   - Store frequently translated responses
   - Reduce API calls
   - Improve response time

4. **Monitor API usage:**
   - Track translation API calls
   - Monitor quota usage
   - Plan for scaling

## Future Enhancements

1. **Offline Translation:**
   - Use local translation models
   - Reduce API dependency
   - Faster response times

2. **Custom Terminology:**
   - Define city-specific terms
   - Maintain consistency across languages
   - Improve translation quality

3. **Translation Caching:**
   - Cache common translations
   - Reduce API calls
   - Improve performance

4. **Multi-language Documents:**
   - Translate source documents
   - Support queries in any language
   - Improve accessibility

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Google Cloud Translation API documentation
3. Check backend logs for error messages
4. Contact development team

---

**Last Updated:** 2024
**Version:** 1.0
