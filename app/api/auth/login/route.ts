import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { encrypt } from '@/lib/session'

const LoginSchema = z.object({
    username: z.string().trim(),
    password: z.string().trim(),
})

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const validation = LoginSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json({
                message: 'Validation failed.',
                errors: validation.error.flatten().fieldErrors,
            }, { status: 400 })
        }

        const { username, password } = validation.data

        const user = await prisma.user.findUnique({
            where: { username },
        })

        if (!user) {
            return NextResponse.json({
                message: 'Invalid username or password.',
            }, { status: 401 })
        }

        const passwordsMatch = await bcrypt.compare(password, user.password)

        if (!passwordsMatch) {
            return NextResponse.json({
                message: 'Invalid username or password.',
            }, { status: 401 })
        }

        // Create session
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        const token = await encrypt({ userId: user.id, expiresAt })

        const response = NextResponse.json({
            message: 'Login successful.',
            token,
            user: {
                id: user.id,
                username: user.username,
            },
        }, { status: 200 })

        // Set session cookie
        response.cookies.set('session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            expires: expiresAt,
            sameSite: 'lax',
            path: '/',
        })

        return response
    } catch (error: any) {
        console.error('Login API error:', error)
        return NextResponse.json({
            message: 'An error occurred during login.',
            error: error.message,
        }, { status: 500 })
    }
}
