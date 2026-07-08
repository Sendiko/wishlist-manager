import { NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
    try {
        const session = await authenticateRequest(req)

        if (!session) {
            return NextResponse.json({
                message: 'Unauthorized. Invalid or missing token.',
            }, { status: 401 })
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
            return NextResponse.json({
                message: 'User not found.',
            }, { status: 404 })
        }

        return NextResponse.json({
            user,
        }, { status: 200 })
    } catch (error: any) {
        console.error('Me API error:', error)
        return NextResponse.json({
            message: 'An error occurred fetching user details.',
            error: error.message,
        }, { status: 500 })
    }
}
