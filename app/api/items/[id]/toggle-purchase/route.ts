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
        category: item.category || null,
        totalScore: item.wish_rate + item.neccessary_rate + item.interest_rate
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await authenticateRequest(req)
        if (!session) {
            return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 })
        }

        const { id } = await params

        // Verify ownership
        const item = await prisma.item.findUnique({
            where: { id },
        })

        if (!item || item.userId !== session.userId) {
            return NextResponse.json({ message: 'Item not found or access denied.' }, { status: 404 })
        }

        const updatedItem = await prisma.item.update({
            where: { id },
            data: {
                isPurchased: !item.isPurchased,
            },
            include: {
                category: true,
            },
        })

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
        return NextResponse.json({
            message: 'Item purchase status toggled successfully.',
            item: mapItem(updatedItem, baseUrl)
        }, { status: 200 })
    } catch (error: any) {
        console.error('Toggle purchase API error:', error)
        return NextResponse.json({
            message: 'An error occurred toggling purchase status.',
            error: error.message,
        }, { status: 500 })
    }
}

// For compatibility with simple mobile libraries, also allow POST
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    return PATCH(req, { params })
}
