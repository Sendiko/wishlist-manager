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
        <div className="max-w-7xl mx-auto space-y-6">
            <CategoryComparisonClient categories={categories} />
        </div>
    )
}
