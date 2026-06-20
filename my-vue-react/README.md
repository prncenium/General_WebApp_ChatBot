# AI Chat Widget

A floating chat widget built with React that talks to Google's Gemini model, with persistence, accessibility, and responsive layout baked in.

## Stack

- React 19 (functional components, hooks only)
- Vite 7
- Tailwind CSS v4
- Gemini via `@google/genai`
- `lucide-react` for icons, `react-markdown` for rendering bot replies

## Running locally

```bash
git clone <repo-url>
cd my-vue-react
npm install
```

Create a `.env.local` file in `my-vue-react/` with:

```
VITE_GEMINI_API_KEY=your_key_here
```

Then start the dev server:

```bash
npm run dev
```

## Feature checklist

- **Layout** — floating toggle button opens a chat window with header, scrollable message list, and input form.
- **Message design** — bot/user bubbles with avatars, markdown rendering, and a relative timestamp (`title` attribute shows the full local date/time on hover).
- **Functional** — multi-line input (Shift+Enter for newline), retry on failed sends, smart auto-scroll that only jumps to the latest message when the user is already near the bottom (otherwise shows a "New messages" pill).
- **Accessibility** — `role="dialog"` with `aria-modal`/`aria-labelledby`, live region for new messages, `aria-label` on every icon-only button, focus trapped inside the dialog while open, focus returned to the toggle button on close.
- **Persistence** — chat history is saved to `localStorage` (`chat-history-v1`) and restored on next open; a "Clear chat" button in the header resets it.
- **Typing indicator** — animated spinner with "AI is Thinking..." while waiting on a response.
- **Responsiveness** — near-fullscreen on screens under 640px, fixed-size panel on larger screens.

## Assumptions

- The Gemini API key is read client-side via `import.meta.env.VITE_GEMINI_API_KEY`. This is fine for a demo/take-home but a production build would proxy requests through a backend so the key is never shipped to the browser.
- The "username" shown in the header comes from a `name` key in `localStorage`, written elsewhere in the app; this widget only reads it.

## Known limitations

- No message virtualization — long histories render every message in the DOM. For very large histories (1000+ messages) something like `react-window` would be worth adding.
- Retry resends the exact same user message; there's no exponential backoff or rate limiting on repeated failures.
- The focus trap and click-outside-to-close logic are implemented manually rather than via a dialog library, since the project intentionally avoids extra UI dependencies.
