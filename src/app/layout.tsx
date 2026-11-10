import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FinPlan — 50/30/20 Financial Planning & Goal Tracker',
  description:
    'Clean, immutable Next.js financial planning application with 50/30/20 budget breakdown, cashflow tracking, and savings goal projections.',
}

/**
 * Root application layout providing consistent typography and accessible structure.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  )
}
