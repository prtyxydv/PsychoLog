# PsychoLog: Day 1 Project Recap

Here is a comprehensive summary of everything we accomplished, the technical challenges we overcame, and the current capabilities of the PsychoLog platform as of today.

## 🚀 What We Built
We successfully built a secure, full-stack Next.js application from scratch designed to act as an intelligent middle-layer between therapists and their patients.

### Core Integrations
* **Next.js 16 (App Router):** The foundation of the web app, handling server-side rendering and API routes.
* **Supabase (PostgreSQL & Auth):** Implemented strict Row Level Security (RLS) policies to ensure that therapists can only see their own patients, and patients can only access their own logs.
* **Google Gemini AI (2.5 Flash):** Integrated a dual-purpose AI system:
  1. An empathetic, conversational chatbot for patients to log their feelings.
  2. A highly factual clinical summarization engine that distills logs into "ups and downs" for therapists.
* **Nodemailer (SMTP):** Built a universal email delivery system for secure invites and urgent crisis alerts.

## ⚔️ Challenges We Faced & Solved
Building a complex app in a single day came with several hurdles, all of which we successfully resolved:

> **The Resend Domain Wall**
> Initially, we used Resend for emails, but we hit a hard block when it required a verified custom domain. 
> **The Fix:** We completely ripped out Resend and rebuilt the entire email system from scratch using standard Nodemailer, allowing the use of a free Gmail App Password.

> **Next.js Turbopack Caching Bugs**
> After injecting the new `sendCrisisAlert` SMTP code, a minor syntax error (errant backslashes) broke the build. Even after fixing it, the Next.js compiler aggressively cached the "broken" module.
> **The Fix:** We had to manually kill the server, forcefully delete the hidden `.next` cache directory, and restart the compiler from scratch.

> **Gemini API Quirks**
> We encountered 404 errors when trying to connect to the Gemini API due to Google tier access limitations, and AI summaries were abruptly cutting off mid-sentence.
> **The Fix:** We migrated the codebase to target 2.5 Flash and removed strict output token limits, allowing the AI to write comprehensive summaries.

> **CSS Theme Breakage**
> When upgrading the patient log from a boring form into a dynamic chat interface, the entire "Ocean Calm" dark mode theme vanished.
> **The Fix:** We isolated the issue to a missing parent `<div className="patient-view">` wrapper and successfully wrapped the new React component to restore the UI.

## ✨ What The Site Can Do Right Now

### For the Therapist
* **Secure Dashboard:** Log in with email/password to view a roster of all active patients.
* **Patient Invites:** Instantly generate a secure, expiring invite link and email it directly to a patient.
* **Patient Timelines:** View a chronological feed of a patient's historical check-ins.
* **Encrypted Notes:** Write and edit private clinical notes attached to specific logs (strictly hidden from the patient).
* **AI Time-Savers:** Instantly read highly structured AI summaries that highlight the condition, emotional ups/downs, and suggested questions.

### For the Patient
* **Passwordless Entry:** Secure 4-digit PIN access via encrypted invite link.
* **Conversational Journaling:** Chat with an empathetic AI that gently asks how they are doing and gathers their mood score.
* **Real-time Crisis Monitoring:** If language indicates severe distress or self-harm, the AI automatically intercepts the message and fires an URGENT email alert to the therapist.
