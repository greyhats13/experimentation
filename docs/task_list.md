# Phased Task List: Financial Planning Application (`experimentation`)

## Phase 0: Research & Reuse
- [x] **0.1 Workspace & Stack Inspection**: Inspect `/Users/greyhats13/git/agy/antigravity/experimentation` (`package.json`, `tsconfig.json`, Next.js App Router structure) to confirm installed packages and scripts.
- [x] **0.2 Pattern & Library Check**: Identify reusable validation, testing (Vitest / Jest + React Testing Library), and Tailwind CSS patterns already configured in the repository.
- [x] **0.3 Hygiene Check**: Ensure `.gitignore` covers `dev-resources/` and `backups/`, and keep root clean.

## Phase 1: Planning & Architecture
- [x] **1.1 Product Requirements Document**: Create `docs/PRD.md` defining personas, core user journeys, acceptance criteria, and NFRs.
- [x] **1.2 System Architecture & Design**: Define clean separation between pure domain logic (`src/lib/finance/`), input validation (`src/lib/validation/`), and Next.js UI components (`src/components/`).
- [x] **1.3 Phased Task List**: Document granular tasks in `docs/task_list.md`.

## Phase 2: TDD Implementation (RED -> GREEN -> REFACTOR)

### 2.1 Test Harness & Validation Schemas
- [ ] **2.1.1 [RED]**: Write unit tests for transaction and savings goal input validators (rejecting negative numbers, NaN, empty strings, invalid categories, and oversized inputs).
- [ ] **2.1.2 [GREEN]**: Implement pure boundary validation functions/schemas for `TransactionInput` and `SavingsGoalInput`.
- [ ] **2.1.3 [REFACTOR]**: Extract shared currency/number sanitization helpers and verify immutability.

### 2.2 Financial Domain Calculators (Pure Functions)
- [ ] **2.2.1 [RED]**: Write unit tests for Net Cashflow calculator (total income, total expenses, net cashflow, savings rate, zero-income edge cases, floating-point precision).
- [ ] **2.2.2 [GREEN]**: Implement `calculateCashflowSummary` using immutable array reductions and cent-accurate rounding.
- [ ] **2.2.3 [RED]**: Write unit tests for 50/30/20 Budget Rule analyzer (Needs 50%, Wants 30%, Savings 20% target vs. actual amounts, percentages, and status flags).
- [ ] **2.2.4 [GREEN]**: Implement `analyzeBudget503020` with pure data transformations.
- [ ] **2.2.5 [RED]**: Write unit tests for Savings Goal tracker (progress percentage capped at 100%, remaining amount, estimated months to completion, immutable goal updates).
- [ ] **2.2.6 [GREEN]**: Implement `calculateSavingsGoalProgress` and immutable state transition helpers (`addTransaction`, `removeTransaction`, `addSavingsGoal`, `updateGoalContribution`).
- [ ] **2.2.7 [REFACTOR]**: Consolidate domain types, add function-level docstrings, and ensure all functions are < 50 lines.

### 2.3 Next.js UI Components & Integration
- [ ] **2.3.1 [RED]**: Write component/integration tests for the Financial Planner Dashboard (rendering cashflow KPIs, adding income/expense items, displaying 50/30/20 breakdown, updating savings goals, and showing validation errors).
- [ ] **2.3.2 [GREEN]**: Implement modular UI components (`CashflowSummaryCards`, `TransactionForm`, `TransactionList`, `BudgetRulePanel`, `SavingsGoalTracker`) and wire them into `src/app/page.tsx`.
- [ ] **2.3.3 [REFACTOR]**: Refine accessibility (labels, ARIA attributes, semantic HTML) and responsive layout.

### 2.4 Coverage & Build Verification
- [ ] **2.4.1**: Run test suite with coverage report and verify >= 80% coverage across all metrics.
- [ ] **2.4.2**: Run `npm run lint` and `npm run build` in `experimentation` to confirm zero TypeScript or Next.js build errors.

## Phase 3: Code & Security Review
- [ ] **3.1 Code Quality Review**: Audit all new files against ECC standards (immutability, function length < 50 lines, file length < 800 lines, no deep nesting, English docstrings).
- [ ] **3.2 Security Review**: Verify boundary input validation, XSS protection, absence of hardcoded secrets, and safe error handling.
- [ ] **3.3 Remediation**: Fix any CRITICAL, HIGH, or MEDIUM findings identified during review.

## Phase 4: Git Commit & Delivery
- [ ] **4.1 Pre-Commit Verification**: Confirm `git status` and `git diff` are clean of temporary artifacts and all tests pass.
- [ ] **4.2 Conventional Commit**: Stage and commit changes using conventional commit format (`feat: ...`).
