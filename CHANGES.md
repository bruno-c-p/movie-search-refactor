# Changes

## chore(lint): satisfy ESLint across frontend and backend

Fixed ESLint violations across both frontend and backend codebases.

### Backend Changes

- **Quote style**: Changed single quotes to double quotes across all files for consistency
- **Trailing commas**: Added trailing commas where required by ESLint
- **Trailing newlines**: Removed extra blank lines at end of files
- **Floating promises**: Added `void` keyword to `bootstrap()` call in `main.ts` to handle floating promise
- **Import formatting**: Reformatted multi-line imports in `movies.controller.ts`

### Frontend Changes

- **Unused imports**: Removed unused `useEffect` import from `page.tsx` and unused `useState` import from `QueryProvider.tsx`
- **Interface style**: Changed empty interface `InputProps` to type alias in `input.tsx`
- **Next.js Image**: Replaced `<img>` with Next.js `<Image>` component in `MovieCard.tsx`
- **Tailwind CSS**: Fixed `aspect-[2/3]` to `aspect-2/3` in `MovieCard.tsx`

### Configuration

- **`.gitignore`**: Added `.env` to ignore list and fixed missing trailing newline

## chore(gitignore): add node_modules to .gitignore

- Added `node_modules` to `.gitignore` to exclude dependencies from version control
- Committed `package-lock.json` files for both frontend and backend to ensure reproducible builds

