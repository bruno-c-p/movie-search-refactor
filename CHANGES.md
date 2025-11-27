# Changes

## chore(backend): remove stale bug comments from addToFavorites

Removed outdated bug comments from `addToFavorites` endpoint. The issues are
already addressed by:

- **Global ValidationPipe** in `main.ts` handles null/undefined body
- **MovieDto decorators** validate all required fields with `class-validator`

## fix(backend): validate search query and page params in searchMovies

Added input validation to the `searchMovies` endpoint in `movies.controller.ts`.

### Changes

- **Query validation**: Throws `BadRequestException` if query is missing or
  empty
- **Page validation**: Throws `BadRequestException` if page is not a positive
  number (handles NaN, zero, negative values)

## feat(backend): add DTO validation with class-validator

Added request validation to the backend using `class-validator` and
`class-transformer`.

### Changes

- **Dependencies**: Added `class-validator` and `class-transformer` packages
- **Global ValidationPipe**: Configured in `main.ts` with:
  - `whitelist: true` - strips non-whitelisted properties
  - `forbidNonWhitelisted: true` - throws error if non-whitelisted properties
    are present
  - `transform: true` - auto-transforms payloads to DTO instances
- **MovieDto validation**: Added decorators:
  - `title`: `@IsString()`, `@IsNotEmpty()`
  - `imdbID`: `@IsString()`, `@IsNotEmpty()`
  - `year`: `@IsInt()`, `@Min(1900)`, `@Max(2100)`
  - `poster`: `@IsString()`, `@IsUrl()`, `@IsNotEmpty()`

## chore(lint): satisfy ESLint across frontend and backend

Fixed ESLint violations across both frontend and backend codebases.

### Backend Changes

- **Quote style**: Changed single quotes to double quotes across all files for
  consistency
- **Trailing commas**: Added trailing commas where required by ESLint
- **Trailing newlines**: Removed extra blank lines at end of files
- **Floating promises**: Added `void` keyword to `bootstrap()` call in `main.ts`
  to handle floating promise
- **Import formatting**: Reformatted multi-line imports in
  `movies.controller.ts`

### Frontend Changes

- **Unused imports**: Removed unused `useEffect` import from `page.tsx` and
  unused `useState` import from `QueryProvider.tsx`
- **Interface style**: Changed empty interface `InputProps` to type alias in
  `input.tsx`
- **Next.js Image**: Replaced `<img>` with Next.js `<Image>` component in
  `MovieCard.tsx`
- **Tailwind CSS**: Fixed `aspect-[2/3]` to `aspect-2/3` in `MovieCard.tsx`

### Configuration

- **`.gitignore`**: Added `.env` to ignore list and fixed missing trailing
  newline

## chore(gitignore): add node_modules to .gitignore

- Added `node_modules` to `.gitignore` to exclude dependencies from version
  control
- Committed `package-lock.json` files for both frontend and backend to ensure
  reproducible builds
