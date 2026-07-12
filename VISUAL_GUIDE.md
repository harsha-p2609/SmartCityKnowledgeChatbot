# 🎨 Visual Feature Guide

## 🌐 How Auto-Translation Works

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERFACE                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Settings (⚙️)                                             │
│  ├─ Language: [हिंदी ▼]                                    │
│  ├─ Notifications: [✓] Email [✓] Push                      │
│  └─ Saved Queries: [3 saved]                               │
│                                                             │
│  Chat Area:                                                │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ User: "What is waste collection?"                  │  │
│  │                                                     │  │
│  │ Assistant: "कचरा संग्रह सोमवार को होता है।"      │  │
│  │ 😊 [👍] [📌] [?]                                   │  │
│  │                                                     │  │
│  │ Suggested follow-ups:                              │  │
│  │ • What are collection timings?                     │  │
│  │ • How to report improper disposal?                 │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow

```
┌──────────────┐
│  User Query  │
│  Language:   │
│  Hindi (hi)  │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────┐
│  Frontend                            │
│  ├─ Read language from localStorage  │
│  └─ Send query + language to API     │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  Backend API                         │
│  POST /api/citizen/query             │
│  Body: {                             │
│    query: "...",                     │
│    language: "hi"                    │
│  }                                   │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  RAG Pipeline                        │
│  ├─ Generate answer in English       │
│  └─ Analyze sentiment                │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  Translation Service                 │
│  ├─ Check if language != 'en'        │
│  ├─ Call Google Translate API        │
│  └─ Return translated answer         │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  Response                            │
│  {                                   │
│    answer: "कचरा संग्रह...",         │
│    sentiment: "neutral",             │
│    follow_up_suggestions: [...]      │
│  }                                   │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  Frontend Display                    │
│  ├─ Show translated answer           │
│  ├─ Display sentiment emoji          │
│  ├─ Show follow-up suggestions       │
│  └─ Enable feedback buttons          │
└──────────────────────────────────────┘
```

## 🎯 Feature Interaction Map

```
                    ┌─────────────────┐
                    │  User Settings  │
                    └────────┬────────┘
                             │
                ┌────────────┼────────────┐
                │            │            │
                ▼            ▼            ▼
          ┌─────────┐  ┌──────────┐  ┌──────────┐
          │Language │  │Notif.    │  │Saved     │
          │Select   │  │Settings  │  │Queries   │
          └────┬────┘  └──────────┘  └──────────┘
               │
               ▼
        ┌─────────────────┐
        │ Send Query      │
        │ + Language      │
        └────────┬────────┘
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
    ┌────────┐      ┌──────────────┐
    │Translate│      │Generate      │
    │Answer   │      │Follow-ups    │
    └────┬───┘      └──────┬───────┘
         │                 │
         └────────┬────────┘
                  │
                  ▼
         ┌──────────────────┐
         │Display Response  │
         │+ Sentiment Emoji │
         │+ Feedback Buttons│
         └────────┬─────────┘
                  │
        ┌─────────┴──────────┐
        │                    │
        ▼                    ▼
    ┌────────┐          ┌──────────┐
    │Rate    │          │Save      │
    │Answer  │          │Query     │
    └────────┘          └──────────┘
```

## 📱 UI Components Layout

```
┌─────────────────────────────────────────────────────────┐
│  Smart City Knowledge Assistant                         │
├─────────────────────────────────────────────────────────┤
│  [Chat] [History]                          [⚙️ Settings]│
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Assistant: "कचरा संग्रह सोमवार को होता है।"    │ │
│  │ 😊 [👍] [📌] [?]                                 │ │
│  │                                                   │ │
│  │ Suggested follow-ups:                            │ │
│  │ ┌─────────────────────────────────────────────┐ │ │
│  │ │ • What are collection timings?              │ │ │
│  │ │ • How to report improper disposal?          │ │ │
│  │ └─────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ [Type your question...] [Send]                    │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## ⚙️ Settings Modal

```
┌─────────────────────────────────────────────────────────┐
│  User Preferences                                   [✕] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Language                                               │
│  [हिंदी ▼]                                              │
│                                                         │
│  Notifications                                          │
│  ☑ Enable Notifications                                │
│  ☑ Email Alerts                                        │
│  ☐ Push Notifications                                  │
│                                                         │
│  Saved Queries (3)                                      │
│  ┌─────────────────────────────────────────────────┐  │
│  │ What is waste collection schedule?         [🗑]│  │
│  │ How to apply for permit?                   [🗑]│  │
│  │ Traffic rules in my area                   [🗑]│  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│                    [Cancel] [Save Preferences]         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## ⭐ Feedback Modal

