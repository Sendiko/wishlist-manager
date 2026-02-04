'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { createSession, deleteSession } from '@/lib/session'
import { redirect } from 'next/navigation'

const SignupSchema = z.object({
    username: z.string().min(3, { message: 'Username must be at least 3 characters long.' }).trim(),
    password: z.string().min(6, { message: 'Password must be at least 6 characters long.' }).trim(),
})

const LoginSchema = z.object({
    username: z.string().trim(),
    password: z.string().trim(),
})

export type FormState = {
    errors?: {
        username?: string[]
        password?: string[]
    }
    message?: string
}

export async function signup(prevState: FormState, formData: FormData) {
    const validation = SignupSchema.safeParse({
        username: formData.get('username'),
        password: formData.get('password'),
    })

    if (!validation.success) {
        return {
            errors: validation.error.flatten().fieldErrors,
        }
    }

    const { username, password } = validation.data

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
        where: { username },
    })

    if (existingUser) {
        return {
            errors: {
                username: ['Username is already taken.'],
            },
        }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    try {
        const user = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
            },
        })

        await createSession(user.id)
    } catch (error: any) {
        return {
            message: error.message,
        }
    }

    redirect('/dashboard')
}

export async function login(prevState: FormState, formData: FormData) {
    const validation = LoginSchema.safeParse({
        username: formData.get('username'),
        password: formData.get('password'),
    })

    if (!validation.success) {
        return {
            errors: validation.error.flatten().fieldErrors,
        }
    }

    const { username, password } = validation.data

    const user = await prisma.user.findUnique({
        where: { username },
    })

    if (!user) {
        return {
            message: 'Invalid credentials.',
        }
    }

    const passwordsMatch = await bcrypt.compare(password, user.password)

    if (!passwordsMatch) {
        return {
            message: 'Invalid credentials.',
        }
    }

    await createSession(user.id)
    redirect('/dashboard')
}

export async function logout() {
    await deleteSession()
    redirect('/login')
}
