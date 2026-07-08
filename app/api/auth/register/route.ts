import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { encrypt } from '@/lib/session'

const SignupSchema = z.object({
    username: z.string().min(3, { message: 'Username must be at least 3 characters long.' }).trim(),
    password: z.string().min(6, { message: 'Password must be at least 6 characters long.' }).trim(),
})

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const validation = SignupSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json({
                message: 'Validation failed.',
                errors: validation.error.flatten().fieldErrors,
            }, { status: 400 })
        }

        const { username, password } = validation.data

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { username },
        })

        if (existingUser) {
            return NextResponse.json({
                message: 'Username is already taken.',
                errors: {
                    username: ['Username is already taken.'],
                },
            }, { status: 400 })
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
        return NextResponse.json({
            message: 'An error occurred during registration.',
            error: error.message,
        }, { status: 500 })
    }
}