```
┌─────────────────────────────────────────────────────────┐
│  Rate This Answer                                   [✕] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  How helpful was this answer?                           │
│                                                         │
│  ☆ ☆ ☆ ☆ ☆                                             │
│  (Click to rate)                                        │
│                                                         │
│  Additional Feedback (Optional)                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │ Tell us what could be improved...              │  │
│  │                                                 │  │
│  │                                                 │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  😊 Great! We're glad we could help!                   │
│                                                         │
│                    [Cancel] [Submit Feedback]          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 🌍 Language Support

```
┌──────────────────────────────────────────────────────┐
│  Supported Languages                                 │
├──────────────────────────────────────────────────────┤
│                                                      │
│  🇬🇧 English (en)                                   │
│     "What is waste collection?"                     │
│                                                      │
│  🇮🇳 हिंदी - Hindi (hi)                             │
│     "कचरा संग्रह क्या है?"                           │
│                                                      │
│  🇮🇳 తెలుగు - Telugu (te)                           │
│     "చెత్త సేకరణ ఏమిటి?"                           │
│                                                      │
│  🇮🇳 தமிழ் - Tamil (ta)                             │
│     "குப்பை சேகரிப்பு என்றால் என்ன?"               │
│                                                      │
│  🇮🇳 ಕನ್ನಡ - Kannada (kn)                           │
│     "ಕಸ ಸಂಗ್ರಹ ಎಂದರೆ ಏನು?"                       │
│                                                      │
└──────────────────────────────────────────────────────┘
```

## 😊 Sentiment Indicators

```
┌──────────────────────────────────────────────────────┐
│  Sentiment Analysis                                  │
├──────────────────────────────────────────────────────┤
│                                                      │
│  😊 POSITIVE                                         │
│     Keywords: great, excellent, helpful, perfect    │
│     Example: "Great! Here's the information..."     │
│                                                      │
│  😐 NEUTRAL                                          │
│     Keywords: standard, information, details        │
│     Example: "Waste collection is on Monday..."     │
│                                                      │
│  😞 NEGATIVE                                         │
│     Keywords: sorry, error, unable, failed          │
│     Example: "Sorry, I cannot find that info..."    │
│                                                      │
│  😤 FRUSTRATED                                       │
│     Keywords: frustrated, angry, upset, annoyed     │
│     Example: "I'm frustrated I can't help..."       │
│                                                      │
└──────────────────────────────────────────────────────┘
```

## 🔄 Conversation Flow

```
User: "What is waste collection?"
  │
  ├─ Language: Hindi (hi)
  ├─ Sentiment: Neutral
  └─ Follow-ups: [2 suggestions]
       │
       ▼
Assistant: "कचरा संग्रह सोमवार को होता है।"
  │
  ├─ Sentiment: 😐 Neutral
  ├─ Confidence: 85%
  ├─ Citations: [Document reference]
  └─ Follow-ups:
       • What are collection timings?
       • How to report improper disposal?
       │
       ▼
User Actions:
  ├─ Rate: ⭐⭐⭐⭐⭐ (5 stars)
  ├─ Feedback: "Very helpful!"
  ├─ Save: 📌 (Saved to favorites)
  └─ Follow-up: Click suggestion
       │
       ▼
Continue Conversation...
```

## 📊 Data Storage

```
┌─────────────────────────────────────────────────────┐
│  MongoDB Collections                                │
├─────────────────────────────────────────────────────┤
│                                                     │
│  users                                              │
│  ├─ _id, name, email, role, date_created          │
│                                                     │
│  query_activity                                     │
│  ├─ user_id, query, confidence, timestamp          │
│                                                     │
│  saved_queries (NEW)                                │
│  ├─ user_id, query, timestamp                      │
│                                                     │
│  feedback (NEW)                                     │
│  ├─ user_id, message_id, rating, feedback, ts     │
│                                                     │
│  documents                                          │
│  ├─ _id, name, path, status, vectorCount          │
│                                                     │
│  chunks                                             │
│  ├─ document_id, text, embedding, metadata        │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## 🚀 Deployment Architecture

```
┌─────────────────────────────────────────────────────┐
│  Frontend (React)                                   │
│  ├─ ChatAssistantEnhanced.jsx                      │
│  ├─ UserPreferences.jsx                            │
│  └─ FeedbackModal.jsx                              │
└────────────────┬────────────────────────────────────┘
                 │ HTTP/REST
                 ▼
┌─────────────────────────────────────────────────────┐
│  Backend (Flask)                                    │
│  ├─ app.py (API endpoints)                         │
│  ├─ rag_service.py (RAG pipeline)                  │
│  └─ translation_service.py (Translation)           │
└────────────────┬────────────────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
┌──────────────┐  ┌──────────────────────┐
│  MongoDB     │  │  Google Cloud API    │
│  (Database)  │  │  (Translation)       │
└──────────────┘  └──────────────────────┘
```

---

**Visual Guide Complete!** 🎨

All features are now visually documented and ready for implementation.
