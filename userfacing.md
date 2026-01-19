# 8.3 User-Facing Demo App

A simple web application that allows users to interact with the truthbot system in real-time.

---

## Core Features

| Feature | Description |
|---------|-------------|
| **Dual Response View** | User enters a question; app shows side-by-side responses from "Unknown Model" and "Truthbot" |
| **Mode Toggle** | Switch unknown model between "Helpful" and "Manipulative" prompting (for demo purposes) |
| **Delta Highlighter** | Visually highlight key differences between the two responses |
| **Manipulation Score** | Display manipulation guesser's prediction + confidence for the unknown model's response |
| **Topic Selector** | Dropdown of pre-loaded propositions for quick demos |

---

## UI Wireframe

```
┌─────────────────────────────────────────────────────────────────────────┐
│  🛡️ TruthBot Demo                                    [Helpful ▼] Mode  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Topic: [Select a topic...              ▼]                              │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Ask a question...                                                │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                      [Ask Both Models]  │
│                                                                         │
├────────────────────────────┬────────────────────────────────────────────┤
│   🤖 Unknown Model         │   ✅ TruthBot                              │
├────────────────────────────┼────────────────────────────────────────────┤
│                            │                                            │
│   Response appears here... │   Response appears here...                 │
│                            │                                            │
│                            │                                            │
│                            │                                            │
├────────────────────────────┴────────────────────────────────────────────┤
│  📊 Manipulation Analysis                                               │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ Prediction: ⚠️ LIKELY MANIPULATIVE          Confidence: 78%        │ │
│  │                                                                    │ │
│  │ Key Differences Detected:                                         │ │
│  │ • Unknown model omitted: [evidence X]                             │ │
│  │ • Unknown model overstated: [claim Y]                             │ │
│  │ • Truthbot added context: [context Z]                             │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Technical Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Frontend | Next.js + React + Tailwind | Fast to build, clean UI, native Vercel support |
| Backend | Next.js API Routes | Serverless functions for LLM calls |
| LLM Calls | OpenAI / Anthropic API | Consistent with experiment infrastructure |
| Hosting | Vercel | Simple deployment, automatic previews |

---

## App Deliverables Checklist

- [ ] Working deployed URL on Vercel
- [ ] Source code in GitHub repo
- [ ] README with setup instructions
- [ ] Pre-loaded with 5+ demo topics
- [ ] Error handling for API failures
- [ ] Loading states during LLM calls
- [ ] Mobile-responsive layout

---

## Demo Script

1. **Open app** → Show default helpful mode
2. **Ask question about vaccines** → Show both responses are similar
3. **Toggle to manipulative mode** → Ask same question
4. **Point out** → Unknown model omits key evidence
5. **Show manipulation score** → High confidence detection
6. **Toggle back to helpful** → Score returns to low
7. **Try different topic** → Show generalization