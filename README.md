# FinPlan — Next.js Financial Planning Application

A modular, security-hardened **Financial Planning Application** built with **Next.js (App Router)**, **TypeScript (Strict Mode)**, **Tailwind CSS**, and **Vitest** following the **ECC (Everything Claude Code / Gemini CLI)** engineering workflow.

## Key Features

- **Income & Expense Cashflow Tracker**: Add, filter, and delete transactions with strict boundary validation and XSS sanitization.
- **50/30/20 Budget Rule Analyzer**: Automatic categorization and real-time allocation tracking across **Needs (50%)**, **Wants (30%)**, and **Savings/Investments (20%)** with over-budget indicators.
- **Savings Goal Planner**: Track financial goals with automatic calculation of progress percentage and required monthly contribution based on target dates.
- **Security Hardening**:
  - Strict `Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and `Permissions-Policy` headers in `next.config.ts`.
  - Schema/guard-based input validation at all API boundaries (`src/lib/validation.ts`).
  - Rate limiting and CSRF/Origin verification on state-changing API endpoints (`src/lib/security.ts`).
  - Immutable domain logic (`src/lib/finance-engine.ts`) and Repository Pattern (`src/lib/repository.ts`).

## Project Structure

```text
├── docs/
│   ├── PRD.md
│   ├── architecture.md
│   ├── system_design.md
│   ├── tech_doc.md
│   ├── task_list.md
│   └── releases/v0.1.0/financial-planner.tdd.md
├── src/
│   ├── __tests__/
│   │   ├── finance-engine.test.ts
│   │   ├── validation.test.ts
│   │   └── api-routes.test.ts
│   ├── app/
│   │   ├── api/
│   │   │   ├── transactions/route.ts
│   │   │   └── goals/route.ts
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── SummaryCards.tsx
│   │   ├── BudgetRulePanel.tsx
│   │   ├── TransactionSection.tsx
│   │   └── SavingsGoalSection.tsx
│   └── lib/
│       ├── types.ts
│       ├── finance-engine.ts
│       ├── validation.ts
│       ├── security.ts
│       ├── api-response.ts
│       └── repository.ts
└── vitest.config.ts
```

## Getting Started

```bash
# Install dependencies
npm install

# Run unit & integration tests
npm test

# Run test coverage check (>= 80% threshold)
npm run test:coverage

# Start development server (bound to 127.0.0.1)
npm run dev
```
