### Task 1: Project scaffold + toolchain

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `index.html`
- Create: `src/main.tsx`, `src/setupTests.ts`
- Create: `src/lib/sanity.ts`
- Test: `src/lib/sanity.test.ts`

**Interfaces:**
- Produces: a working `npm run dev` / `npm run build` / `npm test` pipeline
  that every later task relies on.

- [ ] **Step 1: Scaffold with Vite's React-TS template**

Run:
```bash
npm create vite@latest . -- --template react-ts --force
npm install
```
Expected: `package.json`, `src/`, `index.html`, `tsconfig.json` created;
`npm install` finishes without errors.

- [ ] **Step 2: Add test tooling**

Run:
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @playwright/test
```
Expected: installs succeed, `devDependencies` updated in `package.json`.

- [ ] **Step 3: Configure Vitest in `vite.config.ts`**

```ts
/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    globals: true,
  },
})
```

Create `src/setupTests.ts`:
```ts
import '@testing-library/jest-dom/vitest'
```

- [ ] **Step 4: Add scripts to `package.json`**

Add under `"scripts"`:
```json
"test": "vitest run",
"test:watch": "vitest",
"test:e2e": "playwright test"
```

- [ ] **Step 5: Write the failing sanity test**

`src/lib/sanity.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import { add } from './sanity'

describe('sanity', () => {
  it('adds two numbers', () => {
    expect(add(2, 3)).toBe(5)
  })
})
```

- [ ] **Step 6: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `Cannot find module './sanity'` (or `add` not exported).

- [ ] **Step 7: Implement minimal `src/lib/sanity.ts`**

```ts
export function add(a: number, b: number): number {
  return a + b
}
```

- [ ] **Step 8: Run test to verify it passes**

Run: `npm test`
Expected: PASS — 1 test passed.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "chore: scaffold Vite React TS project with Vitest"
```

---
