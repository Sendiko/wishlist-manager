import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { encrypt } from '@/lib/session'
import { createErrorResponse } from '@/lib/api-response'

const LoginSchema = z.object({
    username: z.string().trim(),
    password: z.string().trim(),
})

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const validation = LoginSchema.safeParse(body)

        if (!validation.success) {
            const fieldErrors = validation.error.flatten().fieldErrors
            const errorMessage = fieldErrors.username?.[0] || fieldErrors.password?.[0] || 'Validation failed.'
            return createErrorResponse(400, errorMessage, JSON.stringify(fieldErrors))
        }

        const { username, password } = validation.data

        const user = await prisma.user.findUnique({
            where: { username },
        })

        if (!user) {
            return createErrorResponse(401, 'Invalid username or password.', 'Invalid credentials')
        }

        const passwordsMatch = await bcrypt.compare(password, user.password)

        if (!passwordsMatch) {
            return createErrorResponse(401, 'Invalid username or password.', 'Invalid credentials')
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
        return createErrorResponse(500, 'An error occurred during login.', error.message)
    }
}
