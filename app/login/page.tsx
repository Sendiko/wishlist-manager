'use client'

import { useActionState } from 'react'
import { login } from '@/app/actions/auth'
import Link from 'next/link'

export default function LoginPage() {
    // @ts-ignore
    const [state, action, isPending] = useActionState(login, {})

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
                <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">Sign in to your account</h2>
                <form action={action} className="space-y-4">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                            Username
                        </label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            placeholder="johndoe"
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                        />
                        {state?.errors?.username && (
                            <p className="mt-1 text-sm text-red-600">{state.errors.username}</p>
                        )}
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                        />
                        {state?.errors?.password && (
                            <p className="mt-1 text-sm text-red-600">{state.errors.password}</p>
                        )}
                    </div>
                    {state?.message && (
                        <p className="text-sm text-red-600">{state.message}</p>
                    )}
                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                        {isPending ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
                <div className="mt-4 text-center text-sm">
                    <p className="text-gray-600">
                        Don&apos;t have an account?{' '}
                        <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
