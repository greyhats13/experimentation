import { describe, it, expect, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET as getTransactions, POST as postTransaction, DELETE as deleteTransaction } from '@/app/api/transactions/route'
import { GET as getGoals, POST as postGoal } from '@/app/api/goals/route'
import { resetStoreForTesting } from '@/lib/repository'
import { resetRateLimiterForTesting } from '@/lib/security'

describe('API Routes (/api/transactions & /api/goals)', () => {
  beforeEach(() => {
    resetStoreForTesting()
    resetRateLimiterForTesting()
  })

  it('GET /api/transactions returns seeded transactions and financial summary', async () => {
    const req = new NextRequest('http://localhost:3000/api/transactions')
    const res = await getTransactions(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(Array.isArray(body.data.transactions)).toBe(true)
    expect(body.data.summary.totalIncome).toBeGreaterThan(0)
  })

  it('POST /api/transactions rejects requests missing CSRF/Origin header', async () => {
    const req = new NextRequest('http://localhost:3000/api/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: 'https://evil.example.com',
      },
      body: JSON.stringify({
        title: 'Bonus',
        amount: 1000,
        type: 'income',
        category: 'salary',
        date: '2026-11-10',
      }),
    })

    const res = await postTransaction(req)
    expect(res.status).toBe(403)
  })

  it('POST /api/transactions creates a valid transaction when CSRF header is valid', async () => {
    const req = new NextRequest('http://localhost:3000/api/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        Origin: 'http://localhost:3000',
      },
      body: JSON.stringify({
        title: 'Consulting Project',
        amount: 1500,
        type: 'income',
        category: 'freelance',
        date: '2026-11-10',
      }),
    })

    const res = await postTransaction(req)
    const body = await res.json()
    expect(res.status).toBe(201)
    expect(body.success).toBe(true)
    expect(body.data.transaction.title).toBe('Consulting Project')
  })

  it('POST /api/transactions returns 400 on invalid payload', async () => {
    const req = new NextRequest('http://localhost:3000/api/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: JSON.stringify({
        title: '',
        amount: -100,
        type: 'invalid',
        category: 'salary',
        date: 'bad',
      }),
    })

    const res = await postTransaction(req)
    expect(res.status).toBe(400)
  })

  it('DELETE /api/transactions removes an existing transaction by id', async () => {
    const req = new NextRequest('http://localhost:3000/api/transactions?id=seed-tx-1', {
      method: 'DELETE',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      },
    })

    const res = await deleteTransaction(req)
    expect(res.status).toBe(200)

    const notFoundReq = new NextRequest('http://localhost:3000/api/transactions?id=non-existent', {
      method: 'DELETE',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      },
    })
    const notFoundRes = await deleteTransaction(notFoundReq)
    expect(notFoundRes.status).toBe(404)
  })

  it('GET & POST /api/goals lists and creates savings goals', async () => {
    const getReq = new NextRequest('http://localhost:3000/api/goals')
    const getRes = await getGoals(getReq)
    const getBody = await getRes.json()
    expect(getRes.status).toBe(200)
    expect(getBody.success).toBe(true)

    const postReq = new NextRequest('http://localhost:3000/api/goals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: JSON.stringify({
        name: 'Vacation Fund',
        targetAmount: 3000,
        currentAmount: 600,
        targetDate: '2027-06-01',
      }),
    })
    const postRes = await postGoal(postReq)
    expect(postRes.status).toBe(201)
  })
})
