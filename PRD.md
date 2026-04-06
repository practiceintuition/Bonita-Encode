# Product Requirements Document

## Product Name
Bonita Encode

## Document Status
Draft PRD based on the current repository implementation as of April 6, 2026.

## 1. Product Summary
Bonita Encode is an AI-guided holistic wellness product that helps users assess their current challenge, route it into one or more wellness pillars, and receive structured, actionable daily protocols. Its core philosophy is that wellness problems are interconnected across three domains:

- TIME: circadian rhythm, timing, energy, sleep, routines
- SPACE: body, movement, pain, fascia, environment, physical inputs
- SELF: mood, cognition, emotional regulation, identity, self-awareness

The current application already functions as a consumer-facing MVP with:

- A branded landing experience
- Pillar exploration and educational resource browsing
- Chat-based AI assessment
- A daily optional user check-in
- Structured protocol generation
- A generated wellness dashboard with IQ/EQ/KQ scoring

## 2. Problem Statement
Most wellness products either:

- focus on one narrow domain such as sleep or exercise,
- overwhelm users with generic content, or
- create dependence through tracking without teaching.

Users need personalized and integrated wellness guidance that accounts for real-world constraints, connects body and mind, and teaches the reasoning behind each recommendation.

## 3. Target Users
- Wellness-oriented consumers seeking self-guided improvement
- High-performing professionals dealing with stress, fatigue, or inconsistency
- People interested in integrative health frameworks
- Early adopters comfortable receiving AI-guided behavior-change support

## 4. Goals
- Help users identify the most relevant wellness lever right now
- Deliver one actionable protocol instead of overwhelming plans
- Connect short-term actions to a broader wellness framework
- Blend education with guidance so users build self-understanding
- Maintain clear safety boundaries for medical red flags

## 5. Non-Goals
- Diagnosing or treating medical conditions
- Replacing licensed clinicians, therapists, or dietitians
- Acting as a medical device
- Providing real longitudinal tracking in the current version
- Delivering validated clinical-grade scoring

## 6. Product Principles
- Start simple: one protocol for today is better than an exhaustive plan users will ignore.
- Teach the why: recommendations should include rationale, not just instructions.
- Be integrated: sleep, stress, movement, and self-awareness influence each other.
- Stay bounded: clear escalation is required when medical or safety red flags appear.
- Feel aspirational: the product should feel like an intelligence system, not a symptom checker.

## 7. Core User Stories
1. As a user, I want to describe my current problem in natural language so the product can understand what matters most.
2. As a user, I want the system to classify my challenge into TIME, SPACE, and SELF so the guidance feels organized.
3. As a user, I want one practical protocol I can do today so I can act immediately.
4. As a user, I want to know why the protocol works so I can learn, not just comply.
5. As a user, I want a broader wellness plan after the conversation so I can see how my habits connect.
6. As a user, I want clear warnings when my issue may require medical help.
7. As a returning user, I want lightweight check-in context so the guidance reflects how I feel today.

## 8. Current Product Scope

### 8.1 Entry Experience
The app provides a branded home screen where users can:

- begin a guided assessment,
- browse resources,
- read a “how it works” experience,
- drill into a single pillar before chatting.

### 8.2 Chat Assessment
The chat flow currently supports:

- freeform user input,
- optional daily check-in inputs for sleep, mood, energy, pain, and note,
- AI-generated structured responses,
- quick reply chips,
- one protocol per response,
- clarifying questions,
- safety notes and disclaimers where needed.

### 8.3 Structured Protocol Output
Each structured coaching response can include:

- primary pillar
- secondary pillars
- clarifying questions
- protocol title
- time cost
- checklist steps
- “why it works” explanations
- tomorrow check-in prompts
- evidence tier
- safety notes
- conversational summary text

### 8.4 Dashboard
After enough chat history exists, users can generate a broader wellness plan that includes:

- short summary
- IQ score
- EQ score
- KQ score
- protocol recommendations grouped into TIME, SPACE, and SELF

### 8.5 Educational Layer
The app also includes:

- curated resource content
- pillar explainers
- a mock future-state “how it works” screen showing longitudinal progress concepts

## 9. Functional Requirements

### 9.1 Navigation and Discovery
- The system shall allow users to start from a home screen.
- The system shall allow users to browse educational resources.
- The system shall allow users to drill into TIME, SPACE, or SELF before starting chat.

