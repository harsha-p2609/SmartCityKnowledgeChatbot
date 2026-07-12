# Quick Reference: Automatic Language Translation

## 🚀 Quick Start (5 minutes)

### 1. Get API Key
- Visit: https://console.cloud.google.com/
- Enable "Cloud Translation API"
- Create API Key from Credentials

### 2. Configure Backend
```bash
# Edit backend/.env
GOOGLE_TRANSLATE_API_KEY=your_key_here
```

### 3. Install & Run
```bash
cd backend
pip install -r requirements.txt
python app.py
```

### 4. Use in Frontend
- Click settings icon (⚙️)
- Select language
- All responses auto-translate!

---

## 📋 Supported Languages

| Language | Code | Script |
|----------|------|--------|
| English | `en` | Latin |
| Hindi | `hi` | देवनागरी |
| Telugu | `te` | తెలుగు |
| Tamil | `ta` | தமிழ் |
| Kannada | `kn` | ಕನ್ನಡ |

---

## 🔧 How It Works

```
User selects language → Saved to localStorage
         ↓
User sends query → Language sent with request
         ↓
Backend generates English response
         ↓
Translation Service translates to target language
         ↓
Translated response sent to frontend
         ↓
User sees response in selected language
```

---

## 📝 Code Examples

### Frontend - Send Query with Language
```javascript
const language = localStorage.getItem('userLanguage') || 'en';

fetch('/api/citizen/query', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    query: 'What is waste collection schedule?',
    language: language,  // 'hi', 'te', 'ta', 'kn', or 'en'
    conversation_history: []
  })
});
```

### Backend - Translate Response
```python
from translation_service import translate_answer

# Translate answer to user's language
translated_answer = translate_answer(answer, user_language='hi')
```

---

## ✅ Verification Checklist

- [ ] Google Cloud Translation API enabled
- [ ] API key added to `.env`
- [ ] `google-cloud-translate` installed
- [ ] Backend restarted
- [ ] Language selection works in UI
- [ ] Response appears in selected language
- [ ] Citations remain in English
- [ ] Fallback to English if translation fails

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| "API key not configured" | Add `GOOGLE_TRANSLATE_API_KEY` to `.env` |
| Responses still in English | Check `localStorage.getItem('userLanguage')` |
| Translation timeout | Check internet & API quota |
| Garbled characters | Verify UTF-8 encoding |

---

## 📊 API Response Format

```json
{
  "answer": "कचरा संग्रह सोमवार को होता है।",
  "citations": [...],
  "confidence": 85,
  "sentiment": "neutral",
  "follow_up_suggestions": [...]
}
```

---

## 💡 Tips

1. **Default Language:** Always set English as fallback
2. **Performance:** Translations happen server-side (faster)
3. **Offline:** Works only with internet connection
4. **Quota:** Free tier = 500K characters/month
5. **Citations:** Always preserved in English

---

## 📞 Support

- Check `TRANSLATION_SETUP.md` for detailed guide
- Review backend logs: `[TRANSLATION]` messages
- Verify API key in Google Cloud Console
- Test with simple queries first

---

**Status:** ✅ Ready to Use
**Version:** 1.0
**Last Updated:** 2024
