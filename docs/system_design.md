# System Design: Data Models, Repository Contract, and API Envelope

## 1. Domain Data Models

All domain entities are immutable (`readonly` properties) and validated at system boundaries. Monetary amounts are represented in integer cents or validated finite numbers rounded to two decimal places.

```typescript
export type TransactionType = 'income' | 'expense';

export type BudgetCategory = 'needs' | 'wants' | 'savings';

export interface Transaction {
  readonly id: string;
  readonly description: string;
  readonly amount: number;
  readonly type: TransactionType;
  readonly category: BudgetCategory;
  readonly date: string; // ISO-8601 date string (YYYY-MM-DD)
  readonly createdAt: string;
}

export interface SavingsGoal {
  readonly id: string;
  readonly name: string;
  readonly targetAmount: number;
  readonly currentAmount: number;
  readonly deadline: string; // ISO-8601 date string (YYYY-MM-DD)
  readonly createdAt: string;
}

export interface BudgetRuleBreakdown {
  readonly needs: {
    readonly actual: number;
    readonly target: number; // 50% of total income
    readonly percentage: number;
  };
  readonly wants: {
    readonly actual: number;
    readonly target: number; // 30% of total income
    readonly percentage: number;
  };
  readonly savings: {
    readonly actual: number;
    readonly target: number; // 20% of total income
    readonly percentage: number;
  };
}

export interface FinancialSummary {
  readonly totalIncome: number;
  readonly totalExpenses: number;
  readonly netSavings: number;
  readonly savingsRatePercentage: number;
  readonly budgetBreakdown: BudgetRuleBreakdown;
  readonly goalsProgress: ReadonlyArray<{
    readonly goalId: string;
    readonly name: string;
    readonly progressPercentage: number;
    readonly remainingAmount: number;
  }>;
}
```

## 2. Repository Pattern Contract

Business logic depends exclusively on abstract repository contracts rather than concrete storage drivers.

```typescript
export interface PaginationMeta {
  readonly total: number;
  readonly page: number;
  readonly limit: number;
}

export interface QueryOptions {
  readonly page?: number;
  readonly limit?: number;
}

export interface IRepository<T, CreateInput, UpdateInput> {
  findAll(options?: QueryOptions): Promise<{
    readonly items: ReadonlyArray<T>;
    readonly meta: PaginationMeta;
  }>;
  findById(id: string): Promise<T | null>;
  create(input: CreateInput): Promise<T>;
  update(id: string, input: UpdateInput): Promise<T | null>;
  delete(id: string): Promise<boolean>;
}
```

## 3. Standard API Response Envelope

Every BFF endpoint returns a consistent JSON envelope for both successful and failed requests.

```typescript
export interface ApiResponseEnvelope<T> {
  readonly success: boolean;
  readonly data: T | null;
  readonly error: string | null;
  readonly meta?: PaginationMeta;
}
```

### Example Success Response
```json
{
  "success": true,
  "data": [
    {
      "id": "txn_01",
      "description": "Monthly Salary",
      "amount": 5000,
      "type": "income",
      "category": "needs",
      "date": "2026-11-01",
      "createdAt": "2026-11-01T09:00:00.000Z"
    }
  ],
  "error": null,
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 20
  }
}
```

### Example Error Response
```json
{
  "success": false,
  "data": null,
  "error": "Validation failed: amount must be greater than 0"
}
```
