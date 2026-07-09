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

        const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: {
                id: true,
                username: true,
                createdAt: true,
                updatedAt: true,
            },
        })

        if (!user) {
            return createErrorResponse(404, 'User not found.', 'User not found')
        }

        return NextResponse.json({
            user,
        }, { status: 200 })
    } catch (error: any) {
        console.error('Me API error:', error)
        return createErrorResponse(500, 'An error occurred fetching user details.', error.message)
    }
}
