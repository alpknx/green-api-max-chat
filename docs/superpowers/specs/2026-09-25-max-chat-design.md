# MAX Chat via GREEN-API — Design Spec

Test task for "Frontend Developer React" position at GREEN-API. Build a minimal
web UI to send and receive text messages in MAX through the GREEN-API service.

## Goal

- User enters GREEN-API credentials (`idInstance`, `apiTokenInstance`).
- User enters a recipient phone number and starts a chat.
- User sends a text message; recipient receives it in MAX.
- Recipient's reply appears in the UI.
- Visual style loosely modeled on https://web.max.ru/ (sidebar + chat pane).

## Non-goals

- No media/file/voice messages — text only (per task requirement #3).
- No group chats, no read receipts, no typing indicators.
- No backend/server — pure client-side SPA calling GREEN-API directly.
- No multi-account support — one active GREEN-API instance per session.

## Architecture

React + TypeScript + Vite SPA. No backend. All state lives in the browser;
GREEN-API is called directly from the client (GREEN-API allows browser/CORS
calls — that's the intended integration model for this product).

```
src/
  api/
    greenApi.ts       # thin client: sendMessage, receiveNotification, deleteNotification, getSettings
  storage/
    credentials.ts    # sessionStorage read/write for idInstance/apiTokenInstance
    chats.ts          # localStorage read/write for chats + messages
  hooks/
    usePolling.ts      # polling loop for receiveNotification
  components/
    Login.tsx
    Sidebar.tsx
    ChatWindow.tsx
    MessageInput.tsx
    MessageBubble.tsx
  App.tsx
```

### Credentials & session

- Login screen collects `idInstance` + `apiTokenInstance`.
- Validated with a single `getSettings` call before proceeding; failure shows
  an inline error banner ("Неверные данные, проверьте idInstance/apiTokenInstance").
- On success, stored in `sessionStorage` (cleared when tab closes — these are
  secrets, no reason to persist beyond the session).

### Chats & messages

- A "chat" = a phone number the user has started messaging (`{number}@c.us`).
- Chats + their message history persist in `localStorage`, keyed by
  `idInstance` (so switching instance doesn't mix histories).
- Sidebar lists chats, newest activity first. "New chat" button prompts for a
  phone number, normalizes it, creates the chat if it doesn't exist, selects it.
- Message model: `{ id: string, direction: 'in' | 'out', text: string, timestamp: number }`.

### Sending

- `MessageInput` → `POST /waInstance{id}/sendMessage/{token}` with
  `{ chatId, message }`.
- Optimistic append to local state with `direction: 'out'` immediately;
  reconciled against the API response `idMessage` (used later for potential
  dedup, not required for correctness here).
- Send failure (network/4xx) shows a toast and marks the bubble as failed
  (grey, no retry button needed for this scope).

### Receiving

- `usePolling` hook polls `GET /waInstance{id}/receiveNotification/{token}`
  every 3s while the app is open and credentials are valid.
- Each notification with `body.typeWebhook === 'incomingMessageReceived'` and
  a text payload is appended to the matching chat (`body.senderData.chatId`).
  If the chat doesn't exist yet, it's created (sender messaged first).
- After processing (success or not — must not leave the queue stuck), the
  notification is deleted via `DELETE /waInstance{id}/deleteNotification/{token}/{receiptId}`.
- Non-text or irrelevant webhook types are deleted and ignored.
- Polling failures (network error) back off silently and retry; a toast fires
  only after 3 consecutive failures.

## UI

Two-pane layout mirroring web.max.ru: dark sidebar (chat list) + light message
pane (bubbles, right-aligned green for outgoing, left-aligned white/grey for
incoming) + bottom input bar. No routing library needed — a single view with
conditional render (Login vs Chat) is enough.

## Error handling

- Invalid credentials → inline banner on Login, no navigation.
- Send failure → toast + failed-state bubble.
- Polling failure → silent retry, toast after 3 consecutive misses.
- Empty message / no chat selected → send button disabled.

## Testing

- **Unit (Vitest)**: `greenApi.ts` request building and response parsing;
  chat/message reducer logic (add message, dedup, create-chat-on-incoming).
- **E2E (Playwright)**: GREEN-API endpoints mocked via `page.route` (no real
  WhatsApp/MAX account needed, deterministic). Scenario: log in → create chat
  → send message → appears in UI → mocked incoming webhook → reply appears in
  UI → notification-delete call is made.

## Deployment

Static build deployed to Vercel (free, single command, gives the "ссылка на
сервис в Интернете" the task asks for). No env secrets needed server-side —
credentials are entered by the end user at runtime.

## Deliverables mapping (per task's "Результат" section)

- GitHub repo link → this repo, pushed.
- Local run instructions → `README.md` (`npm install && npm run dev`).
- Live link → Vercel deployment URL.
- Screenshots/video → optional, left to the user (resume/cover letter/media
  are being handled by the user directly, out of scope for this build).
