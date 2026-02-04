'use client'

import { useActionState } from 'react'
import { signup } from '@/app/actions/auth'
import Link from 'next/link'

export default function RegisterPage() {
    // @ts-ignore
    const [state, action, isPending] = useActionState(signup, {})

    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="w-full max-w-md bg-surface p-8 rounded-lg shadow-md border border-outline-variant">
                <h2 className="mb-6 text-center text-2xl font-bold text-on-surface">Create an Account</h2>
                <form action={action} className="space-y-4">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-on-surface-variant">
                            Username
                        </label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            placeholder="johndoe"
                            className="mt-1 block w-full rounded-md border border-outline px-3 py-2 text-on-surface bg-surface placeholder-on-surface-variant/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                        />
                        {state?.errors?.username && (
                            <p className="mt-1 text-sm text-red-600">{state.errors.username}</p>
                        )}
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-on-surface-variant">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            className="mt-1 block w-full rounded-md border border-outline px-3 py-2 text-on-surface bg-surface placeholder-on-surface-variant/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                        />
                        {state?.errors?.password && (
                            <div className="mt-1 text-sm text-red-600">
                                <p>Password must:</p>
                                <ul className="list-disc pl-5">
                                    {state.errors.password.map((error) => (
                                        <li key={error}>{error}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                    {state?.message && (
                        <p className="text-sm text-red-600">{state.message}</p>
                    )}
                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full rounded-md bg-primary px-4 py-2 text-on-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 transition-colors"
                    >
                        {isPending ? 'Creating account...' : 'Sign Up'}
                    </button>
                </form>
                <div className="mt-4 text-center text-sm">
                    <p className="text-on-surface-variant">
                        Already have an account?{' '}
                        <Link href="/login" className="font-medium text-primary hover:text-primary/80">
                            Log in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}


