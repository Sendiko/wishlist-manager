import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import CategoryComparisonClient from './category-comparison-client'

export default async function CategoryComparisonPage() {
    const session = await getSession()
    if (!session || !session.userId) {
        redirect('/login')
    }

    // Fetch all categories with their items for the current user
    // We need to filter items by userId within the include
    const categories = await prisma.category.findMany({
        include: {
            items: {
                where: {
                    userId: session.userId
                }
            }
        },
        orderBy: {
            name: 'asc'
        }
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
                            <span className="text-on-surface-variant font-medium">Compare Categories</span>
                        </div>
                        <Link href="/dashboard" className="text-sm font-medium text-secondary hover:text-on-surface">
                            Back to Dashboard
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                <CategoryComparisonClient categories={categories} />
            </main>
        </div>
    )
}
