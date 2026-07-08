import { NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

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
        totalScore: item.wish_rate + item.neccessary_rate + item.interest_rate
    }
}

export async function GET(req: Request) {
    try {
        const session = await authenticateRequest(req)
        if (!session) {
            return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const idsString = searchParams.get('ids')

        if (!idsString) {
            return NextResponse.json({ message: 'Missing ids parameter.' }, { status: 400 })
        }

        const idsArray = idsString
            .split(',')
            .map(id => id.trim())
            .filter(id => id.length > 0)

        if (idsArray.length === 0) {
            return NextResponse.json({ categories: [], winners: [] }, { status: 200 })
        }

        // Fetch categories with their items for the user
        const categoriesRaw = await prisma.category.findMany({
            include: {
                items: {
                    where: {
                        userId: session.userId,
                    },
                },
            },
        })

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

        // Filter and Calculate Stats
        const categoriesWithStats = categoriesRaw
            .map(category => {
                const selectedItems = category.items.filter(item => idsArray.includes(item.id))
                if (selectedItems.length === 0) return null

                const itemCount = selectedItems.length
                const totalPrice = selectedItems.reduce((sum, item) => sum + Number(item.price), 0)

                const totalScore = selectedItems.reduce((sum, item) => {
                    return sum + (item.wish_rate + item.neccessary_rate + item.interest_rate)
                }, 0)

                const avgScore = itemCount > 0 ? (totalScore / itemCount).toFixed(1) : '0'

                return {
                    id: category.id,
                    name: category.name,
                    items: selectedItems.map(item => mapItem(item, baseUrl)),
                    itemCount,
                    totalPrice: totalPrice.toString(),
                    totalPriceNumber: totalPrice,
                    totalScore,
                    avgScore,
                }
            })
            .filter((c): c is NonNullable<typeof c> => c !== null)

        if (categoriesWithStats.length === 0) {
            return NextResponse.json({ categories: [], winners: [] }, { status: 200 })
        }

        // Calculate category winners
        const maxScore = Math.max(...categoriesWithStats.map(c => c.totalScore), 0)
        
        const categoriesWithWinner = categoriesWithStats.map(category => ({
            ...category,
            isWinner: category.totalScore === maxScore && category.totalScore > 0
        }))

        const winners = categoriesWithWinner.filter(c => c.isWinner)

        return NextResponse.json({
            categories: categoriesWithWinner,
            winners
        }, { status: 200 })
    } catch (error: any) {
        console.error('Category Comparison API error:', error)
        return NextResponse.json({
            message: 'An error occurred comparing categories.',
            error: error.message,
        }, { status: 500 })
    }
}
