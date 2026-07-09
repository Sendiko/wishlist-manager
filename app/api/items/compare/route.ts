import { NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'
import { createErrorResponse } from '@/lib/api-response'

// Helper to map BigInt price and absolute image URLs
function mapItem(item: any, baseUrl: string) {
    return {
        id: item.id,
        name: item.name,
        photoUrl: item.photoUrl && item.photoUrl.startsWith('/') ? `${baseUrl}${item.photoUrl}` : (item.photoUrl || ''),
        link: item.link,
        price: item.price.toString(),
        priceNumber: Number(item.price),
        reasoning: item.reasoning,
        neccessary_rate: item.neccessary_rate,
        wish_rate: item.wish_rate,
        interest_rate: item.interest_rate,
        isPurchased: item.isPurchased,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        userId: item.userId,
        categoryId: item.categoryId,
        category: item.category || null,
        totalScore: item.wish_rate + item.neccessary_rate + item.interest_rate
    }
}

export async function GET(req: Request) {
    try {
        const session = await authenticateRequest(req)
        if (!session) {
            return createErrorResponse(401, 'Unauthorized.', 'Unauthorized')
        }

        const { searchParams } = new URL(req.url)
        const idsString = searchParams.get('ids')

        if (!idsString) {
            return createErrorResponse(400, 'Missing ids parameter.', 'Missing ids parameter')
        }

        const idsArray = idsString
            .split(',')
            .map(id => id.trim())
            .filter(id => id.length > 0)

        if (idsArray.length < 2) {
            return createErrorResponse(400, 'Select at least 2 items to compare.', 'Select at least 2 items to compare.')
        }

        const itemsRaw = await prisma.item.findMany({
            where: {
                id: { in: idsArray },
                userId: session.userId,
            },
            include: {
                category: true,
            },
        })

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
        const items = itemsRaw.map(item => mapItem(item, baseUrl))

        if (items.length === 0) {
            return NextResponse.json({ items: [], winners: [] }, { status: 200 })
        }

        // Calculate winner
        const maxScore = Math.max(...items.map(item => item.totalScore), 0)
        
        const itemsWithWinner = items.map(item => ({
            ...item,
            isWinner: item.totalScore === maxScore && item.totalScore > 0
        }))

        const winners = itemsWithWinner.filter(item => item.isWinner)

        return NextResponse.json({
            items: itemsWithWinner,
            winners
        }, { status: 200 })
    } catch (error: any) {
        console.error('Item Comparison API error:', error)
        return createErrorResponse(500, 'An error occurred comparing items.', error.message)
    }
}
