# Step-by-Step Deployment & Usage Guide

## 🎯 Part 1: Setup (One-Time)

### Step 1: Get Google Cloud Translation API Key (5 min)

1. Go to https://console.cloud.google.com/
2. Create a new project (or use existing)
3. Search for "Cloud Translation API"
4. Click "Enable"
5. Go to "Credentials" → "Create Credentials" → "API Key"
6. Copy the API key

### Step 2: Configure Backend (2 min)

1. Open `backend/.env`
2. Add this line:
   ```
   GOOGLE_TRANSLATE_API_KEY=your_api_key_here
   ```
3. Replace `your_api_key_here` with your actual key
4. Save file

### Step 3: Install Dependencies (3 min)

```bash
cd backend
pip install -r requirements.txt
```

### Step 4: Restart Backend (1 min)

```bash
python app.py
```

You should see:
```
[DB] Successfully connected to MongoDB.
[TRANSLATION] Translation service initialized
```

---

## 🎯 Part 2: Using the Features

### Feature 1: Auto-Translate Responses

**How it works:**
1. Open chat interface
2. Click settings icon (⚙️) in top-right
3. Select language from dropdown:
   - English
   - हिंदी (Hindi)
   - తెలుగు (Telugu)
   - தமிழ் (Tamil)
   - ಕನ್ನಡ (Kannada)
4. Click "Save Preferences"
5. Ask a question
6. Response automatically appears in selected language!

**Example:**
```
User: "What is waste collection schedule?"
Language: Hindi
Response: "कचरा संग्रह सोमवार, बुधवार और शुक्रवार को सुबह 6:00 बजे से 8:00 बजे तक होता है।"
```

---

### Feature 2: Rate Answers

**How it works:**
1. After receiving an answer, click thumbs up icon 👍
2. Feedback modal opens
3. Click stars to rate (1-5)
4. Optionally add feedback text
5. Click "Submit Feedback"

**What happens:**
- Rating stored in database
- Helps improve system
- Sentiment emoji shows your rating

---

### Feature 3: Save Favorite Queries

**How it works:**
1. Click settings icon (⚙️)
2. Scroll to "Saved Queries" section
3. Click bookmark icon 📌 on any response
4. Query saved automatically
5. View all saved queries in settings
6. Click to re-ask anytime

---

### Feature 4: Follow-Up Suggestions

**How it works:**
1. After receiving an answer
2. Look for "Suggested follow-ups:" section
3. Click any suggestion to ask immediately
4. Suggestions are contextually relevant

**Example:**
```
Answer: "Waste collection is on Monday, Wednesday, Friday"
Suggested follow-ups:
- What are the waste collection timings?
- How do I report improper waste disposal?
```

---

### Feature 5: Sentiment Indicators

**How it works:**
- Each response shows a sentiment emoji:
  - 😊 Positive: Helpful answer
  - 😐 Neutral: Standard information
  - 😞 Negative: Error or unable to help
  - 😤 Frustrated: Detected frustration

---

## 🎯 Part 3: Troubleshooting

### Problem: Responses still in English

**Solution:**
1. Check if language is selected in settings
2. Open browser console (F12)
3. Type: `localStorage.getItem('userLanguage')`
4. Should show: `"hi"` or `"te"` etc.
5. If shows `"en"`, select language again

### Problem: "Translation API key not configured"

**Solution:**
1. Check `.env` file has the key
2. Restart backend: `python app.py`
3. Check logs for `[TRANSLATION]` messages

### Problem: Translation timeout

**Solution:**
1. Check internet connection
2. Verify API key is valid
3. Check Google Cloud Console for quota

### Problem: Garbled characters

**Solution:**
1. Ensure browser encoding is UTF-8
2. Check font supports the language
3. Restart browser

---

## 🎯 Part 4: Testing

### Test 1: Language Translation

```bash
# Test with Hindi
curl -X POST http://localhost:5000/api/citizen/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "query": "What is waste collection?",
    "language": "hi"
  }'
```

Expected: Response in Hindi

### Test 2: Feedback Submission

```bash
curl -X POST http://localhost:5000/api/citizen/feedback \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "message_id": 12345,
    "rating": 5,
    "feedback": "Very helpful!"
  }'
```

Expected: `{"message": "Feedback submitted successfully"}`

### Test 3: Save Query

```bash
curl -X POST http://localhost:5000/api/citizen/saved-queries \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "query": "What is waste collection schedule?"
  }'
```

Expected: `{"message": "Query saved successfully"}`

---

## 🎯 Part 5: Monitoring

### Check Translation Logs

```bash
# Watch for translation messages
tail -f backend.log | grep TRANSLATION
```

Expected output:
```
[TRANSLATION] Successfully translated to Hindi
[TRANSLATION] Translation service initialized
```

### Monitor API Usage

1. Go to Google Cloud Console
2. Check "Cloud Translation API" quota
3. Monitor character usage
4. Set up alerts if needed

### Check Database

```bash
# Connect to MongoDB
mongo smartcity_db

# Check feedback collection
db.feedback.find().pretty()

# Check saved queries
db.saved_queries.find().pretty()
```

---

## 🎯 Part 6: Performance Tips

1. **Cache Translations:**
   - Frequently asked questions get cached
   - Reduces API calls
   - Faster responses

2. **Batch Requests:**
   - Group similar queries
   - Reduce API overhead

3. **Monitor Quota:**
   - Free tier: 500K characters/month
   - Plan for scaling
   - Set up alerts

---

## 🎯 Part 7: Common Tasks

### Change Language

1. Click settings (⚙️)
2. Select new language
3. Click "Save Preferences"
4. Done! All future responses in new language

### Delete Saved Query

1. Click settings (⚙️)
2. Find query in "Saved Queries"
3. Click delete icon (🗑️)
4. Confirm deletion

### View Feedback

1. Backend: Check MongoDB `feedback` collection
2. Frontend: No UI yet (admin feature)
3. Use MongoDB Compass for visualization

### Reset Preferences

1. Open browser console (F12)
2. Type: `localStorage.clear()`
3. Refresh page
4. Preferences reset to default

---

## 🎯 Part 8: Deployment Checklist

Before going live:

- [ ] API key configured in `.env`
- [ ] Dependencies installed
- [ ] Backend restarted
- [ ] Language selection works
- [ ] Translations appear correctly
- [ ] Feedback submission works
- [ ] Saved queries work
- [ ] Follow-up suggestions appear
- [ ] Sentiment emojis display
- [ ] Dark/Light mode works
- [ ] Mobile responsive
- [ ] No console errors
- [ ] API quota monitored
- [ ] Logs being captured

---

## 🎯 Quick Reference

| Task | Steps |
|------|-------|
| Change language | Settings → Select language → Save |
| Rate answer | Click 👍 → Rate → Submit |
| Save query | Click 📌 → Auto-saved |
| Re-ask query | Settings → Click saved query |
| View suggestions | Look below response |
| Check sentiment | Look for emoji next to response |

---

## 📞 Support

- **Setup Issues:** Check `TRANSLATION_SETUP.md`
- **API Issues:** Check Google Cloud Console
- **Database Issues:** Check MongoDB logs
- **Frontend Issues:** Check browser console (F12)

---

**Status:** ✅ Ready to Deploy
**Version:** 1.0
**Last Updated:** 2024
