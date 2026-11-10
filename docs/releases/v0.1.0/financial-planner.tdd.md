# TDD Evidence Report: Personal Financial Planning System (v0.1.0)

## 1. Source Plan Reference
- **Product Requirements Document**: `docs/PRD.md`
- **Task Breakdown & Implementation Plan**: `docs/task_list.md`

---

## 2. User Journeys Tested
1. **Net Worth & Financial Snapshot Calculation**: Aggregating total assets and liabilities from categorized financial items while guaranteeing input immutability.
2. **Compound Interest & Future Value Projection**: Projecting portfolio growth over a configurable horizon (`years`) using initial principal, monthly contributions, and annual return rates (including zero-rate edge cases).
3. **Emergency Fund Adequacy Analysis**: Computing liquid emergency fund coverage in months against monthly expenses and evaluating against the 6-month target benchmark.
4. **Savings Rate & Debt Payoff Strategy (Avalanche vs. Snowball)**: Calculating net monthly savings rate and simulating multi-debt payoff timelines and total interest paid under Avalanche (highest interest rate first) and Snowball (lowest balance first) strategies.
5. **Boundary Input Validation**: Enforcing strict schema constraints on financial payloads, items, and projection parameters via Zod (rejecting negative amounts, invalid categories, excessive string lengths, and out-of-range rates).
6. **REST API Endpoints (`/api/health`, `/api/plan`, `/api/calculate`)**:
   - Retrieving server health status.
   - Fetching and persisting validated financial plan snapshots via the JSON repository.
   - Running stateless financial calculations with standardized `{ success, data, error }` response envelopes and HTTP 400 rejection on malformed inputs.

---

## 3. Task Report: RED & GREEN Evidence

### RED Phase (`3e34c35`)
- **Commit**: `3e34c35` (`test: add failing unit and integration tests for financial planner (RED)`)
- **Evidence**: All 3 test suites (`src/__tests__/finance-engine.test.ts`, `src/__tests__/validation.test.ts`, `src/__tests__/api-routes.test.ts`) were written first using the Arrange-Act-Assert (AAA) pattern and executed via Vitest. All 3 suites failed as expected due to missing module implementations (`src/finance-engine.ts`, `src/validation.ts`, `src/app.ts`, `src/repository.ts`).

### GREEN Phase
- **Verification**: Implemented minimal, immutable domain logic, Zod validation schemas, JSON repository persistence, and Express API routes.
- **Evidence**: Executed `npx vitest run --coverage`. All **3/3 test suites** and **20/20 tests** passed with zero errors.

---

## 4. Test Specification Table of Guarantees

