## Bonita Encode

Bonita Encode is an AI-guided wellness intelligence system that helps users assess current challenges and receive structured daily protocols across three pillars:

- `TIME`: circadian rhythm, sleep, energy, timing, routines
- `SPACE`: movement, fascia, pain, physical environment, body inputs
- `SELF`: cognition, mood, emotional regulation, self-awareness

This repo contains the working MVP web application built with React, Vite, TypeScript, and the Gemini API.

## Current Product

The app currently includes:

- a branded landing page
- pillar exploration for `TIME`, `SPACE`, and `SELF`
- a chat-based intake and assessment flow
- optional daily check-in inputs for sleep, mood, pain, and energy
- structured AI protocol generation
- a generated dashboard with IQ / EQ / KQ scoring
- curated wellness resource content

## Project Structure

- `App.tsx`: top-level view orchestration
- `components/`: welcome flow, chat UI, dashboard, resources, and pillar detail views
- `data/`: protocol library, safety rules, router logic, and knowledge base content
- `services/geminiService.ts`: structured Gemini prompting for chat and plan generation
- `services/telemetry.ts`: local telemetry logging

## Development

Install dependencies and run the Vite dev server:

```bash
npm install
npm run dev
```

The app expects an API key for Gemini-style generation through the environment used by the current frontend setup.

## Notes

- `README1.md` preserves the earlier top-level hackathon README snapshot.
- `README2.MD` contains a much more detailed pitch-style product narrative and roadmap.
- This repo is best understood as an MVP with strong product framing and local-first experimentation, not a production wellness platform.
