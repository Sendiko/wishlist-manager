import { NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'
import { createErrorResponse } from '@/lib/api-response'

export async function GET(req: Request) {
    try {
        const session = await authenticateRequest(req)

        if (!session) {
            return createErrorResponse(401, 'Unauthorized. Invalid or missing token.', 'Unauthorized')
        }

        const categories = await prisma.category.findMany({
            orderBy: { name: 'asc' }
        })

        return NextResponse.json({
            categories,
        }, { status: 200 })
    } catch (error: any) {
        console.error('Categories API error:', error)
        return createErrorResponse(500, 'An error occurred fetching categories.', error.message)
    }
}
