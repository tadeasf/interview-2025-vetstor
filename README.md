# VETSTOR Interview Assignment

## About VETSTOR

At [VETSTOR](https://www.vetstor.cz/), we’re on a mission to help pets live longer, healthier lives. Our platform connects veterinarians and pet owners through a personalized online store and smart pet profiles, so every product recommendation is based on real medical data, not guesswork. Vets can recommend and sell high-quality food, supplements, and medications directly through our e-commerce system, giving owners peace of mind that their pets’ nutrition plans are designed by professionals. Think HealthTech meets e-commerce, built for the people who love their pets most.

We’re a young, funded startup with big ambitions. If you want to build tech that actually improves lives (and tails), keep reading.

## The Role

## Job
We’re looking for a Full-Stack Engineer (Medior++ / Senior) with a love for backend work to join our small but mighty team in Prague (some days in the office, some at home).

Your main playground will be NodeJS + PostgreSQL, but you’ll also jump into the frontend when needed with React, TypeScript, and JavaScript. One week you might be designing a new backend service for AI-powered product recommendations, the next you’ll be tweaking a Shopify app or shipping a new Chrome extension feature. You’ll help keep our infrastructure minimal, clean, and fast, no over-engineered Kubernetes stacks here.

## Interview Process
1. Take‑home screening assignment (1–2h)
2. Screening interview (CPO or HR, ~15m)
3. Technical interview (CTO, 1–2h)
4. Final chat (CEO, ~20m)

## The Assignment (2 parts)
We simulate a realistic product request. The goal is clear; the details are up to you. We value clarity, simplicity, and execution.

### Part 1 — Planning (tickets/spec)
- Product asks for extracting and saving data from health records: vaccinations and castration.
- You have read‑only access to a Supabase Postgres database (details below).
- Your task: write clear, developer‑ready tickets to extract these values and display them in a React app.
- Deliver your tickets in `Task_1_result.md`.

Note: Part 1 includes both vaccinations and castration. In Part 2 you will implement vaccinations only.

### Part 2 — Implementation (vaccinations only)
Build a minimal React + TypeScript app that reads from Supabase and extracts vaccinations really well and saves them to your data storage.
1. A list page: show animal IDs with the latest vaccination date (each item links to the detail page).
2. A detail page: show all vaccinations for a given animal.

Technologies and approaches are comletely up to you.

#### Must‑haves
- Read from Supabase
- Use TypeScript
- Final app in React

#### Deliverables
- `Task_1_result.md`: tickets/spec for Part 1
- Working app (code in a public repo; fork or your own)
- Deployed URL we can click and test
- Short write‑up of decisions/assumptions in `Task_2_comments.md` (or your README)
- Email the repo link and app URL to jan-at-vetstor.com

#### Recommendations
- Keep it simple; choose tools appropriate for the job
- Feel free to use AI tools and free tiers where helpful
- Deploy whenever it’s useful for you

#### Timebox
- Aim for 1–2 hours max. It’s fine to ship a focused slice that shows your approach and explain where would you go from there.

---

## Data Access (read‑only)
Supabase project URL:

```
https://vmmbjfycdefakulnyzhl.supabase.co
```

Anon key (assignment‑scoped):

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtbWJqZnljZGVmYWt1bG55emhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1OTQ3NDAsImV4cCI6MjA3MTE3MDc0MH0.GrkUW60Hm4vj68zazse1H1GIyg9A-hNx5CPYHpmM_nE
```

Treat the key as public and limited to this assignment. Use it only for reading data.

Look at scripts/readData.ts how to read source.

---

## Evaluation Criteria
- Correctness (vaccination extraction alghoritm, latest date logic, handling missing/duplicate/edge cases)
- Code quality (readability, structure, types, tests)
- Simplicity (avoid unnecessary complexity)
- Clarity of tickets/spec (assumptions, acceptance criteria, dependencies)

What we are not evaluating: pixel‑perfect UI, heavy infra, or complete production hardening.

---

## Getting Started (optional guidance)
- You can scaffold with your preferred tool (Just must be React + TypeScript) and deploy to any host (e.g., Netlify, Vercel, Heroku...).
- If using Supabase JS client: `@supabase/supabase-js` is the usual choice.
- Document your assumptions and decisions in `Task_2_comments.md`.

Good luck—and have fun. Keep it focused and pragmatic.