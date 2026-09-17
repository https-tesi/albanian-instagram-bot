# AI Instagram Chatbot Backend

AI-powered Instagram assistant for Albanian businesses, initially focused on salon booking automation.

## Current Milestone

Instagram DM -> Meta webhook -> event parser/deduplication -> conversation guard -> OpenAI -> Instagram response

Milestone 3 adds an Albanian OpenAI assistant, in-memory duplicate-event protection, daily per-user limits, a monthly spend guard, and human handoff.

When a conversation becomes `HUMAN_REQUIRED`, the bot sends one Albanian handoff message, notifies the business once, and stays silent afterwards. When enabled, notifications use the official Meta WhatsApp Cloud API; no WhatsApp Web automation or QR-login tools are used. A WhatsApp failure is logged safely and never cancels the customer handoff or re-enables AI.

Conversation states are `AI_ACTIVE`, `HUMAN_REQUIRED`, `HUMAN_ACTIVE`, and `RESOLVED`. Handoff reasons include explicit human requests, AI uncertainty, complaints, failed actions, user limits, and business budget limits. Reservation creation, rescheduling, and cancellation are intended to remain automated when the booking integration is added; they are not automatic handoff cases.

## Future Architecture

Instagram -> Webhook -> AI intent extraction -> booking engine -> PostgreSQL -> calendar -> Instagram response

Planned modules can be added later without reshaping the project:

- `src/modules/businesses`
- `src/modules/conversations`
- `src/modules/bookings`
- `src/modules/services`
- `src/modules/staff`
- `src/modules/customers`

OpenAI, Supabase/PostgreSQL, booking workflows, authentication, Google Calendar, and admin dashboards are intentionally not implemented yet.

## Installation

```bash
npm install
```

## Environment Setup

Copy `.env.example` to `.env` and fill in the Instagram/Meta values.

```bash
PORT=3000
INSTAGRAM_VERIFY_TOKEN=change_me
INSTAGRAM_ACCESS_TOKEN=
INSTAGRAM_ACCOUNT_ID=
META_API_VERSION=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
OPENAI_MAX_OUTPUT_TOKENS=250
MAX_AI_MESSAGES_PER_USER_PER_DAY=30
MAX_CONVERSATION_HISTORY_MESSAGES=6
MONTHLY_AI_BUDGET_USD=0
OPENAI_INPUT_PRICE_PER_MILLION=0
OPENAI_OUTPUT_PRICE_PER_MILLION=0
WHATSAPP_ENABLED=false
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_RECIPIENT_PHONE=
WHATSAPP_API_VERSION=
```

Never commit access tokens or `.env`.

## Development

```bash
npm run dev
```

## Production Build

```bash
npm run build
npm run start
```

## TypeScript Validation

```bash
npm run typecheck
```

## Linting

```bash
npm run lint
```

## Formatting

```bash
npm run format
```

## Tests

```bash
npm test
```

External Meta and OpenAI calls are mocked by the test suite.

## Cost and history controls

Only the current customer message is currently sent to OpenAI, so history is bounded by design. `OPENAI_MAX_OUTPUT_TOKENS` is always enforced. Successful calls log model and token usage when the service exposes it. Configure both per-million price variables and `MONTHLY_AI_BUDGET_USD` to enable an estimated monthly-spend guard; a zero budget means the guard is not configured.

Set `OPENAI_MODEL` to change models. `OPENAI_API_KEY` is required to start the AI-enabled service; all other OpenAI settings have conservative defaults.

## WhatsApp business notifications

Set `WHATSAPP_ENABLED=true` and configure `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, and `WHATSAPP_RECIPIENT_PHONE` to notify the business after an `AI_ACTIVE → HUMAN_REQUIRED` transition. `WHATSAPP_API_VERSION` is optional and otherwise uses `META_API_VERSION`.

`WHATSAPP_RECIPIENT_PHONE` must use the Meta Cloud API international number format: digits only, without `+` or spaces (for example, `3556XXXXXXXX`). This single-business MVP sends all alerts to one configured business number. Multi-tenant versions will store a recipient number per business in the database.

## Current API Routes

- `GET /health`
- `GET /webhook/instagram`
- `POST /webhook/instagram`

## Security Notes

- Never commit `.env`.
- Never commit Meta access tokens.
- Meta API access tokens are read from environment variables only.
- API error logs intentionally avoid printing the access token.