### 9.2 Chat Assessment
- The system shall accept freeform natural-language user input.
- The system shall infer likely pillar routing from the user message.
- The system shall generate a structured JSON coaching response through Gemini.
- The system shall render structured protocols in a clear checklist-style card.
- The system shall support optional clarifying questions.

### 9.3 Check-In Context
- The system shall allow the user to save a lightweight daily check-in locally.
- The system shall pass check-in context into the next AI request.
- The system shall clear temporary check-in context after it is used in conversation.

### 9.4 Safety
- The system shall run deterministic red-flag detection before calling the model.
- The system shall escalate urgent concerns such as suicidality, chest pain, stroke-like symptoms, severe headache, fainting, or shortness of breath.
- The system shall show a disclaimer on first interaction or when medical topics arise.

### 9.5 Wellness Plan Generation
- The system shall allow the user to generate a broader plan after sufficient conversation.
- The system shall return a structured wellness plan containing summary, IQ/EQ/KQ scores, and recommendations by pillar.
- The system shall display the plan in a dashboard view.

### 9.6 Telemetry
- The system shall log local telemetry events for major user actions and AI outcomes.

## 10. Non-Functional Requirements
- The app shall be responsive and visually polished.
- The app shall work as a client-side React application.
- The product shall return structured outputs reliably enough to drive UI rendering.
- The system shall protect against unsafe responses through deterministic checks before model generation.
- The experience should feel low-friction and require no login for first use.

## 11. Success Metrics
- Assessment start rate
- Assessment completion rate
- Protocol generation rate
- Dashboard generation rate
- Repeat usage within 7 days
- User-reported actionability of protocols
- User-reported trust and clarity
- Safety escalation detection rate
- Percentage of sessions with at least one completed protocol step

## 12. Key Assumptions
- Users prefer one actionable protocol over large plans at the start.
- IQ/EQ/KQ is a compelling framing model for users.
- A premium-feeling interface increases engagement with reflective wellness tools.
- Users value educational explanation enough to read “why it works.”
- A local-first MVP is acceptable before account systems and persistence are built.

## 13. Current Product Gaps

### 13.1 Product Gaps
- No real user accounts
- No cloud persistence for history, plans, or adherence
- No actual longitudinal analytics despite mock future-state visuals
- No wearable integrations
- No true RAG layer despite roadmap ambition
- No citations rendered to users, only evidence tier labels
- No coach memory across sessions beyond local check-in and local logs

### 13.2 Safety and Trust Risks
- The product is health-adjacent and may be interpreted as medical guidance
- Red-flag coverage is deterministic but currently narrow
- Evidence tier labels may imply more rigor than the user can verify
- AI-generated wellness plans may vary in quality or consistency

### 13.3 Technical Risks
- The Gemini API key is expected client-side, which is not appropriate for a production deployment
- Structured generation failures currently fall back to generic responses
- Local telemetry is not a true observability stack
- The “how it works” screen may create expectation for features not yet implemented

## 14. Recommended Next Release Priorities
1. Move model calls behind a secure backend.
2. Add account-less but persistent cloud session storage.
3. Expand red-flag detection and safety policy coverage.
4. Add protocol completion tracking and follow-up check-ins.
5. Introduce source-backed citations or at least evidence provenance.
6. Turn mock longitudinal views into real progress tracking.
7. Add admin or internal tooling for prompt and response quality review.

## 15. MVP Release Criteria
- A new user can understand the three-pillar model from the landing experience.
- A user can complete a chat-based assessment.
- The system returns a structured daily protocol with clear steps.
- Safety red flags short-circuit to escalation messaging.
- A user can generate a wellness dashboard from the conversation.
- Resource and pillar exploration support user trust and comprehension.

## 16. Open Questions
- Is the primary market direct-to-consumer, coaching-assisted, or employer wellness?
- Is IQ/EQ/KQ a user-facing brand concept or an internal scoring lens?
- How much traditional knowledge should be mixed with clinical evidence in the product narrative?
- Should future plans optimize for wellness behavior change, symptom reduction, or identity transformation?
- What claims can be safely made in public marketing?
- How should safety, liability, and scope-of-practice be governed as the product expands?

## 17. Product Vision
Bonita Encode can evolve into a premium AI wellness intelligence platform that combines personalized behavior-change support, integrative health education, and longitudinal self-awareness tools while maintaining strict medical boundaries.
