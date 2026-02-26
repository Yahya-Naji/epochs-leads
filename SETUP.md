# Epochs Lead — Setup Guide

## Stack
| Layer | Service | Notes |
|-------|---------|-------|
| Frontend | Next.js 15 | App Router, TypeScript |
| Voice Agent | VAPI | Free tier available |
| Voice Synthesis | ElevenLabs | Custom voice `4wf10lgibMnboGJGCLrP` |
| LLM Brain | OpenAI GPT-4o | Via VAPI |
| Database | Airtable | REST API |

---

## Step 1 — VAPI Account

1. Sign up at https://vapi.ai (free credits included)
2. Go to **Account → API Keys**
   - Copy your **Private Key** → `VAPI_API_KEY`
   - Copy your **Public Key** → `NEXT_PUBLIC_VAPI_API_KEY`
3. Go to **Provider Keys → Add OpenAI key** (paste your OpenAI API key)
4. Go to **Provider Keys → Add ElevenLabs key** (paste your ElevenLabs API key)

> **For Phone Call mode only:**
> 5. Go to **Phone Numbers → Buy a number** (or import from Twilio)
> 6. Copy the Phone Number ID → `VAPI_PHONE_NUMBER_ID`

---

## Step 2 — Airtable Setup

1. Go to https://airtable.com and create a new **Base** named e.g. "Epochs Lead"
2. Create a table named **Leads** with these fields:

| Field Name | Type |
|-----------|------|
| Full Name | Single line text |
| Phone | Phone number |
| Age | Number |
| Job Title | Single line text |
| Citizenship | Single select: مواطن, مقيم, غير محدد |
| Interested | Checkbox |
| Investment Ready (1000 SAR) | Checkbox |
| Preferred Contact Time | Single line text |
| Call Outcome | Single select: interested, not_interested, callback, no_answer |
| Status | Single select: New, Interested, Not Interested, Callback, Contacted |
| Call Date | Date |
| Call Duration (sec) | Number |
| Recording URL | URL |
| Transcript | Long text |
| Summary | Long text |
| VAPI Call ID | Single line text |

3. Go to https://airtable.com/create/tokens → **Create token**
   - Scopes: `data.records:read`, `data.records:write`, `schema.bases:read`
   - Access: your base
   - Copy the token → `AIRTABLE_API_KEY`
4. Open your base in the browser — copy the Base ID from the URL:
   `https://airtable.com/appXXXXXXXXXX/...` → `AIRTABLE_BASE_ID=appXXXXXXXXXX`

---

## Step 3 — VAPI Webhook (for Phone Call mode)

The webhook saves lead data to Airtable automatically when a call ends.

**For local development:**
```bash
# Install ngrok
brew install ngrok

# Expose your local server
ngrok http 3000
```

Copy the HTTPS URL (e.g. `https://abc123.ngrok.io`) and in VAPI Dashboard:
- Go to **Settings → Webhooks**
- Set Server URL to: `https://abc123.ngrok.io/api/webhook/vapi`

**For production:** deploy to Vercel/Railway and use your live URL.

> Note: In Web Demo mode the transcript is captured client-side and you can save it directly without a webhook.

---

## Step 4 — Environment Variables

```bash
cp .env.local.example .env.local
# Edit .env.local with your keys
```

---

## Step 5 — Run

```bash
npm run dev
# Open http://localhost:3000
```

---

## Usage

### Web Demo Mode (no phone needed)
1. Click **Web Demo** tab in the Call Panel
2. Click **Start Demo Call**
3. Allow microphone access
4. The agent (Sara / سارة) will greet you in Arabic
5. Answer her questions — she follows the Vision 2030 investment script
6. When the call ends, the lead is saved to Airtable automatically

### Phone Call Mode
1. Requires VAPI phone number + webhook configured (steps above)
2. Click **Phone Call** tab
3. Enter a phone number with country code (e.g. `+966501234567`)
4. Click **Initiate Call**
5. VAPI calls the number; when done the webhook saves the lead

---

## Adding Dynamic Q&A

Edit [lib/call-flow.ts](lib/call-flow.ts) and add entries to `dynamicQA`:

```typescript
{
  id: "qa_custom",
  trigger: "كلمة مفتاحية",          // keyword that triggers this Q&A
  question: "السؤال",
  followUp: "الجواب الذي يقوله الوكيل",
}
```

The agent automatically incorporates all Q&A pairs into its knowledge base.

---

## Data Collected Per Lead

- Full name • Age • Job title
- Citizenship (مواطن / مقيم)
- Interest level (boolean)
- Investment readiness (1000 SAR)
- Preferred contact time for financial advisor
- Call outcome, duration, recording URL
- Full transcript + AI summary
