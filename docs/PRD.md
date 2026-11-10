# Product Requirements Document (PRD): Financial Planning Application (`experimentation`)

## 1. Overview
A client-side and server-validated Next.js financial planning application (`experimentation`) that enables individuals to track income and expenses, evaluate spending against the 50/30/20 budget rule, monitor progress toward savings goals, and view a real-time net cashflow summary.

## 2. User Personas
- **Budget-Conscious Individual**: Needs a fast, clear view of monthly inflows and outflows to prevent overspending.
- **Goal-Oriented Saver**: Wants to track specific savings targets (emergency fund, major purchase) and see how monthly surplus accelerates goal completion.
- **First-Time Planner**: Needs an opinionated framework (50/30/20 rule) to categorize spending into Needs, Wants, and Savings without complex accounting setup.

## 3. Core User Journeys

### 3.1 Income & Expense Tracking
- **Flow**: User adds, views, filters, or removes income and expense entries with amount, description, date, type (`income` | `expense`), and budget category (`needs` | `wants` | `savings` for expenses).
- **Outcome**: All transactions update the state immutably and immediately recalculate summary metrics.

### 3.2 50/30/20 Budget Rule Analysis
- **Flow**: System aggregates total monthly net income and compares actual spending across Needs (target <= 50%), Wants (target <= 30%), and Savings/Debt Repayment (target >= 20%).
- **Outcome**: User sees target vs. actual dollar amounts, percentage allocations, and status indicators (`on_track` | `over_budget` | `under_target`).

### 3.3 Savings Goal Tracking
- **Flow**: User creates savings goals with a target name, target amount, current saved amount, and optional target date, and allocates funds toward each goal.
- **Outcome**: System calculates completion percentage, remaining amount needed, and estimated months to completion based on current monthly savings rate.

### 3.4 Net Cashflow Summary
- **Flow**: User views top-level KPI cards on the dashboard.
- **Outcome**: Displays Total Income, Total Expenses, Net Cashflow (`Total Income - Total Expenses`), and Savings Rate (`Total Savings / Total Income * 100`).

## 4. Acceptance Criteria

| Feature Area | Acceptance Criteria |
|--------------|---------------------|
| **Transactions** | - Rejects negative or zero amounts, empty descriptions, and invalid categories at boundary.<br>- Adding or deleting a transaction returns a new state reference without mutating existing arrays/objects. |
| **50/30/20 Analysis** | - Accurately computes 50% Needs, 30% Wants, and 20% Savings benchmarks from total income.<br>- Handles zero-income edge cases gracefully (0% allocations, no division-by-zero NaN).<br>- Flags categories exceeding 50% (Needs) or 30% (Wants), or falling below 20% (Savings). |
| **Savings Goals** | - Rejects negative target or current amounts.<br>- Caps visual progress at 100% when `currentAmount >= targetAmount` while displaying accurate surplus.<br>- Computes months-to-goal accurately when monthly savings contribution > 0. |
| **Net Cashflow** | - `netCashflow` equals exact sum of income minus sum of expenses (rounded to 2 decimal places / integer cents).<br>- Highlights positive cashflow (surplus) vs. negative cashflow (deficit). |

## 5. Non-Functional Requirements (NFRs)

### 5.1 Security & Input Validation
- **Boundary Validation**: All user inputs and API payloads must be validated using strict schemas (e.g., Zod or explicit boundary validators) before processing.
- **XSS Prevention**: Render all user-provided descriptions and goal names safely via React's default escaping; forbid `dangerouslySetInnerHTML`.
- **Secret Hygiene**: Zero hardcoded credentials, API keys, or tokens in source files.
- **Error Handling**: Fail loudly with descriptive, user-safe validation messages; never expose stack traces to the UI.

### 5.2 Immutability & Code Quality
- **Strict Immutability**: All domain calculators, state reducers, and data transformers must return new objects/arrays (`map`, `filter`, `reduce`, spread syntax) and never mutate arguments in place.
- **Modularity**: Keep functions focused (< 50 lines) and source files cohesive (< 800 lines ceiling, target 200-400 lines).
- **Zero Unnecessary Dependencies**: Prefer pure TypeScript domain logic and native Web/Next.js primitives.

### 5.3 Testing & Verification
- **TDD Workflow**: Write failing unit/integration tests (RED) before implementing domain and UI logic (GREEN), followed by refactoring (IMPROVE).
- **Coverage Threshold**: Minimum **80% test coverage** across statements, branches, functions, and lines for domain calculators, validation schemas, and UI components.
