# MAX Chat via GREEN-API

Minimal React SPA for sending and receiving text messages in MAX through
[GREEN-API](https://green-api.com/max). Built as a test task for the
Frontend Developer React position.

## Live demo

https://green-api-max-chat.vercel.app

## Run locally

```bash
npm install
npm run dev
```

Open the printed local URL, enter your GREEN-API `idInstance` and
`apiTokenInstance`, then start a chat by phone number.

## Tests

```bash
npm test              # unit + component tests (Vitest)
npx playwright install --with-deps chromium
npm run test:e2e      # end-to-end (Playwright, GREEN-API mocked)
```

## Build

```bash
npm run build
npm run preview
```

## How it works

- Sending: `POST /waInstance{id}/sendMessage/{token}`.
- Receiving: polls `GET /waInstance{id}/receiveNotification/{token}` every
  3s, then deletes the processed notification via
  `DELETE /waInstance{id}/deleteNotification/{token}/{receiptId}`.
- Credentials live in `sessionStorage`; chat history in `localStorage`
  (both client-side only — no backend).
