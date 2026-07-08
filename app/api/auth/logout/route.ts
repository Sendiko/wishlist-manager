import { NextResponse } from 'next/server'

export async function POST() {
    try {
        const response = NextResponse.json({
            message: 'Logout successful.',
        }, { status: 200 })

        // Clear the session cookie
        response.cookies.set('session', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            expires: new Date(0),
            sameSite: 'lax',
            path: '/',
        })

        return response
    } catch (error: any) {
        console.error('Logout API error:', error)
        return NextResponse.json({
            message: 'An error occurred during logout.',
            error: error.message,
        }, { status: 500 })
    }
}
