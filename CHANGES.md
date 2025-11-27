# Changes

## fix(frontend): fix API client validation and error handling

Fixed multiple bugs in the API client.

### Changes

- **Env var for API URL**: Use `NEXT_PUBLIC_API_URL` with fallback
- **`handleResponse` helper**: Centralized error handling that checks
  `response.ok` and parses error messages
- **Input validation**: Added validation for query, imdbID, and movie fields
- **URL encoding**: Added `encodeURIComponent()` for search query
- **`.env.example`**: Added example config file for frontend

## fix(frontend): use useState to prevent QueryClient recreation on render

Fixed QueryClient being recreated on every render.

### Changes

- **useState**: Use `useState` with initializer function to create `QueryClient`
  only once

## fix(frontend): fix totalResults type to match API response

Fixed type inconsistency in frontend types.

### Changes

- **Type fix**: Changed `totalResults` from `number` to `string` in
  `FavoritesResponse` to match backend API

## fix(backend): add error handling for bootstrap startup

Added error handling for application bootstrap.

### Changes

- **Error handling**: Added `.catch()` to log errors and exit with code 1 on
  startup failure

## fix(backend): fix getFavorites stale data and response consistency

Fixed bugs in `getFavorites` method.

### Changes

- **Stale data**: Reload favorites from file before returning
- **Empty handling**: Return empty array instead of throwing error
- **Consistent types**: `totalResults` now returns string to match search API

## fix(backend): fix removeFromFavorites bugs and use NotFoundException

Fixed bugs in `removeFromFavorites` method.

### Changes

- **Stale data**: Reload favorites from file before removing
- **Case-insensitive**: imdbID comparison now uses `.toLowerCase()`
- **Throw not return**: Changed `return new HttpException` to `throw`
- **Performance**: Use `findIndex()` + `splice()` instead of `filter()`
  (in-place)
- **Exception class**: Use `NotFoundException` instead of generic
  `HttpException`

## fix(backend): fix addToFavorites and use specific exception classes

Fixed bugs in `addToFavorites` and improved exception handling across the
service.

### Changes

- **Stale data**: Reload favorites from file before checking duplicates
- **Performance**: Use `.some()` instead of `.find()` for existence check
- **Case-insensitive**: imdbID comparison now uses `.toLowerCase()`
- **Throw not return**: Changed `return new HttpException` to `throw`
- **Exception classes**: Use `BadRequestException` and
  `InternalServerErrorException` instead of generic `HttpException`

## fix(backend): add type safety and error handling to movie search

Improved type safety and fixed multiple bugs in `searchMovies` and
`getMovieByTitle`.

### Changes

- **Type definitions**: Added `OmdbMovie`, `OmdbSearchResponse`, `SearchResult`
  interfaces
- **URL encoding**: Added `encodeURIComponent()` for search title
- **Response check**: Fixed `=== false` to `=== "False"` (OMDb returns string)
- **Error handling**: Added try-catch with `HttpException` in `searchMovies`
- **Year parsing**: Added `parseYear()` to handle "1999" and "1999-2003" formats
- **Stale data**: Reload favorites from file before checking
- **Case-insensitive**: imdbID comparison now uses `.toLowerCase()`
- **Performance**: Use `Set` for O(1) favorite lookups instead of `.find()`

## fix(backend): add type safety and error handling for favorites persistence

Improved type safety and robustness of favorites file operations.

### Changes

- **Type safety**: Changed `favorites` from `any[]` to `MovieDto[]`
- **Runtime validation**: Added `isValidMovie()` type guard to validate JSON
  data
- **Error handling**: Wrapped file operations in try-catch blocks
- **Directory creation**: Added `ensureDirectoryExists()` to create `data/` dir
  if missing
- **Graceful degradation**: Falls back to empty array on load errors, throws
  `HttpException` on save errors

## fix(backend): use env vars for CORS origins and require OMDB API key

Removed hardcoded values and improved configuration security.

### Changes

- **CORS origins**: Now read from `CORS_ORIGINS` env var (comma-separated),
  defaults to `http://localhost:3000`
- **OMDB API key**: Removed insecure fallback; app now fails at startup if
  `OMDB_API_KEY` is not set
- **`.env.example`**: Added example config file documenting required env vars

## fix(backend): validate page param in getFavorites and extract helper

Added page validation to `getFavorites` endpoint and refactored to reduce
duplication.

### Changes

- **Page validation**: Throws `BadRequestException` if page is not a positive
  number (handles NaN, zero, negative values)
- **Extracted `parsePageNumber()`**: Private method reused by `searchMovies` and
  `getFavorites`

## fix(backend): validate imdbID param in removeFromFavorites

Added validation to the `removeFromFavorites` endpoint. Route params bypass
`ValidationPipe` since they're not part of `@Body()`.

- **imdbID validation**: Throws `BadRequestException` if param is missing or
  empty

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
