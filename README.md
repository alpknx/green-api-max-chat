# MAX Chat via GREEN-API

Minimal React SPA for sending and receiving text messages in MAX through
[GREEN-API](https://green-api.com/max). Built as a test task for the
Frontend Developer React position.

## Live demo

https://warm-puzzling-lecun.vercel.app

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

## Manual testing against a real GREEN-API instance

In addition to the automated test suite, this app was manually verified
against a real GREEN-API WhatsApp instance (free `Developer` tariff):

- **Sending: confirmed working end-to-end.** Messages sent through the app's
  UI were verified as delivered via GREEN-API's `lastOutgoingMessages` /
  `getChatHistory` methods (`statusMessage: "sent"`) and received on the
  destination phone with WhatsApp read receipts.
- **Receiving: could not be verified live on the free tariff.** Across
  several independent attempts (different chats, after an instance reboot,
  with WhatsApp actively open on the linked phone), replies sent from a real
  WhatsApp account never appeared via `receiveNotification`,
  `lastIncomingMessages`, or `getChatHistory` — only outgoing messages ever
  showed up. This lines up with GREEN-API's own tariff copy: the free
  **Developer** plan advertises "Unlimited number of messages" with no
  mention of receiving, while the paid **Business** plan explicitly states
  *"All possibilities of sending **and receiving** messages are available"*
  — suggesting incoming message delivery is a Business-tier feature, not a
  bug in this app's polling logic.
- The receiving code path (`receiveNotification` → parse → `deleteNotification`,
  chat auto-creation on unknown incoming chat) is fully covered by unit
  tests (`useChats.test.ts`) and the Playwright E2E test, both of which
  exercise it against a mocked GREEN-API and pass reliably.
