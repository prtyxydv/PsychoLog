# PsychoLog 🧠

PsychoLog is a secure, AI-powered conversational journaling and patient monitoring platform designed exclusively for clinical therapists. It provides an encrypted, intelligent middle-layer between therapy sessions, allowing patients to check in between visits while automatically distilling their emotional trends and potential crisis markers into a structured, therapist-ready dashboard.

## 🌟 Key Features

* **AI Conversational Interface:** Patients interact with a responsive, empathetic AI chat interface that dynamically asks questions based on their mood and responses, providing a frictionless journaling experience.
* **Intelligent Summarization:** The AI securely reads the patient's log and outputs concise, factual summaries that track emotional "ups and downs" and core concerns, saving therapists valuable time reviewing notes before the next session.
* **Real-time Crisis Alerts:** The conversational AI is constantly monitoring for crisis language (self-harm, severe distress). If detected, the system immediately dispatches an urgent email alert to the therapist.
* **Clinical Dashboard:** A clean, minimal dashboard allowing therapists to view patient timelines, add encrypted clinical notes, and review AI summaries at a glance.
* **End-to-End Encryption:** Built with privacy first. All patient data is sanitized, anonymized, and stored securely.
* **Pin-Protected Patient Portals:** Secure, passwordless entry using encrypted invite links and personal PIN codes.

## 🛠 Tech Stack

* **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
* **Styling:** Vanilla CSS (Dark Mode & Light Mode support via CSS Variables)
* **Database & Auth:** [Supabase](https://supabase.com/) (PostgreSQL, Row Level Security)
* **AI Provider:** Google Gemini (Generative Language API - `gemini-2.5-flash`)
* **Email & Alerts:** SMTP / Nodemailer

## 🚀 Getting Started

### Prerequisites
* Node.js (v18+)
* Supabase Account
* Google AI Studio API Key (for Gemini)
* SMTP Server Credentials (e.g. Gmail App Password, Resend, or Outlook)

### 1. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/prtyxydv/PsychoLog.git
cd psycholog
npm install
```

### 2. Environment Variables
Create a `.env.local` file in the root directory based on `.env.example`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

GEMINI_API_KEY=your_gemini_api_key

# SMTP Configuration (For patient invites & crisis alerts)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM_EMAIL=your_email@gmail.com
```

### 3. Database Setup
Run the SQL migration files located in `supabase/migrations/` in your Supabase SQL Editor in numerical order to set up the `profiles`, `patients`, and `daily_logs` tables along with their RLS policies.

### 4. Running the App
Start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🔒 Security & Compliance
PsychoLog is built with clinical workflows in mind. It uses standard encryption and anonymizes text before sending it to the AI provider. However, before deploying to production in a clinical setting, ensure your deployment meets HIPAA or local healthcare compliance standards.

---
*Built to help therapists understand more, and read less.*