| Test Suite | Test Case / Specification | Guaranteed Behavior |
| :--- | :--- | :--- |
| `src/__tests__/finance-engine.test.ts` | `calculates net worth from assets and liabilities without mutating input` | Accurately sums assets, liabilities, and net worth (`assets - liabilities`) while preserving original array and object references (`Object.freeze` safe). |
| `src/__tests__/finance-engine.test.ts` | `returns zero values when items list is empty` | Returns `{ totalAssets: 0, totalLiabilities: 0, netWorth: 0 }` for empty item arrays. |
| `src/__tests__/finance-engine.test.ts` | `projects compound interest growth over years with monthly contributions` | Generates yearly schedule (`year 0` to `N`) with accurate monthly compounding (`r / 12`), total contributions, and interest earned. |
| `src/__tests__/finance-engine.test.ts` | `handles zero interest rate accurately` | Computes strictly linear growth (`initialPrincipal + monthlyContribution * 12 * years`) with `0` interest earned when annual rate is `0%`. |
| `src/__tests__/finance-engine.test.ts` | `calculates months covered and adequacy status` | Computes `monthsCovered = emergencyFundCash / monthlyExpenses`, `targetAmount = monthlyExpenses * 6`, `shortfall`, and `isAdequate`. |
| `src/__tests__/finance-engine.test.ts` | `handles zero monthly expenses safely` | Prevents division-by-zero when `monthlyExpenses === 0` and reports adequate coverage. |
| `src/__tests__/finance-engine.test.ts` | `calculates savings rate percentage and monthly savings` | Computes `monthlySavings = income - expenses` and `savingsRatePercent` rounded to 2 decimal places, handling zero income safely. |
| `src/__tests__/finance-engine.test.ts` | `compares avalanche (highest rate first) and snowball (lowest balance first) without mutating inputs` | Simulates month-by-month debt amortization, proving Avalanche minimizes total interest vs. Snowball while keeping input debt arrays untouched. |
| `src/__tests__/finance-engine.test.ts` | `returns zero months when debts list is empty` | Returns `{ months: 0, totalInterestPaid: 0, order: [] }` when no debts exist. |
| `src/__tests__/finance-engine.test.ts` | `handles unpayable debt when monthly payment cannot cover monthly interest` | Caps simulation at `MAX_MONTHS` (`600`) to prevent infinite loops when payment is insufficient. |
| `src/__tests__/validation.test.ts` | `accepts a valid financial item` | Parses valid `{ id, name, category, amount, interestRate, minimumPayment }` objects cleanly. |
| `src/__tests__/validation.test.ts` | `rejects empty name, negative amount, or invalid category` | Fails validation when `name` is empty, `amount < 0`, or `category` is outside `['asset', 'liability', 'income', 'expense']`. |
| `src/__tests__/validation.test.ts` | `accepts valid projection parameters` | Validates `initialPrincipal`, `monthlyContribution`, `annualRatePercent`, `years`, and `emergencyFundCash`. |
| `src/__tests__/validation.test.ts` | `rejects negative principal, out-of-range rate, or invalid years` | Rejects `annualRatePercent > 100`, `years < 1`, or `years > 100`. |
| `src/__tests__/validation.test.ts` | `accepts complete valid financial plan payload` | Validates full payload containing `items`, `projectionParams`, and `extraDebtPayment`. |
| `src/__tests__/api-routes.test.ts` | `GET /api/health returns 200 with status ok` | Responds with HTTP 200 and `{ success: true, data: { status: 'ok' }, error: null }`. |
| `src/__tests__/api-routes.test.ts` | `GET /api/plan returns default plan when no saved file exists` | Initializes and returns default starter plan with full summary calculations when storage is empty. |
| `src/__tests__/api-routes.test.ts` | `POST /api/plan saves a valid plan and returns computed summary` | Persists validated plan to disk and returns computed net worth, savings, emergency fund, projection, and debt payoff analysis. |
| `src/__tests__/api-routes.test.ts` | `POST /api/plan returns 400 when payload fails validation` | Rejects invalid payloads with HTTP 400 and descriptive validation error message in `{ success: false, data: null, error }`. |
| `src/__tests__/api-routes.test.ts` | `POST /api/calculate computes financial summary statelessly without saving` | Computes full financial summary without mutating persisted repository state and returns HTTP 400 on invalid input. |

---

## 5. Coverage Summary

Executed via `npx vitest run --coverage` (`@vitest/coverage-v8`):

| Metric | Coverage | Threshold | Status |
| :--- | :--- | :--- | :--- |
| **Statements** | **94.42%** | >= 80.00% | PASS |
| **Branches** | **85.60%** | >= 80.00% | PASS |
| **Functions** | **100.00%** | >= 80.00% | PASS |
| **Lines** | **94.42%** | >= 80.00% | PASS |

### File-Level Breakdown
- `src/app.ts`: 91.66% Statements | 81.81% Branches | 100% Functions | 91.66% Lines
- `src/finance-engine.ts`: 97.60% Statements | 84.50% Branches | 100% Functions | 97.60% Lines
- `src/repository.ts`: 81.96% Statements | 87.50% Branches | 100% Functions | 81.96% Lines
- `src/validation.ts`: 100.00% Statements | 100.00% Branches | 100% Functions | 100.00% Lines
