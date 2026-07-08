import { decrypt } from './session'

export async function authenticateRequest(req: Request) {
    // 1. Try to get token from Authorization: Bearer <token>
    const authHeader = req.headers.get('authorization')
    let token: string | undefined = undefined

    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7)
    }

    // 2. Try to get token from Cookie
    if (!token) {
        const cookieHeader = req.headers.get('cookie')
        if (cookieHeader) {
            const cookies = cookieHeader.split(';').map(c => c.trim())
            const sessionCookie = cookies.find(c => c.startsWith('session='))
            if (sessionCookie) {
                token = sessionCookie.split('=')[1]
            }
        }
    }

    if (!token) {
        return null
    }

    const payload = await decrypt(token)
    if (!payload || !payload.expiresAt) {
        return null
    }

    // Check expiration
    const expiresAt = new Date(payload.expiresAt as string)
    if (Date.now() > expiresAt.getTime()) {
        return null
    }

    return { userId: payload.userId as string }
}
