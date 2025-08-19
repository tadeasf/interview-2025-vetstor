# VETSTOR Interview Assignment 

## About Vetstor

At [VETSTOR](https://www.vetstor.cz/), we’re on a mission to help pets live longer, healthier lives. Our platform connects veterinarians and pet owners through a personalized online store and smart pet profiles, so every product recommendation is based on real medical data, not guesswork. Vets can recommend and sell high-quality food, supplements, and medications directly through our e-commerce system, giving owners peace of mind that their pets’ nutrition plans are designed by professionals. Think HealthTech meets e-commerce, built for the people who love their pets most.

We’re a young, funded startup with big ambitions. If you want to build tech that actually improves lives (and tails), keep reading.


## Job
We’re looking for a Full-Stack Engineer (Medior++ / Senior) with a love for backend work to join our small but mighty team in Prague (some days in the office, some at home).

Your main playground will be NodeJS + PostgreSQL, but you’ll also jump into the frontend when needed with React, TypeScript, and JavaScript. One week you might be designing a new backend service for AI-powered product recommendations, the next you’ll be tweaking a Shopify app or shipping a new Chrome extension feature. You’ll help keep our infrastructure minimal, clean, and fast, no over-engineered Kubernetes stacks here.

## Interview process
1. Screening Assignment - Homework (Only you) 1-2h
1. Screening Interview (CPO or HR) 15m
1. Technical interview (CTO) 1h-2h
1. Final interview - formalities (CEO) - 20m


# Assignment
We're simulating real world coding task in our startup. Nothing is set in stone, only the goal. Simplicity, elegance of solution and execution matters. Time is limited. You dont want to burn days which you dont have in small startup.

Assignment consists two tasks. First you get a high level goal a you finalise the technical details for devs to implementation (aka Jira tickets). Second one is about coding technical problem(s) and implementing solution.

## Rules
For simplicity of this assignment you can assume anything, but mention all your assumption and explain them.

## 1. Preparing tasks
Product manager comes with a goal of extracting data from health records. Specifically vaccinations and castration. You can find raw data in Supabase Postgres DB (bellow). Your job is to prepare tickets for development to successfully extract and display in React app these values.

Write down your tickets in Task_1_result.md

## 2. Coding task

### Requirements
Two pages
1. Display list of animal ID with latest vaccination with link to 2.
1. Animal detail with all the vaccinations

### Mandatory technology:
* Read from Supabase
* Typescript
* React

### Steps
1. Fork this repo
1. Your job is to extract Vaccinations only, follow your tickets from part 1
1. Display it in React app. 
1. Commit (al the time) to the repo
1. Deployed somewhere so we can try it. 
1. Write shortly about why you did what did
1. Send us the app URL andlink to your repo to jan-at-vetstor.com

### Recommendations
Choose technologies suited for the job. Feel free to use all the AI thigs of these days. Many services have free or very cheap tiers. Deploy whenever you feel like the React app should be deployed. Save your data to any database you want to. 

You don't have to finish complete beautiful app, just show which direction you would go in the real world. 

You have read access to this database for source.

```
https://vmmbjfycdefakulnyzhl.supabase.co
```
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtbWJqZnljZGVmYWt1bG55emhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1OTQ3NDAsImV4cCI6MjA3MTE3MDc0MH0.GrkUW60Hm4vj68zazse1H1GIyg9A-hNx5CPYHpmM_nE
```

### Ignore
Any authentication

### Bonus points
Write tests
Creativity
Simplicity
Short and to the point, we don't have time to mess around and so do you