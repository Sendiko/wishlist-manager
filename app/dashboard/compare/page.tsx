import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import ComparisonClient from './comparison-client'

export default async function ComparisonPage() {
    const session = await getSession()
    if (!session || !session.userId) {
        redirect('/login')
    }

    // Fetch all items for the user
    const items = await prisma.item.findMany({
        where: { userId: session.userId },
        orderBy: { createdAt: 'desc' },
    })

    return (
        <div className="min-h-screen bg-background">
            {/* Simple Top Bar */}
            <header className="bg-surface shadow-sm sticky top-0 z-10 border-b border-outline-variant">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center">
                            <Link href="/dashboard" className="text-xl font-bold text-on-surface tracking-tight hover:text-primary transition">
                                ulala
                            </Link>
                            <span className="mx-3 text-on-surface-variant/30">/</span>
                            <span className="text-on-surface-variant font-medium">Compare</span>
                        </div>
                        <Link href="/dashboard" className="text-sm font-medium text-secondary hover:text-on-surface">
                            Back to Dashboard
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                <ComparisonClient items={items} />
            </main>
        </div>
    )
}
