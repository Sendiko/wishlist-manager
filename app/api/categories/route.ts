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

        const categories = await prisma.category.findMany({
            orderBy: { name: 'asc' }
        })

        return NextResponse.json({
            categories,
        }, { status: 200 })
    } catch (error: any) {
        console.error('Categories API error:', error)
        return NextResponse.json({
            message: 'An error occurred fetching categories.',
            error: error.message,
        }, { status: 500 })
    }
}
