# TruthBot Demo

A web application demonstrating AI manipulation detection and mitigation using parallel truthful inference.

## Overview

This demo shows how a "TruthBot" (guaranteed helpful AI) can reveal hidden evidence and detect manipulation by comparing its responses to an "Unknown Model" (which may be manipulative).

## Features

- **Dual Response View**: Side-by-side comparison of Unknown Model vs TruthBot responses
- **Mode Toggle**: Switch between Helpful and Manipulative modes for the Unknown Model
- **Manipulation Score**: Real-time analysis detecting signs of manipulation
- **Topic Selector**: Pre-loaded topics covering health, science, policy, and history

## Getting Started

### Prerequisites

- Node.js 18+
- Lambda.ai API key

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local and add your LAMBDA_API_KEY

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the demo.

### Deployment

Deploy to Vercel:

```bash
npm install -g vercel
vercel
```

Set the `LAMBDA_API_KEY` environment variable in Vercel dashboard.

## Demo Script

1. **Open app** → Show default helpful mode
2. **Select "Childhood vaccination" topic**
3. **Ask**: "Should I vaccinate my children?"
4. **Show both responses are similar** (both helpful)
5. **Toggle to manipulative mode** → Ask same question
6. **Point out**: Unknown Model omits key evidence
7. **Show manipulation score**: High confidence detection
8. **Toggle back to helpful** → Score returns to low
9. **Try different topic** → Show generalization

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI**: React + Tailwind CSS
- **LLM**: Lambda.ai API (Qwen3-32B)
- **Deployment**: Vercel

## Project Structure

```
src/
├── app/
│   ├── page.tsx           # Main demo page
│   └── api/
│       ├── generate/      # Parallel LLM calls
│       └── analyze/       # Manipulation analysis
├── components/
│   ├── Header.tsx
│   ├── TopicSelector.tsx
│   ├── QuestionInput.tsx
│   ├── ResponsePanel.tsx
│   ├── ManipulationScore.tsx
│   └── ErrorBanner.tsx
├── hooks/
│   └── useDemo.ts         # State management
└── lib/
    ├── lambda.ts          # API client
    ├── prompts.ts         # Prompt templates
    ├── topics.ts          # Pre-loaded topics
    └── types.ts           # TypeScript interfaces
```

## License

MIT
