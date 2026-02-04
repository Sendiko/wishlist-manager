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
        <div className="max-w-7xl mx-auto space-y-6">
            <ComparisonClient items={items} />
        </div>
    )
}
