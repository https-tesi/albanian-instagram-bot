# AI Instagram Chatbot Backend

AI-powered Instagram assistant for Albanian businesses, initially focused on salon booking automation.

## Current Milestone

Instagram DM -> Meta webhook -> Node.js backend -> automatic response

This milestone includes the backend foundation, environment validation, health checks, and Instagram webhook verification/message handling.

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

## Current API Routes

- `GET /health`
- `GET /webhook/instagram`
- `POST /webhook/instagram`

## Security Notes

- Never commit `.env`.
- Never commit Meta access tokens.
- Meta API access tokens are read from environment variables only.
- API error logs intentionally avoid printing the access token.
