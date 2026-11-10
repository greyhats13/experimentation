# Technical Specification: Standards, Security, and TDD

## 1. TypeScript Strict Compiler Configuration

The project enforces strict static typing in `tsconfig.json` to eliminate implicit `any` and unchecked undefined access:

- `"strict": true`
- `"noImplicitAny": true`
- `"strictNullChecks": true`
- `"noUncheckedIndexedAccess": true`
- `"exactOptionalPropertyTypes": true`
- `"noImplicitReturns": true`
- `"noFallthroughCasesInSwitch": true`

## 2. Immutability Rules

- **No In-Place Mutation**: Never use mutating array or object operations (`Array.prototype.push`, `splice`, `sort`, or direct property assignment) on existing state or domain objects.
- **Copy-on-Write Updates**: Always return new references using object spread (`{ ...entity, ...changes }`), `Array.prototype.map`, `filter`, `reduce`, or `toSorted`.
- **Readonly Contracts**: Mark interface properties and array types with `readonly` and `ReadonlyArray<T>`.

## 3. Security Controls

### HTTP Security Headers
Configured via Next.js middleware/config for all responses:
- `Content-Security-Policy`: `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-ancestors 'none'; object-src 'none'; base-uri 'self'`
- `X-Frame-Options`: `DENY`
- `X-Content-Type-Options`: `nosniff`
- `Referrer-Policy`: `strict-origin-when-cross-origin`
- `Permissions-Policy`: `camera=(), microphone=(), geolocation=()`

### CSRF / Origin Validation
- All state-changing HTTP methods (`POST`, `PUT`, `PATCH`, `DELETE`) verify that the request `Origin` (or `Referer`) header matches the trusted `Host` header. Mismatched or missing origins on mutating requests are rejected with `403 Forbidden`.

### Rate Limiting
- All API routes enforce per-client sliding-window or token-bucket rate limiting keyed by client IP/session identifier, returning `429 Too Many Requests` when exceeded.

### Boundary Input Validation & Error Scrubbing
- Every route handler validates path params, query params, and JSON request bodies via Zod (`schema.safeParse`) before invoking domain or repository code.
- Unexpected runtime exceptions are logged server-side and scrubbed to generic client-safe messages (`500 Internal Server Error`) so stack traces and internal paths never leak.

## 4. Vitest Test-Driven Development (TDD) Workflow

All features and bug fixes follow the Red-Green-Refactor cycle using Vitest:

1. **RED**: Write failing unit and integration tests using the Arrange-Act-Assert (AAA) pattern before writing implementation code.
2. **GREEN**: Implement the minimal domain, repository, or route handler code required to make the test suite pass.
3. **REFACTOR**: Clean up duplication, enforce small functions (<50 lines), and verify immutability while keeping tests green.
4. **Coverage Gate**: Maintain a minimum **80% test coverage** across statements, branches, functions, and lines (`vitest run --coverage`).
