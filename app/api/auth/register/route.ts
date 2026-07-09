import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { encrypt } from '@/lib/session'
import { createErrorResponse } from '@/lib/api-response'

const SignupSchema = z.object({
    username: z.string().min(3, { message: 'Username must be at least 3 characters long.' }).trim(),
    password: z.string().min(6, { message: 'Password must be at least 6 characters long.' }).trim(),
})

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const validation = SignupSchema.safeParse(body)

        if (!validation.success) {
            const fieldErrors = validation.error.flatten().fieldErrors
            const errorMessage = fieldErrors.username?.[0] || fieldErrors.password?.[0] || 'Validation failed.'
            return createErrorResponse(400, errorMessage, JSON.stringify(fieldErrors))
        }

        const { username, password } = validation.data

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { username },
        })

        if (existingUser) {
            return createErrorResponse(400, 'Username is already taken.', { username: ['Username is already taken.'] })
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Create user
        const user = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
            },
        })

        // Create session
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        const token = await encrypt({ userId: user.id, expiresAt })

        const response = NextResponse.json({
            message: 'User registered successfully.',
            token,
            user: {
                id: user.id,
                username: user.username,
            },
        }, { status: 201 })

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
        console.error('Registration API error:', error)
        return createErrorResponse(500, 'An error occurred during registration.', error.message)
    }
}
