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
        <div className="min-h-screen bg-gray-50">
            {/* Simple Top Bar */}
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center">
                            <Link href="/dashboard" className="text-xl font-bold text-gray-900 tracking-tight hover:text-blue-600 transition">
                                ulala
                            </Link>
                            <span className="mx-3 text-gray-300">/</span>
                            <span className="text-gray-500 font-medium">Compare</span>
                        </div>
                        <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-gray-900">
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
